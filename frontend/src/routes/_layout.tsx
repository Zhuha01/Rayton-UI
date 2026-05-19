/**
 * Authenticated shell layout: sidebar, navbar, tenant/plant resolution, and loading gate around nested routes.
 * Uses TanStack Router `beforeLoad` plus React Query to hydrate the workspace before rendering children.
 */

import {
  Box,
  Container,
  Flex,
  Spinner,
  Text,
  useBreakpointValue,
} from "@chakra-ui/react"
import { useQuery } from "@tanstack/react-query"
import {
  createFileRoute,
  Outlet,
  redirect,
  useLocation,
} from "@tanstack/react-router"
import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react"

import Navbar from "@/components_2/Header/Navbar"
import Sidebar from "@/components_2/Sidebar/Sidebar"
import { resolveInitialTenantAndPlant } from "@/initialSelection"
import { isLoggedIn } from "@/hooks/useAuth"

export const Route = createFileRoute("/_layout")({
  component: Layout,
  beforeLoad: async ({ location }) => {
    const publicAuthPaths = new Set([
      "/login",
      "/recover-password",
      "/reset-password",
    ])
    if (publicAuthPaths.has(location.pathname)) {
      return
    }

    if (!isLoggedIn()) {
      throw redirect({
        to: "/login",
      })
    }
  },
})

const LayoutOutlet = memo(function LayoutOutlet() {
  return <Outlet />
})

function Layout() {
  const { pathname, search } = useLocation()
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true)
  const authPagePaths = new Set([
    "/login",
    "/recover-password",
    "/reset-password",
  ])
  const mainScrollRef = useRef<HTMLDivElement | null>(null)

  const shouldResolvePlants = !authPagePaths.has(pathname) && isLoggedIn()
  const {
    data: selection,
    isLoading: isLoadingSelection,
    isError: isSelectionError,
  } = useQuery({
    queryKey: ["initialSelection", "tenantPlant"],
    queryFn: resolveInitialTenantAndPlant,
    enabled: shouldResolvePlants,
    staleTime: 60 * 60 * 1000,
  })

  const isDesktop =
    useBreakpointValue({ base: false, lg: true }, { ssr: false }) ?? false

  useEffect(() => {
    if (!isDesktop) setIsDesktopSidebarOpen(false)
  }, [isDesktop])

  const handleMenuClick = useCallback(() => {
    if (isDesktop) {
      setIsDesktopSidebarOpen((v) => !v)
    } else {
      setMobileDrawerOpen(true)
    }
  }, [isDesktop])

  /**
   * Reset the main scroll container when the route changes.
   * Some mobile browsers (notably iOS Chrome) may need a few frames plus a short timeout for late layout/height changes.
   */
  useLayoutEffect(() => {
    if (authPagePaths.has(pathname)) return

    const snapScrollTop = () => {
      const el = mainScrollRef.current
      if (el) {
        el.scrollTop = 0
        el.scrollLeft = 0
      }
      window.scrollTo(0, 0)
    }

    snapScrollTop()
    const rafOuter = requestAnimationFrame(() => {
      snapScrollTop()
      requestAnimationFrame(snapScrollTop)
    })
    const t = window.setTimeout(snapScrollTop, 50)

    return () => {
      cancelAnimationFrame(rafOuter)
      window.clearTimeout(t)
    }
  }, [pathname, authPagePaths.has])

  if (authPagePaths.has(pathname)) {
    return <Outlet />
  }

  if (isLoadingSelection) {
    return (
      <Container py={8} centerContent>
        <Spinner size="xl" color="ui.Interactive.accent" />
      </Container>
    )
  }

  if (!isSelectionError) {
    if (selection?.kind === "noTenants") {
      return (
        <Container py={8} centerContent>
          <Text>No tenants available</Text>
        </Container>
      )
    }
    if (selection?.kind === "noPlants") {
      return (
        <Container py={8} centerContent>
          <Text>No plants available</Text>
        </Container>
      )
    }
  }

  return (
    <Flex
      direction="column"
      minH="100vh"
      h="100dvh"
      bg="ui.NavbarComponent.background"
    >
      <Navbar onMenuClick={handleMenuClick} />
      <Flex
        flex="1"
        minH={0}
        overflow="hidden"
        bg="ui.NavbarComponent.background"
        position="relative"
      >
        <Sidebar
          mobileDrawerOpen={mobileDrawerOpen}
          onMobileDrawerClose={() => setMobileDrawerOpen(false)}
          onDesktopSidebarClose={() => setIsDesktopSidebarOpen(false)}
          isDesktopSidebarOpen={isDesktopSidebarOpen}
        />
        <Flex
          ref={mainScrollRef}
          className="app-scrollbar"
          flex="1"
          minH={0}
          direction="column"
          overflowY="auto"
          bg="ui.NavbarComponent.background"
          data-scroll-restoration-id="layout-main"
          css={{
            overflowAnchor: "none",
            overscrollBehaviorY: "contain",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <LayoutOutlet />
        </Flex>
      </Flex>
    </Flex>
  )
}

export default Layout
