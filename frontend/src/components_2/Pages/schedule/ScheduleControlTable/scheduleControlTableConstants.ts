/**
 * schedule Control Table Constants within the Rayton operator UI (components_2/Pages/schedule/ScheduleControlTable/scheduleControlTableConstants.ts).
 * Built with Chakra UI and shared theme tokens to stay consistent with dashboards, management, and control surfaces.
 * Primary contract: exported component props and functions below (see TypeScript types for required fields).
 */

export const SCHEDULE_TABLE_MAX_ROWS = 12
export const DEFAULT_START_TIME = "00:00:00"
export const TIME_FORMAT_REGEX = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/

/** Charge / charge limit / discharge fields (MW-style integers in UI). */
export const SCHEDULE_NUMERIC_MAX = 220
export const SCHEDULE_NUMERIC_MAX_DIGITS = 3
