/**
 * Builds the UZE/ESS telemetry panel title (for example combining the ESS root label with PCS) while avoiding duplicate root labels.
 */
type TFn = (key: string, options?: Record<string, unknown>) => string

export function uzeTelemetryHeaderTitle(device: {
  name: string
  device_id: number
}, t?: TFn): string {
  const rootLabel = t ? t("common.ess") : "УЗЕ"
  const label = device.name?.trim() || String(device.device_id)
  const compact = label.replace(/\s+/g, "").toLowerCase()
  if (compact === "узе") return rootLabel
  return `${rootLabel}, ${label}`
}

export function uzeDeviceTreeDisplayName(
  device: { name?: string | null; device_id: number },
  t?: TFn,
): string {
  const raw = device.name?.trim() || ""
  const trimmed = raw.trim()
  const compact = raw.replace(/\s+/g, "").toLowerCase()
  const lower = trimmed.toLowerCase()

  if (!t) return raw || String(device.device_id)
  if (compact === "узе" || compact === "ess" || compact === "bess")
    return t("common.ess")

  // Handle prefixed station names like "UZE ECLECNOVA" / "ESS Something".
  for (const p of ["узе", "uze", "ess", "bess"] as const) {
    if (lower === p) return t("common.ess")
    if (lower.startsWith(`${p} `)) {
      const rest = trimmed.slice(p.length).trim()
      return rest ? `${t("common.ess")} ${rest}` : t("common.ess")
    }
  }

  if (/лічильник.*pcs|pcs.*лічильник|pcs\s*meter|meter\s*pcs/i.test(raw.toLowerCase()))
    return t("devices.meterPcs")
  if (/tms/i.test(compact)) return t("devices.tms")
  if (/pcs/i.test(compact)) return t("devices.pcs")
  if (/cell/i.test(compact)) return t("devices.cell")
  if (/bms/i.test(compact)) return t("devices.bms")
  if (/інше|other/i.test(compact)) return t("devices.other")

  return raw || t("common.unnamed")
}
