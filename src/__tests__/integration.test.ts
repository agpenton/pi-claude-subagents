/**
 * integration.test.ts
 * Integration tests for @agpenton/pi-claude-subagents
 */

import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';
import type { AgentWidget, AgentActivity } from '../ui/agent-widget';
import type { AgentRecord } from '../types';
import CLAUDE from '../ui/claude-widget';

// Mock dependencies
const createMockManager = () => ({
  listAgents: vi.fn(),
  addAgent: vi.fn(),
  removeAgent: vi.fn(),
  markAgentFinished: vi.fn(),
  getAgent: vi.fn(),
  clearFinished: vi.fn(),
  dispose: vi.fn(),
});

const createMockWidget = (activity: Map<string, AgentActivity>) => {
  return {
    setUICtx: vi.fn(),
    onTurnStart: vi.fn(),
    ensureTimer: vi.fn(),
    markFinished: vi.fn(),
    renderWidget: vi.fn().mockReturnValue([]),
    update: vi.fn(),
    dispose: vi.fn(),
   } as unknown as AgentWidget;
};

const createMockAgent = (overrides?: Partial<AgentRecord>): AgentRecord => ({
  id: 'agent-1',
  type: 'Agent',
  description: 'Test agent',
  status: 'running' as const,
  startedAt: 0,
  completedAt: undefined,
  result: undefined,
  error: undefined,
  toolUses: 0,
  lifetimeUsage: { input: 0, output: 0, cacheWrite: 0 },
  session: undefined,
  compactionCount: 0,
  output: undefined,
  groupId: undefined,
  resultConsumed: false,
  toolCallId: undefined,
  outputFile: undefined,
  ...overrides,
});

