/**
 * Central palette and spacing tokens for SES/UZE device tree pages and frames.
 * Single source for connector rails, disclosure rows, and responsive column widths.
 */

const SES_UZE_PAGE_BASE = {
  panelBorder: "ui.DeviceTree.panelBorder",
  panelBorderWidth: "2px",
  panelRadius: "0",
  /** Vertical padding inside tree+data frame; horizontal flush with inner border edge. */
  panelPadding: "24px 0",
} as const

/** SES/UZE tree+data frame border props. */
const sesUzePanelFlexBorderProps = {
  borderWidth: 0,
  borderTopWidth: 0,
  borderBottomWidth: 0,
  borderLeftWidth: 0,
  borderRightWidth: 0,
} as const

export const DEVICE_TREE_PAGE_UI = {
  connector: {
    idle: "ui.DeviceTree.connectorIdle",
    /** Brighter stroke on the path to the selected leaf than surrounding row backgrounds. */
    active: "ui.DeviceTree.connectorActive",
    widthIdlePx: 2,
    widthActivePx: 3,
    /** Uniform trunk stroke where yellow and gray segments meet to avoid 1px gaps. */
    trunkStrokeUniformPx: 3,
    /** Offset between disclosure header bottom and continuing vertical trunk. */
    trunkGapBelowHeaderPx: 2,
    /** Vertical gap from header to first child and between stacked leaf rows. */
    rowVerticalSpacingPx: 24,
  },
  disclosure: {
    bg: "ui.DeviceTree.disclosureBg",
    borderRadius: "8px",
    padding: "8px",
    indicator: "ui.DeviceTree.leafStatusOnline",
    subtitle: "ui.DeviceTree.disclosureSubtitle",
    borderSelected: "ui.DeviceTree.disclosureBorderSelected",
    hoverFilter: "brightness(1.06)",
    toggle: {
      opacityIdle: 0.9,
      opacityHover: 1,
      focusOutline: "2px solid",
      focusOutlineColor: "whiteAlpha.600",
      focusOutlineOffset: "2px",
      chevronTransition: "transform 0.2s ease",
    },
  },
  leaf: {
    statusOnline: "ui.DeviceTree.leafStatusOnline",
    statusOffline: "ui.DeviceTree.leafStatusOffline",
    /** Icon color by device kind (separate from border colors). */
    iconColorByKind: {
      counter: "ui.DeviceTree.leafIconStrongCounter",
      counter_pcs: "ui.DeviceTree.leafIconStrongPcs",
      inverter: "ui.DeviceTree.leafIconStrongPcs",
      pcs: "ui.DeviceTree.leafIconStrongPcs",
      bms: "ui.DeviceTree.leafIconStrongBms",
      tms: "ui.DeviceTree.leafIconStrongTms",
      cell: "ui.DeviceTree.leafIconStrongCell",
      other: "ui.DeviceTree.leafIconStrongOther",
    } satisfies Record<
      | "counter"
      | "counter_pcs"
      | "inverter"
      | "bms"
      | "pcs"
      | "tms"
      | "cell"
      | "other",
      string
    >,
    /** Default leaf card background when no preset provided. */
    bgDefault: "ui.DeviceTree.leafBgDefault",
    /** Backgrounds for leaf cards by inferred device kind. */
    bgByKind: {
      counter: "ui.DeviceTree.leafBgCounter",
      counter_pcs: "ui.DeviceTree.leafBgCounter",
      inverter: "ui.DeviceTree.leafBgPcs",
      pcs: "ui.DeviceTree.leafBgPcs",
      bms: "ui.DeviceTree.leafBgBms",
      tms: "ui.DeviceTree.leafBgTms",
      cell: "ui.DeviceTree.leafBgCell",
      other: "ui.DeviceTree.leafBgOther",
    } satisfies Record<
      | "counter"
      | "counter_pcs"
      | "inverter"
      | "bms"
      | "pcs"
      | "tms"
      | "cell"
      | "other",
      string
    >,
    /** Selected-row border when no per-kind override exists in `selectedBorderByKind`. */
    selectedBorder: "ui.DeviceTree.leafSelectedBorder",
    /**
     * Per-device-type selected border: slightly lighter than the row fill for contrast.
     * Placeholder values; tune to match design when the API exposes device classes.
     */
    selectedBorderByKind: {
      counter: "ui.DeviceTree.leafIconCounter",
      counter_pcs: "ui.DeviceTree.leafIconPcs",
      inverter: "ui.DeviceTree.leafIconPcs",
      pcs: "ui.DeviceTree.leafIconPcs",
      bms: "ui.DeviceTree.leafIconBms",
      /** TMS accent: border plus connector highlight. */
      tms: "ui.DeviceTree.leafIconTms",
      cell: "ui.DeviceTree.leafIconCell",
      other: "ui.DeviceTree.leafIconOther",
    } satisfies Record<
      | "counter"
      | "counter_pcs"
      | "inverter"
      | "bms"
      | "pcs"
      | "tms"
      | "cell"
      | "other",
      string
    >,
    /** Extra filter applied to the selected row background (layered over the base kind fill). */
    selectedFilter: "none",
    rowRadius: "8px",
    hoverFilter: "brightness(1.08)",
  },
  /** Shared frame token for SES/UZE views combining tree and telemetry columns. */
  sesUzePage: {
    ...SES_UZE_PAGE_BASE,
    panelFlexBorderProps: sesUzePanelFlexBorderProps,
  },
  layout: {
    /** Minimum leaf row height aligned with `DeviceTreeListItem`. */
    treeLeafRowMinHeightPx: 33,
    treeDisclosureRowHeightPx: 72,
    /** Horizontal connector ends this many pixels before leaf text (0 = flush with margin). */
    horizontalGapBeforeLeafPx: 0,
    /**
     * Tree column must not shrink under flex pressure from the data pane.
     * `clamp` preserves design width on large screens and a floor on narrow ones.
     */
    treeColumnWidthCss: "min(100%, clamp(288px, 28vw, 400px))",
    /** Minimum label band width beside the rail so chips stay readable. */
    treeRowContentMinWidthPx: 232,
  },
} as const
