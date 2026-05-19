/**
 * Shared dashboard TypeScript contracts for telemetry transforms, legends, and layout metrics.
 * Centralizes props crossing chart containers, hooks, and the interactive home experience.
 */

export interface PlantUIConfig {
  hasEss: boolean
  hasGenerator: boolean
}

/** Semantic keys used by charts, interactive flow, and status cards (subset of TrendsColorKey). */
export type InteractiveSeriesKey =
  | "SOLAR_GENERATION"
  | "GRID_1"
  | "GRID_2"
  | "GRID_3"
  | "GRID_4"
  | "ESS_POWER"
  | "ESS_SOC"
  | "PLANT_CONSUMPTION"
  | "GENERATOR_POWER"

export interface EnergyTrendChartProps {
  tenantId: string | null
  energyDataIds: number[]
  socDataId: number
  stationName: string
  plantConfig: PlantUIConfig
}

/** One row for Recharts: numeric `x` plus dynamic series keys */
export type ChartRow = { x: number; [key: string]: number | undefined }

export interface SeriesInfoItem {
  name: string
  color: string
  dataId: number
}

export interface TransformedChartData {
  chartData: ChartRow[]
  seriesInfo: SeriesInfoItem[]
}

export type AggregateBy = "hour" | "day" | "month" | "year"

export interface ChartDateRange {
  startDate: Date
  endDate: Date
  aggregateBy: AggregateBy
}

export type SeriesMeta = { name: string; data_id: number }

export interface LegendEntry {
  value?: string
  /** Optional label to display while keeping `value` stable for toggling */
  label?: string
  color?: string
  [key: string]: unknown
}

export type ChartMargin = {
  top: number
  right: number
  left: number
  bottom: number
}

export type ChartSpacing = { barGap: number; barCategoryGap: string | number }
