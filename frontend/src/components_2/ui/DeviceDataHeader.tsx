/**
 * Dark-themed header strip for paired device telemetry panes listing title and last update text.
 * Formats timestamps in day-first local style aligned with dashboard device views.
 */

import { Box, Flex, Text } from "@chakra-ui/react"
import { useTranslation } from "react-i18next"

import { DEVICE_TREE_PAGE_UI } from "@/components_2/Pages/device/deviceTreePageUi"

export type DeviceDataHeaderProps = {
  title: string
  subtitle?: string | null
  /** Milliseconds or Date value shown in the data-updated subtitle when present. */
  updatedAt?: number | Date | null
  /** Optional i18next namespace for the "last updated" label. */
  i18nNs?: string
}

function formatUpdatedAt(value: number | Date) {
  const d = typeof value === "number" ? new Date(value) : value
  // Format: dd.MM.yyyy, HH:mm (matches Figma sample)
  const pad2 = (n: number) => String(n).padStart(2, "0")
  const dd = pad2(d.getDate())
  const mm = pad2(d.getMonth() + 1)
  const yyyy = d.getFullYear()
  const hh = pad2(d.getHours())
  const min = pad2(d.getMinutes())
  return `${dd}.${mm}.${yyyy}, ${hh}:${min}`
}

export function DeviceDataHeader({
  title,
  subtitle,
  updatedAt,
  i18nNs,
}: DeviceDataHeaderProps) {
  const { t } = useTranslation(i18nNs)
  const formatted = updatedAt != null ? formatUpdatedAt(updatedAt) : null
  const rightText =
    formatted != null
      ? i18nNs
        ? t("common.lastUpdated", { date: formatted })
        : `Дані оновлено: ${formatted}`
      : null
  const borderW = `${DEVICE_TREE_PAGE_UI.connector.trunkStrokeUniformPx}px`
  const D = DEVICE_TREE_PAGE_UI.disclosure

  return (
    <Flex
      bg={D.bg}
      borderRadius={D.borderRadius}
      w="100%"
      align="center"
      justify="space-between"
      overflow="hidden"
      borderWidth={borderW}
      borderStyle="solid"
      borderColor="transparent"
    >
      <Flex direction="column" gap="4px" p={D.padding} minW={0}>
        <Text
          color="ui.DeviceTree.titleText"
          fontSize="18px"
          fontWeight={700}
          lineHeight="normal"
          lineClamp={1}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            color={D.subtitle}
            fontSize="12px"
            fontWeight={400}
            lineHeight="normal"
            lineClamp={1}
          >
            {subtitle}
          </Text>
        ) : (
          <Box h="16px" />
        )}
      </Flex>

      <Flex align="center" p={D.padding} flexShrink={0}>
        {rightText ? (
          <Text
            color="ui.DeviceDataHeader.mutedText"
            fontSize="14px"
            fontWeight={400}
            lineHeight="normal"
            whiteSpace="nowrap"
          >
            {rightText}
          </Text>
        ) : (
          <Box h="16px" />
        )}
      </Flex>
    </Flex>
  )
}

export default DeviceDataHeader
