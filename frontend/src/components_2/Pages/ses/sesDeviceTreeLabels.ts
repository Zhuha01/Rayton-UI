/**
 * Fallback labels for the SES device tree when `name` from plant config is empty.
 * Prefers the trimmed `name` from config (same source as `GetDeviceData` / tables), otherwise
 * derives short labels from `device_id` for technical or blank rows.
 */

import i18n from "@/i18n"

type DeviceLike = {
  device_id: number
  name: string
}

type TFn = (key: string, options?: Record<string, unknown>) => string

function resolveT(t?: TFn): TFn {
  if (t) return t
  return (key: string, options?: Record<string, unknown>) =>
    String(i18n.t(`SES:${key}`, options as never))
}

function translateSesTypedLabel(label: string, t: TFn): string {
  const s = label.trim()
  const sl = s.toLowerCase()

  // Full meter phrases (no numbering) — normalize to token translations.
  if (/лічильник\s+основн(ої|ой)\s+мереж(і|и)|main\s*grid\s*meter/i.test(sl)) {
    return t("devices.mainGridMeter")
  }
  if (
    /лічильник\s+резервн(ої|ой)\s+мереж(і|и)\/генератор(у|а)|backup\s*grid\s*meter|backup\s*meter/i.test(
      sl,
    )
  ) {
    return t("devices.backupGridMeter")
  }
  if (/лічильник\s+з\s+мереж(і|и)|grid\s*meter/i.test(sl)) {
    return t("devices.gridMeter")
  }
  if (/лічильник\s+генератор(у|а)|gen\s*meter|generator\s*meter/i.test(sl)) {
    return t("devices.genMeter")
  }

  if (
    /^(смарт\s*лог+ер|смартлог+ер|smart\s*logger|smartlogger)\b/i.test(s)
  ) {
    return t("devices.smartLogger")
  }

  const mSmart = s.match(
    /^(смарт\s*лог+ер|смартлог+ер|smart\s*logger|smartlogger)\s*(\d+)\b/i,
  )
  if (mSmart) return `${t("devices.smartLogger")} ${mSmart[2]}`

  const mMeter = s.match(/^(лічильник|counter|meter)\s*(\d+)\b/i)
  if (mMeter) return `${t("devices.meter")} ${mMeter[2]}`

  const mInv = s.match(/^(інвертор|инвертер|inverter)\s*(\d+)\b/i)
  if (mInv) return `${t("devices.inverter")} ${mInv[2]}`

  return s
}

function counterSlotIndex(id: number): number | null {
  const bases = [101101, 111101, 121101, 131101, 141101]
  for (const b of bases) {
    if (id >= b && id <= b + 4) return id - b + 1
  }
  return null
}

function inverterSlotIndex(id: number): number | null {
  const bases = [101201, 111201, 121201, 131201, 141201]
  for (const b of bases) {
    if (id >= b && id <= b + 4) return id - b + 1
  }
  return null
}

/** SES inverter slot ids (same numeric ranges as `DEVICE_IDS` on the SES page). */
export function isSesInverterSlotDeviceId(deviceId: number): boolean {
  return inverterSlotIndex(deviceId) !== null
}

/**
 * Config names are often compound (for example `SmartLogger 1, Meter 2`); the tree shows only the segment after the first comma.
 * The telemetry panel title rebuilds the full path separately via `sesTelemetryHeaderTitle`.
 */
function stripSesCompoundParentPrefix(label: string): string {
  const t = label.trim()
  const i = t.indexOf(",")
  if (i === -1) return t
  const rest = t.slice(i + 1).trim()
  return rest.length > 0 ? rest : t
}

/**
 * When `name` is set, show it (without parent prefix). Otherwise map ids 10–14 to smart logger
 * slots and metering/inverter bases to "Meter N" / "Inverter N" style labels.
 */
export function sesDeviceTreeDisplayName(device: DeviceLike, t?: TFn): string {
  const tt = resolveT(t)
  const fromConfig = device.name?.trim()
  if (fromConfig) {
    const compact = stripSesCompoundParentPrefix(fromConfig)
    return translateSesTypedLabel(compact, tt)
  }

  const id = device.device_id

  if (id >= 10 && id <= 14) {
    const base = tt("devices.smartLogger")
    return `${base} ${id - 9}`
  }

  const c = counterSlotIndex(id)
  if (c !== null) {
    const base = tt("devices.meter")
    return `${base} ${c}`
  }

  const inv = inverterSlotIndex(id)
  if (inv !== null) {
    const base = tt("devices.inverter")
    return `${base} ${inv}`
  }

  return tt("common.unnamed")
}

type SesTreeNode = DeviceLike & { children?: SesTreeNode[] }

function findSesDevicePath(
  roots: SesTreeNode[],
  targetId: number,
): SesTreeNode[] {
  const walk = (
    nodes: SesTreeNode[],
    prefix: SesTreeNode[],
  ): SesTreeNode[] | null => {
    for (const n of nodes) {
      const cur = [...prefix, n]
      if (n.device_id === targetId) return cur
      if (n.children?.length) {
        const found = walk(n.children, cur)
        if (found) return found
      }
    }
    return null
  }
  return walk(roots, []) ?? []
}

/**
 * Telemetry panel title joins each breadcrumb segment (for example smart logger plus meter at the leaves).
 * For the root node the title collapses to a single display name.
 */
export function sesTelemetryHeaderTitle(
  device: DeviceLike,
  roots: SesTreeNode[],
  t?: TFn,
): string {
  const tt = resolveT(t)
  const path = findSesDevicePath(roots, device.device_id)
  if (path.length === 0) return sesDeviceTreeDisplayName(device, tt)
  return path.map((n) => sesDeviceTreeDisplayName(n, tt)).join(", ")
}
