/**
 * Primary navigation shell: desktop column and mobile drawer with plant list.
 * Search and routes use sidebar semantic tokens.
 */

import { Box, Flex, useBreakpointValue } from "@chakra-ui/react"
import { useLocation } from "@tanstack/react-router"
import { useCallback } from "react"

import {
  DrawerBackdrop,
  DrawerBody,
  DrawerContent,
  DrawerRoot,
} from "@/components_2/ui/Drawer"

import SidebarItems from "../../components_2/Sidebar/SidebarItems"

/**
 * Drawer offsets/heights intentionally mirror the Navbar heights.
 * This keeps the drawer aligned when the mobile Navbar changes height depending on the active route.
 */

interface SidebarProps {
  mobileDrawerOpen: boolean
  onMobileDrawerClose: () => void
  onDesktopSidebarClose: () => void
  isDesktopSidebarOpen: boolean
}

const Sidebar = ({
  mobileDrawerOpen,
  onMobileDrawerClose,
  onDesktopSidebarClose,
  isDesktopSidebarOpen,
}: SidebarProps) => {
  const { pathname } = useLocation()
  const isPlantPath = /(^|\/)plant(\/|$)/.test(pathname)

  const isDesktop =
    useBreakpointValue({ base: false, lg: true }, { ssr: false }) ?? false

  const baseNavbarHeight = isPlantPath ? "116px" : "60px"

  const drawerNavbarOffsetMt = {
    base: baseNavbarHeight,
    md: "80px",
    lg: "80px",
  } as const

  const drawerPanelHeight = {
    base: `calc(100vh - ${baseNavbarHeight})`,
    md: "calc(100vh - 80px)",
    lg: "calc(100vh - 80px)",
  } as const

  const handleOpenChange = useCallback(
    (e: { open: boolean }) => {
      if (!e.open) {
        if (isDesktop) onDesktopSidebarClose()
        else onMobileDrawerClose()
      }
    },
    [isDesktop, onDesktopSidebarClose, onMobileDrawerClose],
  )

  if (isDesktop) {
    return (
      <Box
        flexShrink={0}
        w={isDesktopSidebarOpen ? "240px" : "0"}
        overflow="hidden"
        bg="ui.Sidebar.background"
        transitionDuration={isDesktopSidebarOpen ? "slowest" : "slower"}
        transitionTimingFunction="ease-in-smooth"
        css={{
          transitionProperty: "width",
        }}
        aria-label="Sidebar"
      >
        <Box
          className="sidebar-scrollbar"
          pt="24px"
          pb="24px"
          overflowY="auto"
          overflowX="hidden"
          h="100%"
        >
          <Flex flexDir="column" w="100%" alignItems="stretch" gap="16px">
            <SidebarItems onItemClick={onMobileDrawerClose} />
          </Flex>
        </Box>
      </Box>
    )
  }

  return (
    <DrawerRoot
      placement="start"
      open={mobileDrawerOpen}
      onOpenChange={handleOpenChange}
      lazyMount={false}
      preventScroll={false}
    >
      {mobileDrawerOpen && (
        <DrawerBackdrop
          mt={drawerNavbarOffsetMt}
          h={drawerPanelHeight}
          w="100vw"
          maxW="100vw"
          left={0}
          bg="ui.Overlay.backdrop"
        />
      )}

      <DrawerContent
        maxW="240px"
        bg="ui.Sidebar.background"
        mt={drawerNavbarOffsetMt}
        height={drawerPanelHeight}
        boxShadow="none"
        portalled
        transitionProperty="transform"
        transitionDuration={mobileDrawerOpen ? "slowest" : "slower"}
        transitionTimingFunction="ease-in-smooth"
      >
        <DrawerBody
          className="sidebar-scrollbar"
          p={0}
          pt="24px"
          pb="24px"
          bg="ui.Sidebar.background"
          overflowY="auto"
          overflowX="hidden"
          transitionProperty="transform"
          transitionDuration={mobileDrawerOpen ? "slowest" : "slower"}
          transitionTimingFunction="ease-in-smooth"
        >
          <Flex flexDir="column" w="100%" alignItems="stretch" gap="16px">
            <SidebarItems onItemClick={onMobileDrawerClose} />
          </Flex>
        </DrawerBody>
      </DrawerContent>
    </DrawerRoot>
  )
}

export default Sidebar
