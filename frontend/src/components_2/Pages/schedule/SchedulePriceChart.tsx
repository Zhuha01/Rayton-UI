/**
 * Schedule Price Chart within the Rayton operator UI (components_2/Pages/schedule/SchedulePriceChart.tsx).
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
  const abs = Math.abs(v)
  if (abs < 10 && Math.abs(v - Math.round(v)) > 1e-6) return v.toFixed(1)
  const r = Math.round(v)
  return r === 0 ? "0" : String(r)
}

export type SchedulePriceChartPoint = {
  hour: number
  timeLabel: string
  price_ths?: number
}

export function SchedulePriceChart({
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
  data: SchedulePriceChartPoint[]
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
            id={SCHEDULE_UI.chart.gradients.priceId}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset={SCHEDULE_UI.chart.gradients.topOffset}
              stopColor={SCHEDULE_UI.chart.colors.price}
              stopOpacity={SCHEDULE_UI.chart.gradients.topOpacity}
            />
            <stop
              offset={SCHEDULE_UI.chart.gradients.bottomOffset}
              stopColor={SCHEDULE_UI.chart.colors.price}
              stopOpacity={SCHEDULE_UI.chart.gradients.bottomOpacity}
            />
          </linearGradient>
        </defs>
        <CartesianGrid
          yAxisId="left"
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
          yAxisId="left"
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
          type={SCHEDULE_UI.chart.series.priceStepType}
          dataKey="price_ths"
          name={t("legend.price")}
          stroke={SCHEDULE_UI.chart.colors.price}
          fill={`url(#${SCHEDULE_UI.chart.gradients.priceId})`}
          fillOpacity={1}
          strokeWidth={SCHEDULE_UI.chart.series.strokeWidth}
          dot={false}
          activeDot={{
            r: 3,
            stroke: SCHEDULE_UI.chart.colors.price,
            strokeWidth: 0,
            fill: SCHEDULE_UI.chart.colors.price,
          }}
          isAnimationActive={SCHEDULE_UI.chart.series.isAnimationActive}
          hide={!activeSeries.includes("price")}
          yAxisId="left"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
