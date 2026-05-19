import { useLocation, useParams, useSearch } from "@tanstack/react-router"

import { usePlant } from "@/hooks/usePlantQueries"

export interface NavItem {
  label: string
  to: string
  tabKey: string | null
  /**
   * The ?tab= value used by PlantTabRedirect when landing on /plant/$plantId.
   * null for Home (no tab needed) and Settings (doesn't redirect to plant).
   * Exposed so NavButton can skip the intermediate route and navigate directly.
   */
  routeTab: string | null
  isActive: boolean
}

interface TabConfig {
  schedule?: string
  ess?: string
  smartlogger?: string
  plccontrol?: string
  settings?: string
  [key: string]: string | undefined
}

interface NavItemConfig {
  label: string
  to: string
  tabKey: string | null
  routeTab: string | null
}

const ALL_NAV_ITEMS: NavItemConfig[] = [
  { label: "home", to: "/", tabKey: null, routeTab: null },
  {
    label: "schedule",
    to: "/schedule",
    tabKey: "schedule",
    routeTab: "schedule",
  },
  { label: "ses", to: "/ses", tabKey: "smartlogger", routeTab: "smdata" },
  { label: "storage", to: "/uze", tabKey: "ess", routeTab: "essdata" },
  {
    label: "management",
    to: "/control",
    tabKey: "plccontrol",
    routeTab: "control",
  },
  // Station settings tab (DashboardTabs -> tab="settings"). User settings live at /settings.
  {
    label: "settings",
    to: "/plant-settings",
    tabKey: "settings",
    routeTab: "settings",
  },
]

// All ?tab= values used by PlantTabRedirect — to detect whether a plant page is on
// the default (Home) view vs. a specific functional section.
const PLANT_ROUTE_TABS = new Set(
  ALL_NAV_ITEMS.filter((i) => i.routeTab !== null).map(
    (i) => i.routeTab as string,
  ),
)

export function useNavItems() {
  const { pathname } = useLocation()

  const pathParams = useParams({ strict: false }) as Record<
    string,
    string | undefined
  >
  const searchParams = useSearch({ strict: false }) as {
    plantId?: number
    tab?: string
  }

  const currentPlantId: number | null =
    pathParams.plantId != null
      ? Number(pathParams.plantId)
      : (searchParams.plantId ?? null)

  // ?tab= value set by PlantTabRedirect after landing on /plant/$plantId.
  const currentTab = searchParams.tab ?? null

  const isOnPlantPage = pathname.startsWith("/plant/")

  const { data: plantData, isLoading } = usePlant(currentPlantId)

  let tabConfig: TabConfig = {}
  if (plantData?.tab_config) {
    try {
      tabConfig = JSON.parse(plantData.tab_config)
    } catch (e) {
      console.error("Error parsing tab_config:", e)
    }
  }

  const isTabVisible = (key: string): boolean => tabConfig[key] !== "none"

  const navItems: NavItem[] = ALL_NAV_ITEMS.filter(
    (item) => item.tabKey === null || isTabVisible(item.tabKey),
  ).map((item) => ({
    ...item,
    isActive: (() => {
      if (item.to === "/") {
        // Головна: only active when a plant is already selected.
        // On the root path, require plantId in the URL (not just any visit to "/").
        // On a plant page, active only when no known functional tab is open.
        return (
          (pathname === "/" && currentPlantId != null) ||
          (isOnPlantPage && !PLANT_ROUTE_TABS.has(currentTab ?? ""))
        )
      }

      if (item.routeTab !== null) {
        // Tab-based routes (Розклад, СЕС, УЗЕ, Керування).
        // After PlantTabRedirect they all land on /plant/$plantId?tab=<routeTab>.
        // Also active during the brief transitional render on /schedule etc.
        return (
          (isOnPlantPage && currentTab === item.routeTab) ||
          pathname.startsWith(item.to)
        )
      }

      // Direct routes that stay on their own path (Налаштування → /settings).
      return pathname.startsWith(item.to)
    })(),
  }))

  return { navItems, isLoading, currentPlantId }
}
