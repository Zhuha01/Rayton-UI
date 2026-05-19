/**
 * Dedicated SOC area card that stays aligned with dashboard energy chart chrome.
 * Handles loading states, dummy series for empty grids, and edge-anchored hourly ticks.
 */

import {
  Box,
  Flex,
  Spinner,
  Text,
  useMediaQuery,
  useToken,
} from "@chakra-ui/react"
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  CHART_GRADIENT_MAX_OPACITY,
  CHART_GRADIENT_MIN_OPACITY,
} from "@/theme/semanticTokens/chart"
import { ChartLegend } from "./ChartLegend"
import {
  formatHourlyTick,
  formatXAxisTimestamp,
  colorKeyForSeries,
  LEGEND_DESIRED_ORDER,
  tooltipItemSortIndex,
} from "./chartUtils"
import type { AggregateBy, SeriesMeta, TransformedChartData } from "./dashboardTypes"

export interface BatteryStatusCardProps {
  title?: string
  transformedSoc: TransformedChartData | null
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
  activeSeries: string[]
  onLegendClick: (name: string) => void
  seriesMetaForSort: SeriesMeta[]
  isLoading?: boolean
  errorMessage?: string | null
  /** Provided by parent for responsive axis font sizing. */
  isMobile?: boolean
}

export function BatteryStatusCard({
  title,
  transformedSoc,
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
  activeSeries,
  onLegendClick,
  seriesMetaForSort,
  isLoading,
  errorMessage,
  isMobile: isMobileProp,
}: BatteryStatusCardProps) {
  const { t, i18n } = useTranslation("Dashboard")
  const tooltipLabelBySeriesName = useMemo(() => {
    const map = new Map<string, string>()
    for (const meta of seriesMetaForSort) {
      const key = colorKeyForSeries(meta)
      if (!key) continue
      map.set(meta.name, t(`legend.${key}`, { defaultValue: meta.name }))
    }
    return map
  }, [seriesMetaForSort, t, i18n.resolvedLanguage])
  const resolvedTitle =
    title ?? t("battery.title", { defaultValue: "Battery SOC, %" })
  const formatXAxis = (ts: number) =>
    formatXAxisTimestamp(ts, aggregateBy, i18n.resolvedLanguage)
  const [isMobileMq] = useMediaQuery(["(max-width: 767px)"], { ssr: false })
  const isMobile = isMobileProp ?? isMobileMq
  const axisFontSize = isMobile ? 10 : 14

  const legendRef = useRef<HTMLDivElement | null>(null)
  const [legendHeight, setLegendHeight] = useState(0)

  const _socSeriesSignature = useMemo(
    () =>
      (transformedSoc?.seriesInfo ?? [])
        .map((s) => `${s.dataId}:${s.name}`)
        .join("|"),
    [transformedSoc?.seriesInfo],
  )

  // After toggling SOC combined ↔ split, the card remounts but layout can lag;
  // reset height when data/loading changes, then measure before paint.
  useEffect(() => {
    if (!isMobile) setLegendHeight(0)
    else if (isLoading) setLegendHeight(0)
  }, [isMobile, isLoading])

  useLayoutEffect(() => {
    if (!isMobile || isLoading) return
    const el = legendRef.current
    if (!el) return

    const measure = () => {
      const h = el.getBoundingClientRect().height || 0
      setLegendHeight(h)
    }
    measure()
    const raf = requestAnimationFrame(() => measure())
    const t = setTimeout(measure, 50)

    const RO = (
      globalThis as unknown as {
        ResizeObserver?: new (cb: ResizeObserverCallback) => ResizeObserver
      }
    ).ResizeObserver
    if (!RO) {
      return () => {
        cancelAnimationFrame(raf)
        clearTimeout(t)
      }
    }

    const ro = new RO(() => measure())
    ro.observe(el)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(t)
      ro.disconnect()
    }
  }, [isMobile, isLoading])
  // Make the fill gradient lighter for the "day" view (timeRange 1D),
  // which uses hourly aggregation in this chart.
  const gradientOpacityFactor = aggregateBy === "hour" ? 0.6 : 1
  const gradientMaxOpacity = CHART_GRADIENT_MAX_OPACITY * gradientOpacityFactor
  const gradientMinOpacity = CHART_GRADIENT_MIN_OPACITY * gradientOpacityFactor
  const socTicks = [0, 25, 50, 75, 100] as const
  const [gridLine, cardBorder, tooltipBg, tooltipText, _cursorLine] = useToken(
    "colors",
    [
      "ui.Chart.grid",
      "ui.Chart.cardFrameBorder",
      "ui.Chart.tooltipBg",
      "ui.Chart.tooltipText",
      "ui.Chart.cursorLine",
    ],
  )
  const xDomain: [number, number] = [startDate.getTime(), endDate.getTime()]
  const xTicks = useMemo((): number[] => {
    if (hourlyTicks && hourlyTicks.length > 1) return hourlyTicks
    // Fallback ticks so the axis/grid still render even if API returned no points.
    const count = 9
    const [min, max] = xDomain
    const span = max - min
    if (!Number.isFinite(span) || span <= 0) return [min, max]
    const step = span / (count - 1)
    return Array.from({ length: count }, (_, i) => min + i * step)
  }, [hourlyTicks, xDomain])

  const chartData = useMemo(() => {
    const data = transformedSoc?.chartData ?? []
    if (data.length >= 2) return data
    // At least 2 points are needed for stable scales/grid geometry.
    return [{ x: xDomain[0] }, { x: xDomain[1] }]
  }, [transformedSoc, xDomain])

  const chartDataWithDummy = useMemo(() => {
    // Recharts may stop drawing the grid if there are no graphical items (Areas)
    // visible. Keep a hidden constant series so axes + grid always render.
    return chartData.map((r) => ({ ...r, __grid_dummy__: 0 }))
  }, [chartData])
  // Pin first/last X labels to the plot rim so synthetic 24:00 anchors stay visible.
  // Match the upper AreaTrendChart's bottom layout on mobile (so the time axis
  // sits at the same distance from the card frame as in the upper Power chart).
  // On desktop keep the existing values to avoid breaking PC layout.
  const xAxisTickDy = isMobile ? 12 : 20
  const renderXAxisTick = (props: {
    x: number
    y: number
    index: number
    payload: { value: number }
  }) => {
    const { x, y, index, payload } = props
    const tickCount = xTicks.length
    const anchor: "start" | "middle" | "end" = isMobile
      ? "middle"
      : index === 0
        ? "start"
        : index === tickCount - 1
          ? "end"
          : "middle"
    const label =
      aggregateBy === "hour" && hourlyTicks
        ? formatHourlyTick(payload.value, index, hourlyTicks.length)
        : formatXAxis(payload.value)
    return (
      <text
        x={x}
        y={y}
        dy={xAxisTickDy}
        fill="currentColor"
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
  // Figma-like offsets from the card frame (px)
  const frameInsetPx = 16
  const isMobileDayHourly = isMobile && aggregateBy === "hour"
  // Match AreaTrendChart mobile day: narrower Y band (30) so left inset matches energy chart.
  const socYAxisWidthPx = isMobile ? (isMobileDayHourly ? 30 : 35) : 50

  // Mobile: 8px from card top; 8px gap under legend/title row before the plot.
  const legendTop = isMobile ? 8 : frameInsetPx
  const legendGapToPlot = 8
  // SOC axis title is outside the chart, so keep the SVG top margin tight on mobile.
  const internalMarginTop = isMobile ? 8 : 20
  // Keep the SOC axis title aligned with the legend row (like AreaTrendChart):
  // title on the left, legend on the right.
  // Even if legend is empty/unmeasured (height=0), reserve at least one row so
  // the axis title never overlaps the plot.
  const minHeaderRowPx = axisFontSize + 2
  const mobileTopReserve = isMobile
    ? legendTop + Math.max(legendHeight, minHeaderRowPx) + legendGapToPlot
    : 0
  const mobileAxisLabelTop = isMobile ? legendTop : frameInsetPx

  // Pixel-perfect internal padding for ALL views / charts.
  // Mobile top/bottom margin and X-axis height match AreaTrendChart so the
  // distance from the time-axis labels to the card bottom is identical, and
  // the plot starts at the same distance from the top as in the upper chart.
  const internalMarginBottom = isMobile ? (isMobileDayHourly ? 8 : 16) : 0
  const internalMargins = {
    top: internalMarginTop,
    right: isMobile ? 8 : 20,
    left: 0,
    bottom: internalMarginBottom,
  }
  // Fixed grid step for SOC: 0/25/50/75/100 => 4 intervals.
  // We want exactly 45px between grid lines inside the plot area:
  // plotHeight = 4 * 45 = 180px.
  // In Recharts, XAxis consumes its own height, so we must add it too.
  const socGridStepPx = 45
  const socPlotHeightPx = socGridStepPx * (socTicks.length - 1)
  // X-axis height matches AreaTrendChart on mobile (tighter band for hourly day view).
  const socXAxisHeightPx = isMobile ? (isMobileDayHourly ? 28 : 35) : 45
  const socChartHeightPx =
    socPlotHeightPx +
    internalMargins.top +
    internalMargins.bottom +
    socXAxisHeightPx
  // On mobile the chart container reaches the card bottom (AreaChart margin.bottom
  // matches AreaTrendChart). On PC keep the legacy 15px inset.
  const xAxisBottomInsetPx = isMobile ? 0 : 15

  // On mobile, the card height needs to accommodate the legend overlay above
  // the chart. The plot is anchored to the bottom of the card via absolute
  // positioning, so growing the outer minH pushes the plot DOWN inside the
  // card. We compensate by also adding `mobileTopReserve` to the chart
  // container height + AreaChart margin.top so the plot stays the same size
  // and just sits below the legend on mobile.
  const cardMinHeightPx = socChartHeightPx + xAxisBottomInsetPx

  return (
    <Box
      bg="ui.NavbarComponent.background"
      boxShadow="none"
      rounded="12px"
      p={0}
      borderWidth="1px"
      borderColor={cardBorder}
      display="flex"
      flexDirection="column"
      w="100%"
      minH={isMobile ? `${cardMinHeightPx + mobileTopReserve}px` : 0}
      h={isMobile ? "auto" : "100%"}
    >
      <Box flex="1" minH={0} position="relative">
        {isLoading && (
          <Flex justify="center" align="center" h="100%">
            <Spinner size="xl" color="ui.Interactive.accent" />
          </Flex>
        )}
        {!!errorMessage && <Text color="ui.Form.errorText">{errorMessage}</Text>}

        {!isLoading && !errorMessage && (
          <>
            <Text
              position="absolute"
              top={isMobile ? `${mobileAxisLabelTop}px` : `${frameInsetPx}px`}
              left="15px"
              fontFamily="Inter, system-ui, sans-serif"
              fontSize={{ base: "10px", md: "14px" }}
              fontWeight={500}
              color="ui.Chart.axisText"
              zIndex={2}
              pointerEvents="none"
            >
              {t("axis.chargePct")}
            </Text>
            <Box
              position="absolute"
              top={`${legendTop}px`}
              right="10px"
              zIndex={4}
              maxW={{ base: "55%", md: "100%" }}
              overflow="hidden"
            >
              <div ref={legendRef}>
                <ChartLegend
                  payload={(transformedSoc?.seriesInfo ?? []).map((s) => ({
                    value: s.name,
                    color: s.color,
                  }))}
                  seriesMeta={seriesMetaForSort}
                  activeSeries={activeSeries}
                  onLegendClick={onLegendClick}
                />
              </div>
            </Box>
            <Box
              position="absolute"
              left={0}
              right={0}
              bottom={`${xAxisBottomInsetPx}px`}
              height={socChartHeightPx}
              color="ui.Chart.axisText"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartDataWithDummy}
                  margin={{
                    ...internalMargins,
                  }}
                  tabIndex={-1}
                >
                  <defs>
                    {(transformedSoc?.seriesInfo ?? []).map((series, index) => (
                      <linearGradient
                        key={index}
                        id={`grad_soc_${index}`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor={series.color}
                          stopOpacity={gradientMaxOpacity}
                        />
                        <stop
                          offset="100%"
                          stopColor={series.color}
                          stopOpacity={gradientMinOpacity}
                        />
                      </linearGradient>
                    ))}
                  </defs>
                  <XAxis
                    type="number"
                    dataKey="x"
                    height={socXAxisHeightPx}
                    domain={xDomain}
                    allowDataOverflow={true}
                    ticks={xTicks}
                    interval={0}
                    padding={
                      isMobile ? { left: 10, right: 10 } : { left: 0, right: 0 }
                    }
                    axisLine={false}
                    tickLine={false}
                    tick={renderXAxisTick}
                  />
                  <YAxis
                    domain={[0, 100]}
                    ticks={[...socTicks]}
                    interval={0}
                    axisLine={false}
                    tickLine={false}
                    tick={(props: {
                      x: number
                      y: number
                      payload: { value: number }
                    }) => (
                      <text
                        x={props.x}
                        y={props.y}
                        dy={4}
                        fill="currentColor"
                        textAnchor="end"
                        style={{
                          fontFamily: "Inter, system-ui, sans-serif",
                          fontSize: `${axisFontSize}px`,
                          fontWeight: 500,
                        }}
                      >
                        {props.payload.value}
                      </text>
                    )}
                    width={socYAxisWidthPx}
                    tickMargin={0}
                  />
                  <CartesianGrid
                    vertical={false}
                    horizontalValues={[...socTicks]}
                    syncWithTicks
                    stroke={gridLine}
                    strokeWidth={0.5}
                  />
                  <Tooltip
                    contentStyle={{
                      fontSize: tooltipFontSize,
                      padding: tooltipPadding,
                      borderRadius: "8px",
                      backgroundColor: tooltipBg,
                      border: "none",
                      color: tooltipText,
                    }}
                    cursor={false}
                    wrapperStyle={{ outline: "none" }}
                    shared={false}
                    formatter={(
                      value: number | undefined,
                      name: string | undefined,
                    ) => {
                      if (value === undefined || name === undefined)
                        return ["", ""]
                      return [
                        `${value.toFixed(1)} %`,
                        tooltipLabelBySeriesName.get(name) ?? name,
                      ]
                    }}
                    labelFormatter={(label: number) =>
                      new Date(label).toLocaleString(i18n.resolvedLanguage)
                    }
                    itemSorter={(a: { name?: string }) =>
                      tooltipItemSortIndex(
                        a?.name,
                        seriesMetaForSort,
                        LEGEND_DESIRED_ORDER,
                      )
                    }
                  />
                  {(transformedSoc?.seriesInfo ?? []).map((series, index) => (
                    <Area
                      key={series.name}
                      type="monotone"
                      dataKey={series.name}
                      stroke={series.color}
                      fill={`url(#grad_soc_${index})`}
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
                  ))}
                  <Area
                    type="monotone"
                    dataKey="__grid_dummy__"
                    stroke="transparent"
                    fill="transparent"
                    fillOpacity={0}
                    strokeWidth={0}
                    isAnimationActive={false}
                    dot={false}
                    activeDot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </>
        )}
      </Box>
    </Box>
  )
}
