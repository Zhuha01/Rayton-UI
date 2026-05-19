/**
 * Chart-specific color utilities and constants.
 * Exports trend colors, gradient configurations, and data series mappings for charts.
 */

import { colors } from "@/theme/tokens/colors"

export const TRENDS_COLORS = {
  PLANT_CONSUMPTION: colors.rayton_chart.consumption.value,
  SOLAR_GENERATION: colors.rayton_chart.solar.value,
  GRID_1: colors.rayton_chart.grid_1.value,
  GRID_2: colors.rayton_chart.grid_2.value,
  GRID_3: colors.rayton_chart.grid_3.value,
  GRID_4: colors.rayton_chart.grid_4.value,
  GENERATOR_POWER: colors.rayton_chart.generator.value,
  ESS_SOC: colors.rayton_chart.ess_soc.value,
  ESS_POWER: colors.rayton_chart.ess_power.value,
  ESS_CHARGE_FROM_PV: colors.rayton_chart.ess_charge_from_pv.value,
  ESS_CHARGE_TOTAL: colors.rayton_chart.ess_charge_total.value,
  ESS_DISCHARGE_TOTAL: colors.rayton_chart.ess_discharge_total.value,
} as const

export type TrendsColorKey = keyof typeof TRENDS_COLORS

export const COLOR_BY_DATA_ID: Record<number, TrendsColorKey> = {
  1: "SOLAR_GENERATION",
  2: "GRID_1",
  3: "GRID_2",
  4: "PLANT_CONSUMPTION",
  5: "ESS_POWER",
  6: "ESS_SOC",
  7: "GENERATOR_POWER",
  8: "GRID_3",
  9: "GRID_4",
}

export interface ChartGradientStop {
  offset: string
  opacity: number
}

export interface ChartGradientConfig {
  color: string
  stops: ChartGradientStop[]
}

export const CHART_GRADIENT_MAX_OPACITY = 0.4
export const CHART_GRADIENT_MIN_OPACITY = 0

export function GET_CHART_GRADIENT(
  colorKey: TrendsColorKey,
): ChartGradientConfig {
  return {
    color: TRENDS_COLORS[colorKey],
    stops: [
      { offset: "0%", opacity: CHART_GRADIENT_MAX_OPACITY },
      { offset: "100%", opacity: CHART_GRADIENT_MIN_OPACITY },
    ],
  }
}