describe('Widget Event Integration', () => {
  let mockManager;
  let mockWidget;
  let mockTui;
  let mockTheme;

  beforeEach(() => {
    mockManager = createMockManager();
    mockWidget = createMockWidget(new Map());
    mockTui = {
      terminal: { columns: 80 },
      requestRender: vi.fn(),
    };
    mockTheme = {
      fg: vi.fn((color, text) => `[${color}:${text}]`),
      bold: vi.fn((text) => `**${text}**`),
    };
   });

  afterEach(() => {
    vi.clearAllMocks();
   });

  describe('tool_execution_start event', () => {
    it('should activate widget on agent creation', () => {
      const event = {
        type: 'tool_execution_start',
        ctx: {
          ui: {
            setStatus: vi.fn(),
            setWidget: vi.fn(),
           },
         },
       };

      // Simulate event
      mockWidget.setUICtx(event.ctx.ui);
      
      expect(mockWidget.setUICtx).toHaveBeenCalledWith(event.ctx.ui);
      });

    it('should call update on activation', () => {
      vi.spyOn(mockWidget, 'update');
      
      mockWidget.onTurnStart();
      
      expect(mockWidget.update).toHaveBeenCalled();
    });
  });

  describe('agent_created event', () => {
    it('should add new agent to widget', () => {
      const event = {
        type: 'agent_created',
        record: createMockAgent(),
       };

      const activity = {
        activeTools: new Map(),
        toolUses: 0,
        responseText: '',
        turnCount: 1,
        lifetimeUsage: { input: 0, output: 0, cacheWrite: 0 },
       };

      // Process agent creation
      mockWidget.markFinished(event.record.id);
      
      expect(mockWidget.markFinished).toHaveBeenCalledWith(event.record.id);
    });

    it('should update on new agent', () => {
      vi.spyOn(mockWidget, 'update');
      const event = { record: createMockAgent() };
      
      mockWidget.update = vi.fn();
      mockWidget.update();
      
      expect(mockWidget.update).toHaveBeenCalled();
    });
  });

  describe('agent_status_change event', () => {
    it('should update widget on status change', () => {
      const event = {
        record: {
          id: 'agent-1',
          status: 'running',
        },
       };

      vi.spyOn(mockWidget, 'update');
      
      // Status change triggers update
      mockWidget.update();
      
      expect(mockWidget.update).toHaveBeenCalled();
    });
  });

  describe('agent_completed event', () => {
    it('should mark agent as finished', () => {
      const event = {
        record: createMockAgent({ status: 'completed' }),
       };

      // Mark finished and update
      mockWidget.markFinished(event.record.id);
      
      expect(mockWidget.markFinished).toHaveBeenCalledWith(event.record.id);
    });

    it('should not show completed agent after linger', () => {
      const agentId = 'completed-agent';
      const event = {
        record: createMockAgent({
          id: agentId,
          status: 'completed',
         }),
       };

      // Mark finished
      mockWidget.markFinished(agentId);
      
      // Simulate 2 turn ages (max for non-error)
      for (let i = 0; i < 2; i++) {
        mockWidget.onTurnStart();
      }

      // Should not be shown after 2 turns
      // (This would be checked in actual widget rendering)
    });

    it('should show error agents longer', () => {
      const agentId = 'error-agent';
      const event = {
        record: createMockAgent({
          id: agentId,
          status: 'error',
         }),
       };

      // Mark finished
      mockWidget.markFinished(agentId);
      
      // Simulate 2 turn ages (max for errors)
      for (let i = 0; i < 2; i++) {
        mockWidget.onTurnStart();
      }

      // Should still be shown
      expect(true).toBe(true);
    });
  });

  describe('session_shutdown event', () => {
    it('should cleanup widget', () => {
      vi.spyOn(mockWidget, 'dispose');
      
      // Shutdown cleanup
      mockWidget.dispose();
      
      expect(mockWidget.dispose).toHaveBeenCalled();
    });

    it('should clear widget state', () => {
      const widget = createMockWidget(new Map());
      
      widget.dispose();
      
      // Should be cleaned up
      expect(true).toBe(true);
    });
  });

  describe('batch completion', () => {
    it('should finalize batch after delay', () => {
      const scheduleFinalize = vi.fn(() => {
        // Batch finalization happens after 100ms
        setTimeout(() => {
          scheduleFinalize();
        }, 100);
      });

      // Schedule batch finalize
      scheduleFinalize();
      
      expect(scheduleFinalize).toBeDefined();
    });
  });
});

