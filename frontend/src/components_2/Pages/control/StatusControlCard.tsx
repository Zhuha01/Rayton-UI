/**
 * Status Control Card within the Rayton operator UI (components_2/Pages/control/StatusControlCard.tsx).
 * Built with Chakra UI and shared theme tokens to stay consistent with dashboards, management, and control surfaces.
 * Primary contract: exported component props and functions below (see TypeScript types for required fields).
 */
import { Box, Flex, Text, useToken } from "@chakra-ui/react"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { plcControlUi } from "./controlUi"
import type { PlcControlRow } from "./PLCControlView"

const STATUS_GRADIENT_COLOR_TOKENS = [
  "ui.PlcControl.statusGradientFrom",
  "ui.PlcControl.statusGradientMid",
  "ui.PlcControl.statusGradientTo",
] as const

export function StatusControlCard({
  rows,
  activeModeLabel,
}: {
  rows: PlcControlRow[]
  activeModeLabel?: string
}) {
  const { t } = useTranslation("control")
  const [gradientFrom, gradientMid, gradientTo] = useToken(
    "colors",
    [...STATUS_GRADIENT_COLOR_TOKENS],
  )

  const statusGradientBackground = useMemo(
    () =>
      `linear-gradient(90deg, ${gradientFrom} ${plcControlUi.statusCard.gradientStop1Pct}, ${gradientMid} ${plcControlUi.statusCard.gradientStop2Pct}, ${gradientTo} ${plcControlUi.statusCard.gradientStop3Pct})`,
    [gradientFrom, gradientMid, gradientTo],
  )

  if (rows.length === 0) return null

  const getDisplayText = (row: PlcControlRow) => {
    if (
      row.textlist_entries &&
      row.data !== null &&
      row.data !== undefined &&
      row.textlist_entries[row.data.toString()]
    ) {
      return row.textlist_entries[row.data.toString()]
    }

    if (row.data !== null && row.data !== undefined) return row.data.toString()

    return "N/A"
  }

  // statusData from PLCControl: control_type 2 | 3, sorted as [3, 2].
  const modeStatusRow = rows.find((r) => r.control_type === 3) ?? rows[0]
  const phaseRow = rows.find((r) => r.control_type === 2) ?? rows[1] ?? rows[0]

  return (
    <Box
      position="relative"
      overflow="hidden"
      bg={plcControlUi.statusCard.bg}
      minH={plcControlUi.statusCard.minHeight}
      h={{ base: "auto", md: plcControlUi.statusCard.desktopHeight }}
      borderRadius={plcControlUi.statusCard.radius}
      boxShadow={plcControlUi.statusCard.shadow}
    >
      <Box
        position="absolute"
        left="0"
        top="0"
        zIndex={0}
        h="100%"
        w="50%"
        maxW="441px"
        pointerEvents="none"
        style={{ background: statusGradientBackground }}
      />
      <Box
        position="absolute"
        left="0"
        top="0"
        zIndex={1}
        h="100%"
        w={plcControlUi.statusCard.accentBarWidth}
        bg={plcControlUi.statusCard.accentBarBg}
        borderTopLeftRadius={plcControlUi.statusCard.radius}
        borderBottomLeftRadius={plcControlUi.statusCard.radius}
      />

      <Flex
        position="relative"
        zIndex={2}
        w="100%"
        minH="100%"
        px={{
          base: plcControlUi.statusCard.contentPaddingXMobile,
          md: plcControlUi.statusCard.contentPaddingX,
        }}
        pt={plcControlUi.statusCard.contentPaddingTop}
        pb={plcControlUi.statusCard.contentPaddingBottom}
        align={{ base: "flex-start", md: "center" }}
        justify="space-between"
        gap={plcControlUi.layout.rowGap}
        flexDir={{ base: "column", md: "row" }}
      >
        <Flex direction="column" justify="center" w="100%" minW="0" flex="1">
          <Text
            fontWeight="bold"
            fontSize={plcControlUi.statusCard.captionFontSize}
            color={plcControlUi.statusCard.captionColor}
            whiteSpace="nowrap"
            overflow="hidden"
            textOverflow="ellipsis"
            lineClamp={1}
          >
            {t("statusCard.currentModeCaption")}
          </Text>
          <Text
            fontWeight="bold"
            fontSize={plcControlUi.statusCard.titleFontSize}
            color={plcControlUi.statusCard.titleColor}
            whiteSpace="nowrap"
            overflow="hidden"
            textOverflow="ellipsis"
            lineClamp={1}
          >
            {activeModeLabel || getDisplayText(modeStatusRow)}
          </Text>
        </Flex>

        <Box
          bg={plcControlUi.statusCard.badgeBg}
          px={plcControlUi.statusCard.badgePx}
          py={plcControlUi.statusCard.badgePy}
          borderRadius="full"
          flexShrink={0}
          alignSelf={{ base: "flex-start", md: "center" }}
        >
          <Text
            fontWeight="bold"
            fontSize={plcControlUi.statusCard.badgeFontSize}
            color={plcControlUi.statusCard.badgeTextColor}
            whiteSpace="nowrap"
          >
            {getDisplayText(phaseRow)}
          </Text>
        </Box>
      </Flex>
    </Box>
  )
}

