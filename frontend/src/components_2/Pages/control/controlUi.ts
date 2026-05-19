/**
 * Layout and style constants for the PLC Control tab: spacing, shadows, and semantic color token paths.
 * Colors resolve through `ui.PlcControl.*` (including diagnostics) and `shadows.ui.plcControl*` / `diagnosticLed*` in `theme/semanticTokens`.
 * Prefer adjusting those semantic tokens in the theme; use Chakra `sx`/`color` in components only for rare one-offs.
 */
export const plcControlUi = {
  layout: {
    containerPadding: 6,
    containerPaddingMobile: 4,
    sectionGap: 6,
    sectionGapMobile: 4,
    /** Vertical gap between the status/control stack and the indicators card below. */
    indicatorsBlockMarginTop: "24px",
    rowGap: 2,
    statusIconMinW: "20px",
    loadingHeight: "200px",
  },
  status: {
    sendingColor: "ui.PlcControl.commandSending",
    okColor: "ui.PlcControl.commandOk",
    failColor: "ui.PlcControl.commandFail",
  },
  /** Indicators card inner padding (16px on mobile per spec). */
  indicatorsCard: {
    paddingMobile: "16px",
    /** Desktop padding uses Chakra token `4` (~16px on the default scale). */
    paddingMd: 4,
    /** Horizontal padding for the diagnostic panel (divider spans full width without this inset). */
    paddingXSide: "24px",
  },
  statusCard: {
    bg: "ui.PlcControl.cardBg",
    minHeight: "87px",
    desktopHeight: "87px",
    radius: "8px",
    shadow: "ui.plcControlCard",
    accentBarBg: "ui.PlcControl.statusAccentBar",
    accentBarWidth: "4px",
    /** Gradient stop positions; colors come from `ui.PlcControl.statusGradient*` (+ `useToken` in StatusControlCard). */
    gradientStop1Pct: "0%",
    gradientStop2Pct: "24%",
    gradientStop3Pct: "55%",
    contentPaddingX: 6,
    contentPaddingXMobile: 4,
    contentPaddingTop: "16px",
    contentPaddingBottom: "16px",
    captionColor: "ui.PlcControl.mutedLabel",
    captionFontSize: "14px",
    titleFontSize: "18px",
    titleColor: "ui.PlcControl.primaryTitle",
    badgeBg: "ui.PlcControl.phaseBadgeBg",
    badgeTextColor: "ui.PlcControl.phaseBadgeText",
    badgeFontSize: "14px",
    badgePx: "8px",
    badgePy: "4px",
  },
  managementCard: {
    bg: "ui.PlcControl.cardBg",
    minHeight: "87px",
    desktopHeight: "87px",
    radius: "8px",
    shadow: "ui.plcControlCard",
    paddingX: 6,
    paddingXMobile: 4,
    paddingY: 0,
    /** Divider aligned with schematic card: `ui.PlcControl.cardDividerLine` (light #8F9296, dark #1E1E1E), 2px thick. */
    dividerColor: "ui.PlcControl.cardDividerLine",
    dividerThicknessPx: 2,
    /** Desktop horizontal gap between the vertical divider and the Start/Stop group. */
    dividerToStartStopGap: "24px",
    /** Gap between Start and Stop buttons inside the group. */
    startStopButtonsGap: "20px",
    mobilePaddingY: 4,
    titleColor: "ui.PlcControl.mutedLabel",
    titleFontSize: "18px",
    toggleTrackBg: "ui.PlcControl.toggleTrackTint",
    toggleRadius: "24px",
    toggleWidth: "65px",
    togglePadding: "4px",
    select: {
      bg: "ui.PlcControl.selectSurfaceBg",
      height: "50px",
      radius: "8px",
      px: 6,
      pxMobile: 3,
      py: 2,
      fontSize: "16px",
      color: "ui.PlcControl.selectSurfaceText",
    },
    pickButton: {
      bg: "ui.PlcControl.secondaryButtonBg",
      radius: "8px",
      px: 4,
      py: 2,
      fontSize: "16px",
      color: "ui.PlcControl.secondaryButtonText",
      hoverBg: "ui.PlcControl.secondaryButtonHoverBg",
      hoverColor: "ui.PlcControl.secondaryButtonHoverText",
    },
    startButton: {
      bg: "ui.PlcControl.startPrimaryBg",
      radius: "8px",
      px: 4,
      py: 4,
      fontSize: "16px",
      color: "ui.PlcControl.startPrimaryText",
      gap: 2,
      hoverBg: "ui.PlcControl.startPrimaryHoverBg",
      hoverColor: "ui.PlcControl.startPrimaryText",
      /** Desktop (md+): minimum button width; flex sizing allows growth on wider layouts. */
      desktopMinW: "115px",
      desktopHeight: "50px",
    },
    stopButton: {
      bg: "transparent",
      radius: "8px",
      px: 4,
      py: 4,
      fontSize: "16px",
      color: "ui.PlcControl.stopText",
      borderColor: "ui.PlcControl.stopBorder",
      borderWidth: "2px",
      boxShadow: "ui.plcControlStopButton",
      gap: 2,
      desktopMinW: "115px",
      desktopHeight: "50px",
      hoverBg: "ui.PlcControl.stopHoverBg",
      hoverColor: "ui.PlcControl.stopHoverOnDangerText",
      hoverBorderColor: "ui.PlcControl.stopBorder",
      hoverShadow: "ui.plcControlStopButton",
    },
  },
  card: {
    bg: "background.normal",
    padding: 6,
    headingMb: 4,
    emptyBg: "background.normal",
    emptyBorderColor: "border.normal",
    emptyPadding: 2,
  },
  /** Schematic preview card (`SchematicViewerCard`); colors must stay on semantic tokens only. */
  schematicCard: {
    bg: "ui.PlcControl.cardBg",
    shadow: "ui.plcControlCard",
    borderColor: "ui.PlcControl.cardDividerLine",
    /** Title and PDF fallback text color (~#787878 in both themes). */
    textColor: "ui.PlcControl.mutedLabel",
    radius: "8px",
    /** Thickness of the line under the title (matches `managementCard.dividerThicknessPx`). */
    dividerThicknessPx: 2,
    pdfSrc: "/assets/images/shema.pdf",
    /** Preview aspect ratio (drives height via padding-bottom). */
    aspectRatio: 1152 / 821,
  },
  buttons: {
    selectActiveBg: "ui.PlcControl.startPrimaryBg",
    selectInactiveBg: "ui.PlcControl.secondaryButtonBg",
    startActiveBg: "ui.PlcControl.startPrimaryBg",
    startInactiveBg: "ui.PlcControl.secondaryButtonBg",
    stopActiveBg: "ui.PlcControl.stopText",
    stopInactiveBg: "ui.PlcControl.secondaryButtonBg",
  },
} as const
