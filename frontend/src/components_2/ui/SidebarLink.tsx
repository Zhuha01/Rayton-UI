/**
 * Sidebar navigation row that reacts to RouterLink active state with accent treatments.
 * Constrains width to sidebar column sizing and hides focus chrome on the anchor wrapper.
 */

import { Box, Flex, Icon, Text } from "@chakra-ui/react"
import { Link as RouterLink } from "@tanstack/react-router"
import type { ComponentType, SVGProps } from "react"

/** TanStack Router `<Link>` render-prop state (subset used here) */
type LinkRenderState = {
  isActive: boolean
}

export interface SidebarNavItem {
  icon: ComponentType<SVGProps<SVGSVGElement>>
  title: string
  path: string
}

interface SidebarLinkProps {
  item: SidebarNavItem
  onClick?: () => void
}

export function SidebarLink({ item, onClick }: SidebarLinkProps) {
  const { icon, title, path } = item

  return (
    <Box
      w="192px"
      maxW="192px"
      mx="auto"
      css={{
        "& > a": {
          display: "block",
          width: "100%",
          textDecoration: "none",
          border: "none",
          outline: "none",
        },
      }}
    >
      <RouterLink to={path} onClick={onClick}>
        {({ isActive }: LinkRenderState) => (
          <Flex
            align="center"
            gap="8px"
            px="8px"
            py={0}
            w="192px"
            minW="192px"
            maxW="192px"
            h="40px"
            minH="40px"
            maxH="40px"
            boxSizing="border-box"
            fontFamily="body"
            fontSize="14px"
            fontWeight="medium"
            borderTopLeftRadius={0}
            borderBottomLeftRadius={0}
            borderTopRightRadius="12px"
            borderBottomRightRadius="12px"
            borderLeftWidth="2px"
            borderLeftStyle="solid"
            borderLeftColor={
              isActive ? "ui.Sidebar.item_border_active" : "transparent"
            }
            bg={isActive ? "ui.Sidebar.item_bg_active" : "transparent"}
            color={
              isActive
                ? "ui.Sidebar.item_text_active"
                : "ui.Sidebar.item_text_default"
            }
            _hover={
              isActive
                ? {
                    bg: "ui.Sidebar.item_bg_active",
                    color: "ui.Sidebar.item_text_active",
                    borderLeftColor: "ui.Sidebar.item_border_active",
                  }
                : {
                    bg: "ui.Sidebar.item_bg_active",
                    color: "ui.Sidebar.item_text_default",
                    borderLeftColor: "ui.Sidebar.item_border_active",
                  }
            }
            _focusVisible={{ outline: "none", boxShadow: "none" }}
            transition="background-color 120ms ease, color 120ms ease, border-color 120ms ease"
          >
            <Icon
              as={icon}
              boxSize="24px"
              color="currentColor"
              flexShrink={0}
            />
            <Text
              color="currentColor"
              title={title}
              whiteSpace="nowrap"
              overflow="hidden"
              textOverflow="ellipsis"
              minW={0}
            >
              {title}
            </Text>
          </Flex>
        )}
      </RouterLink>
    </Box>
  )
}
