/**
 * Multi-column explorer of miniature trend charts surfaced when daytime energy view expands.
 * Renders selectable series tiles paired with synced MiniTrendChart instances plus legend badges.
 */

import { Box, Button, HStack, SimpleGrid, Text } from "@chakra-ui/react"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import type { TimeRange } from "@/components_2/ui/TimeRangePicker"
import {
  colorKeyForSeries,
  LEGEND_DESIRED_ORDER,
  tooltipItemSortIndex,
} from "./chartUtils"
import { MiniTrendChart } from "./MiniTrendChart"
import type {
  AggregateBy,
  ChartRow,
  SeriesInfoItem,
  SeriesMeta,
  TransformedChartData,
} from "./dashboardTypes"

export interface ExpandedTrendGridProps {
  transformedEnergy: TransformedChartData
  transformedSoc: TransformedChartData | null
  timeRange: TimeRange
  startDate: Date
  endDate: Date
  aggregateBy: AggregateBy
  hourlyTicks: number[] | undefined
  weekTicks: number[] | undefined
  dynamicXAxisPadding: { left: number; right: number }
  chartSpacing: { barGap: number; barCategoryGap: string | number } | undefined
  tooltipFontSize: number
  tooltipPadding: number
  seriesMetaForSort: SeriesMeta[]
  hasEss: boolean
  zoomDomain: [number, number] | null
  setZoomDomain: (domain: [number, number] | null) => void
  allowChartBrushZoom?: boolean
}

interface MiniEntry {
  series: SeriesInfoItem
  chartData: ChartRow[]
}

export function ExpandedTrendGrid({
  transformedEnergy,
  transformedSoc,
  timeRange,
  startDate,
  endDate,
  aggregateBy,
  hourlyTicks,
  tooltipFontSize,
  tooltipPadding,
  seriesMetaForSort,
  hasEss,
  zoomDomain,
  setZoomDomain,
  allowChartBrushZoom = true,
}: ExpandedTrendGridProps) {
  const { t, i18n } = useTranslation("Dashboard")
  if (timeRange !== "1D") return null

  const entries: MiniEntry[] = []
  for (const series of transformedEnergy.seriesInfo) {
    entries.push({ series, chartData: transformedEnergy.chartData })
  }
  if (hasEss && transformedSoc) {
    for (const series of transformedSoc.seriesInfo) {
      entries.push({ series, chartData: transformedSoc.chartData })
    }
  }

  const sorted = [...entries].sort(
    (a, b) =>
      tooltipItemSortIndex(
        a.series.name,
        seriesMetaForSort,
        LEGEND_DESIRED_ORDER,
      ) -
      tooltipItemSortIndex(
        b.series.name,
        seriesMetaForSort,
        LEGEND_DESIRED_ORDER,
      ),
  )

  const labelBySeriesName = useMemo(() => {
    const map = new Map<string, string>()
    for (const meta of seriesMetaForSort) {
      const key = colorKeyForSeries(meta)
      if (!key) continue
      map.set(meta.name, t(`legend.${key}`, { defaultValue: meta.name }))
    }
    return map
  }, [seriesMetaForSort, t, i18n.resolvedLanguage])

  return (
    <Box w="100%" h="100%" pt={{ base: "12px", md: 0 }} position="relative">
      {zoomDomain && (
        <Box
          position="absolute"
          // Place slightly below the TimeRangePicker row in expanded view.
          top={{ base: "-15px", md: "-38px" }}
          right="8px"
          zIndex={3}
        >
          <Button size="xs" variant="ghost" onClick={() => setZoomDomain(null)}>
            {t("toolbar.resetZoom")}
          </Button>
        </Box>
      )}
      <SimpleGrid columns={{ base: 1, md: 2 }} gap="8px">
        {sorted.map((entry) => (
          <Box
            key={`${entry.series.dataId}_${entry.series.name}`}
            h="275px"
            position="relative"
          >
            {/* Legend: top-right, opposite to Y-axis label */}
            <HStack
              position="absolute"
              top="-2px"
              right="10px"
              gap="8px"
              zIndex={2}
              pointerEvents="none"
              maxW="55%"
              justify="flex-end"
            >
              <Box
                w="10px"
                h="10px"
                borderRadius="full"
                bg={entry.series.color}
              />
              <Text
                fontFamily="Inter, system-ui, sans-serif"
                fontSize="10px"
                fontWeight={500}
                color="ui.Chart.axisText"
                lineClamp={1}
                textAlign="right"
              >
                {labelBySeriesName.get(entry.series.name) ?? entry.series.name}
              </Text>
            </HStack>
            <MiniTrendChart
              series={entry.series}
              chartData={entry.chartData}
              startDate={startDate}
              endDate={endDate}
              aggregateBy={aggregateBy}
              hourlyTicks={hourlyTicks}
              tooltipFontSize={tooltipFontSize}
              tooltipPadding={tooltipPadding}
              timeRange={timeRange}
              zoomDomain={zoomDomain}
              setZoomDomain={setZoomDomain}
              allowChartBrushZoom={allowChartBrushZoom}
            />
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  )
}
