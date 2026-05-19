/**
 * Derives responsive chart heights, margins, and axis extents from breakpoints and datapoint density.
 * Feeds sizing tokens into SOC and energy charts so mobile cards reuse consistent spacing.
 */

import { useBreakpointValue } from "@chakra-ui/react"
import { useMemo } from "react"
import type { ChartMargin, ChartSpacing } from "@/components_2/Pages/dashboard/dashboardTypes"

export type PercentHeight = `${number}%`

export interface ChartDimensions {
  energyChartHeight: PercentHeight
  socChartHeight: PercentHeight
  tooltipFontSize: number
  tooltipPadding: number
  chartMargins: ChartMargin
  barChartMargins: ChartMargin
  yAxisWidth: number
  yAxisLabelOffset: number
  xAxisHeight: number
  isMobile: boolean
  dynamicXAxisPadding: { left: number; right: number }
  chartSpacing: ChartSpacing | undefined
}

export function useChartDimensions(dataCount: number): ChartDimensions {
  const energyChartHeight = useBreakpointValue(
    { base: "50%", md: "60%" },
    { ssr: false },
  ) as PercentHeight

  const socChartHeight = useBreakpointValue(
    { base: "50%", md: "30%" },
    { ssr: false },
  ) as PercentHeight

  const tooltipFontSize = useBreakpointValue(
    { base: 10, md: 12 },
    { ssr: false },
  )!

  const tooltipPadding = useBreakpointValue(
    { base: 5, md: 10 },
    { ssr: false },
  )!

  const chartMargins = useBreakpointValue(
    {
      base: { top: 16, right: 5, left: 0, bottom: 0 },
      md: { top: 20, right: 16, left: 0, bottom: 4 },
    },
    { ssr: false },
  ) as ChartMargin

  const barChartMargins = useBreakpointValue(
    {
      // Bar chart is used for 1W/1M/1Y/All. Keep a stable bottom padding so
      // X-axis labels never touch the card edge.
      // Timeline -> frame should be 16px (frame -> screen bottom is handled by card margin).
      // Reduce left inset so plot sits closer to the card frame (mobile).
      base: { top: 16, right: 10, left: 2, bottom: 16 },
      // Keep some left inset so bars/ticks don't touch the frame.
      // Reduce left inset so plot sits closer to the card frame (desktop).
      md: { top: 20, right: 24, left: 6, bottom: 16 },
    },
    { ssr: false },
  ) as ChartMargin

  // Keep grid close to the card edge (as it was before).
  const yAxisWidth = useBreakpointValue({ base: 35, md: 52 }, { ssr: false })!

  const yAxisLabelOffset = useBreakpointValue(
    { base: 8, md: 10 },
    { ssr: false },
  )!

  const xAxisHeight = useBreakpointValue({ base: 15, md: 20 }, { ssr: false })!

  const isMobile = useBreakpointValue(
    { base: true, md: false },
    { ssr: false },
  )!

  const dynamicXAxisPadding = useMemo(() => {
    if (isMobile) {
      return { left: 20, right: 20 }
    }
    if (dataCount > 0 && dataCount <= 5) {
      return { left: 100, right: 100 }
    }
    if (dataCount <= 10) {
      return { left: 60, right: 60 }
    }
    return { left: 30, right: 30 }
  }, [dataCount, isMobile])

  const chartSpacing = useBreakpointValue(
    {
      base: { barGap: 0, barCategoryGap: "15%" },
      md: { barGap: 4, barCategoryGap: "20%" },
    },
    { ssr: false },
  ) as ChartSpacing | undefined

  return {
    energyChartHeight,
    socChartHeight,
    tooltipFontSize,
    tooltipPadding,
    chartMargins,
    barChartMargins,
    yAxisWidth,
    yAxisLabelOffset,
    xAxisHeight,
    isMobile,
    dynamicXAxisPadding,
    chartSpacing,
  }
}
