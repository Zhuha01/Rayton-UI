/**
 * Primary stacked-area energy chart with optional merged SOC view, brush zoom, and gradients.
 * Computes responsive margins, hourly tick rendering, and separates combined versus split energy modes.
 */

import { Button, useMediaQuery, useToken } from "@chakra-ui/react"
import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  CHART_GRADIENT_MAX_OPACITY,
  CHART_GRADIENT_MIN_OPACITY,
  type ChartGradientConfig,
  type ChartGradientStop,
  GET_CHART_GRADIENT,
} from "@/theme/semanticTokens/chart"
import { ChartLegend } from "./ChartLegend"
import {
  buildInterpolatedTooltipData,
  colorKeyForSeries,
  computeNiceTicks,
  computeStablePowerZoomTicks,
  computeTightNiceTicks,
  formatHourlyTick,
  formatSig3,
  formatXAxisTimestamp,
  getAxisScale,
  getAxisScaleForValue,
  LEGEND_DESIRED_ORDER,
  tooltipItemSortIndex,
} from "./chartUtils"
import type {
  AggregateBy,
  ChartRow,
  SeriesInfoItem,
  SeriesMeta,
  TransformedChartData,
} from "./dashboardTypes"
import type { PercentHeight } from "@/hooks/useChartDimensions"

function VerticalCursor(props: any) {
  const x = props?.points?.[0]?.x
  const top = props?.top ?? 0
  const height = props?.height
  if (typeof x !== "number" || typeof height !== "number") return null
  // Recharts sometimes places the cursor exactly on the chart edge (x=0),
  // which visually "leaks" under the card frame as a thin line.
  // Avoid rendering the cursor when it's effectively on the left/right edge.
  const left = props?.viewBox?.x ?? props?.left ?? 0
  const width = props?.viewBox?.width ?? props?.width
  if (typeof left === "number") {
    if (x <= left + 1) return null
    if (typeof width === "number" && x >= left + width - 1) return null
  }
  return (
    <line
      x1={x}
      x2={x}
      y1={top}
      y2={top + height}
      stroke={props?.stroke ?? "var(--chakra-colors-ui-Chart-cursorLine)"}
      strokeWidth={1}
    />
  )
}

export interface AreaTrendChartProps {
  isSocCombined: boolean
  transformedEnergy: TransformedChartData | null
  transformedSoc: TransformedChartData | null
  transformedCombined: TransformedChartData | null
  startDate: Date
  endDate: Date
  aggregateBy: AggregateBy
  hourlyTicks: number[] | undefined
  chartMargins: { top: number; right: number; left: number; bottom: number }
  xAxisHeight: number
  yAxisWidth: number
  yAxisLabelOffset: number
  tooltipFontSize: number
  tooltipPadding: number
  energyChartHeight: PercentHeight
  /** Extra left margin inside the chart SVG (in px). */
  chartLeftMarginPx?: number
  activeSeries: string[]
  onLegendClick: (name: string) => void
  seriesMetaForSort: SeriesMeta[]
  timeRange: "1D" | string
  zoomDomain: [number, number] | null
  setZoomDomain: (domain: [number, number] | null) => void
  /** Provided by parent; keeps desktop sizing stable. */
  isMobile?: boolean
  /**
   * When false (e.g. mobile default), drag-to-zoom on the chart is disabled so
   * toolbar/touch scrolling does not accidentally trigger a zoom brush.
   */
  allowChartBrushZoom?: boolean
}

