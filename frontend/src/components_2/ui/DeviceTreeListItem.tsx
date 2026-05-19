/**
 * Renders selectable leaf rows in the SES/UZE device explorer with preset icons per device heuristic.
 * Exposes naming heuristics and visual presets reused when mapping API devices onto tree badges.
 */

import { Box, Flex, Text } from "@chakra-ui/react"
import type { ReactNode } from "react"

import { DEVICE_TREE_PAGE_UI } from "@/components_2/Pages/device/deviceTreePageUi"
import { isSesInverterSlotDeviceId } from "@/components_2/Pages/ses/sesDeviceTreeLabels"
import {
  BmsLeafIcon,
  CellLeafIcon,
  CounterLeafIcon,
  OtherLeafIcon,
  PcsLeafIcon,
  TmsLeafIcon,
} from "@/components_2/ui/deviceTreeLeafIcons"

export type DeviceTreeListItemProps = {
  label: string
  icon: ReactNode
  bgColor?: string
  /** Selected-state border color (from `DEVICE_TREE_PAGE_UI.leaf.selectedBorderByKind` when omitted). */
  selectedBorderColor?: string
  /** Online status: green dot (true) or red dot (false). */
  online?: boolean
  kind?: DeviceTreeLeafKind
  selected?: boolean
  variant?: "row" | "tile"
  onClick?: () => void
}

export function DeviceTreeListItem({
  label,
  icon,
  bgColor = DEVICE_TREE_PAGE_UI.leaf.bgDefault,
  selectedBorderColor,
  kind = "other",
  selected = false,
  variant = "row",
  onClick,
}: DeviceTreeListItemProps) {
  const L = DEVICE_TREE_PAGE_UI.leaf
  const borderW = `${DEVICE_TREE_PAGE_UI.connector.trunkStrokeUniformPx}px`
  const borderWhenSelected =
    selectedBorderColor ?? L.selectedBorder
  const iconBox = deviceTreeLeafIconBoxSize(kind)
  const iconColor = L.iconColorByKind[kind]

  const tile = variant === "tile"
  return (
    <Flex
      align="center"
      justify="space-between"
      bg={bgColor}
      borderRadius={L.rowRadius}
      px={tile ? "10px" : "4px"}
      py={tile ? "0" : "4px"}
      cursor="pointer"
      userSelect="none"
      onClick={onClick}
      borderWidth={borderW}
      borderStyle="solid"
      borderColor="transparent"
      minW={tile ? "150px" : undefined}
      h={tile ? "40px" : undefined}
      minH={tile ? "40px" : "33px"}
      w="100%"
      overflow="hidden"
      _hover={{ filter: L.hoverFilter }}
      {...(selected
        ? {
            borderColor: borderWhenSelected,
            filter: L.selectedFilter,
          }
        : undefined)}
    >
      <Flex align="center" gap="8px" minW={0} flex="1">
        <Box
          w={iconBox.w}
          h={iconBox.h}
          flexShrink={0}
          display="flex"
          alignItems="center"
          justifyContent="center"
          color={iconColor}
        >
          {icon}
        </Box>
        <Text
          color="ui.DeviceTree.titleText"
          fontSize={tile ? "14px" : "16px"}
          fontWeight={500}
          lineHeight="normal"
          lineClamp={1}
          flex="1 1 auto"
          minW={0}
        >
          {label}
        </Text>
      </Flex>
    </Flex>
  )
}

export type DeviceTreeLeafKind =
  | "counter"
  | "inverter"
  | "bms"
  | "pcs"
  | "tms"
  | "cell"
  | "other"
  | "counter_pcs"

export function deviceTreeLeafIconBoxSize(kind: DeviceTreeLeafKind): {
  w: string
  h: string
} {
  if (kind === "pcs" || kind === "tms") return { w: "34px", h: "25px" }
  if (kind === "bms" || kind === "other") return { w: "28px", h: "25px" }
  return { w: "25px", h: "25px" }
}

function DeviceTreeLeafIcon({ kind }: { kind: DeviceTreeLeafKind }) {
  const { w, h } =
    kind === "pcs" || kind === "tms"
      ? { w: 34, h: 25 }
      : kind === "bms" || kind === "other"
        ? { w: 28, h: 25 }
        : kind === "counter"
          ? { w: 24, h: 24 }
      : { w: 22, h: 22 }
  const iconProps = {
    width: w,
    height: h,
    "aria-hidden": true,
    focusable: false,
    style: { display: "block" } as const,
  }

  switch (kind) {
    case "counter":
      return <CounterLeafIcon {...iconProps} />
    case "counter_pcs":
    case "inverter":
    case "pcs":
      return <PcsLeafIcon {...iconProps} />
    case "bms":
      return <BmsLeafIcon {...iconProps} />
    case "tms":
      return <TmsLeafIcon {...iconProps} />
    case "cell":
      return <CellLeafIcon {...iconProps} />
    case "other":
      return <OtherLeafIcon {...iconProps} />
  }
}

/** Best-effort device category from lowercase name text; extend once backend exposes class ids. */
export function inferDeviceTreeLeafKind(device: {
  name?: string | null
  device_id?: number
}): DeviceTreeLeafKind {
  const n = (device.name ?? "").toLowerCase()

  if (
    device.device_id !== undefined &&
    isSesInverterSlotDeviceId(device.device_id)
  ) {
    return "pcs"
  }

  // PCS metering variants share a dedicated preset.
  if (/лічильник.*пкс|pks\s*meter|meter\s*pks/i.test(n)) return "counter_pcs"

  if (
    /лічильник|ліч|counter|meter|energy\s*meter|енергомір|licznik|zähler|zaehler/i.test(
      n,
    )
  )
    return "counter"

  if (/інвер(тор|тер|ер)|inverter|falownik|wechselrichter/i.test(n))
    return "inverter"
  if (/bms/i.test(n)) return "bms"
  if (/пкс|pcs/i.test(n)) return "pcs"
  if (/тмс|tms/i.test(n)) return "tms"
  if (/селл|cell/i.test(n)) return "cell"

  // Generic ESS/UZE terms often map to BMS-ish bucket visually
  if (/узе|ess|battery|акум|акумулятор/i.test(n)) return "bms"

  return "other"
}

export function deviceTreeLeafPreset(kind: DeviceTreeLeafKind): {
  icon: ReactNode
  bgColor: string
  selectedBorderColor: string
} {
  const icon = <DeviceTreeLeafIcon kind={kind} />
  const B = DEVICE_TREE_PAGE_UI.leaf.selectedBorderByKind
  const bgColor = DEVICE_TREE_PAGE_UI.leaf.bgByKind[kind]
  switch (kind) {
    case "counter":
      return {
        icon,
        bgColor,
        selectedBorderColor: B.counter,
      }
    case "counter_pcs":
      return {
        icon,
        bgColor,
        selectedBorderColor: B.counter_pcs,
      }
    case "inverter":
      return {
        icon,
        bgColor,
        selectedBorderColor: B.inverter,
      }
    case "pcs":
      return {
        icon,
        bgColor,
        selectedBorderColor: B.pcs,
      }
    case "bms":
      return {
        icon,
        bgColor,
        selectedBorderColor: B.bms,
      }
    case "tms":
      return {
        icon,
        bgColor,
        selectedBorderColor: B.tms,
      }
    case "cell":
      return {
        icon,
        bgColor,
        selectedBorderColor: B.cell,
      }
    case "other":
      return {
        icon,
        bgColor,
        selectedBorderColor: B.other,
      }
  }
}

export default DeviceTreeListItem
