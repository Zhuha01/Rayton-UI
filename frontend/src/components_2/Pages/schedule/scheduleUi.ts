/**
 * schedule Ui within the Rayton operator UI (components_2/Pages/schedule/scheduleUi.ts).
 * Built with Chakra UI and shared theme tokens to stay consistent with dashboards, management, and control surfaces.
 * Primary contract: exported component props and functions below (see TypeScript types for required fields).
 */
import { colors } from "@/theme/tokens/colors"

const SCHEDULE_COLORS = {
  calendar: {
    // Reuse shared dashboard calendar semantics to avoid token duplication.
    navIcon: "ui.Chart.calendarNavText",
    navHoverBg: "ui.Chart.calendarNavHoverBg",
    navHoverColor: "ui.Chart.calendarNavHoverText",
    monthBadgeBg: "ui.Chart.calendarMonthBadgeBg",
    monthBadgeText: "ui.Chart.calendarMonthBadgeText",
    weekdayText: "ui.Chart.calendarWeekdayText",
    outsideMonthDayText: "ui.Chart.calendarOutsideMonthDayText",
    regularDayText: "ui.Chart.calendarRegularDayText",
    selectedDayText: "ui.Chart.calendarSelectedDayText",
    dayHoverBg: "ui.Chart.calendarDayHoverBg",
    dayHoverText: "ui.Chart.calendarDayHoverText",
    todayRing: "ui.Chart.calendarTodayRing",
  },
  scrollBar: {
    trackBg: "#f1f1f1",
    thumbBg: "#ccc",
  },
  chartSeries: {
    price: "#3b82f6",
    chargePower: "#10b981",
    dischargePower: "#ef4444",
  },
} as const