export function AreaTrendChart({
  isSocCombined,
  transformedEnergy,
  transformedSoc,
  transformedCombined,
  startDate,
  endDate,
  aggregateBy,
  hourlyTicks,
  chartMargins,
  xAxisHeight,
  yAxisWidth,
  yAxisLabelOffset,
  tooltipFontSize,
  tooltipPadding,
  energyChartHeight,
  chartLeftMarginPx,
  activeSeries,
  onLegendClick,
  seriesMetaForSort,
  timeRange,
  zoomDomain,
  setZoomDomain,
  isMobile: isMobileProp,
  allowChartBrushZoom = true,
}: AreaTrendChartProps) {
  const { t, i18n } = useTranslation("Dashboard")
  const [axisText, gridLine, tooltipBg, tooltipText, cursorLine] = useToken(
    "colors",
    [
      "ui.Chart.axisText",
      "ui.Chart.grid",
      "ui.Chart.tooltipBg",
      "ui.Chart.tooltipText",
      "ui.Chart.cursorLine",
    ],
  )
  const [isMobileMq] = useMediaQuery(["(max-width: 767px)"], { ssr: false })
  const isMobile = isMobileProp ?? isMobileMq
  // PC: keep big axis text consistent with BatteryStatusCard (14px).
  // Mobile: shrink to 10px so labels fit inside the card frame.
  const axisFontSize = isMobile ? 10 : 14
  // Keep power-unit and SOC captions visually balanced on narrow cards.
  const axisLabelFontSize = isMobile ? 10 : 14
  const formatXAxis = (ts: number) =>
    formatXAxisTimestamp(ts, aggregateBy, i18n.resolvedLanguage)
  const isMobileDayHourly = isMobile && aggregateBy === "hour"

  const isZoomEnabled = timeRange === "1D"
  const brushZoomActive = isZoomEnabled && allowChartBrushZoom
  const [refAreaLeft, setRefAreaLeft] = useState<number | null>(null)
  const [refAreaRight, setRefAreaRight] = useState<number | null>(null)

  useEffect(() => {
    if (brushZoomActive) return
    setRefAreaLeft(null)
    setRefAreaRight(null)
    if (typeof document !== "undefined") document.body.style.userSelect = ""
  }, [brushZoomActive])

  const legendRef = useRef<HTMLDivElement | null>(null)
  const [legendHeight, setLegendHeight] = useState(0)

  useEffect(() => {
    if (!isMobile) return
    const el = legendRef.current
    if (!el) return

    const measure = () =>
      setLegendHeight(el.getBoundingClientRect().height || 0)
    measure()
    // iOS Safari sometimes needs a second measurement after layout/fonts settle.
    const t = setTimeout(measure, 50)

    const RO = (globalThis as any).ResizeObserver as
      | (new (
          cb: ResizeObserverCallback,
        ) => ResizeObserver)
      | undefined
    if (!RO) return

    const ro = new RO(() => measure())
    ro.observe(el)
    return () => {
      clearTimeout(t)
      ro.disconnect()
    }
  }, [isMobile])

  const xDomain: [number, number] = zoomDomain ?? [
    startDate.getTime(),
    endDate.getTime(),
  ]

  const [xMin, xMax] = useMemo(() => {
    const [a, b] = xDomain
    return a <= b ? ([a, b] as const) : ([b, a] as const)
  }, [xDomain])

  const visibleEnergyData = useMemo(() => {
    const data = transformedEnergy?.chartData ?? []
    if (!zoomDomain) return data
    return data.filter((r) => r.x >= xMin && r.x <= xMax)
  }, [transformedEnergy, xMax, xMin, zoomDomain])

  const visibleSocOrCombinedData = useMemo(() => {
    const base = isSocCombined
      ? transformedCombined?.chartData
      : transformedSoc?.chartData
    const data = base ?? []
    if (!zoomDomain) return data
    return data.filter((r) => r.x >= xMin && r.x <= xMax)
  }, [
    isSocCombined,
    transformedCombined,
    transformedSoc,
    xMax,
    xMin,
    zoomDomain,
  ])

  const computeMinMax = (data: ChartRow[], keys: string[]) => {
    let min = 0
    let max = 0
    let has = false
    for (const row of data) {
      for (const k of keys) {
        const v = row[k]
        if (typeof v === "number" && Number.isFinite(v)) {
          if (!has) {
            min = v
            max = v
            has = true
          } else {
            if (v < min) min = v
            if (v > max) max = v
          }
        }
      }
    }
    return { min, max, has }
  }

  const computePowerTicksWithZeroFloor = (
    data: ChartRow[],
    keys: string[],
  ): number[] => {
    // Zoomed view: force exactly 6 ticks / 5 intervals so the visual spacing
    // between horizontal grid lines stays identical to the full-day view.
    if (zoomDomain) {
      return computeStablePowerZoomTicks(data, keys)
    }
    // Always keep 6 horizontal lines (5 intervals).
    const base = computeTightNiceTicks(data, keys)
    const { min, max, has } = computeMinMax(data, keys)
    if (!has) return base

    // If the visible range is entirely >= 0, force axis bottom to 0 and add headroom.
    if (min >= 0 && max >= 0) {
      const count = base.length
      const intervals = count - 1
      const absExt = Math.max(1e-9, max)
      const stepBase =
        absExt <= 10 ? 1 : absExt <= 30 ? 3 : absExt <= 100 ? 5 : 10
      const ceilTo = (v: number, baseStep: number) =>
        Math.ceil(v / baseStep) * baseStep
      const topTarget = ceilTo(max, stepBase) + stepBase
      let step = Math.ceil(topTarget / intervals)
      if (step <= 0) step = 1
      const round = (n: number) => +n.toFixed(6)
      return Array.from({ length: count }, (_, i) => round(i * step))
    }

    return base
  }

  const _computeYDomainForPower = (
    data: ChartRow[],
    keys: string[],
  ): [number, number] => {
    const { min, max, has } = computeMinMax(data, keys)
    if (!has) return [0, 1]

    // If visible range is entirely >= 0, keep a zero baseline and a "nice" top with headroom.
    if (min >= 0 && max >= 0) {
      const absExt = Math.max(1e-9, max)
      const stepBase =
        absExt <= 10 ? 1 : absExt <= 30 ? 3 : absExt <= 100 ? 5 : 10
      const ceilTo = (v: number, baseStep: number) =>
        Math.ceil(v / baseStep) * baseStep
      const topTarget = ceilTo(max, stepBase) + stepBase
      return [0, topTarget]
    }

    // Mixed/negative values: fall back to our tick generator domain.
    const ticks =
      aggregateBy === "hour"
        ? computeTightNiceTicks(data, keys)
        : computeNiceTicks(data, keys)
    return [ticks[0], ticks[ticks.length - 1]]
  }

  const xTicks = useMemo((): number[] | undefined => {
    // Always render a fixed 9-tick timeline so spacing is stable.
    const count = 9
    const span = xMax - xMin
    if (!Number.isFinite(span) || span <= 0) return hourlyTicks
    const step = span / (count - 1)
    return Array.from({ length: count }, (_, i) => xMin + i * step)
  }, [hourlyTicks, xMax, xMin])

  /**
   * A tooltip that fills in interpolated values for series that don't have a
   * real API point at the hovered X. The underlying `chartData` stays pure
   * (only values actually returned by the API), so axis scaling, gradients,
   * and any export remain correct. This map is used purely for what the user
   * sees in the tooltip and matches the line that Recharts draws through gaps
   * via `connectNulls={true}`.
   */
  const buildTooltipLookup = (
    data: ChartRow[],
    info: SeriesInfoItem[],
  ): Map<number, ChartRow> => {
    const filled = buildInterpolatedTooltipData(
      data,
      info.map((s) => s.name),
    )
    const map = new Map<number, ChartRow>()
    for (const row of filled) map.set(row.x, row)
    return map
  }

  interface InterpolatedTooltipContentProps {
    active?: boolean
    label?: string | number
    lookup: Map<number, ChartRow>
    info: SeriesInfoItem[]
    formatItem: (value: number, name: string) => [string, string]
  }

  const InterpolatedTooltipContent = ({
    active,
    label,
    lookup,
    info,
    formatItem,
  }: InterpolatedTooltipContentProps) => {
    if (!active || label === undefined) return null
    const labelNum = typeof label === "number" ? label : Number(label)
    if (!Number.isFinite(labelNum)) return null
    const row = lookup.get(labelNum)
    if (!row) return null
    const items = info
      .filter((s) => activeSeries.includes(s.name))
      .map((s) => {
        const raw = row[s.name]
        if (typeof raw !== "number" || !Number.isFinite(raw)) return null
        const [formattedValue, _displayName] = formatItem(raw, s.name)
        const displayName = tooltipLabelBySeriesName.get(s.name) ?? _displayName
        return {
          rawName: s.name,
          name: displayName,
          value: formattedValue,
          color: s.color,
        }
      })
      .filter(
        (
          v,
        ): v is { rawName: string; name: string; value: string; color: string } =>
          v !== null,
      )
      .sort(
        (a, b) =>
          tooltipItemSortIndex(
            a.rawName,
            seriesMetaForSort,
            LEGEND_DESIRED_ORDER,
          ) -
          tooltipItemSortIndex(
            b.rawName,
            seriesMetaForSort,
            LEGEND_DESIRED_ORDER,
          ),
      )
    if (items.length === 0) return null
    return (
      <div
        className="recharts-default-tooltip"
        style={{
          margin: 0,
          padding: tooltipPadding,
          whiteSpace: "nowrap",
          backgroundColor: tooltipBg,
          border: "none",
          borderRadius: "8px",
          fontSize: tooltipFontSize,
          color: tooltipText,
          outline: "none",
        }}
      >
        <p className="recharts-tooltip-label" style={{ margin: 0 }}>
          {new Date(labelNum).toLocaleString(i18n.resolvedLanguage)}
        </p>
        <ul
          className="recharts-tooltip-item-list"
          style={{ padding: 0, margin: 0 }}
        >
          {items.map((it) => (
            <li
              key={it.name}
              className="recharts-tooltip-item"
              style={{
                display: "block",
                paddingTop: 4,
                paddingBottom: 4,
                color: it.color,
              }}
            >
              <span className="recharts-tooltip-item-name">{it.name}</span>
              <span className="recharts-tooltip-item-separator"> : </span>
              <span className="recharts-tooltip-item-value">{it.value}</span>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  // Make the fill gradient lighter for the "day" view (timeRange 1D),
  // which uses hourly aggregation in this chart.
  const gradientOpacityFactor = aggregateBy === "hour" ? 0.6 : 1
  const gradientMaxOpacity = CHART_GRADIENT_MAX_OPACITY * gradientOpacityFactor
  const gradientMinOpacity = CHART_GRADIENT_MIN_OPACITY * gradientOpacityFactor

  // Never hide the whole chart just because SOC/combined series isn't ready yet.
  // On mobile this looked like the chart "disappears" during SOC toggles/loading.
  if (!transformedEnergy) {
    return null
  }

  const canRenderCombined = isSocCombined && !!transformedCombined

  const legendTop = 4
  const legendGapToPlot = 8
  const axisLabelGapToPlot = 4
  // Gap legend → "Power,kW" → gap before plot. internalMarginTop lives *inside*
  // the SVG; it must not be added again into padding-top or the card grows a
  // false "7th row" gap when SOC is on a separate card.
  const gapAfterLegend = 4
  const gapLabelToChart = 4
  const MOBILE_CHART_HEIGHT_PX = 360
  const internalMarginTop = 40
  const axisLabelTop = isMobile ? legendTop + legendHeight + gapAfterLegend : 16
  const baseMobileTopReserve = isMobile
    ? legendTop + legendHeight + legendGapToPlot
    : 0
  const minReserveFromAxisTitle = isMobile
    ? axisLabelTop +
      axisLabelFontSize +
      axisLabelGapToPlot +
      gapLabelToChart -
      internalMarginTop +
      2
    : 0
  const mobileTopReserve = isMobile
    ? Math.max(baseMobileTopReserve, minReserveFromAxisTitle)
    : 0
  const mobileChartShellStyle: CSSProperties | undefined = isMobile
    ? {
        boxSizing: "border-box",
        paddingTop: mobileTopReserve,
        minHeight: mobileTopReserve + MOBILE_CHART_HEIGHT_PX,
        height: "auto",
      }
    : undefined
  // isMobileDayHourly: tighter bottom band under the time axis (see margin.bottom).
  const internalMargins = {
    top: internalMarginTop,
    right: isMobile ? 8 : 20,
    // Allow explicit 0 from parent (?? would treat only null/undefined, but keep clear).
    left: chartLeftMarginPx != null ? chartLeftMarginPx : 18,
    bottom: isMobileDayHourly ? 8 : 16,
  }
  // Mobile day: narrower Y-axis band = less empty space left of the plot.
  const effectiveYAxisWidth = isMobileDayHourly
    ? Math.min(yAxisWidth, 30)
    : yAxisWidth
  const xAxisBandHeightPx = isMobileDayHourly ? 28 : 35

  const legendPayload = useMemo(
    () =>
      transformedEnergy.seriesInfo.map((s) => ({
        value: s.name,
        color: s.color,
      })),
    [transformedEnergy.seriesInfo],
  )
  const desktopLegendMarginTop = transformedEnergy.seriesInfo.length > 8 ? -28 : -54

  const tooltipLabelBySeriesName = useMemo(() => {
    const map = new Map<string, string>()
    for (const meta of seriesMetaForSort) {
      const key = colorKeyForSeries(meta)
      if (!key) continue
      map.set(meta.name, t(`legend.${key}`, { defaultValue: meta.name }))
    }
    return map
  }, [seriesMetaForSort, t, i18n.resolvedLanguage])

  const effectiveXAxisTickCount = 9
  // Anchor first/last ticks at the plot edges while centering interior labels.
  const renderXAxisTick = (props: {
    x: number
    y: number
    index: number
    payload: { value: number }
  }) => {
    const { x, y, index, payload } = props
    const anchor: "start" | "middle" | "end" = isMobile
      ? "middle"
      : index === 0
        ? "start"
        : index === effectiveXAxisTickCount - 1
          ? "end"
          : "middle"
    const _span = xMax - xMin
    const label = zoomDomain
      ? new Date(payload.value).toLocaleTimeString(i18n.resolvedLanguage, {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      : aggregateBy === "hour" && hourlyTicks
        ? formatHourlyTick(payload.value, index, hourlyTicks.length)
        : formatXAxis(payload.value)
    return (
      <text
        x={x}
        y={y}
        dy={12}
        fill={axisText}
        textAnchor={anchor}
        style={{
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: `${axisFontSize}px`,
          fontWeight: 500,
        }}
      >
        {label}
      </text>
    )
  }

  const renderXAxis = () => (
    <XAxis
      type="number"
      dataKey="x"
      height={xAxisBandHeightPx}
      domain={xDomain}
      ticks={xTicks}
      interval={0}
      // Mobile: keep centered labels fully inside the card frame.
      padding={isMobile ? { left: 10, right: 10 } : { left: 0, right: 0 }}
      axisLine={false}
      tickLine={false}
      allowDataOverflow={true}
      minTickGap={30}
      tick={renderXAxisTick}
    />
  )

  const renderYAxis = (baseUnit: "kW" | "kWh", ticks: number[]) => {
    const yMaxAbs = Math.max(...ticks.map((t) => Math.abs(t)))
    const yScale = getAxisScale(yMaxAbs, baseUnit === "kW" ? "kW" : "kWh")
    const renderYAxisTick = (props: {
      x: number
      y: number
      payload: { value: number }
    }) => {
      const { x, y, payload } = props
      return (
        <text
          x={x}
          y={y}
          dy={4}
          fill={axisText}
          textAnchor="end"
          style={{ fontSize: `${axisFontSize}px`, fontWeight: 500 }}
        >
          {formatSig3(payload.value / yScale.divisor)}
        </text>
      )
    }
    return (
      <YAxis
        ticks={ticks}
        domain={[ticks[0], ticks[ticks.length - 1]]}
        interval={0}
        // Pin axis domain to our manually computed ticks so the grid cannot
        // compress when zooming into a smaller data range.
        allowDataOverflow={true}
        axisLine={false}
        tickLine={false}
        width={effectiveYAxisWidth}
        tick={renderYAxisTick}
      />
    )
  }

  const renderGrid = () => (
    <CartesianGrid
      vertical={false}
      syncWithTicks={true}
      stroke={gridLine}
      strokeWidth={0.5}
    />
  )

  interface GradientDef {
    id: string
    config: ChartGradientConfig
  }

  /**
   * Build gradient stops that fade to 0 opacity at the zero axis on both sides.
   * - All positive: line at top (max opacity), fades to 0 going down.
   * - All negative: gradient starts at 0 at top (zero axis) and darkens going
   *   down toward the line (max opacity at bottom).
   * - Mixed: split at the zero-axis; stops are [max, 0, 0, max] so the fill
   *   disappears exactly where the line crosses zero.
   */
  const computeGradientStops = (
    data: ChartRow[],
    dataKey: string,
  ): ChartGradientStop[] => {
    const values: number[] = []
    for (const row of data) {
      const v = row[dataKey]
      if (typeof v === "number" && Number.isFinite(v)) values.push(v)
    }
    if (values.length === 0) {
      return [
        { offset: "0%", opacity: gradientMaxOpacity },
        { offset: "100%", opacity: gradientMinOpacity },
      ]
    }
    let min = values[0]
    let max = values[0]
    for (const v of values) {
      if (v < min) min = v
      if (v > max) max = v
    }
    if (min >= 0) {
      return [
        { offset: "0%", opacity: gradientMaxOpacity },
        { offset: "100%", opacity: gradientMinOpacity },
      ]
    }
    if (max <= 0) {
      return [
        { offset: "0%", opacity: gradientMinOpacity },
        { offset: "100%", opacity: gradientMaxOpacity },
      ]
    }
    const zeroPct = `${((max / (max - min)) * 100).toFixed(2)}%`
    return [
      { offset: "0%", opacity: gradientMaxOpacity },
      { offset: zeroPct, opacity: gradientMinOpacity },
      { offset: zeroPct, opacity: gradientMinOpacity },
      { offset: "100%", opacity: gradientMaxOpacity },
    ]
  }

  const buildGradients = (
    info: SeriesInfoItem[],
    data: ChartRow[],
    gradPrefix: string,
  ): GradientDef[] => {
    return info
      .map((series) => {
        const key = colorKeyForSeries({
          name: series.name,
          data_id: series.dataId,
        })
        if (!key) return null
        const base = GET_CHART_GRADIENT(key)
        const stops = computeGradientStops(data, series.name)
        return {
          id: `${gradPrefix}_${series.dataId}`,
          config: { color: base.color, stops },
        }
      })
      .filter((g): g is GradientDef => g !== null)
  }

  const renderDefs = (gradients: GradientDef[]) => (
    <defs>
      {gradients.map((g) => (
        <linearGradient key={g.id} id={g.id} x1="0" y1="0" x2="0" y2="1">
          {g.config.stops.map((stop, i) => (
            <stop
              key={i}
              offset={stop.offset}
              stopColor={g.config.color}
              stopOpacity={stop.opacity}
            />
          ))}
        </linearGradient>
      ))}
    </defs>
  )

  const renderAreas = (info: SeriesInfoItem[], gradPrefix: string) =>
    info.map((series) => {
      const key = colorKeyForSeries({
        name: series.name,
        data_id: series.dataId,
      })
      const fill = key ? `url(#${gradPrefix}_${series.dataId})` : series.color
      return (
        <Area
          key={series.name}
          type="monotone"
          dataKey={series.name}
          stroke={series.color}
          fill={fill}
          fillOpacity={1}
          strokeWidth={1.5}
          connectNulls={true}
          isAnimationActive={false}
          dot={false}
          activeDot={{
            r: 3,
            stroke: series.color,
            strokeWidth: 0,
            fill: series.color,
          }}
          hide={!activeSeries.includes(series.name)}
        />
      )
    })

  if (canRenderCombined && transformedCombined) {
    const combinedGradients = buildGradients(
      transformedCombined.seriesInfo,
      transformedCombined.chartData,
      "grad_combined",
    )
    const combinedTickKeys = transformedCombined.seriesInfo
      .map((s) => s.name)
      .filter((n) => activeSeries.includes(n))
    const combinedYTicks =
      aggregateBy === "hour"
        ? computePowerTicksWithZeroFloor(
            visibleSocOrCombinedData,
            combinedTickKeys,
          )
        : computeNiceTicks(visibleSocOrCombinedData, combinedTickKeys)
    const combinedMaxAbs = Math.max(...combinedYTicks.map((t) => Math.abs(t)))
    const combinedScale = getAxisScale(combinedMaxAbs, "kW")
    const combinedTooltipLookup = buildTooltipLookup(
      transformedCombined.chartData,
      transformedCombined.seriesInfo,
    )
    const combinedTooltipFormatItem = (
      v: number,
      name: string,
    ): [string, string] => {
      const isSoc = /\bsoc\b|%\s*$|заряд/i.test(name)
      if (isSoc) return [`${formatSig3(v)} %`, name]
      const s = getAxisScaleForValue(v, "kW")
      return [`${formatSig3(v / s.divisor)} ${s.unit}`, name]
    }
    return (
      <div
        style={{
          position: "relative",
          width: "100%",
          ...(isMobile ? mobileChartShellStyle : { height: "100%" }),
        }}
      >
        {/* Mobile legend overlay (4px from card frame; doesn't affect chart layout) */}
        {isMobile && (
          <div
            style={{
              position: "absolute",
              top: 4,
              right: 8,
              zIndex: 4,
              maxWidth: "calc(100% - 24px)",
            }}
          >
            {/* ref only on legend wrapper so ResizeObserver height ignores overlay Reset */}
            <div
              ref={legendRef}
              style={{
                position: "relative",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <ChartLegend
                payload={
                  transformedCombined.seriesInfo.map((s) => ({
                    value: s.name,
                    color: s.color,
                  })) as any
                }
                seriesMeta={seriesMetaForSort}
                activeSeries={activeSeries}
                onLegendClick={onLegendClick}
              />
              {zoomDomain ? (
                <Button
                  size="xs"
                  variant="ghost"
                  position="absolute"
                  top="100%"
                  right={0}
                  mt="6px"
                  zIndex={5}
                  onClick={() => setZoomDomain(null)}
                >
                  {t("toolbar.resetZoom")}
                </Button>
              ) : null}
            </div>
          </div>
        )}
        <div
          style={{
            position: "absolute",
            top: axisLabelTop,
            left: 15,
            fontFamily: "Inter, system-ui, sans-serif",
            fontSize: `${axisLabelFontSize}px`,
            fontWeight: 500,
            color: axisText,
            zIndex: 2,
            pointerEvents: "none",
          }}
        >
          {t("axis.powerSocCombined", { unit: combinedScale.unit })}
        </div>
        <div
          style={{
            width: "100%",
            height: isMobile ? MOBILE_CHART_HEIGHT_PX : "100%",
          }}
        >
          <ResponsiveContainer key="combined-chart" width="100%" height="100%">
            <AreaChart
              syncId="energyGrid"
              data={transformedCombined.chartData}
              margin={internalMargins}
              tabIndex={-1}
              onMouseDown={(state: any) => {
                if (!brushZoomActive) return
                if (typeof document !== "undefined")
                  document.body.style.userSelect = "none"
                const x = state?.activeLabel
                if (typeof x !== "number" || !Number.isFinite(x)) return
                setRefAreaLeft(x)
                setRefAreaRight(x)
              }}
              onMouseMove={(state: any) => {
                if (!brushZoomActive) return
                if (refAreaLeft === null) return
                const x = state?.activeLabel
                if (typeof x !== "number" || !Number.isFinite(x)) return
                setRefAreaRight(x)
              }}
              onMouseUp={() => {
                if (!brushZoomActive) return
                if (typeof document !== "undefined")
                  document.body.style.userSelect = ""
                if (refAreaLeft === null || refAreaRight === null) return
                const left = refAreaLeft
                const right = refAreaRight
                setRefAreaLeft(null)
                setRefAreaRight(null)

                if (left === right) return
                const min = Math.min(left, right)
                const max = Math.max(left, right)
                const fullMin = startDate.getTime()
                const fullMax = endDate.getTime()
                const clampedMin = Math.max(fullMin, min)
                const clampedMax = Math.min(fullMax, max)
                if (!(clampedMax > clampedMin)) return
                setZoomDomain([clampedMin, clampedMax])
              }}
            >
              {renderDefs(combinedGradients)}
              {renderGrid()}
              {renderXAxis()}
              {/* Combined chart mixes kW and SOC (%), so keep a fixed label and no scaling */}
              <YAxis
                ticks={combinedYTicks}
                domain={[
                  combinedYTicks[0],
                  combinedYTicks[combinedYTicks.length - 1],
                ]}
                interval={0}
                // Same pin as the split chart: stops Recharts from rescaling the
                // axis when the zoomed data doesn't reach the tick endpoints.
                allowDataOverflow={true}
                axisLine={false}
                tickLine={false}
                width={effectiveYAxisWidth}
                tick={(props: {
                  x: number
                  y: number
                  payload: { value: number }
                }) => {
                  const { x, y, payload } = props
                  return (
                    <text
                      x={x}
                      y={y}
                      dy={4}
                      fill={axisText}
                      textAnchor="end"
                      style={{ fontSize: `${axisFontSize}px`, fontWeight: 500 }}
                    >
                      {formatSig3(payload.value)}
                    </text>
                  )
                }}
              />
              <Tooltip
                cursor={<VerticalCursor stroke={cursorLine} />}
                wrapperStyle={{ outline: "none" }}
                shared={true}
                content={(props: {
                  active?: boolean
                  label?: string | number
                }) => (
                  <InterpolatedTooltipContent
                    active={props.active}
                    label={props.label}
                    lookup={combinedTooltipLookup}
                    info={transformedCombined.seriesInfo}
                    formatItem={combinedTooltipFormatItem}
                  />
                )}
              />
              {brushZoomActive &&
                refAreaLeft !== null &&
                refAreaRight !== null &&
                refAreaLeft !== refAreaRight && (
                  <ReferenceArea
                    x1={refAreaLeft}
                    x2={refAreaRight}
                    strokeOpacity={0}
                    fill={cursorLine}
                    fillOpacity={0.12}
                  />
                )}
              {!isMobile && (
                <Legend
                  verticalAlign="top"
                  align="right"
                  wrapperStyle={{ paddingTop: 0, marginTop: desktopLegendMarginTop }}
                  content={(props) => (
                    <ChartLegend
                      payload={props.payload as any}
                      seriesMeta={seriesMetaForSort}
                      activeSeries={activeSeries}
                      onLegendClick={onLegendClick}
                    />
                  )}
                />
              )}
              {renderAreas(transformedCombined.seriesInfo, "grad_combined")}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    )
  }

  const energyGradients = buildGradients(
    transformedEnergy.seriesInfo,
    transformedEnergy.chartData,
    "grad_energy",
  )
  const energyTickKeys = transformedEnergy.seriesInfo
    .map((s) => s.name)
    .filter((n) => activeSeries.includes(n))
  const energyYTicks =
    aggregateBy === "hour"
      ? computePowerTicksWithZeroFloor(visibleEnergyData, energyTickKeys)
      : computeNiceTicks(visibleEnergyData, energyTickKeys)
  const energyMaxAbs = Math.max(...energyYTicks.map((t) => Math.abs(t)))
  const energyScale = getAxisScale(energyMaxAbs, "kW")
  const energyTooltipLookup = buildTooltipLookup(
    transformedEnergy.chartData,
    transformedEnergy.seriesInfo,
  )
  const energyTooltipFormatItem = (
    v: number,
    name: string,
  ): [string, string] => {
    const s = getAxisScaleForValue(v, "kW")
    return [`${formatSig3(v / s.divisor)} ${s.unit}`, name]
  }
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        ...(isMobile ? mobileChartShellStyle : { height: energyChartHeight }),
      }}
    >
      {/* Mobile legend overlay (4px from card frame; doesn't affect chart layout) */}
      {isMobile && (
        <div
          style={{
            position: "absolute",
            top: 4,
            right: 8,
            zIndex: 4,
            maxWidth: "calc(100% - 24px)",
          }}
        >
          <div
            ref={legendRef}
            style={{
              position: "relative",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <ChartLegend
              payload={legendPayload as any}
              seriesMeta={seriesMetaForSort}
              activeSeries={activeSeries}
              onLegendClick={onLegendClick}
            />
            {zoomDomain ? (
              <Button
                size="xs"
                variant="ghost"
                position="absolute"
                top="100%"
                right={0}
                mt="6px"
                zIndex={5}
                onClick={() => setZoomDomain(null)}
              >
                {t("toolbar.resetZoom")}
              </Button>
            ) : null}
          </div>
        </div>
      )}
      <div
        style={{
          position: "absolute",
          top: axisLabelTop,
          left: 15,
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: `${axisLabelFontSize}px`,
          fontWeight: 500,
          color: axisText,
          zIndex: 2,
          pointerEvents: "none",
        }}
      >
        {t("axis.power", { unit: energyScale.unit })}
      </div>
      <div
        style={{
          width: "100%",
          height: isMobile ? MOBILE_CHART_HEIGHT_PX : "100%",
        }}
      >
        <ResponsiveContainer key="energy-chart" width="100%" height="100%">
          <AreaChart
            syncId="energyGrid"
            data={transformedEnergy.chartData}
            margin={internalMargins}
            tabIndex={-1}
            onMouseDown={(state: any) => {
              if (!brushZoomActive) return
              if (typeof document !== "undefined")
                document.body.style.userSelect = "none"
              const x = state?.activeLabel
              if (typeof x !== "number" || !Number.isFinite(x)) return
              setRefAreaLeft(x)
              setRefAreaRight(x)
            }}
            onMouseMove={(state: any) => {
              if (!brushZoomActive) return
              if (refAreaLeft === null) return
              const x = state?.activeLabel
              if (typeof x !== "number" || !Number.isFinite(x)) return
              setRefAreaRight(x)
            }}
            onMouseUp={() => {
              if (!brushZoomActive) return
              if (typeof document !== "undefined")
                document.body.style.userSelect = ""
              if (refAreaLeft === null || refAreaRight === null) return
              const left = refAreaLeft
              const right = refAreaRight
              setRefAreaLeft(null)
              setRefAreaRight(null)

              if (left === right) return
              const min = Math.min(left, right)
              const max = Math.max(left, right)
              const fullMin = startDate.getTime()
              const fullMax = endDate.getTime()
              const clampedMin = Math.max(fullMin, min)
              const clampedMax = Math.min(fullMax, max)
              if (!(clampedMax > clampedMin)) return
              setZoomDomain([clampedMin, clampedMax])
            }}
          >
            {renderDefs(energyGradients)}
            {renderGrid()}
            {renderXAxis()}
            {renderYAxis("kW", energyYTicks)}
            <Tooltip
              cursor={<VerticalCursor stroke={cursorLine} />}
              wrapperStyle={{ outline: "none" }}
              shared={true}
              content={(props: {
                active?: boolean
                label?: string | number
              }) => (
                <InterpolatedTooltipContent
                  active={props.active}
                  label={props.label}
                  lookup={energyTooltipLookup}
                  info={transformedEnergy.seriesInfo}
                  formatItem={energyTooltipFormatItem}
                />
              )}
            />
            {brushZoomActive &&
              refAreaLeft !== null &&
              refAreaRight !== null &&
              refAreaLeft !== refAreaRight && (
                <ReferenceArea
                  x1={refAreaLeft}
                  x2={refAreaRight}
                  strokeOpacity={0}
                  fill={cursorLine}
                  fillOpacity={0.12}
                />
              )}
            {!isMobile && (
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingTop: 0, marginTop: desktopLegendMarginTop }}
                content={(props) => (
                  <ChartLegend
                    payload={props.payload as any}
                    seriesMeta={seriesMetaForSort}
                    activeSeries={activeSeries}
                    onLegendClick={onLegendClick}
                  />
                )}
              />
            )}
            {renderAreas(transformedEnergy.seriesInfo, "grad_energy")}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