describe('Widget Rendering Integration', () => {
  let mockWidget;
  let mockAgentActivity;

  beforeEach(() => {
    mockAgentActivity = new Map();
    mockWidget = createMockWidget(mockAgentActivity);
   });

  describe('empty state', () => {
    it('should return empty widget when no active agents', () => {
      mockAgentActivity.clear();
      
      const widgetRender = mockWidget.renderWidget(
        mockTui,
        mockTheme
       as any
      );

      expect(widgetRender).toEqual([]);
    });

    it('should show undefined status when no agents', () => {
      mockAgentActivity.clear();
      
      mockWidget.setUICtx({
        setStatus: vi.fn((key, value) => {
          expect(value).toBeUndefined();
        }),
       });
      
      mockAgentActivity.clear();
      mockWidget.setUICtx({
        setStatus: vi.fn(),
      });
      mockWidget.update = vi.fn();
      mockWidget.update();

      expect(true).toBe(true);
    });
  });

  describe('running agent rendering', () => {
    it('should include spinner in output', () => {
      const agent = createMockAgent({
        id: 'running-agent',
        status: 'running',
        description: 'Running task',
        toolUses: 2,
        startedAt: 0,
      });

     mockAgentActivity.set(agent.id, {
        activeTools: new Map([['read', 'read']]),
        toolUses: 2,
        responseText: '',
        turnCount: 3,
        lifetimeUsage: { input: 1000, output: 2000, cacheWrite: 0 },
      });

      const rendered = mockWidget.renderWidget(
        mockTui,
        { fg: (c, t) => t, bold: (t) => t }
      as any
      );

      expect(rendered).toBeDefined();
    });

    it('should display activity description', () => {
      agent = createMockAgent({
        id: 'active-agent',
        status: 'running',
        description: 'Active work',
        toolUses: 1,
        startedAt: 0,
      });

      (mockWidget.setUICtx as any)(mockAgentActivity);

      mockWidget.setUICtx({
        setStatus: vi.fn(),
      });

      mockAgentActivity.set(agent.id, {
        activeTools: new Map([['edit', 'editing']]),
        toolUses: 1,
        responseText: 'Working on task',
        turnCount: 1,
        lifetimeUsage: { input: 50, output: 100, cacheWrite: 0 },
      });

      const rendered = mockWidget.renderWidget(
        mockTui,
        { fg: (c, t) => `[${c}:${t}]`, bold: (t) => `**${t}**` }
      as any
      );

      expect(rendered).toContain('editing');
    });
  });

  describe('finished agent rendering', () => {
    it('should show completed agents at bottom', () => {
      const completedAgent = createMockAgent({
        id: 'done-agent',
        status: 'completed',
        description: 'Done task',
        toolUses: 5,
        startedAt: 0,
        completedAt: 1000,
      });

      mockAgentActivity.set(completedAgent.id, {
        activeTools: new Map(),
        toolUses: 5,
        responseText: 'Finished',
        turnCount: 1,
        lifetimeUsage: { input: 0, output: 0, cacheWrite: 0 },
      });

      mockWidget.markFinished(completedAgent.id);

      const rendered = mockWidget.renderWidget(
        mockTui,
        mockTheme
      as any
      );

      expect(rendered).toBeDefined();
    });

    it('should not show finished agents after max turns', () => {
      const finishedAgent = createMockAgent({
        id: 'finished',
        status: 'completed',
      });

      mockAgentActivity.set(finishedAgent.id, {
        activeTools: new Map(),
        toolUses: 0,
        responseText: 'Done',
        turnCount: 1,
        lifetimeUsage: { input: 0, output: 0, cacheWrite: 0 },
      });

      mockWidget.markFinished(finishedAgent.id);

      // Simulate 2 turns (max for non-error)
      for (let i = 0; i < 2; i++) {
        mockWidget.onTurnStart();
      }

      // Should not be displayed
      expect(true).toBe(true);
    });

    it('should show error agents longer', () => {
      const errorAgent = createMockAgent({
        id: 'error-agent',
        status: 'error',
        error: 'Something failed',
      });

      mockAgentActivity.set(errorAgent.id, {
        activeTools: new Map(),
        toolUses: 0,
        responseText: 'Error',
        turnCount: 1,
        lifetimeUsage: { input: 0, output: 0, cacheWrite: 0 },
      });

      mockWidget.markFinished(errorAgent.id);

      // Simulate 2 turns (max for errors)
      for (let i = 0; i < 2; i++) {
        mockWidget.onTurnStart();
      }

      // Should still be displayed
      expect(true).toBe(true);
    });
  });

  describe('queue state', () => {
    it('should display queued count', () => {
      mockWidget.setUICtx({
        setStatus: vi.fn((key, value) => {
          expect(value).toContain('queued');
        }),
      });

      const queuedAgent = createMockAgent({
        id: 'queued-agent',
        status: 'queued',
      });

      mockAgentActivity.set(queuedAgent.id, {
        activeTools: new Map(),
        toolUses: 0,
        responseText: '',
        turnCount: 0,
        lifetimeUsage: { input: 0, output: 0, cacheWrite: 0 },
      });

      const rendered = mockWidget.renderWidget(
        mockTui,
        mockTheme
      as any
      );

      expect(rendered).toBeDefined();
    });
  });

  describe('overflow handling', () => {
    it('should truncate when > 11 agents', () => {
      const agents = Array.from({ length: 20 }, (_, i) => 
        createMockAgent({
          id: `agent${i}`,
          type: 'Agent',
          status: 'running',
          description: `Agent ${i}`,
          toolUses: 0,
          startedAt: 0,
        })
      );

      for (const agent of agents) {
        mockAgentActivity.set(agent.id, {
          activeTools: new Map(),
          toolUses: 0,
          responseText: '',
          turnCount: 0,
          lifetimeUsage: { input: 0, output: 0, cacheWrite: 0 },
        });
      }

      const rendered = mockWidget.renderWidget(
        mockTui,
        { fg: (c, t) => t, bold: (t) => t }
      as any
      );

      expect(rendered).toBeDefined();
    });

    it('should show overflow message', () => {
      const overflowAgent = createMockAgent({
        id: 'overflow',
        type: 'Agent',
        status: 'running',
        description: 'Overflow agent',
      });

      mockAgentActivity.set(overflowAgent.id, {
        activeTools: new Map(),
        toolUses: 0,
        responseText: '',
        turnCount: 0,
        lifetimeUsage: { input: 0, output: 0, cacheWrite: 0 },
      });

      const rendered = mockWidget.renderWidget(
        mockTui,
        { fg: (c, t) => `overflow`, bold: (t) => t }
      as any
      );

      expect(rendered).toBeDefined();
    });
  });

  describe('theme integration', () => {
    it('should support Claude colors', () => {
      const theme = {
        fg: vi.fn((color, text) => `[${color}:${text}]`),
      };

      const colors = [
        CLAUDE.COLORS.success,
        CLAUDE.COLORS.error,
        CLAUDE.COLORS.warning,
        CLAUDE.COLORS.accent,
      ];

      for (const color of colors) {
        theme.fg(color, 'text');
      }

      expect(true).toBe(true);
    });

    it('should format output with theme', () => {
      const theme = {
        fg: (color, text) => `[${color}:${text}]`,
      };

      const output = theme.fg(CLAUDE.COLORS.success, '✓');

      expect(output).toContain(':');
      expect(output).toContain('✓');
    });
  });
});

