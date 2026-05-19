// src/hooks/useHistoricalData.ts
import { type UseQueryOptions, useQuery } from "@tanstack/react-query"
import {
  type ApiError,
  type HistoricalDataGroupedResponse,
  HistoricalDataService,
} from "@/client"
import { toLocalISOString } from "@/components_2/Pages/dashboard/chartUtils"

// Define the type for the parameters needed by the hook/API
interface FetchHistoricalDetailsParams {
  data_ids: number[]
  start?: string | null
  end?: string | null
  tenantId: string | null
  aggregate_by?: "hour" | "day" | "month" | "year" | null
  /**
   * When set, `start`/`end` in params are ignored for the query key and
   * request building is driven by a stable local calendar day. `end` is
   * always "now" at fetch time; `queryKey` omits volatile timestamps so
   * React Query can cache the realtime dashboard slice for that day.
   */
  realtimeLocalDayKey?: string | null
}

function startOfLocalCalendarDayFromKey(dayKey: string): Date {
  const [y, m, d] = dayKey.split("-").map(Number)
  if (!y || !m || !d) return new Date(0)
  return new Date(y, m - 1, d, 0, 0, 0, 0)
}

// Define the type for extra useQuery options
type UseHistoricalDataQueryOptions = Omit<
  UseQueryOptions<HistoricalDataGroupedResponse, ApiError>,
  "queryKey" | "queryFn"
>

function buildHistoricalDetailsQueryKey(
  params: FetchHistoricalDetailsParams,
): [string, Record<string, unknown>] {
  const aggregateBy = params.aggregate_by || "hour"
  if (params.realtimeLocalDayKey) {
    return [
      "historicalDataDetails",
      {
        tenantId: params.tenantId,
        data_ids: [...params.data_ids].sort((a, b) => a - b),
        aggregate_by: aggregateBy,
        scope: "realtime-dashboard",
        realtimeLocalDayKey: params.realtimeLocalDayKey,
      },
    ]
  }
  return [
    "historicalDataDetails",
    {
      ...params,
      aggregate_by: aggregateBy,
    },
  ]
}

/**
 * Hook to fetch detailed historical data, with optional aggregation.
 *
 * param params.aggregate_by - Aggregation level:
 * - null/"hour": Raw/averaged power data (kW) for Day view
 * - "day": Daily delta energy (kWh) for Week/Month view
 * - "month": Monthly delta energy (kWh) for Year view
 * - "year": Yearly delta energy (kWh) for Lifetime view
 *
 * param params.realtimeLocalDayKey - If set, fetches from local day start
 * to "now" (end is fresh on each request); not stored in the query key.
 */

const useHistoricalData = (
  params: FetchHistoricalDetailsParams,
  options: UseHistoricalDataQueryOptions = {},
) => {
  const enabled =
    options.enabled !== false &&
    !!params.tenantId &&
    params.data_ids &&
    params.data_ids.length > 0

  return useQuery<HistoricalDataGroupedResponse, ApiError>({
    ...options,
    queryKey: buildHistoricalDetailsQueryKey(params),
    queryFn: () => {
      if (params.realtimeLocalDayKey) {
        const startDate = startOfLocalCalendarDayFromKey(
          params.realtimeLocalDayKey,
        )
        const queryParams: {
          dataIds: number[]
          start: string
          end: string
          tenantId: string
          aggregateBy: "hour" | "day" | "month" | "year"
        } = {
          dataIds: params.data_ids,
          start: toLocalISOString(startDate),
          end: toLocalISOString(new Date()),
          tenantId: params.tenantId!,
          aggregateBy: (params.aggregate_by || "hour") as
            | "hour"
            | "day"
            | "month"
            | "year",
        }
        return HistoricalDataService.readHistoricalDetails(queryParams)
      }

      const queryParams: Record<string, unknown> = {
        dataIds: params.data_ids,
        start: params.start || undefined,
        end: params.end || undefined,
        tenantId: params.tenantId!,
      }

      if (params.aggregate_by !== undefined && params.aggregate_by !== null) {
        queryParams.aggregateBy = params.aggregate_by
      }

      return HistoricalDataService.readHistoricalDetails(queryParams as any)
    },
    enabled: enabled,
    staleTime: options.staleTime ?? 1000 * 60 * 5, // 5 minutes default
    refetchOnWindowFocus: options.refetchOnWindowFocus ?? false,
  })
}

export default useHistoricalData
