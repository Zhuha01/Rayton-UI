/** HH:mm from API time strings (e.g. "14:30:00"); safe when value is missing. */
export function formatScheduleTimeHm(
  value: string | null | undefined,
  fallback = "00:00",
): string {
  if (value == null || value === "") return fallback
  return value.slice(0, 5)
}
