/**
 * Expandable tree row: status dot, title stack, standard chevron toggle, branch connector UI.
 * Chevron is a plain lucide icon on a transparent hit target (no IconButton surface).
 */

import { Box, chakra, Flex, Text } from "@chakra-ui/react"
import { ChevronDown } from "lucide-react"

import { DEVICE_TREE_PAGE_UI } from "@/components_2/Pages/device/deviceTreePageUi"

const CHEVRON_PX = 24
const TOGGLE_HIT = { minW: "28px", w: "28px", h: "28px" } as const

export type DeviceTreeDisclosureItemProps = {
  title: string
  subtitle?: string | null
  selected?: boolean
  expanded?: boolean
  hasChildren?: boolean
  /** Card-only presentation for roots without children: no hover or click, behaves like a section header. */
  presentationOnly?: boolean
  onSelect?: () => void
  onToggleExpanded?: () => void
}

export function DeviceTreeDisclosureItem({
  title,
  subtitle,
  selected = false,
  expanded = false,
  hasChildren = false,
  presentationOnly = false,
  onSelect,
  onToggleExpanded,
}: DeviceTreeDisclosureItemProps) {
  const D = DEVICE_TREE_PAGE_UI.disclosure
  const borderW = `${DEVICE_TREE_PAGE_UI.connector.trunkStrokeUniformPx}px`
  const T = DEVICE_TREE_PAGE_UI.disclosure.toggle

  return (
    <Box
      bg={D.bg}
      borderRadius={D.borderRadius}
      p={D.padding}
      w="100%"
      cursor={presentationOnly ? "default" : "pointer"}
      userSelect="none"
      onClick={presentationOnly ? undefined : onSelect}
      borderWidth={borderW}
      borderStyle="solid"
      borderColor="transparent"
      {...(presentationOnly ? {} : { _hover: { filter: D.hoverFilter } })}
      {...(selected && !presentationOnly ? { borderColor: D.borderSelected } : undefined)}
    >
      <Flex align="center" gap="16px" w="100%">
        <Flex direction="column" gap="4px" flex="1 1 auto" minW={0}>
          <Flex align="center" gap="16px" w="100%">
            <Text
              color="ui.DeviceTree.titleText"
              fontSize="18px"
              fontWeight={700}
              lineHeight="normal"
              lineClamp={1}
              flex="1 1 auto"
              minW={0}
            >
              {title}
            </Text>
          </Flex>

          {subtitle ? (
            <Flex align="center" pl="0">
              <Text
                color={D.subtitle}
                fontSize="12px"
                fontWeight={400}
                lineHeight="normal"
                textAlign="center"
                whiteSpace="nowrap"
                overflow="hidden"
                textOverflow="ellipsis"
              >
                {subtitle}
              </Text>
            </Flex>
          ) : null}
        </Flex>

        {hasChildren ? (
          <chakra.button
            type="button"
            aria-label={expanded ? "Collapse" : "Expand"}
            aria-expanded={expanded}
            {...TOGGLE_HIT}
            flexShrink={0}
            display="flex"
            alignItems="center"
            justifyContent="center"
            p={0}
            m={0}
            border="none"
            borderRadius="6px"
            bg="transparent"
            color="ui.DeviceTree.titleText"
            opacity={T.opacityIdle}
            cursor="pointer"
            lineHeight={0}
            _hover={{ opacity: T.opacityHover }}
            _focusVisible={{
              outline: T.focusOutline,
              outlineColor: T.focusOutlineColor,
              outlineOffset: T.focusOutlineOffset,
            }}
            onClick={(e) => {
              e.stopPropagation()
              onToggleExpanded?.()
            }}
          >
            <ChevronDown
              size={CHEVRON_PX}
              strokeWidth={2}
              aria-hidden
              style={{
                transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                transformOrigin: "center",
                transition: T.chevronTransition,
              }}
            />
          </chakra.button>
        ) : null}
      </Flex>
    </Box>
  )
}

export default DeviceTreeDisclosureItem
