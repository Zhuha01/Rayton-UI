/**
 * Indicator rows on the PLC Control tab: `control_type === 4` matches the generalized schema,
 * while `100–199` covers additional indicator payloads (e.g. 100–107) separate from mode/phase (1–3) and buttons (141+).
 */
export function isPlcStatusIndicatorRow(row: { control_type: number }): boolean {
  if (row.control_type === 4) return true
  return row.control_type >= 100 && row.control_type <= 199
}
