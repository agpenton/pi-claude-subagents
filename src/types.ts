/**
 * types.ts — Shared type definitions for pi-claude-subagents
 */

// ============================================================================
// Core Types
// ============================================================================

export type SubagentType = string;

/** Agent record with all metadata */
export interface AgentRecord {
  id: string;
  type: SubagentType;
  description: string;
  status: "running" | "queued" | "completed" | "error" | "aborted" | "stopped" | "steered";
  startedAt: number;
  completedAt?: number;
  result?: string;
  error?: string;
  toolUses: number;
  lifetimeUsage: LifetimeUsage;
  session?: any;
  compactionCount?: number;
  output?: string;
  /** Group ID for smart join */
  groupId?: string;
  /** Whether result has been consumed */
  resultConsumed?: boolean;
  /** Tool call ID */
  toolCallId?: string;
  /** Output file path */
  outputFile?: string;
}

/** Agent activity tracking state */
export interface AgentActivity {
  activeTools: Map<string, string>;
  toolUses: number;
  responseText: string;
  session?: any;
  turnCount: number;
  maxTurns?: number;
  lifetimeUsage: LifetimeUsage;
}

/** Usage tracking */
export interface LifetimeUsage {
  input: number;
  output: number;
  cacheWrite: number;
}

/** Session context */
export interface SessionLike {
  /** Context window size */
  contextWindow?: number;
  /** Current tokens used */
  tokensUsed?: number;
  /** Turn count */
  turns?: number;
}

// ============================================================================
// Agent Invocation Config
// ============================================================================

export type JoinMode = "smart" | "group" | "none";

export interface AgentInvocation {
  subagent_type: string;
  prompt: string;
  description: string;
  run_in_background: boolean;
  inherit_context: boolean;
  model?: string;
  thinking?: "none" | "minimal" | "extended";
  isolation?: "worktree" | "filesystem";
  maxTurns?: number;
  schedule?: string;
}

// ============================================================================
// Tool Parameters
// ============================================================================

export type ToolParam = {
  type: string;
  description: string;
  enum?: string[];
  optional?: boolean;
};

export function defineTool(params: {
  name: string;
  label: string;
  description: string;
  params: Record<string, ToolParam>;
}): any {
  return params;
}

// ============================================================================
// Widget Types
// ============================================================================

export type Theme = {
  fg(color: string, text: string): string;
  bold(text: string): string;
};

export type UICtx = {
  setStatus(key: string, text: string | undefined): void;
  setWidget(
    key: string,
    content: undefined | (() => string[]),
    options?: { placement?: string },
  ): void;
};

// ============================================================================
// Export
// ============================================================================

export default {
   AgentRecord,
   AgentActivity,
   LifetimeUsage,
   SessionLike,
   AgentInvocation,
   JoinMode,
   ToolParam,
   Theme,
   UICtx,
};