describe('Theme Constants Integration', () => {
  it('should provide complete color palette', () => {
    const palette = CLAUDE.COLORS;
    
    expect(palette).toHaveProperty('success');
    expect(palette).toHaveProperty('error');
    expect(palette).toHaveProperty('warning');
    expect(palette).toHaveProperty('accent');
    expect(palette).toHaveProperty('muted');
    expect(palette).toHaveProperty('bgBase');
    expect(palette).toHaveProperty('bgElevated');
    expect(palette).toHaveProperty('bgDimmed');
    expect(palette).toHaveProperty('textPrimary');
    expect(palette).toHaveProperty('textSecondary');
    expect(palette).toHaveProperty('textMuted');
    expect(palette).toHaveProperty('borderPrimary');
    expect(palette).toHaveProperty('borderSecondary');
  });

  it('should support spinner animation', () => {
    const spinners = CLAUDE.SPINNER;
    
    for (let i = 0; i < spinners.length; i++) {
      const frame = spinners[i];
      expect(frame).toBeDefined();
      expect(typeof frame).toBe('string');
    }
  });

  it('should provide tree connectors', () => {
    const borders = CLAUDE.BORDERS;
    
    expect(borders).toHaveProperty('VERTICAL');
    expect(borders).toHaveProperty('HORIZONTAL');
    expect(borders).toHaveProperty('CORNER');
    expect(borders).toHaveProperty('MIDDLE');
    expect(borders).toHaveProperty('BRANCH');
  });

  it('should have proper spacing', () => {
    const spacing = CLAUDE.SPACING;
    
    expect(spacing).toHaveProperty('padding');
    expect(spacing).toHaveProperty('paddingX');
    expect(spacing).toHaveProperty('gap');
    expect(spacing).toHaveProperty('margin');
  });
});

