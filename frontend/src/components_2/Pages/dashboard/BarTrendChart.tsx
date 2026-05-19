/**
 * Bar-chart variant for aggregated energy trends with shared legend and tooltip behavior.
 * Mirrors theme tokens from area charts while simplifying axes for multi-day spans.
 */

import { useMediaQuery, useToken } from "@chakra-ui/react"
import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { TimeRange } from "@/components_2/ui/TimeRangePicker"
import { ChartLegend } from "./ChartLegend"
import {
  colorKeyForSeries,
  computeNiceTicks,
  formatSig3,
  getAxisScale,
  getAxisScaleForValue,
  LEGEND_DESIRED_ORDER,
  tooltipItemSortIndex,
} from "./chartUtils"
import type { SeriesMeta, TransformedChartData } from "./dashboardTypes"

export interface BarTrendChartProps {
  data: TransformedChartData
  timeRange: TimeRange
  startDate: Date
  endDate: Date
  weekTicks: number[] | undefined
  /** For `All`: selected year we try to center in the viewport. */
  focusYear?: number
  barChartMargins: { top: number; right: number; left: number; bottom: number }
  chartSpacing: { barGap: number; barCategoryGap: string | number } | undefined
  xAxisHeight: number
  yAxisWidth: number
  tooltipFontSize: number
  tooltipPadding: number
  dynamicXAxisPadding: { left: number; right: number }
  formatXAxisTick: (timestamp: number) => string
  activeSeries: string[]
  onLegendClick: (name: string) => void
  seriesMetaForSort: SeriesMeta[]
  /** Provided by parent for responsive axis font sizing. */
  isMobile?: boolean
}

