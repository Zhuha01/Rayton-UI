/**
 * Grid-based realtime energy schematic mapping telemetry to colored interactive blocks.
 * Resolves semantic palette entries once and renders connector lines referencing the same hues.
 */

import { Box, Flex, Grid, useToken } from "@chakra-ui/react"
import { type ReactElement, useMemo, useRef } from "react"
import { useTranslation } from "react-i18next"
import type { HistoricalDataGroupedResponse, TimeSeriesData } from "@/client"
import {
  parseTelemetryValue,
  resolveInteractiveTelemetrySeriesKey,
  TELEMETRY_ACTIVE_EPSILON,
} from "@/components_2/Pages/dashboard/chartUtils"
import type { PlantUIConfig } from "@/components_2/Pages/dashboard/dashboardTypes"
import { EnergyFlowLines } from "./EnergyFlowLines"
import { InteractiveBlock } from "./InteractiveBlock"
import { BatteryIcon } from "./icons/BatteryIcon"
import { EnterpriseIcon } from "./icons/EnterpriseIcon"
import { GeneratorIcon } from "./icons/GeneratorIcon"
import { NetworkIcon } from "./icons/NetworkIcon"
import { SesIcon } from "./icons/SesIcon"

function smartFormat(value: number): string {
  return String(Math.round(value * 10) / 10)
}

function resolveBlock(value: number) {
  const isActive = Math.abs(value) >= TELEMETRY_ACTIVE_EPSILON
  return { value: smartFormat(value), isActive }
}

function lastFiniteY(series: TimeSeriesData): number {
  for (let i = series.data.length - 1; i >= 0; i -= 1) {
    const y = series.data[i]?.y
    if (typeof y === "number" && Number.isFinite(y)) return y
  }
  return 0
}

export interface InteractiveEnergyFlowProps {
  plantConfig: PlantUIConfig
  historicalData: HistoricalDataGroupedResponse | undefined
  isLoading?: boolean
}

