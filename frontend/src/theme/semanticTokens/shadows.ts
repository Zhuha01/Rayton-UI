/**
 * Semantic shadow tokens with light/dark mode support.
 * Provides consistent shadow values for UI components like cards, menus, and buttons.
 */

export const DEVICE_TREE_STATUS_GLOW = "0 0 6px"

export const semanticShadows = {
  ui: {
    menuOverlay: {
      value: {
        _light: "0 10px 20px rgba(0,0,0,0.3)",
        _dark: "0 10px 20px rgba(0,0,0,0.3)",
      },
    },
    chartToolbarCard: {
      value: {
        _light: "0px 0px 2px rgba(0,0,0,0.2)",
        _dark: "0px 0px 2px rgba(0,0,0,0.57)",
      },
    },
    /** PLC Control tab: status and control cards */
    plcControlCard: {
      value: {
        _light:
          "0 4px 14px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.05)",
        _dark: "-2px 2px 8px rgba(0,0,0,0.15)",
      },
    },
    /** Shadow for the Stop button on the control card */
    plcControlStopButton: {
      value: {
        _light: "0 2px 6px rgba(0, 0, 0, 0.12)",
        _dark: "0px 4px 4px rgba(0, 0, 0, 0.25)",
      },
    },
    /** LED glow on the PLC diagnostic panel */
    diagnosticLedGreen: {
      value: {
        _light: "0 0 0 2px rgba(80, 246, 145, 0.35), 0 0 14px 3px rgba(80, 246, 145, 0.55)",
        _dark: "0 0 0 2px rgba(80, 246, 145, 0.35), 0 0 14px 3px rgba(80, 246, 145, 0.55)",
      },
    },
    diagnosticLedRed: {
      value: {
        _light: "0 0 0 2px rgba(218, 5, 5, 0.35), 0 0 14px 3px rgba(218, 5, 5, 0.5)",
        _dark: "0 0 0 2px rgba(218, 5, 5, 0.35), 0 0 14px 3px rgba(218, 5, 5, 0.5)",
      },
    },
    diagnosticLedOrange: {
      value: {
        _light: "0 0 0 2px rgba(255, 145, 0, 0.35), 0 0 14px 3px rgba(255, 145, 0, 0.5)",
        _dark: "0 0 0 2px rgba(255, 145, 0, 0.35), 0 0 14px 3px rgba(255, 145, 0, 0.5)",
      },
    },
    diagnosticLedNeutral: {
      value: {
        _light: "0 0 0 2px rgba(120, 120, 120, 0.25), 0 0 12px 2px rgba(120, 120, 120, 0.35)",
        _dark: "0 0 0 2px rgba(117, 117, 117, 0.35), 0 0 12px 2px rgba(117, 117, 117, 0.45)",
      },
    },
  },
}
