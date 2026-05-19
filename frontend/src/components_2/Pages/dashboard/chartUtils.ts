/**
 * Shared helpers for energy trends: normalization, legends, CSV export, and axis labeling.
 * Centralizes telemetry parsing helpers used by dashboards, KPI cards, and the interactive diagram.
 */

import type { HistoricalDataGroupedResponse } from "@/client"
import type { TimeRange } from "@/components_2/ui/TimeRangePicker"
import {
  COLOR_BY_DATA_ID,
  TRENDS_COLORS,
  type TrendsColorKey,
} from "@/theme/semanticTokens/chart"
import type {
  AggregateBy,
  ChartDateRange,
  ChartRow,
  InteractiveSeriesKey,
  LegendEntry,
  PlantUIConfig,
  SeriesInfoItem,
  SeriesMeta,
  TransformedChartData,
} from "./dashboardTypes"
import { colors } from "@/theme/tokens/colors"

export const LEGEND_DESIRED_ORDER = [4, 1, 2, 3, 8, 9, 7, 6, 5] as const

const FALLBACK_SERIES_COLOR = "#888888"

// --- Y-AXIS NICE TICKS ---
// Constants for computing evenly-spaced "nice" ticks on the Y-axis so the grid
// stably has 6 horizontal lines and the top/bottom ticks only slightly exceed
// the data range.
const Y_AXIS_TICK_COUNT = 6
const Y_AXIS_NICE_MULTIPLIERS = [1, 1.5, 2, 2.5, 3, 4, 5, 7.5] as const

/** Round a raw step up to the nearest "nice" value (1, 1.5, 2, 2.5, 3, 4, 5, 7.5) * 10^n. */
const niceStep = (raw: number): number => {
  if (!Number.isFinite(raw) || raw <= 0) return 1
  const exp = Math.floor(Math.log10(raw))
  const base = 10 ** exp
  const normalized = raw / base
  for (const m of Y_AXIS_NICE_MULTIPLIERS) {
    if (m >= normalized - 1e-9) return m * base
  }
  return 10 * base
}

/** Return the next nice step strictly greater than the given one. */
const nextNiceStep = (step: number): number => {
  const exp = Math.floor(Math.log10(step))
  const base = 10 ** exp
  const normalized = step / base
  for (const m of Y_AXIS_NICE_MULTIPLIERS) {
    if (m > normalized + 1e-9) return m * base
  }
  return 10 * base
}

/**
 * Compute evenly-spaced ticks covering the data range with a nice round step.
 * Always includes 0 as an anchor tick.
 */
export const computeNiceTicks = (
  data: ChartRow[],
  seriesKeys: string[],
  count: number = Y_AXIS_TICK_COUNT,
): number[] => {
  const intervals = count - 1
  let min = 0
  let max = 0
  let hasData = false
  for (const row of data) {
    for (const key of seriesKeys) {
      const v = row[key]
      if (typeof v === "number" && Number.isFinite(v)) {
        if (!hasData) {
          min = v
          max = v
          hasData = true
        } else {
          if (v < min) min = v
          if (v > max) max = v
        }
      }
    }
  }
  if (!hasData) {
    return Array.from({ length: count }, (_, i) => i)
  }
  const round = (n: number) => +n.toFixed(6)
  // Special case: all values are identical (most commonly all zeros).
  // Returning tiny "nice" steps would get rounded to 0 and render repeated tick labels.
  if (Math.abs(max - min) < 1e-12) {
    const step = min === 0 ? 1 / intervals : Math.abs(min) / intervals
    const start = min >= 0 ? 0 : -Math.abs(min)
    return Array.from({ length: count }, (_, i) => round(start + i * step))
  }
  if (min >= 0) {
    const step = niceStep(Math.max(max, 1e-9) / intervals)
    return Array.from({ length: count }, (_, i) => round(i * step))
  }
  if (max <= 0) {
    const step = niceStep(Math.abs(min) / intervals)
    return Array.from({ length: count }, (_, i) =>
      round(-(intervals - i) * step),
    )
  }
  let step = niceStep((max - min) / intervals)
  let negCount = Math.ceil(Math.abs(min) / step)
  let posCount = intervals - negCount
  while (
    posCount <= 0 ||
    negCount <= 0 ||
    posCount * step < max - 1e-9 ||
    negCount * step < Math.abs(min) - 1e-9
  ) {
    step = nextNiceStep(step)
    negCount = Math.ceil(Math.abs(min) / step)
    posCount = intervals - negCount
    if (step > 1e15) break
  }
  const bottom = -negCount * step
  return Array.from({ length: count }, (_, i) => round(bottom + i * step))
}

