/**
 * Custom legend list for dashboard energy charts respecting semantic ordering hooks.
 * Supports row versus wrapped layouts plus optional truncation for compact SOC overlays.
 */

import { Box, Flex } from "@chakra-ui/react"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { LEGEND_DESIRED_ORDER, sortLegendPayload } from "./chartUtils"
import { colorKeyForSeries } from "./chartUtils"
import type { LegendEntry, SeriesMeta } from "./dashboardTypes"

export interface ChartLegendProps {
  payload: readonly LegendEntry[] | undefined
  seriesMeta: SeriesMeta[]
  activeSeries: string[]
  onLegendClick: (name: string) => void
  /**
   * Controls the legend layout.
   * - default: current Energy charts behavior (2 rows on desktop).
   * - row: keep items in a single horizontal row (useful for 2-item legends).
   */
  layout?: "default" | "row"
  /**
   * Override default end padding (`px` uses spacing `2`). Pass `0` when the parent
   * already applies the same horizontal inset as the chart plot (e.g. schedule charts).
   */
  paddingInlineEnd?: number
}

export function ChartLegend({
  payload,
  seriesMeta,
  activeSeries,
  onLegendClick,
  layout = "default",
  paddingInlineEnd,
}: ChartLegendProps) {
  const { t, i18n } = useTranslation("Dashboard")
  const sortedPayload = sortLegendPayload(
    payload,
    seriesMeta,
    LEGEND_DESIRED_ORDER,
  )
  const desktopRowCount =
    layout === "default" && sortedPayload.length > 8 ? 3 : 2

  const labelBySeriesName = useMemo(() => {
    const map = new Map<string, string>()
    for (const meta of seriesMeta) {
      const key = colorKeyForSeries(meta)
      if (!key) continue
      map.set(meta.name, t(`legend.${key}`, { defaultValue: meta.name }))
    }
    return map
    // `t` can be referentially stable across language changes; depend on language explicitly.
  }, [seriesMeta, i18n.resolvedLanguage, t])

  return (
    <Box
      as="ul"
      display="grid"
      // Mobile: 2 columns filled top-to-bottom.
      // Desktop: keep 2 rows filled left-to-right (current look).
      gridAutoFlow={
        layout === "row"
          ? { base: "column", md: "column" }
          : { base: "row", md: "column" }
      }
      gridTemplateColumns={
        layout === "row"
          ? { base: "repeat(2, max-content)", md: "repeat(2, max-content)" }
          : { base: "repeat(2, max-content)", md: undefined }
      }
      gridTemplateRows={
        layout === "row"
          ? { base: undefined, md: undefined }
          : { base: undefined, md: `repeat(${desktopRowCount}, max-content)` }
      }
      gridAutoColumns={{ base: undefined, md: "max-content" }}
      justifyContent="end"
      alignContent="start"
      columnGap={{ base: 3, md: 4 }}
      rowGap={{ base: 2, md: 2 }}
      py={{ base: 0, md: 1 }}
      pl={2}
      pr={paddingInlineEnd ?? 2}
      listStyleType="none"
      maxWidth="100%"
      overflowX="auto"
      overflowY="hidden"
      whiteSpace="nowrap"
    >
      {sortedPayload.map((entry, index) => (
        <Flex
          key={`item-${index}`}
          as="li"
          direction="row"
          align="center"
          fontFamily="Inter, system-ui, sans-serif"
          fontSize={{ base: "10px", md: "12px" }}
          fontWeight={400}
          color="ui.Chart.axisText"
          flex="0 0 auto"
          whiteSpace="nowrap"
          cursor="pointer"
          onClick={() => {
            if (entry.value && typeof entry.value === "string") {
              onLegendClick(entry.value)
            }
          }}
          opacity={
            entry.value && typeof entry.value === "string"
              ? activeSeries.includes(entry.value)
                ? 1
                : 0.5
              : 1
          }
        >
          <Box
            width={{ base: "10px", md: "12px" }}
            height={{ base: "10px", md: "12px" }}
            borderRadius="2px"
            mr={{ base: 2, md: 4 }}
            backgroundColor={entry.color as string | undefined}
          />
          {typeof entry.value === "string"
            ? ((entry.label as string | undefined) ??
              labelBySeriesName.get(entry.value) ??
              entry.value)
            : ((entry.label as string | undefined) ??
              (entry.value as string | undefined))}
        </Flex>
      ))}
    </Box>
  )
}
