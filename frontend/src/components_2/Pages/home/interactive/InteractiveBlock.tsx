/**
 * Card shell for individual nodes inside the animated energy schematic.
 * Applies accent-derived borders, icon coloring, glow, and live telemetry text.
 */

import { Box, Flex, Text } from "@chakra-ui/react"
import type { FC } from "react"
import { memo } from "react"

export interface BaseIconProps {
  width?: string | number
  height?: string | number
  color?: string
  isActive?: boolean
  soc?: number
  isCharging?: boolean
}

export interface InteractiveBlockProps {
  icon: FC<BaseIconProps>
  title: string
  value: string
  unit?: string
  /** Resolved CSS color string for the active state (from trend palette). Inactive blocks use the inactive token. */
  accentColor: string
  isActive: boolean
  soc?: number
  isCharging?: boolean
  iconBoxSize?: string
}

/** Append hex8 alpha (`80` = 50%) to an `#rrggbb` color for the glow shadow. */
function withAlpha50(color: string): string {
  if (typeof color === "string" && /^#[0-9a-fA-F]{6}$/.test(color)) {
    return `${color}80`
  }
  return color
}

export const InteractiveBlock = memo(
  ({
    icon: IconComponent,
    title,
    value,
    unit = "",
    accentColor,
    isActive,
    soc,
    isCharging,
    iconBoxSize = "1.875rem",
  }: InteractiveBlockProps) => {
    const glowShadow = isActive
      ? `0 0 0.875rem ${withAlpha50(accentColor)}`
      : "none"

    return (
      <Flex
        direction="column"
        align="center"
        justify="center"
        position="absolute"
        top={0}
        left={0}
        w="90px"
        h="90px"
        py="0.25rem"
        gap="0.25rem"
        rounded="0.625rem"
        bg="ui.NavbarComponent.background"
        borderWidth="1px"
        borderColor={accentColor}
        boxShadow={glowShadow}
        transition="all 0.25s ease"
        opacity={isActive ? 1 : 0.55}
        filter={isActive ? "none" : "grayscale(1)"}
        zIndex={2}
        overflow="hidden"
      >
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          color={accentColor}
          minH="2rem"
        >
          <IconComponent
            width={iconBoxSize}
            height={iconBoxSize}
            color={accentColor}
            isActive={isActive}
            soc={soc}
            isCharging={isCharging}
          />
        </Box>

        <Text
          fontSize="0.6875rem"
          fontWeight="medium"
          color="ui.NavbarComponent.text"
          textAlign="center"
          lineHeight="1.1"
          w="full"
          px="0.125rem"
        >
          {title}
        </Text>

        <Text
          fontSize="0.6875rem"
          fontWeight="normal"
          color={accentColor}
          textAlign="center"
          lineHeight="1.1"
          w="full"
          px="0.125rem"
          whiteSpace="nowrap"
        >
          {unit ? `${value} ${unit}` : value}
        </Text>
      </Flex>
    )
  },
)

InteractiveBlock.displayName = "InteractiveBlock"
