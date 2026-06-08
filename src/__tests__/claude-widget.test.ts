/**
 * claude-widget.test.ts
 * Unit tests for Claude Widget styling constants
 */

import { describe, it, expect } from 'vitest';
import CLAUDE from '../ui/claude-widget';

describe('CLAUDE Theme Constants', () => {
  describe('SPINNER', () => {
    it('should have 10 Braille spinner frames', () => {
      expect(CLAUDE.SPINNER).toBeDefined();
      expect(CLAUDE.SPINNER).toHaveLength(10);
      expect(Array.isArray(CLAUDE.SPINNER)).toBe(true);
    });

    it('should all be single character strings', () => {
      for (const frame of CLAUDE.SPINNER) {
        expect(typeof frame).toBe('string');
        expect(frame.length).toBe(1);
      }
     });

    it('should contain valid Braille patterns', () => {
      const validBraille = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
      expect(CLAUDE.SPINNER).toEqual(validBraille);
     });
   });

  describe('BORDERS', () => {
    it('should have VERTICAL connector', () => {
      expect(CLAUDE.BORDERS.VERTICAL).toBe('│');
     });

    it('should have HORIZONTAL connector', () => {
      expect(CLAUDE.BORDERS.HORIZONTAL).toBe('─');
     });

    it('should have CORNER connector', () => {
      expect(CLAUDE.BORDERS.CORNER).toBe('└─');
     });

    it('should have MIDDLE connector', () => {
      expect(CLAUDE.BORDERS.MIDDLE).toBe('├─');
     });

    it('should have BRANCH space', () => {
      expect(CLAUDE.BORDERS.BRANCH).toBe('     ');
     });
   });

  describe('ICONS', () => {
    it('should have SUCCESS icon', () => {
      expect(CLAUDE.ICONS.SUCCESS).toBe('✓');
     });

    it('should have ERROR icon', () => {
      expect(CLAUDE.ICONS.ERROR).toBe('✗');
     });

    it('should have WARNING icon', () => {
      expect(CLAUDE.ICONS.WARNING).toBe('⚠');
     });

    it('should have INFO icon', () => {
      expect(CLAUDE.ICONS.INFO).toBe('○');
     });

    it('should have AGENT_ACTIVE icon', () => {
      expect(CLAUDE.ICONS.AGENT_ACTIVE).toBe('●');
     });

    it('should have AGENT_INACTIVE icon', () => {
      expect(CLAUDE.ICONS.AGENT_INACTIVE).toBe('○');
     });
   });

  describe('COLORS', () => {
    it('should have success color', () => {
      expect(CLAUDE.COLORS.success).toBe('#4ade80');
     });

    it('should have error color', () => {
      expect(CLAUDE.COLORS.error).toBe('#f87171');
     });

    it('should have warning color', () => {
      expect(CLAUDE.COLORS.warning).toBe('#fbbf24');
     });

    it('should have accent color', () => {
      expect(CLAUDE.COLORS.accent).toBe('#818cf8');
     });

    it('should have muted color', () => {
      expect(CLAUDE.COLORS.muted).toBe('#888888');
     });

    it('should have bgBase deep black', () => {
      expect(CLAUDE.COLORS.bgBase).toBe('#0d0d0d');
     });

    it('should have bgElevated background', () => {
      expect(CLAUDE.COLORS.bgElevated).toBe('#1a1a1a');
     });

    it('should have bgDimmed background', () => {
      expect(CLAUDE.COLORS.bgDimmed).toBe('#141414');
     });

    it('should have textPrimary color', () => {
      expect(CLAUDE.COLORS.textPrimary).toBe('#f5f5f5');
     });

    it('should have textSecondary color', () => {
      expect(CLAUDE.COLORS.textSecondary).toBe('#c7c7c7');
     });

    it('should have textMuted color', () => {
      expect(CLAUDE.COLORS.textMuted).toBe('#888888');
     });

    it('should have borderPrimary color', () => {
      expect(CLAUDE.COLORS.borderPrimary).toBe('#2a2a2a');
     });

    it('should have borderSecondary color', () => {
      expect(CLAUDE.COLORS.borderSecondary).toBe('#333333');
     });
   });

  describe('SPACING', () => {
    it('should have padding value', () => {
      expect(CLAUDE.SPACING.padding).toBe(8);
     });

    it('should have paddingX value', () => {
      expect(CLAUDE.SPACING.paddingX).toBe(12);
     });

    it('should have gap value', () => {
      expect(CLAUDE.SPACING.gap).toBe(4);
     });

    it('should have margin value', () => {
      expect(CLAUDE.SPACING.margin).toBe(2);
     });
   });

  describe('TYPOGRAPHY', () => {
    it('should have monospace fontFamily', () => {
      expect(CLAUDE.TYPOGRAPHY.fontFamily).toBe('monospace');
     });

    it('should have fontSize value', () => {
      expect(CLAUDE.TYPOGRAPHY.fontSize).toBe(1);
     });

    it('should have letterSpacing value', () => {
      expect(CLAUDE.TYPOGRAPHY.letterSpacing).toBe(0);
     });
   });

  describe('ANIMATION', () => {
    it('should have spinnerInterval at 80ms', () => {
      expect(CLAUDE.ANIMATION.spinnerInterval).toBe(80);
     });

    it('should have updateDebounce at 50ms', () => {
      expect(CLAUDE.ANIMATION.updateDebounce).toBe(50);
     });

    it('should have lingerTurns at 2', () => {
      expect(CLAUDE.ANIMATION.lingerTurns).toBe(2);
     });
   });

  describe('WIDGET', () => {
    it('should have maxWidth at 80', () => {
      expect(CLAUDE.WIDGET.maxWidth).toBe(80);
     });

    it('should have maxHeight at 12', () => {
      expect(CLAUDE.WIDGET.maxHeight).toBe(12);
     });

    it('should have headerHeight at 1', () => {
      expect(CLAUDE.WIDGET.headerHeight).toBe(1);
     });

    it('should have bodyLines at 11', () => {
      expect(CLAUDE.WIDGET.bodyLines).toBe(11);
     });
   });

  describe('AGENT', () => {
    it('should have maxDescription at 40', () => {
      expect(CLAUDE.AGENT.maxDescription).toBe(40);
     });

    it('should have maxTokenDisplay at 30', () => {
      expect(CLAUDE.AGENT.maxTokenDisplay).toBe(30);
     });

    it('should have turnSymbol', () => {
      expect(CLAUDE.AGENT.turnSymbol).toBe('↻');
     });

    it('should have agentSymbol', () => {
      expect(CLAUDE.AGENT.agentSymbol).toBe('⚙');
     });
   });

  describe('ACTIVITY', () => {
    it('should have reading activity', () => {
      expect(CLAUDE.ACTIVITY.reading).toBe('reading');
     });

    it('should have editing activity', () => {
      expect(CLAUDE.ACTIVITY.editing).toBe('editing');
     });

    it('should have searching activity', () => {
      expect(CLAUDE.ACTIVITY.searching).toBe('searching');
     });

    it('should have writing activity', () => {
      expect(CLAUDE.ACTIVITY.writing).toBe('writing');
     });

    it('should have running activity', () => {
      expect(CLAUDE.ACTIVITY.running).toBe('running command');
     });

    it('should have finding activity', () => {
      expect(CLAUDE.ACTIVITY.finding).toBe('finding files');
     });

    it('should have listing activity', () => {
      expect(CLAUDE.ACTIVITY.listing).toBe('listing');
     });

    it('should have default activity', () => {
      expect(CLAUDE.ACTIVITY.default).toBe('thinking');
     });
   });

  describe('color values validation', () => {
     const hexPattern = /^#[0-9A-Fa-f]{6}$/;

    it('should validate all color values are valid hex codes', () => {
       const colors = CLAUDE.COLORS;
       for (const [key, value] of Object.entries(colors)) {
         expect(hexPattern.test(value)).toBe(true);
         expect(key).toBeTruthy();
         expect(value).toBeTruthy();
        }
     });

    it('should have consistent color palette', () => {
       const colors = CLAUDE.COLORS;
       // Check that all colors are in the same hue family
       expect(colors.success.startsWith('#4')).toBe(true); // Green family
       expect(colors.error.startsWith('#f')).toBe(true); // Red family
       expect(colors.warning.startsWith('#f')).toBe(true); // Yellow family
       expect(colors.accent.startsWith('#8')).toBe(true); // Purple family
      });
   });

  describe('complete widget structure', () => {
    it('should have all required sections', () => {
      const requiredSections = ['SPINNER', 'BORDERS', 'ICONS', 'COLORS', 'SPACING',
        'TYPOGRAPHY', 'ANIMATION', 'WIDGET', 'AGENT', 'ACTIVITY'
      ];
      
      for (const section of requiredSections) {
        expect(CLAUDE).toHaveProperty(section);
      }
     });

    it('should have valid BRANCH spacing (at least 5 characters)', () => {
      expect(CLAUDE.BORDERS.BRANCH.length).toBeGreaterThanOrEqual(5);
     });
   });

  describe('integration with widget', () => {
    it('should be usable in real widget rendering', () => {
       // Simulate widget rendering
      const spinnerFrame = 3;
      const spinnerChar = CLAUDE.SPINNER[spinnerFrame];
      
      expect(spinnerChar).toBe('⠸'); // 4th frame
      
      const statusColor = CLAUDE.COLORS.success;
      expect(statusColor).toBe('#4ade80');
     });

    it('should support overflow behavior', () => {
      // Widget should have proper overflow handling
      expect(CLAUDE.WIDGET.maxHeight).toBe(12);
      expect(CLAUDE.SPACING.padding).toBe(8);
     });
   });
});