/**
 * Tighter tick generation for Day view (raw power line chart).
 * Goal: keep axis max/min close to actual extrema (avoid huge headroom like 220 -> 300).
 * Still returns evenly spaced ticks and keeps 0 on the axis when possible.
 */
export const computeTightNiceTicks = (
  data: ChartRow[],
  seriesKeys: string[],
  count: number = Y_AXIS_TICK_COUNT,
): number[] => {
  const intervals = count - 1
  let min = 0
  let max = 0
  let hasData = false
  for (const row of data) {
    for (const key of seriesKeys) {
      const v = row[key]
      if (typeof v === "number" && Number.isFinite(v)) {
        if (!hasData) {
          min = v
          max = v
          hasData = true
        } else {
          if (v < min) min = v
          if (v > max) max = v
        }
      }
    }
  }
  if (!hasData) return Array.from({ length: count }, (_, i) => i)

  const round = (n: number) => +n.toFixed(6)
  if (Math.abs(max - min) < 1e-12) {
    const step = max === 0 ? 1 / intervals : Math.abs(max) / intervals
    const start = max >= 0 ? 0 : -Math.abs(max)
    return Array.from({ length: count }, (_, i) => round(start + i * step))
  }

  const absExt = Math.max(Math.abs(min), Math.abs(max))
  // If values are small, keep the axis tight:
  // - for max <= 10 we want a fixed headroom of 1 (e.g. max=2.2 -> top≈4, max=10 -> top=11)
  // - for larger ranges we keep progressively coarser rounding
  const stepBase = absExt <= 10 ? 1 : absExt <= 30 ? 3 : absExt <= 100 ? 5 : 10
  const ceilTo = (v: number, base: number) => Math.ceil(v / base) * base
  const floorTo = (v: number, base: number) => Math.floor(v / base) * base

  // Keep a small headroom/footroom: next 10 plus one extra stepBase.
  const topTarget = ceilTo(max, stepBase) + stepBase
  const bottomTarget = floorTo(min, stepBase) - stepBase

  let bottom: number
  let top: number

  if (min >= 0) {
    bottom = 0
    top = topTarget
  } else if (max <= 0) {
    bottom = bottomTarget
    top = 0
  } else {
    bottom = bottomTarget
    top = topTarget
  }

  // Compute an integer step so that bottom + step*intervals >= top.
  let step = Math.ceil((top - bottom) / intervals)
  if (step <= 0) step = 1
  // Recompute top to fit exactly `count` ticks.
  top = bottom + step * intervals
  return Array.from({ length: count }, (_, i) => round(bottom + i * step))
}

/**
 * Stable zoom ticks for power charts.
 *
 * Locks the Y-axis to exactly `count` ticks (5 intervals by default) so that
 * the horizontal grid density — i.e. the visual distance between grid lines —
 * matches the full-day view and does NOT compress when the zoomed range is
 * small. Endpoints round up/down to a small "nice" step so the domain doesn't
 * jitter on every micro zoom change.
 */