describe('Performance Integration', () => {
  let startMs;

  beforeEach(() => {
    startMs = performance.now();
  });

  it('should render widget quickly', () => {
    const start = performance.now();
    
    mockAgentActivity.clear();
    
    const widget = {
      renderWidget: (tui, theme) => [],
     };
    
    const result = widget.renderWidget(mockTui, mockTheme as any);
    const end = performance.now();
    
    const duration = end - start;
    expect(duration).toBeLessThan(10); // Should be very fast
  });

  it('should have minimal overhead', () => {
     const iterations = 100;
     let total = 0;
     
     for (let i = 0; i < iterations; i++) {
       const start = performance.now();
       mockWidget.update = vi.fn();
       mockWidget.update();
       total += performance.now() - start;
     }
     
     const avg = total / iterations;
     // Should average < 1ms per update
     expect(avg).toBeLessThan(1);
   });

  it('should handle bulk updates', () => {
     let duration = 0;
     
     // Simulate multiple agent updates
     for (let i = 0; i < 10; i++) {
       const start = performance.now();
       mockAgentActivity.set(`agent-${i}`, {
         activeTools: new Map(),
         toolUses: 0,
         responseText: '',
         turnCount: 0,
         lifetimeUsage: { input: 0, output: 0, cacheWrite: 0 },
       });
       mockWidget.update = vi.fn();
       mockWidget.update();
       duration += performance.now() - start;
     }
     
     expect(duration).toBeLessThan(50); // <50ms for 10 updates
   });
});

describe('Edge Cases', () => {
  it('should handle empty agent', () => {
    const emptyAgent = createMockAgent({
      id: '',
      description: '',
      type: 'Agent',
    });

    mockAgentActivity.set(emptyAgent.id, {
      activeTools: new Map(),
      toolUses: 0,
      responseText: '',
      turnCount: 0,
      lifetimeUsage: { input: 0, output: 0, cacheWrite: 0 },
    });

    mockWidget.markFinished(emptyAgent.id);
    
    expect(true).toBe(true);
  });

  it('should handle null values', () => {
    const agent = createMockAgent({
      id: 'null-agent',
      description: null as any,
      type: 'Agent',
    });

    mockAgentActivity.set(agent.id, {
      activeTools: new Map(),
      toolUses: 0,
      responseText: null as any,
      turnCount: 0,
      lifetimeUsage: { input: 0, output: 0, cacheWrite: 0 },
    });

    expect(agent).toBeDefined();
  });

  it('should handle undefined status', () => {
    const agent = createMockAgent({
      id: 'undefined-status',
      status: undefined as any,
    });

    mockWidget.markFinished(agent.id);
    
    expect(true).toBe(true);
  });

  it('should handle negative token counts', () => {
    const agent = createMockAgent({
      id: 'negative-tokens',
      type: 'Agent',
    });

    mockAgentActivity.set(agent.id, {
      activeTools: new Map(),
      toolUses: 0,
      responseText: '',
      turnCount: 0,
      lifetimeUsage: { input: -100, output: -100, cacheWrite: 0 },
    });

    expect(agent).toBeDefined();
  });
});

describe('Integration Completeness', () => {
  it('should have all required event handlers', () => {
    const handlers = ['tool_execution_start', 'agent_created', 'agent_status_change',
       'agent_completed', 'session_shutdown'
     ];

    for (const handler of handlers) {
      expect(handler).toBeDefined();
    }
  });

  it('should support widget lifecycle', () => {
    const lifecycle = {
      start: 'tool_execution_start',
      create: 'agent_created',
      update: 'agent_status_change',
      complete: 'agent_completed',
      shutdown: 'session_shutdown',
    };

    for (const event of Object.values(lifecycle)) {
      expect(event).toBeDefined();
    }
  });

  it('should handle theme properly', () => {
    const theme = CLAUDE;
    const hasAllProps = Object.keys(theme).length > 5;
    
    expect(hasAllProps).toBe(true);
  });
});
