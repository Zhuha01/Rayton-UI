/**
 * Compact Recharts area tile used inside expanded trend grids for one series.
 * Mirrors main chart styling, supports zoomed domains, and interpolates sparse tooltip samples.
 */

import { Box, useMediaQuery, useToken } from "@chakra-ui/react"
import { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  CHART_GRADIENT_MAX_OPACITY,
  CHART_GRADIENT_MIN_OPACITY,
  type ChartGradientStop,
} from "@/theme/semanticTokens/chart"
import {
  buildInterpolatedTooltipData,
  colorKeyForSeries,
  computeStablePowerZoomTicks,
  computeTightNiceTicks,
  formatHourlyTick,
  formatSig3,
  formatXAxisTimestamp,
  getAxisScale,
  getAxisScaleForValue,
} from "./chartUtils"
import type { AggregateBy, ChartRow, SeriesInfoItem } from "./dashboardTypes"

export interface MiniTrendChartProps {
  series: SeriesInfoItem
  chartData: ChartRow[]
  startDate: Date
  endDate: Date
  aggregateBy: AggregateBy
  hourlyTicks: number[] | undefined
  tooltipFontSize: number
  tooltipPadding: number
  timeRange: "1D" | string
  zoomDomain: [number, number] | null
  setZoomDomain: (domain: [number, number] | null) => void
  /** When false, drag-to-zoom brush is disabled (mobile toolbar isolation). */
  allowChartBrushZoom?: boolean
}

const SOC_NAME_REGEX = /\bsoc\b|%|заряд/i

function isSocSeries(series: SeriesInfoItem): boolean {
  const key = colorKeyForSeries({ name: series.name, data_id: series.dataId })
  if (key === "ESS_SOC") return true
  return SOC_NAME_REGEX.test(series.name)
}

