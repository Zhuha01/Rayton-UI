/**
 * Plc Status Indicators Card within the Rayton operator UI (components_2/Pages/control/PlcStatusIndicatorsCard.tsx).
 * Built with Chakra UI and shared theme tokens to stay consistent with dashboards, management, and control surfaces.
 * Primary contract: exported component props and functions below (see TypeScript types for required fields).
 */
import { Box, Circle, Flex, SimpleGrid, Text, useMediaQuery } from "@chakra-ui/react"
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import {
  PlcIndicatorsFilter,
  type PlcIndicatorFilterValue,
} from "@/components_2/ui/PlcIndicatorsFilter"
import { plcControlUi } from "./controlUi"
import type { PlcControlRow } from "./PLCControlView"

/** Maps PLC indicator `data` values to row semantics (see Figma 220:6667 / 220:6663). */
type IndicatorValue = -1 | 0 | 1 | 2

const INDICATOR_ROW: Record<
  IndicatorValue,
  { accent: string; tint: string; ledShadow: string }
> = {
  [-1]: {
    accent: "ui.PlcControl.diagnosticAccentRed",
    tint: "ui.PlcControl.diagnosticRowTintRed",
    ledShadow: "ui.diagnosticLedRed",
  },
  0: {
    accent: "ui.PlcControl.diagnosticAccentNeutral",
    tint: "ui.PlcControl.diagnosticRowTintNeutral",
    ledShadow: "ui.diagnosticLedNeutral",
  },
  1: {
    accent: "ui.PlcControl.diagnosticAccentGreen",
    tint: "ui.PlcControl.diagnosticRowTintGreen",
    ledShadow: "ui.diagnosticLedGreen",
  },
  2: {
    accent: "ui.PlcControl.diagnosticAccentOrange",
    tint: "ui.PlcControl.diagnosticRowTintOrange",
    ledShadow: "ui.diagnosticLedOrange",
  },
}

function normalizeIndicatorValue(data: number | null | undefined): IndicatorValue {
  if (data === null || data === undefined || Number.isNaN(Number(data))) return -1
  const n = Math.round(Number(data))
  if (n === 0) return 0
  if (n === 1) return 1
  if (n === 2) return 2
  return -1
}

function matchesIndicatorFilter(
  row: PlcControlRow,
  filter: PlcIndicatorFilterValue,
): boolean {
  const v = normalizeIndicatorValue(row.data)
  if (filter === "all") return true
  if (filter === "active") return v === 1
  if (filter === "inactive") return v === 0
  return true
}

