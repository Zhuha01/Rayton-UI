/**
 * Stateful orchestration hook for tenant trend queries, date presets, SOC modes, and transform pipelines.
 * Exposes memoized datasets and navigation handlers consumed by dashboard chart containers.
 */

import { useCallback, useEffect, useMemo, useState } from "react"
import type { TimeRange } from "@/components_2/ui/TimeRangePicker"
import {
  buildConsistentColorMap,
  buildSortedDashboardDataIds,
  buildTransformedCombinedData,
  buildTransformedEnergyData,
  buildTransformedSocData,
  buildWeekTicks,
  collectSeriesMeta,
  computeChartDateRange,
  DASHBOARD_DAY_ROLL_CHECK_MS,
  DASHBOARD_REALTIME_REFETCH_MS,
  DASHBOARD_REALTIME_STALE_MS,
  getHourlyTicks,
  splitHistoricalGroupedByDataIds,
  toLocalDateString,
  toLocalISOString,
} from "@/components_2/Pages/dashboard/chartUtils"
import type { EnergyTrendChartProps } from "@/components_2/Pages/dashboard/dashboardTypes"
import useHistoricalData from "@/hooks/useHistoricalData"

export function useChartLogic({
  tenantId,
  energyDataIds,
  socDataId,
  plantConfig,
}: EnergyTrendChartProps) {
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [timeRange, setTimeRange] = useState<TimeRange>("1D")
  const [isSocCombined, setIsSocCombined] = useState(false)
  const [useCurrentPeriod, setUseCurrentPeriod] = useState(false)
  const [activeSeries, setActiveSeries] = useState<string[]>([])
  const [localDayKey, setLocalDayKey] = useState(() =>
    toLocalDateString(new Date()),
  )

  const { startDate, endDate, aggregateBy } = useMemo(
    () => computeChartDateRange(currentDate, timeRange, useCurrentPeriod),
    [currentDate, timeRange, useCurrentPeriod],
  )

  const isToday = useMemo(
    () => currentDate.toDateString() === new Date().toDateString(),
    [currentDate],
  )

  const isChartServedByRealtime = timeRange === "1D" && isToday

  const sortedDashboardDataIds = useMemo(
    () => buildSortedDashboardDataIds(energyDataIds, socDataId),
    [energyDataIds, socDataId],
  )

  useEffect(() => {
    const id = window.setInterval(() => {
      const next = toLocalDateString(new Date())
      setLocalDayKey((prev) => (next !== prev ? next : prev))
    }, DASHBOARD_DAY_ROLL_CHECK_MS)
    return () => window.clearInterval(id)
  }, [])

  const realtimeFetchParams = useMemo(
    () => ({
      tenantId,
      data_ids: sortedDashboardDataIds,
      aggregate_by: "hour" as const,
      realtimeLocalDayKey: localDayKey,
    }),
    [tenantId, sortedDashboardDataIds, localDayKey],
  )

  const {
    data: realtimeTodayData,
    isLoading: isLoadingRealtime,
    error: errorRealtime,
  } = useHistoricalData(realtimeFetchParams, {
    enabled: !!tenantId && sortedDashboardDataIds.length > 0,
    staleTime: DASHBOARD_REALTIME_STALE_MS,
    gcTime: DASHBOARD_REALTIME_STALE_MS * 2,
    refetchInterval: DASHBOARD_REALTIME_REFETCH_MS,
    refetchOnWindowFocus: false,
  })

  const { chartDataIds, chartAggregate } = useMemo(() => {
    if (timeRange === "1D" && !isToday) {
      return {
        chartDataIds: sortedDashboardDataIds,
        chartAggregate: "hour" as const,
      }
    }
    return { chartDataIds: energyDataIds, chartAggregate: aggregateBy }
  }, [timeRange, isToday, sortedDashboardDataIds, energyDataIds, aggregateBy])

  const chartRangeEnabled =
    !!tenantId && !isChartServedByRealtime && chartDataIds.length > 0

  const {
    data: chartRangeData,
    isLoading: isLoadingChart,
    error: errorChart,
  } = useHistoricalData(
    {
      tenantId: tenantId,
      start: toLocalISOString(startDate),
      end: toLocalISOString(endDate),
      data_ids: chartDataIds,
      aggregate_by: chartAggregate,
    },
    {
      enabled: chartRangeEnabled,
    },
  )

  const { energy: energyApiResponse, soc: socApiResponse } = useMemo(() => {
    if (isChartServedByRealtime) {
      return splitHistoricalGroupedByDataIds(
        realtimeTodayData,
        energyDataIds,
        socDataId,
        plantConfig.hasEss,
      )
    }
    if (timeRange === "1D" && !isToday) {
      return splitHistoricalGroupedByDataIds(
        chartRangeData,
        energyDataIds,
        socDataId,
        plantConfig.hasEss,
      )
    }
    return { energy: chartRangeData, soc: undefined }
  }, [
    isChartServedByRealtime,
    timeRange,
    isToday,
    realtimeTodayData,
    chartRangeData,
    energyDataIds,
    socDataId,
    plantConfig.hasEss,
  ])

  useEffect(() => {
    if (!plantConfig.hasEss) {
      setIsSocCombined(false)
    }
  }, [plantConfig.hasEss])

  // activeSeries init moved below — it depends on transformed (filtered) data
  // so that hidden series never appear in the legend.

  const handleTimeRangeChange = useCallback((newRange: TimeRange) => {
    setTimeRange(newRange)
    setUseCurrentPeriod(false)
    if (newRange !== "1D") {
      setIsSocCombined(false)
    }
  }, [])

  const handleDateChange = useCallback((dateString: string) => {
    const [year, month, day] = dateString.split("-").map(Number)
    if (year && month && day) {
      setCurrentDate(new Date(year, month - 1, day))
    }
  }, [])

  const handleDateArrow = useCallback(
    (direction: "prev" | "next") => {
      setCurrentDate((prev) => {
        const newDate = new Date(prev)
        const increment = direction === "next" ? 1 : -1
        if (timeRange === "1D") newDate.setDate(newDate.getDate() + increment)
        else if (timeRange === "1W")
          newDate.setDate(newDate.getDate() + 7 * increment)
        else if (timeRange === "1M")
          newDate.setMonth(newDate.getMonth() + increment)
        else if (timeRange === "1Y")
          newDate.setFullYear(newDate.getFullYear() + increment)
        else if (timeRange === "All")
          newDate.setFullYear(newDate.getFullYear() + increment)
        return newDate
      })
    },
    [timeRange],
  )

  const handleLegendClick = useCallback((dataKey: string) => {
    setActiveSeries((prev) =>
      prev.includes(dataKey)
        ? prev.filter((el) => el !== dataKey)
        : [...prev, dataKey],
    )
  }, [])

  const seriesMetaForSort = useMemo(
    () => collectSeriesMeta(energyApiResponse, socApiResponse),
    [energyApiResponse, socApiResponse],
  )

  const consistentColorMap = useMemo(
    () => buildConsistentColorMap(seriesMetaForSort),
    [seriesMetaForSort],
  )

  const transformedEnergyData = useMemo(
    () =>
      buildTransformedEnergyData(
        energyApiResponse,
        consistentColorMap,
        timeRange,
        startDate,
        endDate,
        plantConfig,
      ),
    [
      energyApiResponse,
      consistentColorMap,
      timeRange,
      startDate,
      endDate,
      plantConfig,
    ],
  )

  const transformedSocData = useMemo(
    () =>
      buildTransformedSocData(socApiResponse, consistentColorMap, plantConfig),
    [socApiResponse, consistentColorMap, plantConfig],
  )

  const transformedCombinedData = useMemo(
    () =>
      buildTransformedCombinedData(
        energyApiResponse,
        socApiResponse,
        consistentColorMap,
        plantConfig,
      ),
    [energyApiResponse, socApiResponse, consistentColorMap, plantConfig],
  )

  useEffect(() => {
    const visibleNames = new Set<string>()
    transformedEnergyData?.seriesInfo.forEach((s) => visibleNames.add(s.name))
    transformedSocData?.seriesInfo.forEach((s) => visibleNames.add(s.name))
    transformedCombinedData?.seriesInfo.forEach((s) => visibleNames.add(s.name))
    setActiveSeries(Array.from(visibleNames))
  }, [transformedEnergyData, transformedSocData, transformedCombinedData])

  const hourlyTicks = useMemo(() => {
    if (aggregateBy === "hour") {
      return getHourlyTicks(startDate.getTime(), endDate.getTime())
    }
    return undefined
  }, [aggregateBy, startDate, endDate])

  const weekTicks = useMemo(
    () => (timeRange === "1W" ? buildWeekTicks(startDate) : undefined),
    [timeRange, startDate],
  )

  const isLoading = isChartServedByRealtime ? isLoadingRealtime : isLoadingChart
  const error = isChartServedByRealtime ? errorRealtime : errorChart

  return {
    currentDate,
    timeRange,
    isSocCombined,
    setIsSocCombined,
    useCurrentPeriod,
    setUseCurrentPeriod,
    activeSeries,
    localDayKey,
    startDate,
    endDate,
    aggregateBy,
    energyApiResponse,
    socApiResponse,
    realtimeTodayData,
    transformedEnergyData,
    transformedSocData,
    transformedCombinedData,
    hourlyTicks,
    weekTicks,
    seriesMetaForSort,
    isToday,
    isLoading,
    error,
    handleTimeRangeChange,
    handleDateChange,
    handleDateArrow,
    handleLegendClick,
  }
}