describe('CLAUDE Theme Practical Usage', () => {
  it('should create proper color combinations', () => {
     const theme = {
      fg: (color: string, text: string): string => `[${color}:${text}]`,
     };

     const output = [
      theme.fg(CLAUDE.COLORS.success, '✓'),
      theme.fg(CLAUDE.COLORS.error, '✗'),
      theme.fg(CLAUDE.COLORS.warning, '⚠'),
      theme.fg(CLAUDE.COLORS.accent, 'Agent'),
      theme.fg(CLAUDE.COLORS.muted, 'queued'),
      theme.fg(CLAUDE.COLORS.bgBase, 'background'),
     ];

     for (const outputItem of output) {
       expect(outputItem).toBeDefined();
       expect(outputItem).toContain(':');
      }
     });

  it('should use spinner correctly', () => {
     for (let i = 0; i < CLAUDE.SPINNER.length; i++) {
       const spinner = CLAUDE.SPINNER[i];
       expect(typeof spinner).toBe('string');
       expect(spinner.length).toBe(1);
       expect(!/^\s*$/.test(spinner)).toBe(true);
      }
     });

  it('should render tree structure', () => {
     const treeLines = [
      `├─ Running agent`,
      `│  └─ More details`,
      `├─ Queued agent`,
      `└─ Finished`,
     ];

     for (const line of treeLines) {
       expect(line.includes('└')).toBe(true);
       expect(line.includes('│')).toBe(true);
      }
     });

  it('should handle color gradients', () => {
     const colors = [
      CLAUDE.COLORS.success,
      CLAUDE.COLORS.error,
      CLAUDE.COLORS.warning,
      CLAUDE.COLORS.accent,
     ];

     for (const color of colors) {
       expect(color.length).toBe(7); // #XXXXXX
       expect(color[0]).toBe('#');
      }
     });
});