export function BarTrendChart({
  data,
  timeRange,
  startDate,
  endDate,
  weekTicks,
  focusYear,
  barChartMargins,
  chartSpacing,
  xAxisHeight,
  yAxisWidth,
  tooltipFontSize,
  tooltipPadding,
  dynamicXAxisPadding,
  formatXAxisTick,
  activeSeries,
  onLegendClick,
  seriesMetaForSort,
  isMobile: isMobileProp,
}: BarTrendChartProps) {
  const { t, i18n } = useTranslation("Dashboard")
  const [axisText, gridLine, tooltipBg, tooltipText, cursorFill] = useToken(
    "colors",
    [
      "ui.Chart.axisText",
      "ui.Chart.grid",
      "ui.Chart.tooltipBg",
      "ui.Chart.tooltipText",
      "ui.Chart.cursorFill",
    ],
  )
  const [isMobileMq] = useMediaQuery(["(max-width: 767px)"], { ssr: false })
  const isMobile = isMobileProp ?? isMobileMq
  const axisFontSize = isMobile ? 9 : 12
  const axisLabelFontSize = isMobile ? 10 : 12

  const legendRef = useRef<HTMLDivElement | null>(null)
  const [legendHeight, setLegendHeight] = useState(0)

  useEffect(() => {
    if (!isMobile) return
    const el = legendRef.current
    if (!el) return

    const measure = () =>
      setLegendHeight(el.getBoundingClientRect().height || 0)
    measure()

    const RO = (globalThis as any).ResizeObserver as
      | (new (
          cb: ResizeObserverCallback,
        ) => ResizeObserver)
      | undefined
    if (!RO) return

    const ro = new RO(() => measure())
    ro.observe(el)
    return () => ro.disconnect()
  }, [isMobile])

  const legendTop = 4
  const legendGapToPlot = 8
  const axisLabelGapToPlot = 4
  const gapAfterLegend = 4
  const gapLabelToChart = 4
  const MOBILE_CHART_HEIGHT_PX = 360

  // Keep original chart margins; reserve space via wrapper padding instead.
  const effectiveBarChartMargins = barChartMargins
  const axisLabelTop = isMobile ? legendTop + legendHeight + gapAfterLegend : 16
  const baseMobileTopReserve = isMobile
    ? legendTop + legendHeight + legendGapToPlot
    : 0
  const minReserveFromAxisTitle = isMobile
    ? axisLabelTop +
      axisLabelFontSize +
      axisLabelGapToPlot +
      gapLabelToChart -
      effectiveBarChartMargins.top +
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
  // For 1Y: clamp the visible timeline to exactly 12 month buckets
  // (so bars/ticks never spill outside the selected year).
  const monthKeyFromTs = (ts: number) => {
    const d = new Date(ts)
    return d.getFullYear() * 12 + d.getMonth()
  }

  const yearMonth = useMemo(() => {
    if (timeRange !== "1Y") return null

    // Always align to calendar month boundaries for stable 12-month axis.
    const firstTick = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      1,
      0,
      0,
      0,
      0,
    )

    const ticks = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(firstTick)
      d.setMonth(d.getMonth() + i)
      return d.getTime()
    })

    const lastTick = new Date(firstTick)
    lastTick.setMonth(lastTick.getMonth() + 11)
    const lastMonthEnd = new Date(
      lastTick.getFullYear(),
      lastTick.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    )

    return {
      ticks,
      domain: [ticks[0], lastMonthEnd.getTime()] as [number, number],
      monthKeys: ticks.map(monthKeyFromTs),
    }
  }, [timeRange, startDate, endDate])

  const yearBuckets = useMemo(() => {
    if (timeRange !== "All") return null

    const firstYear = startDate.getFullYear()
    const lastYear = endDate.getFullYear()
    const yearsCount = Math.max(1, lastYear - firstYear + 1)

    const ticks = Array.from({ length: yearsCount }, (_, i) => {
      const d = new Date(firstYear + i, 0, 1, 0, 0, 0, 0)
      return d.getTime()
    })

    const lastYearEnd = new Date(lastYear, 11, 31, 23, 59, 59, 999)

    return {
      ticks,
      domain: [ticks[0], lastYearEnd.getTime()] as [number, number],
      years: ticks.map((x) => new Date(x).getFullYear()),
    }
  }, [timeRange, startDate, endDate])

  const allFocusWindow = useMemo(() => {
    if (timeRange !== "All" || !yearBuckets || !focusYear) return null
    // Show a small window around the focus year so the selected year sits near the center.
    const span = isMobile ? 3 : 5 // years visible
    const half = Math.floor(span / 2)
    const first = yearBuckets.years[0]
    const last = yearBuckets.years[yearBuckets.years.length - 1]
    const fromYear = Math.max(first, focusYear - half)
    const toYear = Math.min(last, fromYear + span - 1)
    const clampedFrom = Math.max(first, toYear - (span - 1))
    const startTs = new Date(clampedFrom, 0, 1, 0, 0, 0, 0).getTime()
    const endTs = new Date(toYear, 11, 31, 23, 59, 59, 999).getTime()
    const ticks = yearBuckets.ticks.filter((x) => {
      const y = new Date(x).getFullYear()
      return y >= clampedFrom && y <= toYear
    })
    return {
      domain: [startTs, endTs] as [number, number],
      fromYear: clampedFrom,
      toYear,
      ticks,
    }
  }, [timeRange, yearBuckets, focusYear, isMobile])

  // Data used for axes/ticks: keep only actual API points in the year.
  const chartDataForScale = useMemo(() => {
    if (!yearMonth && !yearBuckets) return data.chartData
    if (yearMonth) {
      const keySet = new Set(yearMonth.monthKeys)
      return data.chartData.filter((r) => keySet.has(monthKeyFromTs(r.x)))
    }
    const yearSet = new Set(yearBuckets?.years ?? [])
    return data.chartData.filter((r) => yearSet.has(new Date(r.x).getFullYear()))
  }, [data.chartData, yearMonth, yearBuckets])

  // Data used for rendering bars: force all 12 months so the timeline always
  // spans the whole chart width even when the API omits months.
  const chartDataForRender = useMemo(() => {
    if (!yearMonth && !yearBuckets) return data.chartData

    const seriesNames = data.seriesInfo.map((s) => s.name)
    const idxByKey = new Map<number, number>()
    const ticks = yearMonth?.ticks ?? yearBuckets?.ticks ?? []
    const keyFromTs = (ts: number) =>
      yearMonth ? monthKeyFromTs(ts) : new Date(ts).getFullYear()

    const buckets = ticks.map((x, idx) => {
      idxByKey.set(keyFromTs(x), idx)
      const row: Record<string, number> & { x: number } = { x }
      for (const name of seriesNames) row[name] = 0
      return row
    })

    for (const r of data.chartData) {
      const idx = idxByKey.get(keyFromTs(r.x))
      if (idx === undefined) continue
      const bucket = buckets[idx]
      for (const name of seriesNames) {
        const v = r[name]
        if (typeof v === "number" && Number.isFinite(v)) bucket[name] = v
      }
    }

    return buckets
  }, [data.chartData, data.seriesInfo, yearMonth, yearBuckets])

  const chartDataForViewport = useMemo(() => {
    if (timeRange !== "All" || !allFocusWindow) return chartDataForRender
    return chartDataForRender.filter((r) => {
      const y = new Date(r.x).getFullYear()
      return y >= allFocusWindow.fromYear && y <= allFocusWindow.toYear
    })
  }, [timeRange, allFocusWindow, chartDataForRender])

  const isAllYearsView = timeRange === "All"
  const allYearsForXAxis = useMemo(
    () => chartDataForViewport.map((r) => new Date(r.x).getFullYear()),
    [chartDataForViewport],
  )
  // For "All" view we want equal spacing between years, centered.
  // Using a time scale makes spacing subtly uneven (leap years, date boundaries),
  // so we map visible buckets to a uniform index axis.
  const chartDataForXAxis = useMemo(() => {
    if (!isAllYearsView) return chartDataForViewport
    return chartDataForViewport.map((r, idx) => ({ ...r, __xIndex: idx }))
  }, [chartDataForViewport, isAllYearsView])

  const chartDataForYAxis =
    timeRange === "1Y"
        ? chartDataForRender
        : chartDataForScale.length
          ? chartDataForScale
          : chartDataForRender

  const effectiveDataLen =
    timeRange === "All" && allFocusWindow
      ? chartDataForViewport.length
      : chartDataForRender.length
  const visibleSeriesKeys = data.seriesInfo
    .map((s) => s.name)
    .filter((n) => activeSeries.includes(n))

  const desktopLegendMarginTop = data.seriesInfo.length > 8 ? -28 : -54

  // For stacked "All", axis must be based on the per-year total, not individual series,
  // otherwise the top grid line / ticks "jump" and bars can appear clipped.
  const yTickData =
    timeRange === "All"
      ? chartDataForYAxis.map((row) => {
          let total = 0
          for (const k of visibleSeriesKeys) {
            const v = row[k]
            if (typeof v === "number" && Number.isFinite(v)) total += v
          }
          return { x: row.x, __total: total }
        })
      : chartDataForYAxis
  const yTickKeys = timeRange === "All" ? ["__total"] : visibleSeriesKeys

  const yTicks = computeNiceTicks(yTickData as any, yTickKeys, 6)
  const yMaxAbs = Math.max(...yTicks.map((t) => Math.abs(t)))
  const yScale = getAxisScale(yMaxAbs, "kWh")

  const tooltipLabelBySeriesName = useMemo(() => {
    const map = new Map<string, string>()
    for (const meta of seriesMetaForSort) {
      const key = colorKeyForSeries(meta)
      if (!key) continue
      map.set(meta.name, t(`legend.${key}`, { defaultValue: meta.name }))
    }
    return map
  }, [seriesMetaForSort, t, i18n.resolvedLanguage])

  const xInterval: number | "preserveStartEnd" = (() => {
    if (timeRange === "1W") return 0
    if (timeRange === "1Y") return isMobile ? 1 : 0
    if (timeRange === "All") return "preserveStartEnd"
    // Remaining supported ranges here are not "1W"/"1Y"/"All".
    const desiredTicks = 11
    if (effectiveDataLen <= desiredTicks) return 0
    // Recharts interval: "show every (interval + 1)th tick"
    return Math.max(0, Math.ceil(effectiveDataLen / desiredTicks) - 1)
  })()

  const renderXAxisTick = (props: {
    x: number
    y: number
    index?: number
    payload: { value: number }
  }) => {
    const { x, y, payload } = props
    const yearFromIndex = (idxRaw: number) => {
      const idx = Math.round(idxRaw)
      if (idx < 0 || idx >= allYearsForXAxis.length) return ""
      return String(allYearsForXAxis[idx])
    }
    const monthShort = (ts: number, letters: number) => {
      const raw = new Date(ts).toLocaleDateString(i18n.resolvedLanguage, {
        month: "short",
      })
      const cleaned = raw.replace(/[^\p{L}]/gu, "")
      return (cleaned || raw).slice(0, letters)
    }
    const axisLabel =
      timeRange === "All"
        ? yearFromIndex(payload.value)
        : timeRange === "1Y"
        ? monthShort(payload.value, isMobile ? 2 : 3)
        : formatXAxisTick(payload.value)

    return (
      <text
        x={x}
        y={y}
        dy={12}
        fill={axisText}
        textAnchor="middle"
        style={{ fontSize: `${axisFontSize}px`, fontWeight: 500 }}
      >
        {axisLabel}
      </text>
    )
  }

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
          ref={legendRef}
          style={{ position: "absolute", top: 4, right: 8, zIndex: 4 }}
        >
          <ChartLegend
            payload={
              data.seriesInfo.map((s) => ({
                value: s.name,
                color: s.color,
              })) as import("./dashboardTypes").LegendEntry[]
            }
            seriesMeta={seriesMetaForSort}
            activeSeries={activeSeries}
            onLegendClick={onLegendClick}
          />
        </div>
      )}
      {/* Compact caption matching SOC mobile axis typography */}
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
        {timeRange === "All"
          ? t("axis.yearWithUnit", {
              year: focusYear ?? "",
              unit: yScale.unit,
            })
          : t("axis.energy", { unit: yScale.unit })}
      </div>
      <div
        style={{
          width: "100%",
          height: isMobile ? MOBILE_CHART_HEIGHT_PX : "100%",
        }}
      >
        <ResponsiveContainer
          width="100%"
          height="100%"
          initialDimension={{ width: 320, height: 200 }}
        >
          <BarChart
            data={chartDataForXAxis as any}
            margin={effectiveBarChartMargins}
            barGap={chartSpacing?.barGap}
            barCategoryGap={chartSpacing?.barCategoryGap}
          >
            <CartesianGrid
              vertical={false}
              stroke={gridLine}
              strokeWidth={0.5}
            />
            <XAxis
              type="number"
              scale={isAllYearsView ? "linear" : "time"}
              dataKey={isAllYearsView ? "__xIndex" : "x"}
              height={xAxisHeight}
              domain={
                isAllYearsView
                  ? ([
                      -0.5,
                      Math.max(0, chartDataForViewport.length - 1) + 0.5,
                    ] as [number, number])
                  : yearMonth?.domain ??
                    allFocusWindow?.domain ??
                    yearBuckets?.domain ??
                    (["dataMin", "dataMax"] as const)
              }
              tickFormatter={(value) =>
                isAllYearsView
                  ? String(allYearsForXAxis[Math.round(Number(value))] ?? "")
                  : formatXAxisTick(Number(value))
              }
              allowDataOverflow={false}
              ticks={
                isAllYearsView
                  ? Array.from(
                      { length: chartDataForViewport.length },
                      (_, i) => i,
                    )
                  : timeRange === "1W"
                    ? weekTicks
                    : timeRange === "1Y"
                      ? yearMonth?.ticks
                      : allFocusWindow?.ticks ?? yearBuckets?.ticks
              }
              interval={xInterval}
              padding={
                timeRange === "1Y"
                  ? isMobile
                    ? { left: 14, right: 14 }
                    : { left: 8, right: 8 }
                  : dynamicXAxisPadding
              }
              axisLine={false}
              tickLine={false}
              tick={renderXAxisTick}
              minTickGap={timeRange === "1Y" ? 0 : undefined}
            />
            <YAxis
              ticks={yTicks}
              domain={[yTicks[0], yTicks[yTicks.length - 1]]}
              interval={0}
              allowDataOverflow={false}
              axisLine={false}
              tickLine={false}
              tick={renderYAxisTick}
              width={yAxisWidth}
            />
            <Tooltip
              {...({ trigger: "item" } as unknown as Record<string, unknown>)}
              contentStyle={{
                fontSize: tooltipFontSize,
                padding: tooltipPadding,
                borderRadius: "8px",
                backgroundColor: tooltipBg,
                border: "none",
                color: tooltipText,
              }}
              cursor={{ fill: cursorFill }}
              wrapperStyle={{ outline: "none" }}
              // Show all series values for the hovered period (but only when on a bar).
              shared={true}
              formatter={(value: number | undefined, name?: string) => {
                if (value === undefined || !Number.isFinite(value)) return ""
                const s = getAxisScaleForValue(value, "kWh")
                const formatted = `${formatSig3(value / s.divisor)} ${s.unit}`
                const label = name ? tooltipLabelBySeriesName.get(name) ?? name : undefined
                return label ? [formatted, label] : formatted
              }}
              labelFormatter={(label) => {
                if (isAllYearsView) {
                  const idx = Math.round(Number(label))
                  return String(allYearsForXAxis[idx] ?? "")
                }
                return formatXAxisTick(label as number)
              }}
              itemSorter={(a: { name?: string }) =>
                tooltipItemSortIndex(
                  a?.name,
                  seriesMetaForSort,
                  LEGEND_DESIRED_ORDER,
                )
              }
            />
            {!isMobile && (
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingTop: 0, marginTop: desktopLegendMarginTop }}
                content={(props) => (
                  <ChartLegend
                    payload={props.payload as import("./dashboardTypes").LegendEntry[]}
                    seriesMeta={seriesMetaForSort}
                    activeSeries={activeSeries}
                    onLegendClick={onLegendClick}
                  />
                )}
              />
            )}
            {data.seriesInfo.map((series) => (
              <Bar
                key={series.name}
                dataKey={series.name}
                fill={series.color}
                isAnimationActive={false}
                maxBarSize={timeRange === "All" ? 120 : 50}
                stackId={timeRange === "All" ? "all" : undefined}
                hide={!activeSeries.includes(series.name)}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