export const computeStablePowerZoomTicks = (
  data: ChartRow[],
  seriesKeys: string[],
  count: number = Y_AXIS_TICK_COUNT,
): number[] => {
  const intervals = Math.max(2, count - 1)
  let min = 0
  let max = 0
  let hasData = false
  for (const row of data) {
    for (const key of seriesKeys) {
      const v = row[key]
      if (typeof v === "number" && Number.isFinite(v)) {
        if (!hasData) {
          min = v
          max = v
          hasData = true
        } else {
          if (v < min) min = v
          if (v > max) max = v
        }
      }
    }
  }
  if (!hasData) return Array.from({ length: count }, (_, i) => i)

  const round = (n: number) => +n.toFixed(6)

  if (Math.abs(max - min) < 1e-12) {
    const magnitude = Math.max(Math.abs(max), 1)
    const step = niceStep(magnitude / intervals)
    if (min >= 0) {
      return Array.from({ length: count }, (_, i) => round(i * step))
    }
    return Array.from({ length: count }, (_, i) =>
      round(-(intervals - i) * step),
    )
  }

  const headroomRatio = 0.08

  if (min >= 0) {
    const target = Math.max(max * (1 + headroomRatio), max + 1e-9)
    let step = niceStep(target / intervals)
    let guard = 0
    while (step * intervals < max - 1e-9 && guard < 100) {
      step = nextNiceStep(step)
      if (!Number.isFinite(step) || step > 1e15) break
      guard++
    }
    return Array.from({ length: count }, (_, i) => round(i * step))
  }

  if (max <= 0) {
    const target = Math.max(
      Math.abs(min) * (1 + headroomRatio),
      Math.abs(min) + 1e-9,
    )
    let step = niceStep(target / intervals)
    let guard = 0
    while (step * intervals < Math.abs(min) - 1e-9 && guard < 100) {
      step = nextNiceStep(step)
      if (!Number.isFinite(step) || step > 1e15) break
      guard++
    }
    return Array.from({ length: count }, (_, i) =>
      round(-(intervals - i) * step),
    )
  }

  // Mixed range: pick a nice step that accommodates both sides within `intervals`.
  const paddedRange = (max - min) * (1 + headroomRatio)
  let step = niceStep(paddedRange / intervals)
  let topSteps = Math.ceil(max / step)
  let botSteps = Math.ceil(Math.abs(min) / step)
  let guard = 0
  while (topSteps + botSteps > intervals && guard < 200) {
    step = nextNiceStep(step)
    if (!Number.isFinite(step) || step > 1e15) break
    topSteps = Math.ceil(max / step)
    botSteps = Math.ceil(Math.abs(min) / step)
    guard++
  }
  const extra = Math.max(0, intervals - topSteps - botSteps)
  const extraTop = Math.ceil(extra / 2)
  const extraBot = extra - extraTop
  const bottom = -(botSteps + extraBot) * step
  return Array.from({ length: count }, (_, i) => round(bottom + i * step))
}

export function formatSig3(value: number): string {
  if (!Number.isFinite(value)) return ""
  if (value === 0) return "0"
  // 3 significant digits, no trailing zeros
  const s = value.toPrecision(3)
  const n = Number(s)
  return Number.isFinite(n) ? String(n) : s
}

export type AxisScale = { divisor: number; unit: string }

export function getAxisScale(
  maxAbs: number,
  baseUnit: "kWh" | "kW",
): AxisScale {
  const abs = Math.abs(maxAbs)
  if (baseUnit === "kWh") {
    if (abs >= 1_000_000) return { divisor: 1_000_000, unit: "GWh" }
    if (abs >= 1_000) return { divisor: 1_000, unit: "MWh" }
    return { divisor: 1, unit: "kWh" }
  }
  // kW
  if (abs >= 1_000_000) return { divisor: 1_000_000, unit: "GW" }
  if (abs >= 1_000) return { divisor: 1_000, unit: "MW" }
  return { divisor: 1, unit: "kW" }
}

/**
 * Pick a scale based on the individual value magnitude.
 * Useful for tooltips where a mixed dataset may have very large and very small
 * values (e.g., show 0.2 MWh as 200 kWh for readability).
 */
export function getAxisScaleForValue(
  value: number,
  baseUnit: "kWh" | "kW",
): AxisScale {
  return getAxisScale(Math.abs(value), baseUnit)
}

/**
 * Name-based color resolution. Patterns are checked in order; first match wins,
 * so more specific patterns (Grid 2, ESS SOC) MUST come before their generic
 * counterparts (Grid, ESS power). Matching is case-insensitive and tolerant
 * of Ukrainian/English naming.
 */
