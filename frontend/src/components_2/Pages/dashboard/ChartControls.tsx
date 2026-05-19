/**
 * Dashboard chart toolbar assembling range pickers, date navigation, SOC toggles, and export menu.
 * Splits responsive layouts so mobile retains a condensed header strip while wider screens stack control rows.
 */

import { Box, Flex, HStack, Text } from "@chakra-ui/react"
import type { RefObject } from "react"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { ChartExpansionButton } from "@/components_2/ui/ChartExpansionButton"
import ChartExportMenu from "@/components_2/ui/ChartExportMenu"
import { OrangeToggleSwitch } from "@/components_2/ui/OrangeToggleSwitch"
import { SocCombinedSwitch } from "@/components_2/ui/SocCombinedSwitch"
import { StationNameBadge } from "@/components_2/ui/StationNameBadge"
import {
  type TimeRange,
  TimeRangePicker,
} from "@/components_2/ui/TimeRangePicker"
import { toLocalDateString } from "./chartUtils"
import { DatePickerActions } from "./DatePickerActions"

export interface ChartControlsProps {
  chartRef: RefObject<HTMLDivElement | null>
  tenantId: string | null
  energyDataIds: number[]
  hasEss: boolean
  timeRange: TimeRange
  stationName: string
  currentDate: Date
  isToday: boolean
  useCurrentPeriod: boolean
  isSocCombined: boolean
  startDate: Date
  endDate: Date
  isExpanded: boolean
  onToggleExpanded: () => void
  onTimeRangeChange: (range: TimeRange) => void
  onDateChange: (dateString: string) => void
  onDateNavigate: (direction: "prev" | "next") => void
  onUseCurrentPeriodChange: (checked: boolean) => void
  onSocCombinedChange: (checked: boolean) => void
}

export function ChartControls(props: ChartControlsProps) {
  const { t } = useTranslation("Dashboard")
  const {
    chartRef,
    tenantId,
    energyDataIds,
    hasEss,
    timeRange,
    stationName,
    currentDate,
    isToday,
    useCurrentPeriod,
    isSocCombined,
    startDate,
    endDate,
    isExpanded,
    onToggleExpanded,
    onTimeRangeChange,
    onDateChange,
    onDateNavigate,
    onUseCurrentPeriodChange,
    onSocCombinedChange,
  } = props

  const rangeHintText = useMemo(() => {
    if (timeRange !== "1W" && timeRange !== "1M" && timeRange !== "1Y")
      return ""
    return t(
      `rangeHint.${timeRange}.${useCurrentPeriod ? "current" : "last"}`,
      {
        defaultValue: "",
      },
    )
  }, [t, timeRange, useCurrentPeriod])

  return (
    <Box
      w="100%"
      pt={{ base: "12px", md: "24px" }}
      pb={{ base: "0px", md: "24px" }}
    >
      <Flex direction="column">
        <Flex
          display={{ base: "flex", md: "none" }}
          w="100%"
          align="center"
          justify="space-between"
          px="12px"
          pb="12px"
          borderBottom="1px solid"
          borderColor="ui.Chart.divider"
          gap="10px"
        >
          <Box flexShrink={0}>
            <StationNameBadge name={stationName} />
          </Box>

          <Box flex="1" display="flex" justifyContent="center">
            <ChartExpansionButton
              isExpanded={isExpanded}
              isDisabled={timeRange !== "1D"}
              onClick={onToggleExpanded}
              showLabel={false}
            />
          </Box>

          <Box flexShrink={0}>
            <SocCombinedSwitch
              label="SOC"
              variant="compact"
              isChecked={
                !isExpanded && timeRange === "1D" && hasEss
                  ? isSocCombined
                  : false
              }
              isDisabled={isExpanded || timeRange !== "1D" || !hasEss}
              onChange={onSocCombinedChange}
            />
          </Box>
        </Flex>

        <Box display={{ base: "none", md: "block" }}>
          <Flex
            w="100%"
            align="center"
            justify="space-between"
            flexWrap="wrap"
            gap="16px"
            px="24px"
            pb="24px"
            borderBottom="1px solid"
            borderColor="ui.Chart.divider"
          >
            <StationNameBadge name={stationName} />
            <ChartExpansionButton
              isExpanded={isExpanded}
              isDisabled={timeRange !== "1D"}
              onClick={onToggleExpanded}
            />
            <Box minW="200px" display="flex" justifyContent="flex-end">
              <SocCombinedSwitch
                isChecked={
                  !isExpanded && timeRange === "1D" && hasEss
                    ? isSocCombined
                    : false
                }
                isDisabled={isExpanded || timeRange !== "1D" || !hasEss}
                onChange={onSocCombinedChange}
              />
            </Box>
          </Flex>

          <Box px="24px" mt="24px">
            <Flex
              w="100%"
              minH="60px"
              align="center"
              justify="center"
              flexWrap="wrap"
              border="1px solid"
              borderColor="ui.Chart.toolbarBorder"
              borderRadius="12px"
              bg="ui.Chart.toolbarBg"
              px="12px"
              py="8px"
              gap="16px"
            >
              <Box minW="fit-content">
                <TimeRangePicker
                  value={timeRange}
                  onChange={onTimeRangeChange}
                />
              </Box>

              <Box
                flex="1 1 auto"
                minW="fit-content"
                display="flex"
                justifyContent="center"
              >
                <DatePickerActions
                  timeRange={timeRange}
                  currentDate={currentDate}
                  isToday={isToday}
                  onDateChange={onDateChange}
                  onNavigate={onDateNavigate}
                />
              </Box>

              <Box minW="fit-content">
                <ChartExportMenu
                  chartRef={chartRef}
                  tenantId={tenantId || ""}
                  dataIds={energyDataIds}
                  startDate={startDate}
                  endDate={endDate}
                  fileName={`energy-trend-chart-${timeRange}-${toLocalDateString(currentDate)}`}
                />
              </Box>
            </Flex>
          </Box>
        </Box>

        {timeRange !== "1D" && timeRange !== "All" && (
          <Flex px="24px" justify="flex-start" mt="16px">
            <HStack gap={3}>
              <Text
                fontSize="xs"
                fontWeight="medium"
                color="ui.Chart.mutedText"
              >
                {rangeHintText}
              </Text>
              <OrangeToggleSwitch
                size="sm"
                checked={useCurrentPeriod}
                onCheckedChange={onUseCurrentPeriodChange}
              />
            </HStack>
          </Flex>
        )}
      </Flex>
    </Box>
  )
}
