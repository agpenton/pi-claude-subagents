/**
 * agent-manager.js — Simplified agent manager for pi-claude-subagents
 * 
 * This is a minimal implementation that integrates the Claude-styled widget
 * with the pi-subagents event system.
 */

import { AgentWidget } from "./ui/agent-widget.js";
import CLAUDE from "./ui/claude-widget.js";

// ============================================================================
// Constants and Types
// ============================================================================

export const SUBAGENT_TOOL_NAMES = {
  AGENT: "Agent",
  GET_SUBAGENT_RESULT: "get_subagent_result",
  STEER_SUBAGENT: "steer_subagent",
};

export const BUILTIN_TOOL_NAMES = ["read", "write", "edit", "bash", "grep", "find", "ls"];

export const DEFAULT_AGENT_NAMES = ["Agent", "Explore", "Refactor", "Fix", "Explain"];

// ============================================================================
// Agent Manager Class
// ============================================================================

/**
 * Simplified AgentManager that provides minimal functionality for widget integration
 */
export class AgentManager {
  constructor() {
    this.agents = new Map();
    this.finishedAgents = new Map();
  }

  /** List all agents */
  listAgents() {
    const all = [];
    for (const [id, agent] of this.agents) {
      all.push({
        id,
        ...agent,
        status: agent.status,
      });
    }
    
    const finished = [];
    for (const [id, agent] of this.finishedAgents) {
      if (agent.completedAt) {
        finished.push({
          id,
          ...agent,
          status: agent.status,
        });
      }
    }
    
    return [...all, ...finished];
  }

  /** Add an agent */
  addAgent(agent) {
    this.agents.set(agent.id, agent);
  }

  /** Remove an agent */
  removeAgent(id) {
    this.agents.delete(id);
  }

  /** Mark an agent as finished */
  markAgentFinished(id) {
    const agent = this.agents.get(id);
    if (agent) {
      this.finishedAgents.set(id, agent);
      this.agents.delete(id);
    }
  }

  /** Get an agent by ID */
  getAgent(id) {
    return this.agents.get(id);
  }

  /** Clear finished agents */
  clearFinished() {
    this.finishedAgents.clear();
  }

  /** Dispose and cleanup */
  dispose() {
    this.agents.clear();
    this.finishedAgents.clear();
  }
}

// ============================================================================
// Agent Configuration
// ============================================================================

/** Agent configuration structure */
export class AgentConfig {
  constructor(params) {
    this.name = params.name;
    this.displayName = params.displayName || params.name;
    this.description = params.description;
    this.model = params.model;
    this.builtinToolNames = params.builtinToolNames || BUILTIN_TOOL_NAMES;
  }
}

/** Default agent configurations */
const DEFAULT_AGENTS = new Map([
  ["Agent", new AgentConfig({
    name: "Agent",
    displayName: "Agent",
    description: "General-purpose agent for code tasks",
    model: "default",
  })],
  ["Explore", new AgentConfig({
    name: "Explore",
    displayName: "Explore",
    description: "Research and gather information",
    model: "default",
  })],
  ["Refactor", new AgentConfig({
    name: "Refactor",
    displayName: "Refactor",
    description: "Improve existing code",
    model: "default",
  })],
  ["Fix", new AgentConfig({
    name: "Fix",
    displayName: "Fix",
    description: "Debug and fix issues",
    model: "default",
  })],
]);

// Export for external use
export const getDefaultAgentNames = () => Array.from(DEFAULT_AGENTS.keys());
export const getAgentConfig = (name) => DEFAULT_AGENTS.get(name);

export const registerAgents = (customAgents) => {
  for (const [name, config] of customAgents) {
    DEFAULT_AGENTS.set(name, config);
  }
};

// ============================================================================
// Export Main Module
// ============================================================================

export const createAgentManager = () => new AgentManager();
export const initializeAgentManager = () => createAgentManager();

export default {
  AgentManager,
  AgentConfig,
  SUBAGENT_TOOL_NAMES,
  BUILTIN_TOOL_NAMES,
  DEFAULT_AGENT_NAMES,
  getDefaultAgentNames,
  getAgentConfig,
  registerAgents,
  createAgentManager,
  initializeAgentManager,
};