export function PlcStatusIndicatorsCard({ rows }: { rows: PlcControlRow[] }) {
  const { t } = useTranslation("control")
  const [filter, setFilter] = useState<PlcIndicatorFilterValue>("all")
  const [isDesktop] = useMediaQuery(["(min-width: 48em)"], { ssr: false })

  const namedRows = useMemo(
    () => rows.filter((row) => Boolean(row.data_text?.trim())),
    [rows],
  )

  const filteredRows = useMemo(
    () => namedRows.filter((row) => matchesIndicatorFilter(row, filter)),
    [namedRows, filter],
  )

  if (rows.length === 0) return null

  const filterLabels = {
    all: t("indicators.filterAll"),
    active: t("indicators.filterActive"),
    inactive: t("indicators.filterInactive"),
  }

  const padX = {
    base: plcControlUi.indicatorsCard.paddingMobile,
    md: plcControlUi.indicatorsCard.paddingXSide,
  }
  const padTopHeader = {
    base: plcControlUi.indicatorsCard.paddingMobile,
    md: "24px",
  }
  const headerPb = {
    base: plcControlUi.indicatorsCard.paddingMobile,
    md: "24px",
  }

  const titleTypography = {
    as: "h2" as const,
    fontWeight: "bold" as const,
    fontSize: plcControlUi.managementCard.titleFontSize,
    lineHeight: "normal" as const,
    color: plcControlUi.managementCard.titleColor,
  }

  const headerBorderProps = {
    borderBottomWidth: `${plcControlUi.managementCard.dividerThicknessPx}px`,
    borderBottomColor: plcControlUi.managementCard.dividerColor,
  } as const

  const filterEl = (
    <PlcIndicatorsFilter
      value={filter}
      onChange={setFilter}
      labels={filterLabels}
      selectedSegmentBg="ui.PlcControl.secondaryButtonBg"
      hoverSegmentBg="ui.PlcControl.secondaryButtonHoverBg"
    />
  )

  return (
    <Box
      borderRadius={plcControlUi.statusCard.radius}
      overflow="hidden"
      bg={plcControlUi.managementCard.bg}
      boxShadow={plcControlUi.statusCard.shadow}
    >
      {isDesktop === true ? (
        <Box
          pl={plcControlUi.indicatorsCard.paddingXSide}
          pr={0}
          pt={padTopHeader}
          position="relative"
          pb={headerPb}
          minW={0}
          {...headerBorderProps}
        >
          <Text
            {...titleTypography}
            maxW="calc(100% - 240px)"
            whiteSpace="nowrap"
            lineClamp={1}
          >
            {t("indicators.title")}
          </Text>
          <Flex
            position="absolute"
            top={0}
            bottom={0}
            right={0}
            align="center"
            justify="flex-end"
            pr={plcControlUi.indicatorsCard.paddingXSide}
            pointerEvents="none"
            minW={0}
          >
            <Box pointerEvents="auto" flexShrink={0}>
              {filterEl}
            </Box>
          </Flex>
        </Box>
      ) : (
        <Box
          px={padX}
          pt={padTopHeader}
          pb={headerPb}
          minW={0}
          {...headerBorderProps}
        >
          <Text {...titleTypography} maxW="100%" whiteSpace="normal" lineClamp={2}>
            {t("indicators.title")}
          </Text>
          <Box mt="16px" w="100%">
            {filterEl}
          </Box>
        </Box>
      )}

      <Box px={padX} py={{ base: plcControlUi.indicatorsCard.paddingMobile, md: 4 }}>
        {filteredRows.length === 0 ? (
          <Text color="text.muted" fontSize="sm">
            {t("indicators.emptyFilter")}
          </Text>
        ) : (
          <SimpleGrid columns={{ base: 2, lg: 4 }} gap={{ base: 4, md: 3 }}>
            {filteredRows.map((row) => {
              const name = row.data_text?.trim()
              if (!name) return null
              const valueKey = normalizeIndicatorValue(row.data)
              const sem = INDICATOR_ROW[valueKey]
              return (
                <Box
                  key={row.id}
                  position="relative"
                  borderRadius={plcControlUi.statusCard.radius}
                  overflow="hidden"
                  minW={0}
                  bg="ui.PlcControl.diagnosticRowBg"
                >
                  <Box
                    position="absolute"
                    inset={0}
                    zIndex={0}
                    bg={sem.tint}
                    pointerEvents="none"
                    aria-hidden
                  />
                  <Box
                    position="absolute"
                    left="0"
                    top="0"
                    zIndex={1}
                    h="100%"
                    w={plcControlUi.statusCard.accentBarWidth}
                    bg={sem.accent}
                    borderTopLeftRadius={plcControlUi.statusCard.radius}
                    borderBottomLeftRadius={plcControlUi.statusCard.radius}
                    pointerEvents="none"
                    aria-hidden
                  />
                  <Flex
                    position="relative"
                    zIndex={2}
                    align="center"
                    justify="space-between"
                    gap={{ base: 2, md: 3 }}
                    minH={{ base: "56px", md: "51px" }}
                    px={4}
                    py={{ base: 3, md: 2 }}
                    minW={0}
                  >
                    <Text
                      color="ui.PlcControl.diagnosticRowLabel"
                      fontSize={{ base: "14px", md: "md" }}
                      fontWeight="normal"
                      lineHeight="normal"
                      flex="1"
                      minW={0}
                      lineClamp={2}
                    >
                      {name}
                    </Text>
                    <Circle
                      size="12px"
                      bg={sem.accent}
                      flexShrink={0}
                      boxShadow={sem.ledShadow}
                      aria-hidden
                    />
                  </Flex>
                </Box>
              )
            })}
          </SimpleGrid>
        )}
      </Box>
    </Box>
  )
}
