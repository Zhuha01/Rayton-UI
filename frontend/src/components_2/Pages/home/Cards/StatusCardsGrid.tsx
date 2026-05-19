/**
 * Maps realtime and day-aggregated telemetry into the home dashboard KPI card grid.
 * Resolves semantic coloring, optional ESS/generator rows, and caps desktop height for layout stability.
 */

import { Box, Grid, useToken } from "@chakra-ui/react"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import type { HistoricalDataGroupedResponse, TimeSeriesData } from "@/client"
import {
  DASHBOARD_REALTIME_REFETCH_MS,
  DASHBOARD_REALTIME_STALE_MS,
  isInteractiveGridKey,
  parseTelemetryValue,
  resolveInteractiveTelemetrySeriesKey,
  TELEMETRY_ACTIVE_EPSILON,
} from "@/components_2/Pages/dashboard/chartUtils"
import type { PlantUIConfig } from "@/components_2/Pages/dashboard/dashboardTypes"
import useHistoricalData from "@/hooks/useHistoricalData"
import { BatteryIcon } from "../interactive/icons/BatteryIcon"
import { EnterpriseIcon } from "../interactive/icons/EnterpriseIcon"
import { GeneratorIcon } from "../interactive/icons/GeneratorIcon"
import { NetworkIcon } from "../interactive/icons/NetworkIcon"
import { SesIcon } from "../interactive/icons/SesIcon"
import type { StatusCardDensity } from "./StatusCard"
import { StatusCard } from "./StatusCard"

/** Returns the latest parsed numeric sample for a telemetry series. */
function lastPointTelemetryY(series: TimeSeriesData): number {
  for (let i = series.data.length - 1; i >= 0; i -= 1) {
    const y = series.data[i]?.y
    if (y == null) continue
    return parseTelemetryValue(y)
  }
  return 0
}

function formatNumber(value: number): string {
  return String(Math.round(value * 10) / 10)
}

function formatSoc(value: number): string {
  const clamped = Math.min(100, Math.max(0, value))
  return String(Math.round(clamped))
}

export type StatusCardsGridProps = {
  plantConfig: PlantUIConfig
  energyDataIds: number[]
  historicalData: HistoricalDataGroupedResponse | undefined
  tenantId: string | null
  localDayKey: string
}