function VerticalCursor(props: any) {
  const x = props?.points?.[0]?.x
  const top = props?.top ?? 0
  const height = props?.height
  if (typeof x !== "number" || typeof height !== "number") return null
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

/**
 * Gradient stops matching the main AreaTrendChart's zero-axis split logic so
 * mini-chart fills look identical to the combined view.
 */
function computeGradientStops(
  data: ChartRow[],
  dataKey: string,
  maxOpacity: number,
  minOpacity: number,
): ChartGradientStop[] {
  const values: number[] = []
  for (const row of data) {
    const v = row[dataKey]
    if (typeof v === "number" && Number.isFinite(v)) values.push(v)
  }
  if (values.length === 0) {
    return [
      { offset: "0%", opacity: maxOpacity },
      { offset: "100%", opacity: minOpacity },
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
      { offset: "0%", opacity: maxOpacity },
      { offset: "100%", opacity: minOpacity },
    ]
  }
  if (max <= 0) {
    return [
      { offset: "0%", opacity: minOpacity },
      { offset: "100%", opacity: maxOpacity },
    ]
  }
  const zeroPct = `${((max / (max - min)) * 100).toFixed(2)}%`
  return [
    { offset: "0%", opacity: maxOpacity },
    { offset: zeroPct, opacity: minOpacity },
    { offset: zeroPct, opacity: minOpacity },
    { offset: "100%", opacity: maxOpacity },
  ]
}

export function MiniTrendChart({
  series,
  chartData,
  startDate,
  endDate,
  aggregateBy,
  hourlyTicks,
  tooltipFontSize,
  tooltipPadding,
  timeRange,
  zoomDomain,
  setZoomDomain,
  allowChartBrushZoom = true,
}: MiniTrendChartProps) {
  const { t, i18n } = useTranslation("Dashboard")
  const [isMobileChart] = useMediaQuery(["(max-width: 767px)"], { ssr: false })
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

  const soc = isSocSeries(series)

  const [refAreaLeft, setRefAreaLeft] = useState<number | null>(null)
  const [refAreaRight, setRefAreaRight] = useState<number | null>(null)
  const [isHovered, setIsHovered] = useState(false)

  const isZoomEnabled = timeRange === "1D"
  const brushZoomActive = isZoomEnabled && allowChartBrushZoom

  useEffect(() => {
    if (brushZoomActive) return
    setRefAreaLeft(null)
    setRefAreaRight(null)
    if (typeof document !== "undefined") document.body.style.userSelect = ""
  }, [brushZoomActive])

  const xDomain: [number, number] = zoomDomain ?? [
    startDate.getTime(),
    endDate.getTime(),
  ]

  const [xMin, xMax] = useMemo(() => {
    const [a, b] = xDomain
    return a <= b ? ([a, b] as const) : ([b, a] as const)
  }, [xDomain])

  const xTicks = useMemo((): number[] | undefined => {
    const count = 9
    const span = xMax - xMin
    if (!Number.isFinite(span) || span <= 0) return hourlyTicks
    const step = span / (count - 1)
    return Array.from({ length: count }, (_, i) => xMin + i * step)
  }, [hourlyTicks, xMax, xMin])

  // Match hourly gradient strength with AreaTrendChart for visual continuity.
  const gradientOpacityFactor = aggregateBy === "hour" ? 0.6 : 1
  const maxOpacity = CHART_GRADIENT_MAX_OPACITY * gradientOpacityFactor
  const minOpacity = CHART_GRADIENT_MIN_OPACITY * gradientOpacityFactor

  // Y-axis ticks: adapt to the visible time window (zoom) for a logical scale.
  const visibleData = useMemo(() => {
    if (!zoomDomain) return chartData
    return chartData.filter((r) => r.x >= xMin && r.x <= xMax)
  }, [chartData, xMax, xMin, zoomDomain])

  const computeMinMax = (data: ChartRow[], key: string) => {
    let min = 0
    let max = 0
    let has = false
    for (const row of data) {
      const v = row[key]
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
    return { min, max, has }
  }

  const computePowerTicksWithZeroFloor = (
    data: ChartRow[],
    key: string,
  ): number[] => {
    // Zoomed view: lock to a stable 6-tick grid so the visual distance
    // between horizontal lines matches the full-day view.
    if (zoomDomain) {
      return computeStablePowerZoomTicks(data, [key])
    }
    const base = computeTightNiceTicks(data, [key])
    const { min, max, has } = computeMinMax(data, key)
    if (!has) return base
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

  const yTicks = soc
    ? ([0, 25, 50, 75, 100] as number[])
    : computePowerTicksWithZeroFloor(visibleData, series.name)
  const yMaxAbs = Math.max(...yTicks.map((t) => Math.abs(t)))
  const yScale = soc ? null : getAxisScale(yMaxAbs, "kW")
  const yAxisLabel = soc
    ? t("axis.chargePct")
    : t("axis.power", { unit: yScale?.unit ?? "kW" })

  const effectiveXAxisTickCount = 9
  const _zoomStepMs = useMemo(() => {
    const span = xMax - xMin
    return Number.isFinite(span) && span > 0
      ? span / (effectiveXAxisTickCount - 1)
      : null
  }, [xMax, xMin])

  const formatZoomTick = (ts: number): string => {
    const date = new Date(ts)
    return date.toLocaleTimeString(i18n.resolvedLanguage, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
  }

  // X-axis: always center labels on tick positions so gaps between labels look
  // uniform (start/end anchoring makes the first/last intervals look squashed).
  const renderXAxisTick = (props: {
    x: number
    y: number
    index: number
    payload: { value: number }
  }) => {
    const { x, y, index, payload } = props
    const anchor: "start" | "middle" | "end" = "middle"
    const label = zoomDomain
      ? formatZoomTick(payload.value)
      : aggregateBy === "hour" && hourlyTicks
        ? formatHourlyTick(payload.value, index, hourlyTicks.length)
        : formatXAxisTimestamp(payload.value, aggregateBy, i18n.resolvedLanguage)
    return (
      <text
        x={x}
        y={y}
        dy={12}
        fill={axisText}
        textAnchor={anchor}
        style={{ fontSize: "10px", fontWeight: 500 }}
      >
        {label}
      </text>
    )
  }

  // Interpolate null API samples so tooltips still read values bridged by connectNulls.
  const tooltipLookup = (() => {
    const filled = buildInterpolatedTooltipData(chartData, [series.name])
    const map = new Map<number, ChartRow>()
    for (const row of filled) map.set(row.x, row)
    return map
  })()

  interface TooltipProps {
    active?: boolean
    label?: string | number
  }
  const TooltipContent = ({ active, label }: TooltipProps) => {
    if (!active || label === undefined) return null
    const labelNum = typeof label === "number" ? label : Number(label)
    if (!Number.isFinite(labelNum)) return null
    const row = tooltipLookup.get(labelNum)
    if (!row) return null
    const raw = row[series.name]
    if (typeof raw !== "number" || !Number.isFinite(raw)) return null
    const formatted = soc
      ? `${formatSig3(raw)} %`
      : (() => {
          const s = getAxisScaleForValue(raw, "kW")
          return `${formatSig3(raw / s.divisor)} ${s.unit}`
        })()
    const key = colorKeyForSeries({ name: series.name, data_id: series.dataId })
    const displayName = key
      ? t(`legend.${key}`, { defaultValue: series.name })
      : series.name
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
          <li
            className="recharts-tooltip-item"
            style={{
              display: "block",
              paddingTop: 4,
              paddingBottom: 4,
              color: series.color,
            }}
          >
            <span className="recharts-tooltip-item-name">{displayName}</span>
            <span className="recharts-tooltip-item-separator"> : </span>
            <span className="recharts-tooltip-item-value">{formatted}</span>
          </li>
        </ul>
      </div>
    )
  }

  const gradientId = `miniGrad_${series.dataId}`
  const gradientStops = computeGradientStops(
    chartData,
    series.name,
    maxOpacity,
    minOpacity,
  )

  const miniYAxisWidth = isMobileChart ? 32 : 40
  // SVG padding excludes axis chrome; top gap reserves space for the pinned Y-axis caption.
  const internalMargins = isMobileChart
    ? { top: 22, right: 8, left: 0, bottom: 24 }
    : { top: 22, right: 10, left: 0, bottom: 24 }

  return (
    <Box
      position="relative"
      bg="transparent"
      w="100%"
      h="100%"
      minH={0}
      overflow="hidden"
    >
      <Box
        position="absolute"
        top="-2px"
        left="10px"
        fontFamily="Inter, system-ui, sans-serif"
        fontSize="10px"
        fontWeight={500}
        color="ui.Chart.axisText"
        zIndex={2}
        pointerEvents="none"
      >
        {yAxisLabel}
      </Box>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={internalMargins}
          syncId="energyGrid"
          tabIndex={-1}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => {
            setIsHovered(false)
            setRefAreaLeft(null)
            setRefAreaRight(null)
            if (typeof document !== "undefined")
              document.body.style.userSelect = ""
          }}
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
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              {gradientStops.map((stop, i) => (
                <stop
                  key={i}
                  offset={stop.offset}
                  stopColor={series.color}
                  stopOpacity={stop.opacity}
                />
              ))}
            </linearGradient>
          </defs>
          <CartesianGrid
            vertical={false}
            syncWithTicks={true}
            stroke={gridLine}
            strokeWidth={0.5}
          />
          <XAxis
            type="number"
            dataKey="x"
            height={22}
            domain={xDomain}
            ticks={xTicks}
            interval={0}
            // Small symmetric inset on both modes: keeps center-anchored HH:mm
            // labels inside the card without the axis visually "running away" like
            // padding 0. Slightly tighter on full day than zoom so the plot still
            // reads close to edge-to-edge.
            // Mobile: keep HH:mm labels inside the card frame.
            padding={
              isMobileChart
                ? { left: 10, right: 10 }
                : zoomDomain
                  ? { left: 10, right: 10 }
                  : { left: 8, right: 8 }
            }
            axisLine={false}
            tickLine={false}
            allowDataOverflow={true}
            // We pass an explicit 9-tick grid; minTickGap would distort or hide
            // ticks on narrow widths (especially when zoomed).
            minTickGap={0}
            tick={renderXAxisTick}
          />
          <YAxis
            ticks={yTicks}
            domain={[yTicks[0], yTicks[yTicks.length - 1]]}
            interval={0}
            // Pin the axis domain exactly to our ticks so Recharts cannot
            // shrink/expand it to "fit" visible data and compress the grid.
            allowDataOverflow={true}
            axisLine={false}
            tickLine={false}
            width={miniYAxisWidth}
            tick={{
              fill: axisText,
              style: { fontSize: "10px", fontWeight: 500 },
            }}
            tickFormatter={(v: number) =>
              soc ? formatSig3(v) : formatSig3(v / (yScale?.divisor ?? 1))
            }
          />
          <Tooltip
            cursor={<VerticalCursor stroke={cursorLine} />}
            wrapperStyle={{ outline: "none" }}
            shared={true}
            active={isHovered ? undefined : false}
            content={(props: { active?: boolean; label?: string | number }) => (
              <TooltipContent active={props.active} label={props.label} />
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
          <Area
            type="monotone"
            dataKey={series.name}
            stroke={series.color}
            fill={`url(#${gradientId})`}
            fillOpacity={1}
            strokeWidth={1.5}
            connectNulls={true}
            isAnimationActive={false}
            dot={false}
            activeDot={
              isHovered
                ? {
                    r: 3,
                    stroke: series.color,
                    strokeWidth: 0,
                    fill: series.color,
                  }
                : false
            }
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  )
}
