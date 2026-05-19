/**
 * Schedule Chart within the Rayton operator UI (components_2/Pages/schedule/ScheduleChart.tsx).
 * Built with Chakra UI and shared theme tokens to stay consistent with dashboards, management, and control surfaces.
 * Primary contract: exported component props and functions below (see TypeScript types for required fields).
 */
import {
  Box,
  Flex,
  Heading,
  Spinner,
  Text,
  useBreakpointValue,
  useMediaQuery,
  useToken,
  VStack,
} from "@chakra-ui/react"
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import type { ElectricityCostRow, ScheduleRow } from "@/client"
import { ChartLegend } from "@/components_2/Pages/dashboard/ChartLegend"
import type {
  LegendEntry,
  SeriesMeta,
} from "@/components_2/Pages/dashboard/dashboardTypes"
import { useGetElectricityCost } from "@/hooks/useElectricityCostQueries"
import { useGetSchedule } from "@/hooks/useScheduleQueries"
import { colors } from "@/theme/tokens/colors"
import { SchedulePowerChart } from "./SchedulePowerChart"
import { SchedulePriceChart } from "./SchedulePriceChart"
import { SCHEDULE_UI } from "./scheduleUi"

interface ScheduleChartProps {
  tenantId: string
  date: string
  scheduleData?: ScheduleRow[] // Optional prop to pass schedule data from table
}

type ScheduleChartPoint = {
  hour: number
  timeLabel: string
  price?: number
  price_ths?: number
  charge_power?: number
  discharge_power?: number
}

