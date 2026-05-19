/**
 * schedule Power Input within the Rayton operator UI (components_2/Pages/schedule/ScheduleControlTable/schedulePowerInput.ts).
 * Built with Chakra UI and shared theme tokens to stay consistent with dashboards, management, and control surfaces.
 * Primary contract: exported component props and functions below (see TypeScript types for required fields).
 */
type PowerInputOpts = {
  maxDigits: number
  min?: number
  max?: number
}

/** While typing: only digits, max length, clamp display & value to min/max. */
export function normalizePowerFieldInput(
  raw: string,
  opts: PowerInputOpts,
): { displayText: string; commitValue?: number } {
  const digits = raw.replace(/\D/g, "").slice(0, opts.maxDigits)
  if (digits === "") return { displayText: "" }

  const n = parseInt(digits, 10)
  if (!Number.isFinite(n)) return { displayText: digits }

  if (typeof opts.max === "number" && n > opts.max) {
    return { displayText: String(opts.max), commitValue: opts.max }
  }
  if (typeof opts.min === "number" && n < opts.min) {
    return { displayText: String(opts.min), commitValue: opts.min }
  }
  return { displayText: digits, commitValue: n }
}

/** On blur: parse digits; empty field becomes `fallbackEmpty` (typically 0). */
export function commitPowerFieldInput(
  raw: string,
  opts: PowerInputOpts,
  fallbackEmpty: number,
): number {
  const digits = raw.replace(/\D/g, "").slice(0, opts.maxDigits)
  if (digits === "") return fallbackEmpty
  let n = parseInt(digits, 10)
  if (!Number.isFinite(n)) return fallbackEmpty
  if (typeof opts.max === "number") n = Math.min(opts.max, n)
  if (typeof opts.min === "number") n = Math.max(opts.min, n)
  return n
}
