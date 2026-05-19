/**
 * Expandable management list card: shared header, divider, and expandable body.
 * Each instance keeps its own open state so multiple cards can stay expanded independently.
 */

import {
  Box,
  Button,
  chakra,
  Flex,
  Text,
  type ButtonProps,
} from "@chakra-ui/react"
import { type ReactNode, useCallback, useState } from "react"
import { ManagementCardStrToggleIcon } from "./ManagementCardSvgs"

const HEADER_MIN_HEIGHT = "90px"
const CARD_RADIUS = "8px"
const DIVIDER_INLINE_MARGIN = "16px"
const TRANSITION_GRID = "grid-template-rows 0.25s ease"

export interface ManagementCardShellProps {
  leading: ReactNode
  title: string
  /** Optional row below title (e.g. role badge). */
  badge?: ReactNode
  children: ReactNode
  /** Idle token for the leading icon (before hover / when collapsed). */
  leadingIconIdleColor?: string
  /** Idle token for the expand toggle glyph. */
  toggleIconIdleColor?: string
}

export function ManagementCardShell({
  leading,
  title,
  badge,
  children,
  leadingIconIdleColor = "ui.ManagementCard.labelMuted",
  toggleIconIdleColor = "ui.ManagementCard.labelMuted",
}: ManagementCardShellProps) {
  const [expanded, setExpanded] = useState(false)
  const [hover, setHover] = useState(false)
  const toggle = useCallback(() => {
    setExpanded((v) => !v)
  }, [])

  const cardBg =
    !expanded && hover
      ? "ui.ManagementCard.bgHover"
      : "ui.ManagementCard.bgIdle"

  const leadingColor = leadingIconIdleColor

  const toggleColor =
    !expanded && hover
      ? "ui.ManagementCard.toggleHoverText"
      : toggleIconIdleColor

  return (
    <Box
      bg={cardBg}
      borderRadius={CARD_RADIUS}
      overflow="visible"
      w="full"
      transition="background 0.2s ease"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <chakra.button
        type="button"
        display="flex"
        w="full"
        minH={HEADER_MIN_HEIGHT}
        px="20px"
        py="12px"
        alignItems="center"
        gap="16px"
        cursor="pointer"
        border="none"
        bg="transparent"
        borderTopRadius={CARD_RADIUS}
        borderBottomRadius={expanded ? 0 : CARD_RADIUS}
        onClick={toggle}
        aria-expanded={expanded}
        textAlign="left"
        overflow="visible"
      >
        <Box flexShrink={0} color={leadingColor}>
          {leading}
        </Box>
        <Flex direction="column" flex="1" minW={0} gap="8px">
          <Text
            fontSize="16px"
            fontWeight="bold"
            color="ui.ManagementCard.titleText"
            lineClamp={2}
          >
            {title}
          </Text>
          {badge}
        </Flex>
        <Box color={toggleColor} transition="color 0.2s ease">
          <ManagementCardStrToggleIcon expanded={expanded} />
        </Box>
      </chakra.button>

      <Box
        display="grid"
        gridTemplateRows={expanded ? "1fr" : "0fr"}
        transition={TRANSITION_GRID}
        overflow="hidden"
        borderBottomRadius={CARD_RADIUS}
      >
        <Box minH={0} overflow="hidden">
          <Box
            as="hr"
            role="separator"
            h="1px"
            border="none"
            bg="ui.ManagementCard.divider"
            mx={DIVIDER_INLINE_MARGIN}
            w="auto"
            flexShrink={0}
          />
          <Box px="20px" pt="8px" pb="16px">
            {children}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export function managementCardLabelProps() {
  return {
    fontSize: "12px",
    fontWeight: "semibold",
    color: "ui.ManagementCard.labelMuted",
  } as const
}

export function ManagementCardOutlinedButton(props: ButtonProps) {
  return (
    <Button
      variant="plain"
      fontSize="14px"
      fontWeight="regular"
      borderRadius="8px"
      px="16px"
      py="8px"
      h="auto"
      lineHeight="1"
      minW="auto"
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      {...props}
    />
  )
}

type ChakraColor = string | { base?: string; _light?: string; _dark?: string }

export function ManagementCardDetailRow({
  label,
  value,
  valueColor,
}: {
  label: string
  value: ReactNode
  valueColor?: ChakraColor
}) {
  return (
    <Flex direction="column" gap="4px" align="flex-start">
      <Text {...managementCardLabelProps()}>{label}</Text>
      <Text
        fontSize="16px"
        fontWeight="bold"
        color={valueColor ?? "ui.ManagementCard.valueText"}
      >
        {value}
      </Text>
    </Flex>
  )
}
