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

import { getAgentDir } from "@earendil-works/pi-coding-agent";
import { AgentActivity, AgentWidget, defineTool, getAgentConfig, getAllTypes, getDefaultAgentNames, getUserAgentNames, registerAgents, resolveType, SUBAGENT_TOOL_NAMES } from "./agent-manager.js";
import { loadCustomAgents } from "./custom-agents.js";
import { CLAUDE } from "./ui/claude-widget.js";
import { describeActivity, formatTokens, formatTurns } from "./ui/agent-widget.js";

// ============================================================================
// Extension Entry Point
// ============================================================================

export default function (pi) {
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
   const agentActivity = new Map();
   let widget = undefined;
   let uiCtx = undefined;
   let batchFinalizeTimer = undefined;
   let currentBatchAgents = [];
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
      {},
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
   
   /** Handle agent manager events */
   function handleAgentManagerEvents(event, record) {
     const activity = record.activity || {};
     const tokens = record.tokens || {};
     
     switch (event) {
      case "agent_started":
         agentActivity.set(record.id, {
           type: record.type,
           message: record.message,
           tokens: 0,
           duration: 0,
           finished: false,
           turns: 0,
         });
         
         break;
         
         case "agent_message":
          (agentActivity.get(record.actorId) || {}).message = record.content || "No message";
          break;
         
         case "agent_tokens":
          const currentTurns = (agentActivity.get(record.actorId) || {}).turns || 0;
          agentActivity.get(record.actorId).tokens = tokens?.total || 0;
          
          if (currentTurns !== (agentActivity.get(record.actorId) || {}).turns) {
           widget?.updateTurns(record.actorId, tokens?.total || 0);
           agentActivity.get(record.actorId).turns = tokens?.total || 0;
          }
          (agentActivity.get(record.actorId) || {}).tokens = tokens?.total || 0;
          break;
         
         case "agent_finished":
          if (agentActivity.has(record.actorId)) {
           agentActivity.get(record.actorId).finished = true;
           agentActivity.get(record.actorId).message = "Complete";
           (agentActivity.get(record.actorId) || {}).tokens = tokens?.total || 0;
           widget?.markFinished(record.actorId);
          }
          break;
         
         case "chain_started":
          if (!(agentActivity.get(record.chainId) || {}).message) {
           agentActivity.set(record.chainId, {
             type: record.type || SUBAGENT_TOOL_NAMES,
             message: record.message || "Chain started",
             tokens: 0,
             duration: 0,
             finished: false,
             turns: 0,
             agents: [],
           });
          }
           break;
         
         case "chain_update":
          if (agentActivity.has(record.chainId)) {
           (agentActivity.get(record.chainId) || {}).agents = [...(agentActivity.get(record.chainId) || {}).agents || [], ...record.agents];
           agentActivity.get(record.chainId).message = record.message || "Chain running";
           agentActivity.get(record.chainId).tokens = record.tokens?.total || 0;
           agentActivity.get(record.chainId).turned = record.turns || 0;
         
           // Update widget
           widget?.updateChain(record.chainId, {
             agents: [
               ...[agentActivity.get(record.chainId) || {}].map((a) => ({
                 id: a.id || "unknown",
                 type: a.type || "unknown",
                 message: a.message || "No message",
                 tokens: a.tokens || 0,
                 duration: a.duration || 0,
                 finished: a.finished || false,
                 turns: a.turns || 0,
               })),
             ],
             tokens: record.tokens?.total || 0,
             turns: record.turns || 0,
             message: record.message || "Chain running",
           });
          }
         break;
         
         case "chain_finished":
          if (agentActivity.has(record.chainId)) {
           agentActivity.get(record.chainId).finished = true;
           agentActivity.get(record.chainId).message = record.message || "Chain finished";
           agentActivity.get(record.chainId).tokens = record.tokens?.total || 0;
           agentActivity.get(record.chainId).turned = record.turns || 0;
           widget?.markFinished(record.chainId);
          }
          break;
         
         case "agent_error":
          if (agentActivity.has(record.actorId)) {
           agentActivity.get(record.actorId).message = record.error || "Agent error";
           agentActivity.get(record.actorId).finished = true;
           widget?.markFinished(record.actorId);
          }
          break;
         
         default:
          console.log(`Unhandled event: ${event}`, { record });
         break;
       }
     }
   
   /** Subscribe to agent manager events */
   pi.registerPlugin("subagents-widget", {
      name: "subagents-widget",
      onEvent: handleAgentManagerEvents,
   });
   
   /** Return widget reference */
   return {
      widget,
      agentActivity,
      typeListText,
      buildTypeListText,
    };
}
