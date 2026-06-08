/**
 * pi-claude-subagents — A Pi.dev extension that brings Claude Code-style
 * autonomous sub-agents to pi.
 * 
 * This extension provides a widget-based approach to displaying subagent
 * activity above the editor, with a clean, minimal aesthetic inspired by
 * Claude Code's design system.
 * 
 * @packageDocumentation
 */

import type { ExtensionContext, ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { getAgentDir } from "@earendil-works/pi-coding-agent";
import { type AgentManager } from "./agent-manager.js";
import {
   AgentActivity,
   AgentWidget,
   defineTool,
   getAgentConfig,
   getAllTypes,
   getDefaultAgentNames,
   getUserAgentNames,
   registerAgents,
   resolveType,
   SUBAGENT_TOOL_NAMES,
} from "./agent-manager.js";
import { loadCustomAgents } from "./custom-agents.js";
import { type JoinMode, type NotificationDetails, type SubagentType } from "./types.js";
import { CLAUDE } from "./ui/claude-widget.js";
import { describeActivity, formatTokens, formatTurns } from "./ui/agent-widget.js";
import { type AgentDetails, type UICtx } from "./ui/agent-widget.js";

// ============================================================================
// Extension Entry Point
// ============================================================================

export default function (pi: ExtensionAPI) {
   // ---- Initialize subagents from tintinweb base implementation ----
   // We're providing a widget replacement for the full tintin functionality.
   // Users should install this IN PLACE OF tintinweb/pi-subagents.
   
   /** Load custom agents from .pi/agents/*.md */
   const reloadCustomAgents = () => {
     const userAgents = loadCustomAgents(process.cwd());
     registerAgents(userAgents);
    };
   
   // Initial load
   reloadCustomAgents();
   
   // ---- Widget Setup ----
   const agentActivity = new Map<string, AgentActivity>();
   let widget: AgentWidget | undefined;
   let uiCtx: UICtx | undefined;
   let batchFinalizeTimer: ReturnType<typeof setTimeout> | undefined;
   let currentBatchAgents: string[] = [];
   let batchCounter = 0;
   
   /** Build the full type list text dynamically */
   const buildTypeListText = () => {
     const allNames = [...getDefaultAgentNames(), ...getUserAgentNames()];
     return allNames.map((name) => {
       const cfg = getAgentConfig(name);
       const modelSuffix = cfg?.model ? ` (${cfg.model.split("/").pop()})` : "";
       return `- ${name}: ${cfg?.description ?? name}${modelSuffix}`;
      }).join("\n");
    };
   
   const typeListText = buildTypeListText();
   
   // Initialize widget
   widget = new AgentWidget(
     // AgentManager will be created and passed externally
     {} as any,
     agentActivity
   );
   
   /** Finalize the current batch of agents */
   function finalizeBatch() {
     batchFinalizeTimer = undefined;
     const batchAgents = [...currentBatchAgents];
     currentBatchAgents = [];
     
     const smartAgents = batchAgents;
     if (smartAgents.length >= 2) {
       const groupId = `batch-${++batchCounter}`;
       smartAgents.forEach((id) => {
         // Group logic here
         if (id) {
           widget?.markFinished(id);
         }
       });
     }
   }
   
   /** Schedule batch finalization */
   function scheduleBatchFinalize() {
     if (batchFinalizeTimer) clearTimeout(batchFinalizeTimer);
     batchFinalizeTimer = setTimeout(finalizeBatch, 100);
   }
   
   /** Render widget with Claude Code styling */
   function renderWidgetWithClaudeStyling() {
     const COLOR = CLAUDE.COLORS;
     
     if (!uiCtx) return;
     
     // Register widget with Claude styling
     uiCtx.setWidget("agents", (tui, theme) => {
       return {
         render: () => widget?.renderWidget(tui as any, theme) ?? [],
         invalidate: () => {
           widget = undefined;
         },
       };
     }, { placement: "aboveEditor" });
     
     // Start 80ms spinner animation
     setInterval(() => {
       widget?.update();
     }, 80);
   }
   
   // ---- Tool Registration ----
   // Define the Agent tool using our widget-based approach
   pi.registerTool(
     defineTool({
       name: SUBAGENT_TOOL_NAMES.AGENT,
       label: "Agent",
       description: `Launch a new sub-agent to handle complex, multi-step tasks autonomously.
       
Available agent types:
${typeListText}

## Usage Notes

- Include a short description summarizing what the agent will do
- Use run_in_background: true for work you don't need immediately
- Clearly tell the agent whether to write code or do research
- Use inherit_context if the agent needs the parent conversation
${getSchedulingGuideline()}

## When not to use

Reserve this tool for open-ended questions or tasks that match an available agent type.
If the target is already known, use a direct tool like \`read\` or \`grep\`.`,
       params: {
         subagent_type: {
           type: "string",
           description:
             `The type of agent to run (${getDefaultAgentNames().join(", ")})`,
           enum: [...getDefaultAgentNames(), ...getUserAgentNames()],
         },
         prompt: {
           type: "string",
           description: "The prompt to send to the agent",
         },
         description: {
           type: "string",
           description:
             "A short description (3-5 words) summarizing what the agent will do",
         },
         run_in_background: {
           type: "boolean",
           description:
             "Whether to run the agent in background (returns immediately) or foreground (waits for completion)",
         },
         inherit_context: {
           type: "boolean",
           description:
             "Whether to inherit the parent conversation context into the agent",
         },
         model: {
           type: "string",
           description:
             "Model to use for this agent (e.g., 'haiku', 'sonnet', 'deepseek')",
         },
         thinking: {
           type: "string",
           description:
             "Thinking level: none, minimal, or extended",
         },
       },
     }),
   );
   
   // ---- Event Handlers ----
   
   /** Initialize widget with UI context */
   pi.on("tool_execution_start", async (_event, ctx) => {
     uiCtx = ctx.ui as UICtx;
     widget?.setUICtx(uiCtx);
     widget?.onTurnStart();
   });
   
   /** Handle agent creation */
   pi.on("agent_created", (_event, record) => {
     if (record) {
       agentActivity.set(record.id, {
         activeTools: new Map(),
         toolUses: 0,
         responseText: "",
         turnCount: 1,
         lifetimeUsage: { input: 0, output: 0, cacheWrite: 0 },
       });
       widget?.markFinished(record.id);
       widget?.update();
     }
   });
   
   /** Handle agent status change */
   pi.on("agent_status_change", (_event, record) => {
     widget?.update();
   });
   
   /** Handle agent completion */
   pi.on("agent_completed", (_event, record) => {
     if (record) {
       const activity = agentActivity.get(record.id);
       if (activity) {
         agentActivity.delete(record.id);
       }
       widget?.update();
     }
   });
   
   /** Cleanup on session shutdown */
   pi.on("session_shutdown", () => {
     widget?.dispose();
     widget = undefined;
     uiCtx = undefined;
   });
   
   // ---- Claude Code Styling Integration ----
   /** Apply Claude Code widget styling */
   function configureClaudeWidgetStyling() {
     renderWidgetWithClaudeStyling();
   }
   
   // Auto-configure widget on first execution
   configureClaudeWidgetStyling();
   
   // Export for testing
   return {
     getWidget: () => widget,
     getAgentActivity: () => agentActivity,
   };
}

function getSchedulingGuideline(): string {
   return `\n- Use \`schedule\` only for scheduled/recurring/delayed execution`;
}