const computeMinMax = (
  data: ScheduleChartPoint[],
  keys: (keyof ScheduleChartPoint)[],
) => {
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

const niceStep = (rawStep: number) => {
  if (!Number.isFinite(rawStep) || rawStep <= 0) return 1
  const exp = Math.floor(Math.log10(rawStep))
  const base = 10 ** exp
  const f = rawStep / base
  const m = f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10
  return m * base
}

const buildStableTicks = (opts: {
  data: ScheduleChartPoint[]
  keys: (keyof ScheduleChartPoint)[]
  tickCount?: number
  /**
   * When true and all values are >= 0, force axis bottom at 0 with headroom on top.
   * Matches the energy charts' look for "all-positive" series.
   */
  zeroFloorIfAllPositive?: boolean
}) => {
  const { data, keys, tickCount = 6, zeroFloorIfAllPositive = true } = opts
  const { min, max, has } = computeMinMax(data, keys)
  if (!has) return [0, 1, 2, 3, 4, 5]

  const intervals = Math.max(1, tickCount - 1)
  const round6 = (n: number) => +n.toFixed(6)

  if (zeroFloorIfAllPositive && min >= 0 && max >= 0) {
    const raw = max / intervals
    const step = niceStep(raw) || 1
    const top = Math.max(step, Math.ceil(max / step) * step + step)
    return Array.from({ length: tickCount }, (_, i) =>
      round6((top / intervals) * i),
    )
  }

  // Mixed/negative values: make symmetric-ish domain and keep 0 included when possible.
  const span = max - min || 1
  const raw = span / intervals
  const step = niceStep(raw) || 1
  const bottom = Math.floor(min / step) * step
  const top = Math.ceil(max / step) * step
  const start = Number.isFinite(bottom) ? bottom : 0
  const end = Number.isFinite(top) ? top : step * intervals
  const enforcedSpan = end - start || step * intervals
  const enforcedStep = enforcedSpan / intervals
  return Array.from({ length: tickCount }, (_, i) =>
    round6(start + enforcedStep * i),
  )
}

const buildHourTicks = (opts: {
  tickEveryHours: number
  includeEnd?: boolean
}) => {
  const every = Math.max(1, Math.floor(opts.tickEveryHours || 1))
  const includeEnd = opts.includeEnd ?? true
  const ticks: number[] = []
  for (let h = 0; h <= 24; h += every) ticks.push(h)
  if (includeEnd && ticks[ticks.length - 1] !== 24) ticks.push(24)
  return ticks
}

const computeTimeLineX = (opts: {
  isoDate: string
  mode: "none" | "now" | "fixed"
  fixedHour: number
}) => {
  const { isoDate, mode, fixedHour } = opts
  if (mode === "none") return undefined
  if (mode === "fixed") return fixedHour

  // "now": show only when viewing today's date (local).
  const now = new Date()
  const todayIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
  if (isoDate !== todayIso) return undefined

  const h = now.getHours()
  const m = now.getMinutes()
  const value = h + m / 60
  // Keep inside domain [0..24]
  return Math.max(0, Math.min(24, value))
}

// Transform API response to chart format
const transformElectricityCostData = (
  apiResponse: ElectricityCostRow[] | undefined,
) => {
  if (!apiResponse) {
    return []
  }

  // Create a map of all hours with their prices
  const hourMap = new Map<number, number>()
  apiResponse.forEach((cost) => {
    hourMap.set(cost.hour_of_day, parseFloat(cost.price_UAH_per_MWh.toString()))
  })

  // Generate data for all 24 hours from 00:00 to 23:00
  let chartData = []
  for (let hour = 0; hour < 24; hour++) {
    let price
    if (hourMap.has(hour)) {
      price = hourMap.get(hour)!
    } else if (hour === 0 && hourMap.has(1)) {
      // For hour 0, use the price from the next hour (01:00) if available
      price = hourMap.get(1)!
    } else {
      price = 0 // Use 0 if no data for this hour and no next hour data for hour 0
    }
    chartData.push({
      hour: hour,
      timeLabel: `${hour.toString().padStart(2, "0")}:00`,
      price: price,
    })
  }

  // Add a point at hour 24 with the actual price if available in API data, otherwise use the last hour's price
  const hour24Price = hourMap.has(24)
    ? hourMap.get(24)!
    : chartData[chartData.length - 1].price
  chartData = [
    ...chartData,
    {
      hour: 24,
      timeLabel: "24:00",
      price: hour24Price,
    },
  ]

  return chartData
}

// Transform schedule data for charting
const transformScheduleData = (scheduleRows: ScheduleRow[] | undefined) => {
  if (!scheduleRows || scheduleRows.length === 0) {
    // Return empty data for all 24 hours if no schedule data
    let chartData = []
    for (let hour = 0; hour < 24; hour++) {
      chartData.push({
        hour: hour,
        timeLabel: `${hour.toString().padStart(2, "0")}:00`,
        charge_power: 0,
        discharge_power: 0,
      })
    }
    // Add a point at hour 24 with same values as the last hour
    const lastPoint = chartData[chartData.length - 1]
    chartData = [
      ...chartData,
      {
        hour: 24,
        timeLabel: "24:00",
        charge_power: lastPoint.charge_power,
        discharge_power: lastPoint.discharge_power,
      },
    ]

    return chartData
  }

  // Create an array to hold the schedule values for each hour of the day
  const hourValues = new Array(24).fill(null).map(() => ({
    charge_power: 0,
    discharge_power: 0,
  }))

  // Filter out duplicate start times, keeping only the first occurrence (by rec_no)
  // This handles the case where there might be multiple records with the same start time
  const uniqueScheduleRows = []
  const seenTimes = new Set()
  for (const row of scheduleRows) {
    const timeKey = row.start_time
    if (!seenTimes.has(timeKey)) {
      seenTimes.add(timeKey)
      uniqueScheduleRows.push(row)
    }
  }

  // Process each unique schedule row to fill the appropriate hours
  for (let i = 0; i < uniqueScheduleRows.length; i++) {
    const currentRow = uniqueScheduleRows[i]
    const currentHour = parseInt(currentRow.start_time.split(":")[0], 10)

    // Determine the end hour for this row's values
    let endHour
    if (i === uniqueScheduleRows.length - 1) {
      // For the last row in the list, the values apply until the next row in the list (which might be the first row if wrapping around)
      // Or until the end of the day if the next row has an earlier time (indicating wrap-around)
      const nextRow = uniqueScheduleRows[0] // First row in the list
      const nextHour = parseInt(nextRow.start_time.split(":")[0], 10)
      if (nextHour > currentHour) {
        // If next hour is later in the day, use that as the end point
        endHour = nextHour
      } else {
        // If next hour is earlier (indicating wrap-around), go to the end of the day
        endHour = 24
      }
    } else {
      // For non-last rows, values apply until the next row in the list
      const nextRow = uniqueScheduleRows[i + 1]
      endHour = parseInt(nextRow.start_time.split(":")[0], 10)
    }

    // Apply the current row's values to all hours from currentHour up to (but not including) endHour
    for (let hour = currentHour; hour < endHour; hour++) {
      if (hour < 24) {
        // Only for valid hours 0-23
        hourValues[hour] = {
          charge_power:
            currentRow.charge_power !== 0 && currentRow.charge_from_grid
              ? -Math.abs(currentRow.charge_power)
              : 0,
          discharge_power: Math.abs(currentRow.discharge_power) || 0,
        }
      }
    }
  }

  // Generate data for all 24 hours from 00:00 to 23:00
  let chartData = []
  for (let hour = 0; hour < 24; hour++) {
    chartData.push({
      hour: hour,
      timeLabel: `${hour.toString().padStart(2, "0")}:00`,
      charge_power: hourValues[hour].charge_power,
      discharge_power: hourValues[hour].discharge_power,
    })
  }

  // Add a point at hour 24 with same values as the last hour of the day (hour 23)
  const lastPoint = chartData[23] // Use the values from hour 23, not from chartData[chartData.length - 1] which would be hour 23's data
  chartData = [
    ...chartData,
    {
      hour: 24,
      timeLabel: "24:00",
      charge_power: lastPoint.charge_power,
      discharge_power: lastPoint.discharge_power,
    },
  ]

  return chartData
}

const ScheduleChart = ({
  tenantId,
  date,
  scheduleData: propScheduleData,
}: ScheduleChartProps) => {
  const { t, i18n } = useTranslation("Schedule")
  const { data: fetchedScheduleData } = useGetSchedule({ tenantId, date })

  const {
    data: electricityCostData,
    isLoading: isElectricityCostLoading,
    error: electricityCostError,
  } = useGetElectricityCost({ tenantId, date })

  // Use the schedule data passed via props if available, otherwise use the fetched data
  const scheduleDataToUse = propScheduleData || fetchedScheduleData

  // Transform electricity cost data for charting
  const transformedCostData = useMemo(() => {
    return transformElectricityCostData(electricityCostData)
  }, [electricityCostData])

  // Transform schedule data for charting
  const transformedScheduleData = useMemo(() => {
    return transformScheduleData(scheduleDataToUse)
  }, [scheduleDataToUse])

  // Combine the two datasets by merging the power values into the cost data
  const combinedData = useMemo(() => {
    if (transformedCostData.length > 0 && transformedScheduleData.length > 0) {
      // Merge the two datasets by matching the timeLabel
      return transformedCostData.map((costPoint, index) => {
        const schedulePoint = transformedScheduleData[index]
        return {
          ...costPoint, // Spread the cost data (hour, timeLabel, price)
          charge_power: schedulePoint.charge_power,
          discharge_power: schedulePoint.discharge_power,
        }
      })
    }
    if (transformedScheduleData.length > 0) {
      // If only schedule data is available, use it with default price values
      return transformedScheduleData
    }
    return []
  }, [transformedCostData, transformedScheduleData])

  const priceChartData = useMemo(() => {
    return combinedData.map((row: any) => ({
      ...row,
      price_ths: typeof row.price === "number" ? row.price / 1000 : row.price,
    }))
  }, [combinedData])

  // Stable Y-grid: pin YAxis ticks+domain so horizontal grid lines match Energy charts.
  const powerYTicks = useMemo(() => {
    return buildStableTicks({
      data: combinedData as ScheduleChartPoint[],
      keys: ["charge_power", "discharge_power"],
      tickCount: SCHEDULE_UI.chart.axes.yTickCount,
      zeroFloorIfAllPositive: false, // power can be negative (charge) and positive (discharge)
    })
  }, [combinedData])

  const priceYTicks = useMemo(() => {
    return buildStableTicks({
      data: priceChartData as ScheduleChartPoint[],
      keys: ["price_ths"],
      tickCount: SCHEDULE_UI.chart.axes.yTickCount,
      zeroFloorIfAllPositive: true,
    })
  }, [priceChartData])

  // --- Mobile Adaptations ---
  const tooltipFontSize =
    useBreakpointValue(SCHEDULE_UI.chart.responsive.tooltipFontSize, {
      ssr: false,
    }) ?? 12
  const tooltipPadding =
    useBreakpointValue(SCHEDULE_UI.chart.responsive.tooltipPadding, {
      ssr: false,
    }) ?? 10
  const yAxisWidth =
    useBreakpointValue(SCHEDULE_UI.chart.responsive.yAxisWidth, {
      ssr: false,
    }) ?? 50
  const _cardHeight =
    useBreakpointValue(SCHEDULE_UI.chart.responsive.cardHeight, {
      ssr: false,
    }) ?? "360px"
  const cardTitleFontSize =
    useBreakpointValue(SCHEDULE_UI.chart.responsive.cardTitleFontSize, {
      ssr: false,
    }) ?? "12px"
  const xAxisFontSize =
    useBreakpointValue(SCHEDULE_UI.chart.responsive.xAxisFontSize, {
      ssr: false,
    }) ?? 10
  const yAxisFontSize =
    useBreakpointValue(SCHEDULE_UI.chart.responsive.yAxisFontSize, {
      ssr: false,
    }) ?? 12
  const xAxisInterval =
    useBreakpointValue(SCHEDULE_UI.chart.responsive.xAxisInterval, {
      ssr: false,
    }) ?? 3

  const chartMargins =
    useBreakpointValue(SCHEDULE_UI.chart.responsive.chartMargins, {
      ssr: false,
    }) ?? SCHEDULE_UI.chart.responsive.chartMargins.md
  // --------------------------

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
  const gridStroke =
    gridLine || "rgba(255, 255, 255, 0.08)"
  const [_isMobile] = useMediaQuery(["(max-width: 767px)"], { ssr: false })
  // Extra headroom so the top Y tick doesn't get clipped by the SVG viewport.
  const extraTop =
    useBreakpointValue(SCHEDULE_UI.chart.axes.extraTopMarginPx, {
      ssr: false,
    }) ?? 18
  const effectiveChartMargins = useMemo(
    () => ({ ...chartMargins, top: (chartMargins?.top ?? 0) + extraTop }),
    [chartMargins, extraTop],
  )
  const effectivePriceChartMargins = useMemo(
    () => ({
      ...effectiveChartMargins,
      bottom: (effectiveChartMargins?.bottom ?? 0) + 4,
    }),
    [effectiveChartMargins],
  )
  // Title: align with inner plot left (Y-axis + tick labels). Legend on the right: only Recharts
  // `margin.right` — schedule charts have a single left Y-axis, so do not add `yAxisWidth` to `pr`
  // (that would push the legend left vs the actual plot edge).
  const chartHeaderInsetPx = useMemo(() => {
    const yLabelDx = SCHEDULE_UI.chart.axes.y.tickLabelDx ?? 0
    const left = (chartMargins?.left ?? 0) + yAxisWidth + yLabelDx
    const right = chartMargins?.right ?? 0
    return { pl: `${left}px`, pr: `${right}px` }
  }, [chartMargins?.left, chartMargins?.right, yAxisWidth])
  const formatHour = (h: number) => `${String(h).padStart(2, "0")}:00`

  const configuredFixedCardHeightPx =
    useBreakpointValue(SCHEDULE_UI.chart.layout.fixedCardHeightPx, {
      ssr: false,
    }) ?? 360
  const cardTotalHeightPx = useMemo(() => {
    if (SCHEDULE_UI.chart.layout.heightMode === "fixed")
      return configuredFixedCardHeightPx
    // "matchTable": 2 cards + gap = table height.
    const total = SCHEDULE_UI.table.heightPx
    const gap = SCHEDULE_UI.chart.layout.stackGapPx
    return Math.floor((total - gap) / 2)
  }, [configuredFixedCardHeightPx])

  const resolvedHourTicks = useMemo(() => {
    const explicit = SCHEDULE_UI.chart.axes.x.ticks
    if (Array.isArray(explicit) && explicit.length > 0) return explicit
    return buildHourTicks({
      tickEveryHours: SCHEDULE_UI.chart.axes.x.tickEveryHours,
      includeEnd: true,
    })
  }, [])

  const timeLineX = useMemo(() => {
    return computeTimeLineX({
      isoDate: date,
      mode: SCHEDULE_UI.chart.timeLine.mode,
      fixedHour: SCHEDULE_UI.chart.timeLine.fixedHour,
    })
  }, [date])

  const renderXAxisTick = (props: any) => {
    const { x, y, payload } = props ?? {}
    const v = Number(payload?.value)
    // Keep all time labels centered on their tick for even perceived spacing.
    const anchor = "middle"
    const dx =
      v === 0
        ? SCHEDULE_UI.chart.axes.x.edgeDx.start
        : v === 24
          ? SCHEDULE_UI.chart.axes.x.edgeDx.end
          : 0
    return (
      <text
        x={x}
        y={y}
        dx={dx}
        dy={10}
        textAnchor={anchor}
        fill={axisText}
        style={{ fontSize: `${xAxisFontSize}px`, fontWeight: 500 }}
      >
        {formatHour(v)}
      </text>
    )
  }

  const TooltipContent = ({ active, payload, label }: any) => {
    if (!active || !payload || payload.length === 0) return null
    const labelHour = typeof label === "number" ? label : Number(label)
    const title = Number.isFinite(labelHour)
      ? formatHour(labelHour)
      : String(label ?? "")

    const items = payload
      .filter((p: any) => p && typeof p.value !== "undefined" && p.name)
      .map((p: any) => {
        const dk = p.dataKey as string | undefined
        const raw = Number(p.value)
        if (dk === "discharge_power") {
          return {
            name: p.name as string,
            value: `${raw * -1} MW`,
            color: p.color as string,
          }
        }
        if (dk === "charge_power") {
          return {
            name: p.name as string,
            value: `${raw} MW`,
            color: p.color as string,
          }
        }
        if (dk === "price_ths") {
          return {
            name: p.name as string,
            value: `${raw.toFixed(2)} ${t("tooltip.priceUnit")}`,
            color: p.color as string,
          }
        }
        return {
          name: p.name as string,
          value: `${p.value}`,
          color: p.color as string,
        }
      })

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
          {title}
        </p>
        <ul
          className="recharts-tooltip-item-list"
          style={{ padding: 0, margin: 0 }}
        >
          {items.map((it: any) => (
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

  const legendLabels = useMemo(
    () => ({
      charge: t("legend.charge"),
      discharge: t("legend.discharge"),
      price: t("legend.price"),
    }),
    [t, i18n.resolvedLanguage],
  )

  // Legend (must be defined before any conditional returns to keep hook order stable)
  const powerLegendPayload: LegendEntry[] = [
    {
      value: "charge",
      label: legendLabels.charge,
      color: SCHEDULE_UI.chart.colors.chargePower,
    },
    {
      value: "discharge",
      label: legendLabels.discharge,
      color: SCHEDULE_UI.chart.colors.dischargePower,
    },
  ]
  const powerSeriesMeta: SeriesMeta[] = [
    { name: "charge", data_id: 1 },
    { name: "discharge", data_id: 2 },
  ]
  const priceLegendPayload: LegendEntry[] = [
    { value: "price", label: legendLabels.price, color: SCHEDULE_UI.chart.colors.price },
  ]
  const priceSeriesMeta: SeriesMeta[] = [{ name: "price", data_id: 3 }]

  const [activePowerSeries, setActivePowerSeries] = useState<string[]>([
    "charge",
    "discharge",
  ])
  const [activePriceSeries, setActivePriceSeries] = useState<string[]>(["price"])

  const toggleSeries = (
    name: string,
    set: (next: (prev: string[]) => string[]) => void,
  ) => {
    set((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
    )
  }

  // If schedule data is provided via props, we don't need to wait for the schedule fetch
  const isLoading = isElectricityCostLoading // Only check electricity cost loading since schedule data can come from props
  const error = electricityCostError

  if (isLoading) {
    return (
      <Box
        p={SCHEDULE_UI.chart.loading.p}
        borderWidth={SCHEDULE_UI.chart.card.borderWidth}
        borderRadius={SCHEDULE_UI.chart.card.borderRadius}
        bg={SCHEDULE_UI.chart.card.bg}
        borderColor={SCHEDULE_UI.chart.card.borderColor}
        minHeight={SCHEDULE_UI.chart.loading.minHeight}
      >
        <Heading as="h3" size="md" mb={2}>
          Schedule Chart
        </Heading>
        <Flex
          justify="center"
          align="center"
          h={SCHEDULE_UI.chart.loading.spinnerAreaHeight}
        >
          <Spinner size="xl" color="ui.Interactive.accent" />
        </Flex>
      </Box>
    )
  }

  if (error) {
    return (
      <Box
        p={SCHEDULE_UI.chart.loading.p}
        borderWidth={SCHEDULE_UI.chart.card.borderWidth}
        borderRadius={SCHEDULE_UI.chart.card.borderRadius}
        bg={SCHEDULE_UI.chart.card.bg}
        borderColor={SCHEDULE_UI.chart.card.borderColor}
        minHeight="200px"
      >
        <Heading as="h3" size="md" mb={2}>
          Schedule Chart
        </Heading>
        <Text color="ui.ScheduleTable.errorText">
          Error loading chart: {error.message}
        </Text>
      </Box>
    )
  }

  const ChartCard = ({
    label,
    legendPayload,
    legendMeta,
    activeSeries,
    onLegendClick,
    legendLayout,
    children,
  }: {
    label: string
    legendPayload: LegendEntry[]
    legendMeta: SeriesMeta[]
    activeSeries: string[]
    onLegendClick: (name: string) => void
    legendLayout?: "default" | "row"
    children: any
  }) => (
    <Box
      p={SCHEDULE_UI.chart.card.p}
      px={SCHEDULE_UI.chart.card.innerPx}
      pb={SCHEDULE_UI.chart.card.innerPb}
      borderWidth={SCHEDULE_UI.chart.card.borderWidth}
      borderRadius={SCHEDULE_UI.chart.card.borderRadius}
      bg={SCHEDULE_UI.chart.card.bg}
      borderColor={SCHEDULE_UI.chart.card.borderColor}
      overflow={SCHEDULE_UI.chart.card.overflow}
      w="100%"
      h={`${cardTotalHeightPx}px`}
      display="flex"
      flexDirection="column"
    >
      <Flex
        pl={chartHeaderInsetPx.pl}
        pr={chartHeaderInsetPx.pr}
        pt={SCHEDULE_UI.chart.layout.headerPt}
        align="center"
        justify="space-between"
        gap="8px"
      >
        <Text
          fontSize={cardTitleFontSize}
          fontWeight={600}
          color="ui.Chart.axisText"
          whiteSpace="nowrap"
        >
          {label}
        </Text>
        <Box>
          <ChartLegend
            payload={legendPayload}
            seriesMeta={legendMeta}
            activeSeries={activeSeries}
            onLegendClick={onLegendClick}
            layout={legendLayout ?? "default"}
            paddingInlineEnd={0}
          />
        </Box>
      </Flex>
      <Box
        flex="1"
        w="100%"
        minW={0}
        minH="240px"
        mt={SCHEDULE_UI.chart.layout.chartAreaMt}
      >
        {children}
      </Box>
    </Box>
  )

  return (
    <VStack align="stretch" gap={SCHEDULE_UI.chart.layout.headerGap}>
      {combinedData.length > 0 ? (
        <>
          <ChartCard
            label={t("charts.powerTitle")}
            legendPayload={powerLegendPayload}
            legendMeta={powerSeriesMeta}
            activeSeries={activePowerSeries}
            onLegendClick={(name) => toggleSeries(name, setActivePowerSeries)}
            legendLayout="row"
          >
            <SchedulePowerChart
              data={combinedData}
              chartMargins={effectiveChartMargins}
              yAxisWidth={yAxisWidth}
              axisText={axisText}
              axisFontSize={yAxisFontSize}
              gridStroke={gridStroke}
              cursorLine={cursorLine}
              hourTicks={resolvedHourTicks}
              renderXAxisTick={renderXAxisTick}
              xAxisInterval={xAxisInterval}
              yTicks={powerYTicks}
              tooltipContent={<TooltipContent />}
              activeSeries={activePowerSeries}
              timeLineX={timeLineX}
            />
          </ChartCard>

          <ChartCard
            label={t("charts.priceTitle")}
            legendPayload={priceLegendPayload}
            legendMeta={priceSeriesMeta}
            activeSeries={activePriceSeries}
            onLegendClick={(name) => toggleSeries(name, setActivePriceSeries)}
          >
            <SchedulePriceChart
              data={priceChartData}
              chartMargins={effectivePriceChartMargins}
              yAxisWidth={yAxisWidth}
              axisText={axisText}
              axisFontSize={yAxisFontSize}
              gridStroke={gridStroke}
              cursorLine={cursorLine}
              hourTicks={resolvedHourTicks}
              renderXAxisTick={renderXAxisTick}
              xAxisInterval={xAxisInterval}
              yTicks={priceYTicks}
              tooltipContent={<TooltipContent />}
              activeSeries={activePriceSeries}
              timeLineX={timeLineX}
            />
          </ChartCard>
        </>
      ) : (
        <Flex
          justify="center"
          align="center"
          h={SCHEDULE_UI.chart.noData.centerHeight}
        >
          <Text color="ui.Chart.axisText">{t("charts.noData")}</Text>
        </Flex>
      )}
    </VStack>
  )
}

export default ScheduleChart
