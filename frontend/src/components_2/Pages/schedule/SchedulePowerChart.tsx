/**
 * Schedule Power Chart within the Rayton operator UI (components_2/Pages/schedule/SchedulePowerChart.tsx).
 * Built with Chakra UI and shared theme tokens to stay consistent with dashboards, management, and control surfaces.
 * Primary contract: exported component props and functions below (see TypeScript types for required fields).
 */
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { useTranslation } from "react-i18next"
import { SCHEDULE_UI } from "./scheduleUi"

const formatIntTick = (v: number) => {
  if (!Number.isFinite(v)) return ""
  // Avoid duplicate labels when values are fractional but rounded to the same int.
  const abs = Math.abs(v)
  if (abs < 10 && Math.abs(v - Math.round(v)) > 1e-6) return v.toFixed(1)
  const r = Math.round(v)
  return r === 0 ? "0" : String(r)
}

type GradientStop = { offset: string; opacity: number }

export type SchedulePowerChartPoint = {
  hour: number
  timeLabel: string
  charge_power?: number
  discharge_power?: number
}

const computeGradientStops = (
  data: SchedulePowerChartPoint[],
  dataKey: keyof SchedulePowerChartPoint,
): GradientStop[] => {
  const maxOpacity = SCHEDULE_UI.chart.gradients.topOpacity
  const minOpacity = SCHEDULE_UI.chart.gradients.bottomOpacity

  const values: number[] = []
  for (const row of data) {
    const v = row[dataKey]
    if (typeof v === "number" && Number.isFinite(v)) values.push(v)
  }

  // Default: match existing behavior (fade down).
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

  // All positive: strongest at top, fade down.
  if (min >= 0) {
    return [
      { offset: "0%", opacity: maxOpacity },
      { offset: "100%", opacity: minOpacity },
    ]
  }

  // All negative: fade to 0 at the zero axis (top), strongest at bottom.
  if (max <= 0) {
    return [
      { offset: "0%", opacity: minOpacity },
      { offset: "100%", opacity: maxOpacity },
    ]
  }

  // Mixed: fade to 0 exactly at the zero axis, then increase again.
  const zeroPct = `${((max / (max - min)) * 100).toFixed(2)}%`
  return [
    { offset: "0%", opacity: maxOpacity },
    { offset: zeroPct, opacity: minOpacity },
    { offset: zeroPct, opacity: minOpacity },
    { offset: "100%", opacity: maxOpacity },
  ]
}

