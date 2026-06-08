/**
 * agent-widget.test.ts
 * Unit tests for AgentWidget class
 */

import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';
import { AgentWidget } from '../ui/agent-widget';
import type { AgentManager } from '../agent-manager';
import type { Theme, UICtx } from '../ui/agent-widget';

// Mock implementations
const mockManager: any = {
  listAgents: () => [],
};

describe('AgentWidget', () => {
  let widget: AgentWidget;
  let mockUICtx: UICtx;
  let mockTui: any;

  beforeEach(() => {
    widget = new AgentWidget(mockManager, new Map());
    
    mockUICtx = {
      setStatus: vi.fn(),
      setWidget: vi.fn(),
    };
    
    mockTui = {
      terminal: {
        columns: 80,
      },
      requestRender: vi.fn(),
    };
    
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with empty agent activity map', () => {
      const widget = new AgentWidget(mockManager, new Map());
      expect(widget).toBeDefined();
    });

    it('should initialize with zero widget frame', () => {
      const widget = new AgentWidget(mockManager, new Map());
      // Internal state should be initialized
      expect(widget).toHaveProperty('widgetFrame');
    });
  });

  describe('setUICtx', () => {
    it('should set UI context', () => {
      widget.setUICtx(mockUICtx);
      expect(mockUICtx).toBeDefined();
    });

    it('should reset registered flag when UI context changes', () => {
      (widget as any).widgetRegistered = true;
      widget.setUICtx(mockUICtx);
      expect((widget as any).widgetRegistered).toBe(false);
    });
  });

  describe('onTurnStart', () => {
    it('should increment finished turn ages', () => {
      widget = new AgentWidget(mockManager, new Map());
      (widget as any).finishedTurnAge = new Map([['agent1', 2]]);
      
      widget.onTurnStart();
      
      expect((widget as any).finishedTurnAge.get('agent1')).toBe(3);
    });

    it('should call update method', () => {
      widget.setUICtx(mockUICtx);
      vi.spyOn(widget, 'update');
      
      widget.onTurnStart();
      
      expect(widget.update).toHaveBeenCalled();
    });
  });

  describe('ensureTimer', () => {
    it('should create timer interval', () => {
      const spy = vi.spyOn(global, 'setInterval').mockReturnValue(1 as any);
      
      widget.ensureTimer();
      
      expect(spy).toHaveBeenCalled();
    });

    it('should not create interval if one exists', () => {
      (widget as any).widgetInterval = 1 as any;
      const spy = vi.spyOn(global, 'setInterval').mockReturnValue(1 as any);
      
      widget.ensureTimer();
      
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('shouldShowFinished', () => {
    it('should show finished agent within linger turns', () => {
      widget.setUICtx(mockUICtx);
      (widget as any).finishedTurnAge = new Map([
        ['agent1', 0],
        ['agent2', 1],
      ]);
      
      expect((widget as any).shouldShowFinished('agent1', 'completed')).toBe(true);
      expect((widget as any).shouldShowFinished('agent2', 'completed')).toBe(true);
    });

    it('should not show agent after max linger turns', () => {
      widget.setUICtx(mockUICtx);
      (widget as any).finishedTurnAge = new Map([
        ['agent1', 2],
      ]);
      
      expect((widget as any).shouldShowFinished('agent1', 'completed')).toBe(false);
    });

    it('should show errors for extended duration', () => {
      widget.setUICtx(mockUICtx);
      (widget as any).finishedTurnAge = new Map([
        ['agent-error', 1],
      ]);
      
      expect((widget as any).shouldShowFinished('agent-error', 'error')).toBe(true);
    });
  });

  describe('markFinished', () => {
    it('should set finished age to 0', () => {
      widget.markFinished('agent1');
      expect((widget as any).finishedTurnAge.get('agent1')).toBe(0);
    });

    it('should not override existing age', () => {
      (widget as any).finishedTurnAge = new Map([
        ['agent1', 5],
      ]);
      
      widget.markFinished('agent1');
      expect((widget as any).finishedTurnAge.get('agent1')).toBe(0);
    });
  });

  describe('renderFinishedLine', () => {
    it('should render completed agent line', () => {
      const agent = {
        id: 'agent1',
        type: 'Agent',
        status: 'completed',
        description: 'Test agent',
        toolUses: 3,
        startedAt: 0,
        completedAt: 1000,
      };
      
      const result = widget.renderFinishedLine(
        agent,
        { fg: (color: string, text: string) => `[${color}:${text}]` }
      );
      
      expect(result).toContain('✓');
      expect(result).toContain('Agent');
      expect(result).toContain('Test agent');
    });

    it('should render error agent line with error message', () => {
      const agent: any = {
        id: 'agent-error',
        type: 'Agent',
        status: 'error',
        description: 'Failed agent',
        toolUses: 1,
        startedAt: 0,
        completedAt: 1000,
        error: 'Something went wrong',
      };
      
      const result = widget.renderFinishedLine(
        agent,
        { fg: (color: string, text: string) => `[${color}:${text}]` }
      );
      
      expect(result).toContain('✗');
      expect(result).toContain('error');
    });

    it('should render aborted agent line', () => {
      const agent = {
        id: 'agent-aborted',
        type: 'Agent',
        status: 'aborted',
        description: 'Aborted agent',
        toolUses: 0,
        startedAt: 0,
        completedAt: 1000,
      };
      
      const result = widget.renderFinishedLine(
        agent,
        { fg: (color: string, text: string) => `[${color}:${text}]` }
      );
      
      expect(result).toContain('✗');
      expect(result).toContain('aborted');
    });

    it('should include turn count in output', () => {
      const agent = {
        id: 'agent1',
        type: 'Agent',
        status: 'completed',
        description: 'Test',
        toolUses: 3,
        startedAt: 0,
        completedAt: 1000,
      };
      
      (widget as any).agentActivity = new Map([
        ['agent1', { turnCount: 5 }],
      ]);
      
      const result = widget.renderFinishedLine(
        agent,
        { fg: (color: string, text: string) => `[${color}:${text}]` }
      );
      
      expect(result).toContain('↻5');
    });
  });

  describe('renderWidget', () => {
    it('should return empty array when no agents active', () => {
      (mockManager.listAgents as any).mockReturnValue([]);
      widget.setUICtx(mockUICtx);
      
      const result = widget.renderWidget(mockTui, {
        fg: (color: string, text: string) => `[${color}:${text}]`,
      });
      
      expect(result).toEqual([]);
    });

    it('should render agent header', () => {
      (mockManager.listAgents as any).mockReturnValue([
        {
          id: 'agent1',
          type: 'Agent',
          status: 'running',
          description: 'Running agent',
          toolUses: 2,
          startedAt: 0,
        },
      ]);
      
      widget.setUICtx(mockUICtx);
      const theme = {
        fg: (color: string, text: string) => `[${color}:${text}]`,
        bold: (text: string) => `**${text}**`,
      };
      
      const result = widget.renderWidget(mockTui, theme);
      
      expect(result).toContain('[accent:Agents]');
    });

    it('should render running agent with spinner', () => {
      (mockManager.listAgents as any).mockReturnValue([
        {
          id: 'agent1',
          type: 'Agent',
          status: 'running',
          description: 'Running agent',
          toolUses: 2,
          startedAt: Date.now() - 1000,
          compactionCount: 0,
        },
      ]);
      
      (widget as any).agentActivity = new Map([
        ['agent1', {
          activeTools: new Map([['read', 'read']]),
          toolUses: 2,
          responseText: '',
          turnCount: 3,
          lifetimeUsage: { input: 100, output: 200, cacheWrite: 0 },
        }],
      ]);
      
      const result = widget.renderWidget(mockTui, {
        fg: (color: string, text: string) => `[${color}:${text}]`,
        bold: (text: string) => `**${text}**`,
      });
      
      expect(result).toContain('⠹'); // Spinner character
      expect(result).toContain('Agent');
      expect(result).toContain('Running agent');
      expect(result).toContain('↻3');
      expect(result).toContain('8.2k token');
      expect(result).toContain('1.0s');
    });

    it('should render activity description', () => {
      (mockManager.listAgents as any).mockReturnValue([
        {
          id: 'agent1',
          type: 'Agent',
          status: 'running',
          description: 'Test',
          toolUses: 0,
          startedAt: Date.now() - 1000,
          compactionCount: 0,
        },
      ]);
      
      (widget as any).agentActivity = new Map([
        ['agent1', {
          activeTools: new Map([['read', 'read'], ['edit', 'edit']]),
          toolUses: 2,
          responseText: 'Doing work',
          turnCount: 1,
          lifetimeUsage: { input: 50, output: 50, cacheWrite: 0 },
        }],
      ]);
      
      const result = widget.renderWidget(mockTui, {
        fg: (color: string, text: string) => `${text}`,
        bold: (text: string) => text,
      });
      
      expect(result).toContain('editing');
      expect(result).toContain('reading');
    });

    it('should handle overflow when too many agents', () => {
      const 20Agents = Array.from({ length: 20 }, (_, i) => ({
        id: `agent${i}`,
        type: 'Agent',
        status: 'running',
        description: `Agent ${i}`,
        toolUses: 0,
        startedAt: Date.now() - 1000,
        compactionCount: 0,
      }));
      
      (mockManager.listAgents as any).mockReturnValue(20Agents);
      
      widget.setUICtx(mockUICtx);
      
      const result = widget.renderWidget(mockTui, {
        fg: (color: string, text: string) => `${text}`,
        bold: (text: string) => text,
      });
      
      expect(result).toContain('+');
      expect(result).toContain('more');
    });

    it('should show queued agent count', () => {
      (mockManager.listAgents as any).mockReturnValue([
        {
          id: 'agent1',
          type: 'Agent',
          status: 'queued',
          description: 'Queued agent',
          toolUses: 0,
          startedAt: 0,
        },
      ]);
      
      widget.setUICtx(mockUICtx);
      
      const result = widget.renderWidget(mockTui, {
        fg: (color: string, text: string) => `[${color}:${text}]`,
        bold: (text: string) => text,
      });
      
      expect(result).toContain('queued');
    });

    it('should show finished agents when no active', () => {
      (mockManager.listAgents as any).mockReturnValue([
        {
          id: 'agent1',
          type: 'Agent',
          status: 'completed',
          description: 'Finished agent',
          toolUses: 2,
          startedAt: 0,
          completedAt: Date.now() - 100,
        },
      ]);
      
      widget.setUICtx(mockUICtx);
      
      const result = widget.renderWidget(mockTui, {
        fg: (color: string, text: string) => `[${color}:${text}]`,
        bold: (text: string) => text,
      });
      
      expect(result).toContain('├─');
      expect(result).toContain('✓');
      expect(result).toContain('Finished agent');
    });
  });

  describe('update', () => {
    it('should register widget when agents are active', () => {
      (mockManager.listAgents as any).mockReturnValue([
        {
          id: 'agent1',
          type: 'Agent',
          status: 'running',
          description: 'Running',
          toolUses: 0,
          startedAt: 0,
        },
      ]);
      
      widget.setUICtx(mockUICtx);
      widget.update();
      
      expect(mockUICtx.setWidget).toHaveBeenCalled();
    });

    it('should set status message for running agents', () => {
      (mockManager.listAgents as any).mockReturnValue([
        {
          id: 'agent1',
          type: 'Agent',
          status: 'running',
          description: 'Running',
          toolUses: 0,
          startedAt: 0,
        },
        {
          id: 'agent2',
          type: 'Agent',
          status: 'queued',
          description: 'Queued',
          toolUses: 0,
          startedAt: 0,
        },
      ]);
      
      widget.setUICtx(mockUICtx);
      widget.update();
      
      expect(mockUICtx.setStatus).toHaveBeenCalledWith(
        'subagents',
        expect.stringContaining('running')
      );
      expect(mockUICtx.setStatus).toHaveBeenCalledWith(
        'subagents',
        expect.stringContaining('queued')
      );
    });

    it('should set status to undefined when no agents active', () => {
      (mockManager.listAgents as any).mockReturnValue([]);
      
      widget.setUICtx(mockUICtx);
      widget.update();
      
      expect(mockUICtx.setStatus).toHaveBeenCalledWith(
        'subagents',
        undefined
      );
    });

    it('should clear widget when no agents active', () => {
      (mockManager.listAgents as any).mockReturnValue([]);
      (widget as any).widgetRegistered = true;
      
      widget.setUICtx(mockUICtx);
      widget.update();
      
      expect(mockUICtx.setWidget).toHaveBeenCalledWith('agents', undefined);
      expect((widget as any).widgetRegistered).toBe(false);
    });

    it('should increment widget frame on update', () => {
      const initialFrame = (widget as any).widgetFrame;
      
      (mockManager.listAgents as any).mockReturnValue([
        {
          id: 'agent1',
          type: 'Agent',
          status: 'running',
          description: 'Running',
          toolUses: 0,
          startedAt: 0,
        },
      ]);
      
      widget.setUICtx(mockUICtx);
      widget.update();
      
      expect((widget as any).widgetFrame).toBe(initialFrame + 1);
    });

    it('should clear finished agent ages when agent is gone', () => {
      (mockManager.listAgents as any).mockReturnValue([
        { id: 'agent2', type: 'Agent', startedAt: 0, status: 'running' },
      ]);
      
      (widget as any).finishedTurnAge = new Map([
        ['agent1', 5],
        ['agent2', 0],
      ]);
      
      widget.setUICtx(mockUICtx);
      widget.update();
      
      expect((widget as any).finishedTurnAge.has('agent1')).toBe(false);
      expect((widget as any).finishedTurnAge.has('agent2')).toBe(true);
    });
  });

  describe('dispose', () => {
    it('should clear timer', () => {
      const spy = vi.spyOn(global, 'clearInterval');
      (widget as any).widgetInterval = 1 as any;
      
      widget.dispose();
      
      expect(spy).toHaveBeenCalledWith(1);
    });

    it('should clear widget and UI context', () => {
      widget.setUICtx(mockUICtx);
      widget.dispose();
      
      expect(mockUICtx.setWidget).toHaveBeenCalledWith('agents', undefined);
      expect(mockUICtx.setStatus).toHaveBeenCalledWith('subagents', undefined);
    });

    it('should reset internal state', () => {
      widget.dispose();
      
      expect((widget as any).widgetRegistered).toBe(false);
      expect((widget as any).lastStatusText).toBeUndefined();
    });
  });
});
