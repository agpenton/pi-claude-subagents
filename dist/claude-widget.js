/**
 * claude-widget.ts — Claude Code styled agent widget
 * 
 * This file provides the Claude Code aesthetic implementation for the pi-subagents
 * widget. It replaces the default tintin styling with a minimal, dark aesthetic.
 * 
 * Key Visual Characteristics:
 * - Deep blacks for backgrounds
 * - Soft accent colors (green, purple, red)
 * - Minimal borders and padding
 * - Clean monospace typography
 * - Braille spinners for animations
 */

// ============================================================================
// Claude Code Theme Constants
// ============================================================================

/**
 * Claude Code color palette and visual constants
 * Deep, professional aesthetic matching Claude Code CLI style
 */
export const CLAUDE = {
  /** Braille spinner frames for animated indicators */
  SPINNER: [
     "⠋", // frame 0
     "⠙", // frame 1
     "⠹", // frame 2
     "⠸", // frame 3
     "⠼", // frame 4
     "⠴", // frame 5
     "⠦", // frame 6
     "⠧", // frame 7
     "⠇", // frame 8
     "⠏", // frame 9
    ],

  /** Tree connector characters for widget structure */
  BORDERS: {
    VERTICAL: "│",       // Vertical branch
    HORIZONTAL: "─",     // Horizontal line
    CORNER: "└─",        // Corner (last item)
    MIDDLE: "├─",        // Middle (continue)
    BRANCH: "    ",       // Branch space
   },

  /** Icon characters for status indicators */
  ICONS: {
    SUCCESS: "✓",         // Success checkmark
    ERROR: "✗",           // Error X mark
    WARNING: "⚠",         // Warning triangle
    INFO: "○",            // Info circle
    AGENT_ACTIVE: "●",    // Active agent dot
    AGENT_INACTIVE: "○",  // Inactive agent dot
   },

  /** Status colors for the widget theme */
  COLORS: {
    // Status colors - soft, desaturated
    success: "#4ade80",   // Soft green (#4ade80)
    error: "#f87171",     // Soft red (#f87171)
    warning: "#fbbf24",   // Soft yellow (#fbbf24)
    accent: "#818cf8",    // Soft purple (#818cf8)
    muted: "#888888",     // Muted gray (#888888)
    
    // Widget background colors (for theme.fg equivalent)
    bgBase: "#0d0d0d",    // Deep black background
    bgElevated: "#1a1a1a", // Elevated background
    bgDimmed: "#141414",  // Dimmed background
    
    // Text colors
    textPrimary: "#f5f5f5", // Off-white text
    textSecondary: "#c7c7c7", // Secondary text
    textMuted: "#888888",   // Muted text
    
    // Border colors
    borderPrimary: "#2a2a2a", // Primary border
    borderSecondary: "#333333", // Secondary border
   },

  /** Spacing values for widget layout */
  SPACING: {
    padding: 8,           // Padding in pixels
    paddingX: 12,         // Horizontal padding
    gap: 4,               // Gap between elements
    margin: 2,            // Margin
   },

  /** Typography settings */
  TYPOGRAPHY: {
    fontFamily: "monospace",
    fontSize: 1,          // Standard terminal font size
    letterSpacing: 0,     // No letter spacing for terminal
   },

  /** Animation timing */
  ANIMATION: {
    spinnerInterval: 80,  // 80ms between spinner frames
    updateDebounce: 50,   // 50ms debounce for updates
    lingerTurns: 2,       // Turns to linger finished agents
   },

  /** Widget dimensions */
  WIDGET: {
    maxWidth: 80,         // Maximum widget width in characters
    maxHeight: 12,        // Maximum widget height in lines
    headerHeight: 1,      // Header line height
    bodyLines: 11,        // Body lines after header
   },

  /** Agent display properties */
  AGENT: {
    maxDescription: 40,   // Max description length
    maxTokenDisplay: 30,  // Max token string display
    turnSymbol: "↻",      // Turn counter symbol
    agentSymbol: "⚙",     // Agent icon
   },

  /** Activity symbols */
  ACTIVITY: {
    reading: "reading",
    editing: "editing",
    searching: "searching",
    writing: "writing",
    running: "running command",
    finding: "finding files",
    listing: "listing",
    default: "thinking",
   },
};

export default CLAUDE;