const NAME_PATTERNS: ReadonlyArray<{ regex: RegExp; key: TrendsColorKey }> = [
  { regex: /мереж[а-яіїєґ']*\s*4|grid\s*4/i, key: "GRID_4" },
  { regex: /мереж[а-яіїєґ']*\s*3|grid\s*3/i, key: "GRID_3" },
  { regex: /мереж[а-яіїєґ']*\s*2|grid\s*2/i, key: "GRID_2" },
  // ESS charge/discharge breakdowns (more specific than generic ESS power)
  {
    regex: /заряд[а-яіїєґ']*.*(сес|pv)|charge.*(pv|solar)|from\s*(pv|solar)/i,
    key: "ESS_CHARGE_FROM_PV",
  },
  {
    regex:
      /заряд[а-яіїєґ']*.*(загалом|усього|total)|total\s*charge|charge\s*total/i,
    key: "ESS_CHARGE_TOTAL",
  },
  {
    regex:
      /розряд[а-яіїєґ']*.*(загалом|усього|total)|total\s*discharge|discharge\s*total/i,
    key: "ESS_DISCHARGE_TOTAL",
  },
  {
    regex: /\bsoc\b|state\s*of\s*charge|рівень\s*заряд|заряд\s*батаре/i,
    key: "ESS_SOC",
  },
  { regex: /генератор|generator/i, key: "GENERATOR_POWER" },
  { regex: /мереж[а-яіїєґ']*|grid/i, key: "GRID_1" },
  { regex: /ess|узе|батаре|battery|акумулят/i, key: "ESS_POWER" },
  { regex: /сонячн|сонце|solar|\bpv\b|фотоелектр/i, key: "SOLAR_GENERATION" },
  {
    regex: /споживан|consumption|навантаж|\bload\b/i,
    key: "PLANT_CONSUMPTION",
  },
]

export function colorKeyForSeries(
  meta: SeriesMeta,
): TrendsColorKey | undefined {
  for (const { regex, key } of NAME_PATTERNS) {
    if (regex.test(meta.name)) return key
  }
  return COLOR_BY_DATA_ID[meta.data_id]
}

export function isSeriesAllowedByPlantConfig(
  dataId: number,
  plantConfig: PlantUIConfig,
): boolean {
  if (!plantConfig.hasEss && (dataId === 5 || dataId === 6)) return false
  if (!plantConfig.hasGenerator && dataId === 7) return false
  return true
}

/** Default historical/chart data_id list for the energy dashboard, filtered by plant hardware flags. */
export function buildEnergyDataIds(plantConfig: PlantUIConfig): number[] {
  // TODO: replace with per-plant telemetry manifest from API when available (DeviceInfo has no data_id today).
  const all = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const
  return all.filter((id) => isSeriesAllowedByPlantConfig(id, plantConfig))
}

function filterSeriesByPlantConfig<T extends { data_id: number }>(
  series: T[],
  plantConfig: PlantUIConfig,
): T[] {
  return series.filter((s) =>
    isSeriesAllowedByPlantConfig(s.data_id, plantConfig),
  )
}

/** kW threshold for treating a power channel as active vs idle (flow + cards). */
export const TELEMETRY_ACTIVE_EPSILON = 0.05

export function parseTelemetryValue(
  value: string | number | null | undefined,
): number {
  if (value == null) return 0
  if (typeof value === "number") return Number.isFinite(value) ? value : 0
  const n = parseFloat(String(value).replace(",", "."))
  return Number.isFinite(n) ? n : 0
}

const INTERACTIVE_TELEMETRY_KEYS = new Set<InteractiveSeriesKey>([
  "SOLAR_GENERATION",
  "GRID_1",
  "GRID_2",
  "GRID_3",
  "GRID_4",
  "ESS_POWER",
  "ESS_SOC",
  "PLANT_CONSUMPTION",
  "GENERATOR_POWER",
])

/**
 * Same series semantics as the energy chart (`NAME_PATTERNS` then
 * `COLOR_BY_DATA_ID`), narrowed to flow/card keys, with the same plant
 * visibility rules as chart transforms.
 */
export function resolveInteractiveTelemetrySeriesKey(
  point: SeriesMeta,
  plantConfig: PlantUIConfig,
): InteractiveSeriesKey | undefined {
  if (!isSeriesAllowedByPlantConfig(point.data_id, plantConfig))
    return undefined
  const key = colorKeyForSeries(point)
  if (!key) return undefined
  if (INTERACTIVE_TELEMETRY_KEYS.has(key as InteractiveSeriesKey)) {
    return key as InteractiveSeriesKey
  }
  return undefined
}

/** True when the resolved key is one of the four grid power slots (matches flow/chart semantics). */
export function isInteractiveGridKey(
  k: InteractiveSeriesKey | undefined,
): k is "GRID_1" | "GRID_2" | "GRID_3" | "GRID_4" {
  return k === "GRID_1" || k === "GRID_2" || k === "GRID_3" || k === "GRID_4"
}

export function toLocalDateString(date: Date): string {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const day = date.getDate().toString().padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function toLocalISOString(date: Date): string {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const day = date.getDate().toString().padStart(2, "0")
  const hours = date.getHours().toString().padStart(2, "0")
  const minutes = date.getMinutes().toString().padStart(2, "0")
  const seconds = date.getSeconds().toString().padStart(2, "0")
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
}

/**
 * API timestamps for chart points are treated as UTC-based "wall time" timestamps.
 * To render the chart starting at local 00:00 (instead of shifting to 02:00 etc.),
 * we shift each point by the browser timezone offset so that formatted labels and
 * axis alignment match the local day boundary.
 */
export function toLocalWallTimeTimestamp(timestampMs: number): number {
  return timestampMs + new Date(timestampMs).getTimezoneOffset() * 60_000
}

export function getHourlyTicks(start: number, end: number): number[] {
  const ticks: number[] = []
  let current = start
  const threeHours = 3 * 60 * 60 * 1000
  while (current <= end) {
    ticks.push(current)
    current += threeHours
  }
  return ticks
}

export function formatHourlyTick(
  timestamp: number,
  index: number,
  totalTicks: number,
): string {
  const date = new Date(timestamp)
  const hours = date.getHours()
  const minutes = date.getMinutes()

  // Treat wrapped midnight ticks as synthetic 24:00 for readability.
  if (index === totalTicks - 1 && hours === 0 && index !== 0) {
    return "24:00"
  }

  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
}

export function formatXAxisTimestamp(
  timestamp: number,
  aggregateBy: AggregateBy,
  locale?: string,
): string {
  const date = new Date(timestamp)
  if (aggregateBy === "hour") {
    return date.toLocaleTimeString(locale, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
  }
  if (aggregateBy === "day") {
    return date.toLocaleDateString(locale, {
      month: "short",
      day: "numeric",
    })
  }
  if (aggregateBy === "month") {
    return date.toLocaleDateString(locale, {
      month: "short",
      year: "numeric",
    })
  }
  return date.getFullYear().toString()
}

export function buildConsistentColorMap(
  seriesMeta: SeriesMeta[],
): Record<string, string> {
  const map: Record<string, string> = {}
  for (const s of seriesMeta) {
    const key = colorKeyForSeries(s)
    if (key) {
      map[s.name] = TRENDS_COLORS[key]
    }
  }
  return map
}

/**
 * Build a copy of `chartData` where each series has a value in every row
 * between its first and last known point (linear interpolation on `x`).
 *
 * NOTE: This is intended for the tooltip only. The real `chartData` must stay
 * untouched so that axis scaling, gradients, and any data export keep using
 * only actual values from the API. We use this copy just to look up a value
 * for every active series at the hovered X, matching what the line visually
 * passes through via Recharts' `connectNulls`.
 */
export function buildInterpolatedTooltipData(
  chartData: ChartRow[],
  seriesNames: string[],
): ChartRow[] {
  if (chartData.length === 0 || seriesNames.length === 0) return chartData
  const result = chartData.map((row) => ({ ...row }))
  for (const name of seriesNames) {
    const knownIndices: number[] = []
    for (let i = 0; i < result.length; i++) {
      const v = result[i][name]
      if (typeof v === "number" && Number.isFinite(v)) {
        knownIndices.push(i)
      }
    }
    if (knownIndices.length < 2) continue
    for (let k = 0; k < knownIndices.length - 1; k++) {
      const iStart = knownIndices[k]
      const iEnd = knownIndices[k + 1]
      if (iEnd - iStart <= 1) continue
      const xStart = result[iStart].x
      const xEnd = result[iEnd].x
      const yStart = result[iStart][name] as number
      const yEnd = result[iEnd][name] as number
      const dx = xEnd - xStart
      if (dx === 0) continue
      for (let i = iStart + 1; i < iEnd; i++) {
        const t = (result[i].x - xStart) / dx
        result[i][name] = yStart + (yEnd - yStart) * t
      }
    }
  }
  return result
}

function fillWeekGaps(
  dataMap: Record<number, ChartRow>,
  seriesNames: string[],
  startDate: Date,
): ChartRow[] {
  const filledDataMap: Record<number, ChartRow> = { ...dataMap }
  const periodStart = new Date(startDate)
  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(periodStart)
    dayDate.setDate(periodStart.getDate() + i)
    dayDate.setHours(0, 0, 0, 0)
    const dayTimestamp = dayDate.getTime()
    if (!filledDataMap[dayTimestamp]) {
      filledDataMap[dayTimestamp] = { x: dayTimestamp }
      for (const name of seriesNames) {
        filledDataMap[dayTimestamp][name] = 0
      }
    }
  }
  return Object.values(filledDataMap).sort((a, b) => a.x - b.x)
}

export function buildTransformedEnergyData(
  energyApiResponse: HistoricalDataGroupedResponse | undefined,
  consistentColorMap: Record<string, string>,
  timeRange: TimeRange,
  startDate: Date,
  _endDate: Date,
  plantConfig: PlantUIConfig,
): TransformedChartData | null {
  if (!energyApiResponse) return null
  const normalizeTimestamp = (x: number) =>
    x < 1_000_000_000_000 ? x * 1000 : x
  const filteredSeries = filterSeriesByPlantConfig(
    energyApiResponse.series,
    plantConfig,
  )
  const dataMap: Record<number, ChartRow> = {}
  const seriesInfo: SeriesInfoItem[] = filteredSeries.map((s) => ({
    name: s.name,
    color: consistentColorMap[s.name] ?? FALLBACK_SERIES_COLOR,
    dataId: s.data_id,
  }))

  for (const series of filteredSeries) {
    for (const point of series.data) {
      const ts = toLocalWallTimeTimestamp(normalizeTimestamp(point.x))
      if (!dataMap[ts]) {
        dataMap[ts] = { x: ts }
      }
      dataMap[ts][series.name] = point.y ?? 0
    }
  }

  let chartData: ChartRow[] = Object.values(dataMap).sort((a, b) => a.x - b.x)

  if (timeRange === "1W") {
    chartData = fillWeekGaps(
      dataMap,
      filteredSeries.map((s) => s.name),
      startDate,
    )
  }

  return { chartData, seriesInfo }
}

export function buildTransformedSocData(
  socApiResponse: HistoricalDataGroupedResponse | undefined,
  consistentColorMap: Record<string, string>,
  plantConfig: PlantUIConfig,
): TransformedChartData | null {
  if (!socApiResponse) return null
  const normalizeTimestamp = (x: number) =>
    x < 1_000_000_000_000 ? x * 1000 : x
  const filteredSeries = filterSeriesByPlantConfig(
    socApiResponse.series,
    plantConfig,
  )
  const dataMap: Record<number, ChartRow> = {}
  const seriesInfo: SeriesInfoItem[] = filteredSeries.map((s) => ({
    name: s.name,
    color: consistentColorMap[s.name] ?? FALLBACK_SERIES_COLOR,
    dataId: s.data_id,
  }))

  for (const series of filteredSeries) {
    for (const point of series.data) {
      const ts = toLocalWallTimeTimestamp(normalizeTimestamp(point.x))
      if (!dataMap[ts]) {
        dataMap[ts] = { x: ts }
      }
      dataMap[ts][series.name] = point.y ?? 0
    }
  }

  const chartData = Object.values(dataMap).sort((a, b) => a.x - b.x)
  return { chartData, seriesInfo }
}

export function buildTransformedCombinedData(
  energyApiResponse: HistoricalDataGroupedResponse | undefined,
  socApiResponse: HistoricalDataGroupedResponse | undefined,
  consistentColorMap: Record<string, string>,
  plantConfig: PlantUIConfig,
): TransformedChartData | null {
  if (!energyApiResponse || !socApiResponse) return null
  const normalizeTimestamp = (x: number) =>
    x < 1_000_000_000_000 ? x * 1000 : x
  const combinedRaw: HistoricalDataGroupedResponse = {
    series: [...energyApiResponse.series, ...socApiResponse.series],
  }
  const filteredSeries = filterSeriesByPlantConfig(
    combinedRaw.series,
    plantConfig,
  )
  const dataMap: Record<number, ChartRow> = {}
  const seriesInfo: SeriesInfoItem[] = filteredSeries.map((s) => ({
    name: s.name,
    color: consistentColorMap[s.name] ?? FALLBACK_SERIES_COLOR,
    dataId: s.data_id,
  }))

  for (const series of filteredSeries) {
    for (const point of series.data) {
      const ts = toLocalWallTimeTimestamp(normalizeTimestamp(point.x))
      if (!dataMap[ts]) {
        dataMap[ts] = { x: ts }
      }
      dataMap[ts][series.name] = point.y ?? 0
    }
  }

  const chartData = Object.values(dataMap).sort((a, b) => a.x - b.x)
  return { chartData, seriesInfo }
}

export function computeChartDateRange(
  currentDate: Date,
  timeRange: TimeRange,
  useCurrentPeriod: boolean,
): ChartDateRange {
  let start: Date = new Date(currentDate)
  let end = new Date(currentDate)
  let aggregateBy: AggregateBy = "hour"

  if (timeRange === "1D") {
    start = new Date(currentDate)
    start.setHours(0, 0, 0, 0)
    end = new Date(currentDate)
    end.setDate(end.getDate() + 1)
    end.setHours(0, 0, 0, 0)
    aggregateBy = "hour"
  } else if (timeRange === "1W" || timeRange === "1M") {
    aggregateBy = "day"
    if (useCurrentPeriod && timeRange === "1W") {
      start = new Date(currentDate)
      const day = start.getDay()
      const diff = start.getDate() - day + (day === 0 ? -6 : 1)
      start.setDate(diff)
      start.setHours(0, 0, 0, 0)
      end = new Date(start)
      end.setDate(start.getDate() + 7)
      end.setHours(23, 59, 59, 999)
    } else if (useCurrentPeriod && timeRange === "1M") {
      start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      start.setHours(0, 0, 0, 0)
      end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
      end.setHours(23, 59, 59, 999)
    } else if (timeRange === "1W") {
      start = new Date(currentDate)
      start.setDate(start.getDate() - 6)
      start.setHours(0, 0, 0, 0)
      end = new Date(currentDate)
      end.setHours(23, 59, 59, 999)
    } else {
      start = new Date(currentDate)
      start.setDate(start.getDate() - 29)
      start.setHours(0, 0, 0, 0)
      end = new Date(currentDate)
      end.setHours(23, 59, 59, 999)
    }
  } else if (timeRange === "1Y") {
    aggregateBy = "month"
    if (useCurrentPeriod) {
      start = new Date(currentDate.getFullYear(), 0, 1)
      start.setHours(0, 0, 0, 0)
      end = new Date(currentDate.getFullYear(), 11, 31)
      end.setHours(23, 59, 59, 999)
    } else {
      start = new Date(currentDate)
      start.setMonth(start.getMonth() - 11)
      start.setHours(0, 0, 0, 0)
      end = new Date(currentDate)
      end.setHours(23, 59, 59, 999)
    }
  } else if (timeRange === "All") {
    aggregateBy = "year"
    // Limit "All" to 2020–present so exports do not scan unbounded history.
    start = new Date(2020, 0, 1)
    end = new Date()
    end.setHours(23, 59, 59, 999)
  }

  return { startDate: start, endDate: end, aggregateBy }
}

export function buildWeekTicks(startDate: Date): number[] {
  const ticks: number[] = []
  const periodStart = new Date(startDate)
  for (let i = 0; i < 7; i++) {
    const tickDate = new Date(periodStart)
    tickDate.setDate(periodStart.getDate() + i)
    ticks.push(tickDate.getTime())
  }
  return ticks
}

function dataIdForSeriesName(
  name: string | undefined,
  seriesMeta: SeriesMeta[],
): number | undefined {
  if (!name) return undefined
  return seriesMeta.find((s) => s.name === name)?.data_id
}

export function sortLegendPayload(
  payload: readonly LegendEntry[] | undefined,
  seriesMeta: SeriesMeta[],
  desiredOrder: readonly number[] = LEGEND_DESIRED_ORDER,
): LegendEntry[] {
  if (!payload || payload.length === 0) return []
  const sortedPayload = [...payload]
  sortedPayload.sort((a, b) => {
    const aVal = typeof a.value === "string" ? a.value : undefined
    const bVal = typeof b.value === "string" ? b.value : undefined
    const aDataId = dataIdForSeriesName(aVal, seriesMeta)
    const bDataId = dataIdForSeriesName(bVal, seriesMeta)
    const aIndex = aDataId !== undefined ? desiredOrder.indexOf(aDataId) : -1
    const bIndex = bDataId !== undefined ? desiredOrder.indexOf(bDataId) : -1
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex
    if (aIndex !== -1) return -1
    if (bIndex !== -1) return 1
    return 0
  })
  return sortedPayload
}

export function tooltipItemSortIndex(
  itemName: string | undefined,
  seriesMeta: SeriesMeta[],
  desiredOrder: readonly number[] = LEGEND_DESIRED_ORDER,
): number {
  const id = dataIdForSeriesName(itemName, seriesMeta)
  const idx = id !== undefined ? desiredOrder.indexOf(id) : -1
  return idx !== -1 ? idx : desiredOrder.length
}

export function collectSeriesMeta(
  energy: HistoricalDataGroupedResponse | undefined,
  soc: HistoricalDataGroupedResponse | undefined,
): SeriesMeta[] {
  const out: SeriesMeta[] = []
  energy?.series?.forEach((s) => out.push({ name: s.name, data_id: s.data_id }))
  soc?.series?.forEach((s) => out.push({ name: s.name, data_id: s.data_id }))
  return out
}

/** 5 min — single realtime dashboard query (widgets + 1D today chart) */
export const DASHBOARD_REALTIME_STALE_MS = 1000 * 60 * 5
export const DASHBOARD_REALTIME_REFETCH_MS = 1000 * 60 * 5
/** Roll `realtimeLocalDayKey` at local midnight without a full page reload. */
export const DASHBOARD_DAY_ROLL_CHECK_MS = 60_000

/**
 * Merged `data_id` list for `/historical-data/details` (energy channels + SOC), sorted for stable query keys.
 * Matches the former `useInteractiveHistoricalData` merge.
 */
export function buildSortedDashboardDataIds(
  energyDataIds: number[],
  socDataId: number,
): number[] {
  const ids = [...energyDataIds]
  if (!ids.includes(socDataId)) ids.push(socDataId)
  return ids.sort((a, b) => a - b)
}

/**
 * Splits a grouped API response for chart transforms: power series vs optional SOC by `data_id`.
 */
export function splitHistoricalGroupedByDataIds(
  full: HistoricalDataGroupedResponse | undefined,
  energyDataIds: number[],
  socDataId: number,
  hasEss: boolean,
): {
  energy: HistoricalDataGroupedResponse | undefined
  soc: HistoricalDataGroupedResponse | undefined
} {
  if (!full?.series) return { energy: undefined, soc: undefined }
  const energySet = new Set(energyDataIds)
  const energy: HistoricalDataGroupedResponse = {
    series: full.series.filter((s) => energySet.has(s.data_id)),
  }
  if (!hasEss) {
    return { energy, soc: undefined }
  }
  const soc: HistoricalDataGroupedResponse = {
    series: full.series.filter((s) => s.data_id === socDataId),
  }
  return { energy, soc }
}