export const SCHEDULE_UI = {
  tab: {
    container: {
      bg: "white",
      shadow: "sm",
      rounded: "lg",
      p: { base: 2, md: 4 },
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: "border.subtle",
      maxW: "100%",
      overflow: "hidden",
    } as const,
    colors: {
      calendar: {
        navIcon: SCHEDULE_COLORS.calendar.navIcon,
        navHoverBg: SCHEDULE_COLORS.calendar.navHoverBg,
        navHoverColor: SCHEDULE_COLORS.calendar.navHoverColor,
        monthBadgeBg: SCHEDULE_COLORS.calendar.monthBadgeBg,
        monthBadgeText: SCHEDULE_COLORS.calendar.monthBadgeText,
        weekdayText: SCHEDULE_COLORS.calendar.weekdayText,
        outsideMonthDayText: SCHEDULE_COLORS.calendar.outsideMonthDayText,
        regularDayText: SCHEDULE_COLORS.calendar.regularDayText,
        selectedDayText: SCHEDULE_COLORS.calendar.selectedDayText,
        dayHoverBg: SCHEDULE_COLORS.calendar.dayHoverBg,
        dayHoverText: SCHEDULE_COLORS.calendar.dayHoverText,
        todayRing: SCHEDULE_COLORS.calendar.todayRing,
      } as const,
    } as const,
    header: {
      direction: { base: "column", md: "row" },
      justify: "space-between",
      align: { base: "stretch", md: "center" },
      // Tight spacing under title row on desktop to reduce full-page micro-scroll.
      mb: { base: 2, md: 1 },
      gap: { base: 3, md: 6 }, // 24px between header columns
      titleGap: 2,
      titleJustify: "space-between",
      titleAlign: "center",
      headingSize: { base: "md", md: "lg" },
    } as const,
    refresh: {
      iconButton: {
        ariaLabel: "Refresh Data",
        size: "sm",
        variant: "ghost",
        display: "none",
      } as const,
      button: {
        size: "sm",
        display: { base: "none", md: "flex" },
      } as const,
    } as const,
    controls: {
      gap: 2,
      justify: { base: "space-between", md: "flex-end" },
      w: { base: "100%", md: "auto" },
      wrap: { base: "nowrap", md: "wrap" },
      buttonGroup: {
        variant: "solid",
        size: { base: "xs", md: "sm" },
      } as const,
      datePickerBoxFlexShrink: 0,
      datePickerSize: "sm",
      actionButton: {
        bg: "transparent",
        color: "text.normal",
        _hover: { bg: "ui.Interactive.hoverBg" },
        _active: { bg: "ui.Interactive.hoverBg" },
      } as const,
      actionButtonMobile: {
        h: "34px",
        px: "12px",
        borderRadius: "12px",
      } as const,
    } as const,
    grid: {
      templateColumns: { base: "1fr", md: "1fr 1fr" },
      gap: { base: 3, md: 6 }, // md gap = 24px
      itemMinW: "0",
    } as const,
    layout: {
      tablePl: { base: 0, md: 6 }, // 24px
      chartsPr: { base: 0, md: 6 }, // 24px
      // Desktop: remove bottom padding to avoid tiny page scroll.
      chartsPb: { base: 0, md: 0 },
    } as const,
    panels: {
      vStackAlignItems: "stretch",
      scrollBox: {
        overflowX: "auto",
        w: "100%",
      } as const,
      scrollBar: {
        height: "6px",
        trackBg: SCHEDULE_COLORS.scrollBar.trackBg,
        thumbBg: SCHEDULE_COLORS.scrollBar.thumbBg,
        thumbRadius: "3px",
      } as const,
    } as const,
  } as const,
  table: {
    headerBg: "ui.ScheduleTable.headerBg",
    headerTextColor: "ui.ScheduleTable.headerText",
    rowBgOdd: "ui.ScheduleTable.rowBgOdd",
    rowBgEven: "ui.ScheduleTable.rowBgEven",
    rowHoverBg: "ui.ScheduleTable.rowHoverBg",
    cellTextColor: "ui.ScheduleTable.cellText",
    mutedTextColor: "ui.ScheduleTable.mutedText",
    invalidRowBg: "ui.ScheduleTable.invalidRowBg",
    invalidInputBg: "ui.ScheduleTable.invalidInputBg",
    errorTextColor: "ui.ScheduleTable.errorText",
    invalidOutlineColor: "ui.ScheduleTable.invalidOutline",
    radius: "8px",
    // Base (Figma) table width for the 8-column layout.
    widthPx: 840,
    // 13× rowHeight (1 header + 12 rows) = 559; 560 matches chart stack math with stackGap 16 and trims slack vs old 565 to avoid layout micro-scroll.
    heightPx: 560,
    firstColWidthPx: 54,
    otherColWidthPx: 103.67,
    // Compact widths for the 8-column variant only (uniformly shrink all data columns).
    // Keeps 7-column variants unchanged.
    compact8: {
      // We want the first columns (#, start, end) tighter, because content is short ("12", "00:00").
      // Also keep checkbox columns narrower.
      // Column order (8 cols): #, Start, End, FromGrid, Sell, Charge, ChargeLimit, Discharge
      // Slightly widened to avoid last-column clipping (padding/border rounding).
      colWidthsPx: [44, 92, 92, 78, 78, 104, 104, 126] as const,
      // Add a few px to the last column specifically to avoid right-edge clipping.
      widthPx: 44 + 92 + 92 + 78 + 78 + 104 + 104 + 140, // 718px
    } as const,
    rowHeightPx: 43,
    fontSizePx: 14,
    cellPx: 4,
    cellPy: 3,
    headerPx: 4,
    headerPy: 4,
    /** Chakra `Table` recipe adds borders on cells; schedule + SES/UZE data tables use zebra bg only. */
    noCellBorderCss: {
      "& td, & th": {
        backgroundClip: "padding-box",
        borderWidth: 0,
        borderStyle: "none",
        borderColor: "transparent",
      },
      "& tr": {
        borderWidth: 0,
        borderStyle: "none",
      },
    },
    footer: {
      // Desktop: avoid tiny page scroll caused by extra footer spacing.
      mt: { base: 4, md: 0 },
      gap: 3,
      justify: "flex-end",
      alignItems: "center",
    } as const,
    /* Mobile card list (Figma 119:9435); colors are semantic tokens. */
    mobile: {
      cardRadius: "8px",
      badgeSizePx: 30,
      headerMinHPx: 62,
      stackGapPx: 16,
      stepperBtnPx: "19px",
      stepperValuePx: "16px",
      timeFontSizePx: 18,
      summaryFontSizePx: 14,
      bodyLabelFontSizePx: 16,
      bodyValueFontSizePx: 16,
      badgeFontSizePx: 16,
      mobileCardBg: "ui.ScheduleTable.mobileCardBg",
      mobileCardBorder: "ui.ScheduleTable.mobileCardBorder",
      mobileCardBorderActive: "ui.ScheduleTable.mobileCardBorderActive",
      mobileBadgeBg: "ui.ScheduleTable.mobileBadgeBg",
      mobileBadgeBorder: "ui.ScheduleTable.mobileBadgeBorder",
      mobileTimeText: "ui.ScheduleTable.mobileTimeText",
      mobileTimeTextActive: "ui.ScheduleTable.mobileTimeTextActive",
      mobileMutedText: "ui.ScheduleTable.mobileMutedText",
      mobileStepperRowBg: "ui.ScheduleTable.mobileStepperRowBg",
      mobileStepperBtnBg: "ui.ScheduleTable.mobileStepperBtnBg",
      mobileStepperValueBorder: "ui.ScheduleTable.mobileStepperValueBorder",
      mobileDivider: "ui.ScheduleTable.mobileDivider",
      mobileChevron: "ui.ScheduleTable.mobileChevron",
    } as const,
  },
  commandStatus: {
    minW: "220px",
    colors: {
      sending: "ui.ScheduleTable.statusSending",
      success: "ui.ScheduleTable.statusSuccess",
      failed: "ui.ScheduleTable.statusFailed",
    } as const,
  },
  chart: {
    /**
     * Schedule charts are intended to be "fully controllable" from this object:
     * - height policy (fixed vs match table)
     * - X axis ticks/count/label positions
     * - Y axis tick count and stable ticks
     * - optional time line (ReferenceLine) position
     */
    card: {
      p: 0,
      // Inner horizontal padding for the whole card content (header + chart),
      // so axis labels don't touch the card frame.
      // Reduce distance from the card frame to Y-axis numbers.
      innerPx: "1px",
      // Keep X-axis labels inside the frame (match side padding visually).
      innerPb: "6px",
      borderWidth: "1px",
      borderRadius: "lg",
      bg: "ui.NavbarComponent.background",
      borderColor: "ui.Chart.cardFrameBorder",
      overflow: "visible",
    } as const,
    loading: {
      p: 4,
      minHeight: "400px",
      spinnerAreaHeight: "300px",
    } as const,
    noData: {
      centerHeight: "300px",
    } as const,
    layout: {
      // Header inner padding is handled by chart.card.innerPx.
      headerPx: 0,
      // Reduce header top padding to keep total chart stack height
      // aligned with the schedule table height.
      headerPt: 1,
      // Chakra spacing token: 4 ≈ 16px between the two chart cards (tighter than 6/24px).
      headerGap: 4,
      // Requirement: 8px between header (label+legend) and the chart area.
      chartAreaMt: "8px",
      // Must match visual gap from headerGap; used in ScheduleChart matchTable height split.
      stackGapPx: 16,
      /**
       * Height policy for chart cards.
       *
       * - "matchTable": keep current layout (2 cards + gap = table height)
       * - "fixed": use `fixedCardHeightPx`
       */
      heightMode: "matchTable" as "matchTable" | "fixed",
      fixedCardHeightPx: { base: 320, md: 360 } as const,
      responsiveContainer: {
        width: "100%",
        initialDimension: { width: 320, height: 200 },
      } as const,
    } as const,
    responsive: {
      tooltipFontSize: { base: 10, md: 12 },
      tooltipPadding: { base: 5, md: 10 },
      // Allow 3-digit values with a minus sign without clipping.
      // Slightly tighter than before so labels don't sit far from the plot edge.
      yAxisWidth: { base: 40, md: 48 },
      cardHeight: { base: "320px", md: "360px" },
      cardTitleFontSize: { base: "10px", md: "12px" },
      legendFontSize: { base: "10px", md: "14px" },
      // Separate font sizes for better mobile control.
      xAxisFontSize: { base: 12, md: 14 },
      yAxisFontSize: { base: 12, md: 14 },
      xAxisInterval: { base: 0, md: 0 },
      chartMargins: {
        // Keep margins minimal so Y labels sit close to the frame.
        // Bottom margin ensures at least ~8px between X labels and card edge.
        // Requirement: 4px side spacing for the plot area as well.
        // Side spacing is handled by `card.innerPx` (4px); keep chart margins symmetric.
        // NOTE: Avoid asymmetric XAxis domain padding — it visually changes spacing near 24:00.
        // Use SVG margins instead; extra right margin makes centered "24:00" fit without shifting the plot start.
        base: { top: 4, right: 18, left: 0, bottom: 12 },
        md: { top: 5, right: 22, left: 0, bottom: 16 },
      },
    } as const,
    tooltip: {
      contentBorderRadiusPx: 4,
    } as const,
    grid: {
      // Schedule charts use the same solid horizontal grid as Energy charts.
      strokeWidth: 0.5,
    } as const,
    axes: {
      x: {
        tickMargin: 4,
        /**
         * Keep domain padding at 0 so hour=0 aligns with the plot start and tick spacing stays uniform.
         * Edge label clipping is handled via responsive.chartMargins.right + card padding.
         */
        padding: { left: 0, right: 0 },
        height: 28,
        // Keep edge label nudging minimal; prefer symmetric padding/margins for consistent spacing.
        // Nudge the last label ("24:00") slightly left to avoid clipping on narrow chart widths.
        edgeDx: { start: 0, end: -8 },
        /**
         * X ticks policy.
         * - When `ticks` is provided, it wins.
         * - Otherwise ticks are generated by `tickEveryHours` (e.g. 4 => 0,4,8,...,24).
         */
        tickEveryHours: 4,
        ticks: undefined as undefined | number[],
      } as const,
      y: {
        tickMargin: 0,
        fontWeight: 500,
        /**
         * Horizontal shift for Y tick labels only (applied on the <text>).
         * Use this instead of YAxis dx so the axis/grid doesn't slide over nearby text.
         */
        tickLabelDx: -4,
      } as const,
      // Extra headroom so the top Y tick doesn't get clipped by the SVG viewport.
      // Applied on top of responsive.chartMargins.top.
      extraTopMarginPx: { base: 8, md: 8 },
      // More ticks => denser horizontal grid (smaller distance between lines).
      yTickCount: 8,
    } as const,
    timeLine: {
      /**
       * Optional vertical "time line" on top of the chart (ReferenceLine).
       * - "none": no line
       * - "now": show current time (only when viewing today's date)
       * - "fixed": show at fixedHour
       */
      mode: "none" as "none" | "now" | "fixed",
      fixedHour: 12,
      stroke: "ui.Chart.cursorLine",
      strokeWidth: 1,
      strokeDasharray: "4 4",
    } as const,
    colors: {
      price: SCHEDULE_COLORS.chartSeries.price,
      chargePower: SCHEDULE_COLORS.chartSeries.chargePower,
      dischargePower: SCHEDULE_COLORS.chartSeries.dischargePower,
    } as const,
    gradients: {
      topOffset: "5%",
      bottomOffset: "95%",
      topOpacity: 0.1,
      bottomOpacity: 0,
      priceId: "colorPrice",
      chargePowerId: "colorChargePower",
      dischargePowerId: "colorDischargePower",
    } as const,
    series: {
      strokeWidth: 2,
      dotRadius: 0,
      activeDotRadius: 6,
      isAnimationActive: false,
      // Recharts "type" values are strings; keep them here to control globally.
      powerStepType: "stepAfter",
      priceStepType: "stepBefore",
    } as const,
  } as const,
} as const
