/**
 * Container page for tenant energy dashboards wiring chart logic, KPI cards, and flow widgets.
 * Branches layouts between mobile stacks and dense desktop grids while guarding expanded chart mode to the day range.
 */

import {
  Box,
  Button,
  Flex,
  GridItem,
  Spinner,
  Text,
  useMediaQuery,
} from "@chakra-ui/react"
import { useEffect, useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { StatusCardsGrid } from "@/components_2/Pages/home/Cards/StatusCardsGrid"
import { InteractiveEnergyFlow } from "@/components_2/Pages/home/interactive/InteractiveEnergyFlow"
import ChartExportMenu from "@/components_2/ui/ChartExportMenu"
import { OrangeToggleSwitch } from "@/components_2/ui/OrangeToggleSwitch"
import { TimeRangePicker } from "@/components_2/ui/TimeRangePicker"
import { AreaTrendChart } from "./AreaTrendChart"
import { BarTrendChart } from "./BarTrendChart"
import { BatteryStatusCard } from "./BatteryStatusCard"
import { ChartControls } from "./ChartControls"
import { formatXAxisTimestamp, toLocalDateString } from "./chartUtils"
import { DatePickerActions } from "./DatePickerActions"
import { ExpandedTrendGrid } from "./ExpandedTrendGrid"
import type { EnergyTrendChartProps } from "./dashboardTypes"
import { useChartDimensions } from "@/hooks/useChartDimensions"
import { useChartLogic } from "@/hooks/useChartLogic"

const MD_CHART_FIXED_HEIGHT_REM = "47.5625rem"

const EnergyTrendChart = (props: EnergyTrendChartProps) => {
  const { t, i18n } = useTranslation("Dashboard")
  const chartRef = useRef<HTMLDivElement | null>(null)
  const logic = useChartLogic(props)
  const dataCount = logic.transformedEnergyData?.chartData.length ?? 0
  const dimensions = useChartDimensions(dataCount)
  const [isExpanded, setIsExpanded] = useState(false)
  const [zoomDomain, setZoomDomain] = useState<[number, number] | null>(null)
  /** Mobile: drag-zoom on chart is opt-in so toolbar touches do not brush-zoom. */
  const [mobileChartBrushEnabled, setMobileChartBrushEnabled] = useState(false)
  const [socSplitBatteryLayoutKey, setSocSplitBatteryLayoutKey] = useState(0)
  const wasSplitBatteryCardRef = useRef<boolean | null>(null)

  // Collapse expanded grids automatically when switching away from the intraday preset.
  useEffect(() => {
    if (logic.timeRange !== "1D" && isExpanded) {
      setIsExpanded(false)
    }
  }, [logic.timeRange, isExpanded])

  useEffect(() => {
    if (logic.timeRange !== "1D") setZoomDomain(null)
  }, [logic.timeRange])

  const yScaleOffsetFromCardPx = 0
  const cardPaddingMdPx = 16
  const areaChartLeftMarginPx = Math.max(
    0,
    yScaleOffsetFromCardPx - cardPaddingMdPx,
  )

  const formatXAxisTick = useMemo(
    () =>
      (ts: number) =>
        formatXAxisTimestamp(ts, logic.aggregateBy, i18n.resolvedLanguage),
    [logic.aggregateBy, i18n.resolvedLanguage],
  )

  const formatXAxisTickMobile = useMemo(() => {
    const month2 = (d: Date) => {
      const raw = d.toLocaleDateString(i18n.resolvedLanguage, { month: "short" })
      // Strip punctuation/spaces and keep 2 visible letters for compact mobile ticks.
      const cleaned = raw.replace(/[^\p{L}]/gu, "")
      return cleaned.slice(0, 2) || raw.slice(0, 2)
    }
    return (ts: number) => {
      const d = new Date(ts)
      if (logic.aggregateBy === "day") {
        return `${d.getDate()} ${month2(d)}`
      }
      if (logic.aggregateBy === "month") {
        const yy = String(d.getFullYear()).slice(-2)
        return `${month2(d)} ${yy}`
      }
      // hour/year fall back to existing formatting
      return formatXAxisTimestamp(ts, logic.aggregateBy, i18n.resolvedLanguage)
    }
  }, [logic.aggregateBy, i18n.resolvedLanguage])

  const isSplitBatteryCard =
    !isExpanded &&
    logic.timeRange === "1D" &&
    logic.isSocCombined === false &&
    props.plantConfig.hasEss
  // Remount SOC card when returning from combined mode so legend/label layout state resets.
  useEffect(() => {
    const prev = wasSplitBatteryCardRef.current
    if (prev === false && isSplitBatteryCard) {
      setSocSplitBatteryLayoutKey((k) => k + 1)
    }
    wasSplitBatteryCardRef.current = isSplitBatteryCard
  }, [isSplitBatteryCard])
  const [isMobileLayout] = useMediaQuery(["(max-width: 767px)"], {
    ssr: false,
  })

  const isDayView = logic.timeRange === "1D"

  /** Desktop: brush zoom always on. Mobile: opt-in, and only for 1D (area chart path). */
  const allowChartBrushZoom =
    !isMobileLayout || (isDayView && mobileChartBrushEnabled)
  const chartCardBottomSpaceMobile = isSplitBatteryCard ? 0 : 16
  const chartCardBottomSpaceDesktop = isSplitBatteryCard ? 0 : 24

  return (
    <>
      <GridItem
        area="chart"
        gridColumn={{ md: "span 3" }}
        w="100%"
        minW={{ base: "0px", md: "1000px" }}
        px={{ base: "16px", md: "24px" }}
        pt={{ base: "16px", md: "24px" }}
        boxSizing="border-box"
        mb={{
          base: `${chartCardBottomSpaceMobile}px`,
          md: `${chartCardBottomSpaceDesktop}px`,
        }}
      >
        <Flex
          direction={{ base: "column", md: "row" }}
          // base: 16px (1rem), md+: 24px (1.5rem)
          gap={{ base: "1rem", md: "1.5rem" }}
          alignItems="stretch"
          w="100%"
        >
          <Box
            order={{ base: 2, md: 1 }}
            w="100%"
            minW={0}
            flex={{ base: "none", md: 2 }}
          >
            {/* MOBILE: controls are outside the chart card (below sidebar/header) */}
            {isMobileLayout && (
              <Flex
                direction="column"
                gap="16px"
                pb="16px"
                style={{ touchAction: "manipulation" }}
              >
                {/* 1) Time range picker (standalone row) */}
                <TimeRangePicker
                  value={logic.timeRange}
                  onChange={logic.handleTimeRangeChange}
                />

                {/* 2) Calendar + Export row */}
                <Flex
                  w="100%"
                  align="center"
                  justify="space-between"
                  borderRadius="12px"
                  bg="ui.Chart.toolbarBg"
                  boxShadow="ui.chartToolbarCard"
                  px="16px"
                  py="0"
                  gap="16px"
                >
                  <Box flex="1" minW={0}>
                    <DatePickerActions
                      timeRange={logic.timeRange}
                      currentDate={logic.currentDate}
                      isToday={logic.isToday}
                      onDateChange={logic.handleDateChange}
                      onNavigate={logic.handleDateArrow}
                    />
                  </Box>
                  <Flex align="center" gap="16px" flexShrink={0}>
                    {/* Opt-in brush on 1D; other ranges keep control visible but disabled */}
                    <Flex align="center" gap="8px">
                      <Text
                        fontSize="11px"
                        fontWeight={500}
                        letterSpacing="0.02em"
                        color={isDayView ? "text.normal" : "ui.Chart.mutedText"}
                        lineHeight="1"
                        whiteSpace="nowrap"
                        opacity={isDayView ? 1 : 0.45}
                      >
                        {t("toolbar.zoom")}
                      </Text>
                      <OrangeToggleSwitch
                        size="md"
                        checked={mobileChartBrushEnabled}
                        disabled={!isDayView}
                        onCheckedChange={setMobileChartBrushEnabled}
                      />
                    </Flex>

                    <ChartExportMenu
                      chartRef={chartRef}
                      tenantId={props.tenantId || ""}
                      dataIds={props.energyDataIds}
                      startDate={logic.startDate}
                      endDate={logic.endDate}
                      fileName={`energy-trend-chart-${logic.timeRange}-${toLocalDateString(logic.currentDate)}`}
                      compact={true}
                    />
                  </Flex>
                </Flex>
              </Flex>
            )}

            <Box
              ref={chartRef}
              bg="ui.NavbarComponent.background"
              boxShadow="none"
              rounded="lg"
              p={0}
              borderWidth="1px"
              borderColor="ui.Chart.cardFrameBorder"
              w="100%"
              h={{
                base: "auto",
                md: isExpanded ? "auto" : MD_CHART_FIXED_HEIGHT_REM,
              }}
              overflow="visible"
              display="flex"
              flexDirection="column"
            >
              <ChartControls
                chartRef={chartRef}
                tenantId={props.tenantId}
                energyDataIds={props.energyDataIds}
                hasEss={props.plantConfig.hasEss}
                timeRange={logic.timeRange}
                stationName={props.stationName}
                currentDate={logic.currentDate}
                isToday={logic.isToday}
                useCurrentPeriod={logic.useCurrentPeriod}
                isSocCombined={logic.isSocCombined}
                startDate={logic.startDate}
                endDate={logic.endDate}
                isExpanded={isExpanded}
                onToggleExpanded={() => setIsExpanded((v) => !v)}
                onTimeRangeChange={logic.handleTimeRangeChange}
                onDateChange={logic.handleDateChange}
                onDateNavigate={logic.handleDateArrow}
                onUseCurrentPeriodChange={logic.setUseCurrentPeriod}
                onSocCombinedChange={logic.setIsSocCombined}
              />
              <Box
                flex="1"
                w="100%"
                h={{ base: "auto", md: isExpanded ? "auto" : "0" }}
                mt={{ base: "16px", md: "24px" }}
                minH={0}
              >
                {!logic.isLoading &&
                  !logic.error &&
                  logic.transformedEnergyData &&
                  (isExpanded ? (
                    <ExpandedTrendGrid
                      transformedEnergy={logic.transformedEnergyData}
                      transformedSoc={logic.transformedSocData}
                      timeRange={logic.timeRange}
                      startDate={logic.startDate}
                      endDate={logic.endDate}
                      aggregateBy={logic.aggregateBy}
                      hourlyTicks={logic.hourlyTicks}
                      weekTicks={logic.weekTicks}
                      dynamicXAxisPadding={dimensions.dynamicXAxisPadding}
                      chartSpacing={dimensions.chartSpacing}
                      tooltipFontSize={dimensions.tooltipFontSize}
                      tooltipPadding={dimensions.tooltipPadding}
                      seriesMetaForSort={logic.seriesMetaForSort}
                      hasEss={props.plantConfig.hasEss}
                      zoomDomain={zoomDomain}
                      setZoomDomain={setZoomDomain}
                      allowChartBrushZoom={allowChartBrushZoom}
                    />
                  ) : isDayView ? (
                    <Box position="relative" w="100%" h="100%" minH={0}>
                      {zoomDomain && (
                        <Box
                          position="absolute"
                          top="-26px"
                          left="10px"
                          zIndex={3}
                          display={{ base: "none", md: "block" }}
                        >
                          <Button
                            size="xs"
                            variant="ghost"
                            onClick={() => setZoomDomain(null)}
                          >
                            {t("toolbar.resetZoom")}
                          </Button>
                        </Box>
                      )}
                      <AreaTrendChart
                        isSocCombined={logic.isSocCombined}
                        transformedEnergy={logic.transformedEnergyData}
                        transformedSoc={logic.transformedSocData}
                        transformedCombined={logic.transformedCombinedData}
                        startDate={logic.startDate}
                        endDate={logic.endDate}
                        aggregateBy={logic.aggregateBy}
                        hourlyTicks={logic.hourlyTicks}
                        chartMargins={dimensions.chartMargins}
                        xAxisHeight={dimensions.xAxisHeight}
                        yAxisWidth={dimensions.yAxisWidth}
                        yAxisLabelOffset={dimensions.yAxisLabelOffset}
                        tooltipFontSize={dimensions.tooltipFontSize}
                        tooltipPadding={dimensions.tooltipPadding}
                        chartLeftMarginPx={areaChartLeftMarginPx}
                        energyChartHeight={
                          logic.isSocCombined
                            ? dimensions.energyChartHeight
                            : "100%"
                        }
                        activeSeries={logic.activeSeries}
                        onLegendClick={logic.handleLegendClick}
                        seriesMetaForSort={logic.seriesMetaForSort}
                        timeRange={logic.timeRange}
                        zoomDomain={zoomDomain}
                        setZoomDomain={setZoomDomain}
                        isMobile={isMobileLayout}
                        allowChartBrushZoom={allowChartBrushZoom}
                      />
                    </Box>
                  ) : (
                    <Box w="100%" h={{ base: "auto", md: "100%" }} minH={0}>
                      <BarTrendChart
                        data={logic.transformedEnergyData}
                        timeRange={logic.timeRange}
                        startDate={logic.startDate}
                        endDate={logic.endDate}
                        weekTicks={logic.weekTicks}
                        {...({ focusYear: logic.currentDate.getFullYear() } as any)}
                        barChartMargins={dimensions.barChartMargins}
                        chartSpacing={dimensions.chartSpacing}
                        xAxisHeight={dimensions.xAxisHeight}
                        yAxisWidth={dimensions.yAxisWidth}
                        tooltipFontSize={dimensions.tooltipFontSize}
                        tooltipPadding={dimensions.tooltipPadding}
                        dynamicXAxisPadding={dimensions.dynamicXAxisPadding}
                        formatXAxisTick={
                          isMobileLayout
                            ? formatXAxisTickMobile
                            : formatXAxisTick
                        }
                        activeSeries={logic.activeSeries}
                        onLegendClick={logic.handleLegendClick}
                        seriesMetaForSort={logic.seriesMetaForSort}
                        isMobile={isMobileLayout}
                      />
                    </Box>
                  ))}
                {logic.isLoading && (
                  <Flex justify="center" align="center" h="100%" minH="200px">
                    <Spinner size="xl" color="ui.Interactive.accent" />
                  </Flex>
                )}
              </Box>
            </Box>
          </Box>

          <Flex
            direction="column"
            order={{ base: 1, md: 2 }}
            mb={0}
            flex={{ base: "none", md: 1 }}
            minW={0}
            w={{ base: "100%", md: "auto" }}
            gap={{ base: "1rem", md: "1.5rem" }}
            h={{
              base: "auto",
              md: isExpanded ? "auto" : MD_CHART_FIXED_HEIGHT_REM,
            }}
            minH={0}
          >
            <Box flexShrink={0} w="100%">
              <InteractiveEnergyFlow
                plantConfig={props.plantConfig}
                historicalData={logic.realtimeTodayData}
                isLoading={logic.isLoading}
              />
            </Box>
            <Box
              flex={1}
              w="100%"
              minH={0}
              minW={0}
              display="flex"
              flexDirection="column"
              overflow="hidden"
            >
              <StatusCardsGrid
                plantConfig={props.plantConfig}
                energyDataIds={props.energyDataIds}
                historicalData={logic.realtimeTodayData}
                tenantId={props.tenantId}
                localDayKey={logic.localDayKey}
              />
            </Box>
          </Flex>
        </Flex>
      </GridItem>

      {isSplitBatteryCard && props.plantConfig.hasEss && (
        <Box
          gridColumn="1 / -1"
          w="100%"
          px={{ base: "16px", md: "24px" }}
          boxSizing="border-box"
          mt={{ base: "16px", md: "24px" }}
          mb={{ base: "16px", md: "24px" }}
        >
          <Box w="100%" h={{ base: "auto", md: "297px" }} minH={0}>
            <BatteryStatusCard
              key={socSplitBatteryLayoutKey}
              title={t("battery.title")}
              transformedSoc={logic.transformedSocData}
              startDate={logic.startDate}
              endDate={logic.endDate}
              aggregateBy={logic.aggregateBy}
              hourlyTicks={logic.hourlyTicks}
              chartMargins={dimensions.chartMargins}
              xAxisHeight={dimensions.xAxisHeight}
              yAxisWidth={dimensions.yAxisWidth}
              yAxisLabelOffset={dimensions.yAxisLabelOffset}
              tooltipFontSize={dimensions.tooltipFontSize}
              tooltipPadding={dimensions.tooltipPadding}
              activeSeries={logic.activeSeries}
              onLegendClick={logic.handleLegendClick}
              seriesMetaForSort={logic.seriesMetaForSort}
              isLoading={logic.isLoading}
              errorMessage={logic.error?.message ?? null}
              isMobile={isMobileLayout}
            />
          </Box>
        </Box>
      )}
    </>
  )
}

export default EnergyTrendChart
