/**
 * Compact telemetry summary tile with adaptive density, SOC-aware icons, and status chip.
 * Used by the dashboard home grid for solar, grids, ESS, and facility KPIs.
 */

import { Box, Flex, Text } from "@chakra-ui/react"
import type { FC } from "react"
import { memo } from "react"
import { useTranslation } from "react-i18next"
import type { BaseIconProps } from "../interactive/InteractiveBlock"

export type CardStatus =
  | "active"
  | "inactive"
  | "charging"
  | "discharging"
  | "idle"
export type StatusCardDensity = "compact" | "slim"

const getDensityTokens = (density: StatusCardDensity) => ({
  p: "0.5rem",
  headerGap: "0.375rem",
  icon: density === "compact" ? "1.5rem" : "1.125rem",
  titleFs: density === "compact" ? "0.875rem" : "0.75rem",
  valueFs: density === "compact" ? "1.125rem" : "0.875rem",
  footerFs: density === "compact" ? "0.6875rem" : "0.5rem",
  badgeFs: density === "compact" ? "0.6875rem" : "0.5625rem",
})

interface StatusBadgeProps {
  status: CardStatus
  fontSize: string
}

function StatusBadge({ status, fontSize }: StatusBadgeProps) {
  const { t } = useTranslation("Interactive")
  let bg: string
  let color = "rayton_neutral.150"
  switch (status) {
    case "active":
      bg = "rayton_green.950"
      break
    case "charging":
      bg = "trends.ESS_CHARGE_TOTAL/58"
      break
    case "discharging":
      bg = "trends.ESS_DISCHARGE_TOTAL/58"
      break
    default:
      bg = "border.normal/40"
      color = "rayton_neutral.250"
      break
  }

  return (
    <Box
      bg={bg}
      px="0.25rem"
      py="0.125rem"
      rounded="0.25rem"
      flexShrink={0}
      lineHeight={1}
    >
      <Text
        fontSize={fontSize}
        fontWeight="600"
        color={color}
        whiteSpace="nowrap"
      >
        {t(`status.${status}`)}
      </Text>
    </Box>
  )
}

export interface StatusCardProps {
  icon: FC<BaseIconProps>
  title: string
  value: string
  unit: string
  status: CardStatus
  footerLabel: string
  footerValue: string
  footerUnit: string
  accentColor: string
  soc?: number
  isCharging?: boolean
  density?: StatusCardDensity
  hideFooter?: boolean
}

export const StatusCard = memo(
  ({
    icon: IconComponent,
    title,
    value,
    unit,
    status,
    footerLabel,
    footerValue,
    footerUnit,
    accentColor,
    soc,
    isCharging,
    density = "compact",
    hideFooter = false,
  }: StatusCardProps) => {
    const t = getDensityTokens(density)

    return (
      <Flex
        direction="column"
        flex={1}
        h={{ base: "auto", md: "100%" }}
        bg="ui.NavbarComponent.background"
        borderWidth="1px"
        borderColor="ui.Chart.cardFrameBorder"
        rounded="0.75rem"
        p={t.p}
        minW="147px"
        minH={0}
        overflow="hidden"
        justifyContent={{ base: "flex-start", md: "space-between" }}
        gap={{ base: "0.5rem", md: "0" }}
      >
        <Flex align="center" gap={t.headerGap} w="100%" flexShrink={0}>
          <Box
            display="flex"
            alignItems="center"
            color={accentColor}
            flexShrink={0}
          >
            <IconComponent
              width={t.icon}
              height={t.icon}
              color={accentColor}
              isActive={false}
              soc={soc}
              isCharging={isCharging}
            />
          </Box>
          <Text
            fontSize={t.titleFs}
            fontWeight="400"
            color="ui.NavbarComponent.text"
            opacity={0.65}
            lineHeight={1.1}
            flex="1"
            truncate
          >
            {title}
          </Text>
          <StatusBadge status={status} fontSize={t.badgeFs} />
        </Flex>

        <Flex
          align="center"
          flex={{ base: "none", md: 1 }}
          py={{ base: "0.125rem", md: "0" }}
        >
          <Text
            fontSize={t.valueFs}
            fontWeight="600"
            color="ui.NavbarComponent.text"
            lineHeight={1}
          >
            {value}{" "}
            <Text as="span" fontSize="0.8em" fontWeight="400">
              {unit}
            </Text>
          </Text>
        </Flex>

        <Text
          fontSize={t.footerFs}
          fontWeight="600"
          color="ui.NavbarComponent.text"
          opacity={0.55}
          truncate
          flexShrink={0}
          visibility={hideFooter ? "hidden" : "visible"}
        >
          {footerLabel}: {footerValue} {footerUnit}
        </Text>
      </Flex>
    )
  },
)

StatusCard.displayName = "StatusCard"