export function StatusCardsGrid({
  plantConfig,
  energyDataIds,
  historicalData,
  tenantId,
  localDayKey,
}: StatusCardsGridProps) {
  const { t } = useTranslation("Interactive")
  const { hasEss, hasGenerator } = plantConfig

  const { data: dailyEnergyResponse } = useHistoricalData(
    {
      tenantId,
      data_ids: energyDataIds,
      aggregate_by: "day",
      realtimeLocalDayKey: localDayKey,
    },
    {
      enabled: !!tenantId && energyDataIds.length > 0,
      staleTime: DASHBOARD_REALTIME_STALE_MS,
      refetchInterval: DASHBOARD_REALTIME_REFETCH_MS,
      gcTime: DASHBOARD_REALTIME_STALE_MS * 2,
      refetchOnWindowFocus: false,
    },
  )

  const dailyEnergyMap = useMemo(() => {
    const map = new Map<number, number>()
    for (const series of dailyEnergyResponse?.series ?? []) {
      map.set(series.data_id, lastPointTelemetryY(series))
    }
    return map
  }, [dailyEnergyResponse])

  const [sesC, grid1C, grid2C, grid3C, grid4C, essC, genC, facC, inactiveC] =
    useToken("colors", [
      "trends.SOLAR_GENERATION",
      "trends.GRID_1",
      "trends.GRID_2",
      "trends.GRID_3",
      "trends.GRID_4",
      "trends.ESS_POWER",
      "trends.GENERATOR_POWER",
      "trends.PLANT_CONSUMPTION",
      "border.normal",
    ])

  const seriesByDataId = useMemo(() => {
    const map = new Map<
      number,
      {
        currentKw: number
        key: ReturnType<typeof resolveInteractiveTelemetrySeriesKey>
      }
    >()
    for (const series of historicalData?.series ?? []) {
      const key = resolveInteractiveTelemetrySeriesKey(
        { name: series.name, data_id: series.data_id },
        plantConfig,
      )
      if (!key) continue
      map.set(series.data_id, {
        currentKw: lastPointTelemetryY(series),
        key,
      })
    }
    return map
  }, [historicalData, plantConfig])

  const solarDataId = useMemo(() => {
    for (const s of historicalData?.series ?? []) {
      if (
        resolveInteractiveTelemetrySeriesKey(
          { name: s.name, data_id: s.data_id },
          plantConfig,
        ) === "SOLAR_GENERATION"
      ) {
        return s.data_id
      }
    }
    return undefined
  }, [historicalData, plantConfig])

  const plantDataId = useMemo(() => {
    for (const s of historicalData?.series ?? []) {
      if (
        resolveInteractiveTelemetrySeriesKey(
          { name: s.name, data_id: s.data_id },
          plantConfig,
        ) === "PLANT_CONSUMPTION"
      ) {
        return s.data_id
      }
    }
    return undefined
  }, [historicalData, plantConfig])

  const totals = useMemo(() => {
    let ses = 0,
      battery = 0,
      soc = 0,
      generator = 0,
      factory = 0
    for (const accum of seriesByDataId.values()) {
      const kw = accum.currentKw ?? 0
      if (accum.key === "SOLAR_GENERATION") ses += kw
      else if (accum.key === "ESS_POWER") battery += kw
      else if (accum.key === "ESS_SOC") soc = kw
      else if (accum.key === "GENERATOR_POWER") generator += kw
      else if (accum.key === "PLANT_CONSUMPTION") factory += kw
    }
    return { ses, battery, soc, generator, factory }
  }, [seriesByDataId])

  const gridCards = useMemo(() => {
    const allowed = new Set(energyDataIds)
    const result = []
    for (const series of historicalData?.series ?? []) {
      if (!allowed.has(series.data_id)) continue
      const key = resolveInteractiveTelemetrySeriesKey(
        { name: series.name, data_id: series.data_id },
        plantConfig,
      )
      if (isInteractiveGridKey(key)) {
        const accum = seriesByDataId.get(series.data_id)
        result.push({
          dataId: series.data_id,
          semanticKey: key,
          currentKw: accum?.currentKw ?? 0,
          dailyKwh: dailyEnergyMap.get(series.data_id) ?? 0,
        })
      }
    }
    return result.sort((a, b) => a.dataId - b.dataId)
  }, [
    historicalData,
    plantConfig,
    energyDataIds,
    seriesByDataId,
    dailyEnergyMap,
  ])

  const sesDailyKwh =
    solarDataId != null ? (dailyEnergyMap.get(solarDataId) ?? 0) : 0
  const _plantDailyKwh =
    plantDataId != null ? (dailyEnergyMap.get(plantDataId) ?? 0) : 0

  const totalCardCount =
    1 + gridCards.length + (hasEss ? 1 : 0) + (hasGenerator ? 1 : 0) + 1
  const rowCount = totalCardCount <= 6 ? 3 : 4
  const currentDensity: StatusCardDensity =
    totalCardCount <= 6 ? "compact" : "slim"
  const gapRem = currentDensity === "compact" ? 0.75 : 0.5

  const gridMdTemplateRows = useMemo(
    () => `repeat(${rowCount}, 1fr)`,
    [rowCount],
  )

  const gridGap = useMemo(() => `${gapRem}rem`, [gapRem])

  const gridAccent = (k: string) => {
    if (k === "GRID_1") return grid1C
    if (k === "GRID_2") return grid2C
    if (k === "GRID_3") return grid3C
    return grid4C
  }

  return (
    <Box flex={1} w="100%" display="flex" flexDirection="column" minH={0}>
      <Grid
        flex={1}
        w="100%"
        templateColumns="repeat(2, 1fr)"
        templateRows={{ base: "auto", md: gridMdTemplateRows }}
        alignContent={{ base: "start", md: "stretch" }}
        gap={gridGap}
        minH={0}
        pb={{ base: "8px", md: "0" }}
        maxH="25rem"
      >
        <StatusCard
          density={currentDensity}
          icon={SesIcon}
          title={t("cards.title.ses")}
          value={formatNumber(totals.ses)}
          unit={t("units.kw")}
          status={
            Math.abs(totals.ses) >= TELEMETRY_ACTIVE_EPSILON
              ? "active"
              : "inactive"
          }
          footerLabel={t("cards.footer.produced")}
          footerValue={sesDailyKwh.toString()}
          footerUnit={t("units.kwh")}
          accentColor={
            Math.abs(totals.ses) >= TELEMETRY_ACTIVE_EPSILON ? sesC : inactiveC
          }
        />

        {gridCards.map((card, idx) => {
          const isActive = Math.abs(card.currentKw) >= TELEMETRY_ACTIVE_EPSILON
          return (
            <StatusCard
              key={card.dataId}
              density={currentDensity}
              icon={NetworkIcon}
              title={t("cards.gridTitle", { n: idx + 1 })}
              value={formatNumber(card.currentKw)}
              unit={t("units.kw")}
              status={isActive ? "active" : "inactive"}
              footerLabel={t("cards.footer.consumed")}
              footerValue={card.dailyKwh.toString()}
              footerUnit={t("units.kwh")}
              accentColor={isActive ? gridAccent(card.semanticKey) : inactiveC}
            />
          )
        })}

        {hasEss && (
          <StatusCard
            density={currentDensity}
            icon={BatteryIcon}
            title={t("cards.title.ess")}
            value={formatSoc(totals.soc)}
            unit={t("units.percent")}
            status={
              totals.battery < -TELEMETRY_ACTIVE_EPSILON
                ? "charging"
                : totals.battery > TELEMETRY_ACTIVE_EPSILON
                  ? "discharging"
                  : "idle"
            }
            footerLabel={t("cards.footer.power")}
            footerValue={totals.battery.toString()}
            footerUnit={t("units.kw")}
            accentColor={
              Math.abs(totals.battery) >= TELEMETRY_ACTIVE_EPSILON
                ? essC
                : inactiveC
            }
            soc={totals.soc}
            isCharging={totals.battery < -TELEMETRY_ACTIVE_EPSILON}
          />
        )}

        {hasGenerator && (
          <StatusCard
            density={currentDensity}
            icon={GeneratorIcon}
            title={t("cards.title.generator")}
            value={formatNumber(totals.generator)}
            unit={t("units.kw")}
            status={
              Math.abs(totals.generator) >= TELEMETRY_ACTIVE_EPSILON
                ? "active"
                : "inactive"
            }
            footerLabel={t("cards.footer.power")}
            footerValue={totals.generator.toString()}
            footerUnit={t("units.kw")}
            accentColor={
              Math.abs(totals.generator) >= TELEMETRY_ACTIVE_EPSILON
                ? genC
                : inactiveC
            }
          />
        )}

        <StatusCard
          density={currentDensity}
          icon={EnterpriseIcon}
          title={t("cards.title.factory")}
          value={formatNumber(totals.factory)}
          unit={t("units.kw")}
          status={
            Math.abs(totals.factory) >= TELEMETRY_ACTIVE_EPSILON
              ? "active"
              : "inactive"
          }
          accentColor={
            Math.abs(totals.factory) >= TELEMETRY_ACTIVE_EPSILON
              ? facC
              : inactiveC
          }
          hideFooter={true}
          footerLabel=""
          footerValue=""
          footerUnit=""
        />
      </Grid>
    </Box>
  )
}

export default StatusCardsGrid