export function InteractiveEnergyFlow({
  plantConfig,
  historicalData,
  isLoading = false,
}: InteractiveEnergyFlowProps): ReactElement {
  const { t } = useTranslation("Interactive")
  const { hasEss, hasGenerator } = plantConfig
  const hasLeftColumn = hasEss || hasGenerator

  // Single source of truth: resolve trends + inactive tokens once.
  const [sesC, gridC, essC, genC, facC, inactiveC] = useToken("colors", [
    "trends.SOLAR_GENERATION",
    "trends.GRID_1",
    "trends.ESS_POWER",
    "trends.GENERATOR_POWER",
    "trends.PLANT_CONSUMPTION",
    "border.normal",
  ])

  const containerRef = useRef<HTMLDivElement>(null)
  const sesRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const factoryRef = useRef<HTMLDivElement>(null)
  const batteryRef = useRef<HTMLDivElement>(null)
  const generatorRef = useRef<HTMLDivElement>(null)

  const values = useMemo(() => {
    const acc = {
      ses: 0,
      grid: 0,
      battery: 0,
      factory: 0,
      generator: 0,
      soc: 0,
    }

    for (const series of historicalData?.series ?? []) {
      const key = resolveInteractiveTelemetrySeriesKey(
        { name: series.name, data_id: series.data_id },
        plantConfig,
      )
      if (!key) continue

      const value = parseTelemetryValue(lastFiniteY(series))
      if (key === "SOLAR_GENERATION") {
        acc.ses += value
      } else if (
        key === "GRID_1" ||
        key === "GRID_2" ||
        key === "GRID_3" ||
        key === "GRID_4"
      ) {
        acc.grid += value
      } else if (key === "ESS_POWER") {
        acc.battery += value
      } else if (key === "ESS_SOC") {
        acc.soc = value
      } else if (key === "PLANT_CONSUMPTION") {
        acc.factory += value
      } else if (key === "GENERATOR_POWER") {
        acc.generator += value
      }
    }
    return acc
  }, [historicalData, plantConfig])

  const sesBlock = useMemo(() => resolveBlock(values.ses), [values.ses])
  const batteryBlock = useMemo(
    () => resolveBlock(values.battery),
    [values.battery],
  )
  const generatorBlock = useMemo(
    () => resolveBlock(values.generator),
    [values.generator],
  )
  const gridBlock = useMemo(() => resolveBlock(values.grid), [values.grid])
  const factoryBlock = useMemo(
    () => resolveBlock(values.factory),
    [values.factory],
  )

  const isBatteryCharging = values.battery < 0

  const mainGap = hasEss && hasGenerator ? 0 : "1rem"

  return (
    <Box
      ref={containerRef}
      borderWidth="1px"
      borderColor="ui.Chart.cardFrameBorder"
      bg="ui.NavbarComponent.background"
      rounded="0.5rem"
      minW="310px"
      w="100%"
      h="auto"
      p="1rem"
      position="relative"
      overflow="visible"
    >
      <EnergyFlowLines
        containerRef={containerRef}
        sesRef={sesRef}
        gridRef={gridRef}
        factoryRef={factoryRef}
        batteryRef={hasEss ? batteryRef : undefined}
        generatorRef={hasGenerator ? generatorRef : undefined}
        values={values}
        plantConfig={plantConfig}
        dataReadyKey={isLoading ? "loading" : `ready:${historicalData?.series?.length ?? 0}`}
      />
      <Grid
        templateColumns={hasLeftColumn ? "90px 1fr 90px" : "90px 90px"}
        templateRows="auto auto auto"
        rowGap={mainGap}
        columnGap={hasLeftColumn ? "0" : "4rem"}
        w="100%"
        justifyContent="center"
        alignItems="center"
      >
        <Box
          ref={sesRef}
          gridColumn={hasLeftColumn ? "2" : "1"}
          gridRow="1"
          justifySelf="center"
          position="relative"
          w="90px"
          h="90px"
          flexShrink={0}
        >
          <InteractiveBlock
            icon={SesIcon}
            title={t("blocks.ses")}
            value={sesBlock.value}
            unit={t("units.kw")}
            accentColor={sesBlock.isActive ? sesC : inactiveC}
            isActive={sesBlock.isActive}
          />
        </Box>

        {hasLeftColumn && (
          <Flex
            gridColumn="1"
            gridRow="2"
            direction="column"
            align="center"
            gap="1rem"
            justifySelf="center"
          >
            {hasEss && (
              <Box
                ref={batteryRef}
                position="relative"
                w="90px"
                h="90px"
                flexShrink={0}
              >
                <InteractiveBlock
                  icon={BatteryIcon}
                  title={t("blocks.ess")}
                  value={batteryBlock.value}
                  unit={t("units.kw")}
                  accentColor={batteryBlock.isActive ? essC : inactiveC}
                  isActive={batteryBlock.isActive}
                  soc={values.soc}
                  isCharging={isBatteryCharging}
                  iconBoxSize="1.75rem"
                />
              </Box>
            )}
            {hasGenerator && (
              <Box
                ref={generatorRef}
                position="relative"
                w="90px"
                h="90px"
                flexShrink={0}
              >
                <InteractiveBlock
                  icon={GeneratorIcon}
                  title={t("blocks.generator")}
                  value={generatorBlock.value}
                  unit={t("units.kw")}
                  accentColor={generatorBlock.isActive ? genC : inactiveC}
                  isActive={generatorBlock.isActive}
                />
              </Box>
            )}
          </Flex>
        )}

        <Box
          ref={gridRef}
          gridColumn={hasLeftColumn ? "3" : "2"}
          gridRow="2"
          justifySelf="center"
          position="relative"
          w="90px"
          h="90px"
          flexShrink={0}
        >
          <InteractiveBlock
            icon={NetworkIcon}
            title={t("blocks.grid")}
            value={gridBlock.value}
            unit={t("units.kw")}
            accentColor={gridBlock.isActive ? gridC : inactiveC}
            isActive={gridBlock.isActive}
          />
        </Box>

        <Box
          ref={factoryRef}
          gridColumn={hasLeftColumn ? "2" : "1"}
          gridRow="3"
          justifySelf="center"
          position="relative"
          w="90px"
          h="90px"
          flexShrink={0}
        >
          <InteractiveBlock
            icon={EnterpriseIcon}
            title={t("blocks.factory")}
            value={factoryBlock.value}
            unit={t("units.kw")}
            accentColor={factoryBlock.isActive ? facC : inactiveC}
            isActive={factoryBlock.isActive}
          />
        </Box>
      </Grid>
    </Box>
  )
}

export default InteractiveEnergyFlow