export function SchedulePowerChart({
  data,
  chartMargins,
  yAxisWidth,
  axisText,
  axisFontSize,
  gridStroke,
  cursorLine,
  hourTicks,
  renderXAxisTick,
  xAxisInterval,
  yTicks,
  tooltipContent,
  activeSeries,
  timeLineX,
}: {
  data: SchedulePowerChartPoint[]
  chartMargins: { top: number; right: number; left: number; bottom: number }
  yAxisWidth: number
  axisText: string
  axisFontSize: number
  gridStroke: string
  cursorLine: string
  hourTicks: number[]
  renderXAxisTick: (props: any) => any
  xAxisInterval: number
  yTicks: number[]
  tooltipContent: any
  activeSeries: string[]
  timeLineX?: number
}) {
  const { t } = useTranslation("Schedule")
  const renderYAxisTick = (props: any) => {
    const { x, y, payload } = props ?? {}
    const v = Number(payload?.value)
    return (
      <text
        x={x}
        y={y}
        dx={SCHEDULE_UI.chart.axes.y.tickLabelDx}
        dy={4}
        textAnchor="end"
        fill={axisText}
        style={{
          fontSize: `${axisFontSize}px`,
          fontWeight: SCHEDULE_UI.chart.axes.y.fontWeight,
        }}
      >
        {formatIntTick(v)}
      </text>
    )
  }

  return (
    <ResponsiveContainer
      width={SCHEDULE_UI.chart.layout.responsiveContainer.width}
      height="100%"
      minHeight={240}
      initialDimension={
        SCHEDULE_UI.chart.layout.responsiveContainer.initialDimension
      }
    >
      <AreaChart data={data} syncId="chartSync" margin={chartMargins}>
        <defs>
          <linearGradient
            id={SCHEDULE_UI.chart.gradients.chargePowerId}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            {computeGradientStops(data, "charge_power").map((s, i) => (
              <stop
                key={i}
                offset={s.offset}
                stopColor={SCHEDULE_UI.chart.colors.chargePower}
                stopOpacity={s.opacity}
              />
            ))}
          </linearGradient>
          <linearGradient
            id={SCHEDULE_UI.chart.gradients.dischargePowerId}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            {computeGradientStops(data, "discharge_power").map((s, i) => (
              <stop
                key={i}
                offset={s.offset}
                stopColor={SCHEDULE_UI.chart.colors.dischargePower}
                stopOpacity={s.opacity}
              />
            ))}
          </linearGradient>
        </defs>
        <CartesianGrid
          yAxisId="right"
          vertical={false}
          syncWithTicks={true}
          stroke={gridStroke}
          strokeWidth={SCHEDULE_UI.chart.grid.strokeWidth}
        />
        <XAxis
          dataKey="hour"
          type="number"
          domain={[0, 24]}
          ticks={hourTicks}
          interval={0}
          height={SCHEDULE_UI.chart.axes.x.height}
          axisLine={false}
          tickLine={false}
          tick={renderXAxisTick}
          tickMargin={SCHEDULE_UI.chart.axes.x.tickMargin}
          padding={SCHEDULE_UI.chart.axes.x.padding}
        />
        <YAxis
          yAxisId="right"
          orientation="left"
          ticks={yTicks}
          domain={[yTicks[0], yTicks[yTicks.length - 1]]}
          interval={0}
          allowDataOverflow={true}
          width={yAxisWidth}
          axisLine={false}
          tickLine={false}
          tickMargin={SCHEDULE_UI.chart.axes.y.tickMargin}
          tick={renderYAxisTick}
        />
        <Tooltip
          content={tooltipContent}
          cursor={{ stroke: cursorLine, strokeWidth: 1 }}
        />
        {typeof timeLineX === "number" && Number.isFinite(timeLineX) ? (
          <ReferenceLine
            x={timeLineX}
            stroke={cursorLine}
            strokeWidth={SCHEDULE_UI.chart.timeLine.strokeWidth}
            strokeDasharray={SCHEDULE_UI.chart.timeLine.strokeDasharray}
          />
        ) : null}
        <Area
          type={SCHEDULE_UI.chart.series.powerStepType}
          dataKey="charge_power"
          name={t("legend.charge")}
          stroke={SCHEDULE_UI.chart.colors.chargePower}
          fill={`url(#${SCHEDULE_UI.chart.gradients.chargePowerId})`}
          fillOpacity={1}
          strokeWidth={SCHEDULE_UI.chart.series.strokeWidth}
          dot={false}
          activeDot={{
            r: 3,
            stroke: SCHEDULE_UI.chart.colors.chargePower,
            strokeWidth: 0,
            fill: SCHEDULE_UI.chart.colors.chargePower,
          }}
          isAnimationActive={SCHEDULE_UI.chart.series.isAnimationActive}
          hide={!activeSeries.includes("charge")}
          yAxisId="right"
        />
        <Area
          type={SCHEDULE_UI.chart.series.powerStepType}
          dataKey="discharge_power"
          name={t("legend.discharge")}
          stroke={SCHEDULE_UI.chart.colors.dischargePower}
          fill={`url(#${SCHEDULE_UI.chart.gradients.dischargePowerId})`}
          fillOpacity={1}
          strokeWidth={SCHEDULE_UI.chart.series.strokeWidth}
          dot={false}
          activeDot={{
            r: 3,
            stroke: SCHEDULE_UI.chart.colors.dischargePower,
            strokeWidth: 0,
            fill: SCHEDULE_UI.chart.colors.dischargePower,
          }}
          isAnimationActive={SCHEDULE_UI.chart.series.isAnimationActive}
          hide={!activeSeries.includes("discharge")}
          yAxisId="right"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
