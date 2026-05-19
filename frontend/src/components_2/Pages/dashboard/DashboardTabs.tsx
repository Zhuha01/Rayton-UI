/**
 * Dashboard Tabs within the Rayton operator UI (components_2/Pages/dashboard/DashboardTabs.tsx).
 * Built with Chakra UI and shared theme tokens to stay consistent with dashboards, management, and control surfaces.
 * Primary contract: exported component props and functions below (see TypeScript types for required fields).
 */

import { Box, Spinner, Tabs } from "@chakra-ui/react"
import { useNavigate } from "@tanstack/react-router"
import { useCallback, useEffect, useMemo, useState } from "react"
import type { ApiError, DashboardData } from "@/client"
import EnergyTrendChart from "@/components_2/Pages/dashboard/EnergyTrendChart"
import type { PlantUIConfig } from "@/components_2/Pages/dashboard/dashboardTypes"
import { usePlant } from "@/hooks/usePlantQueries"
import TabRenderer from "./TabRenderer"

interface DashboardTabsProps {
  isLoadingDashboard: boolean
  dashboardData: DashboardData | undefined
  error: ApiError | null
  selectedTenant: string | null
  stationName: string
  energyDataIds: number[]
  socDataId: number
  initialTab?: string
  plantId?: number | string
  plantConfig: PlantUIConfig
}

const DashboardTabs = ({
  isLoadingDashboard,
  dashboardData,
  error,
  selectedTenant,
  stationName,
  energyDataIds,
  socDataId,
  initialTab = "main",
  plantId,
  plantConfig,
}: DashboardTabsProps) => {
  const [activeTab, setActiveTab] = useState(initialTab)

  useEffect(() => {
    setActiveTab(initialTab)
  }, [initialTab])

  const navigate = useNavigate()

  const { data: plantData, isLoading: isPlantLoading } = usePlant(
    plantId ? Number(plantId) : null,
  )

  interface TabConfig {
    schedule?: string
    ess?: string
    smartlogger?: string
    plccontrol?: string
    settings?: string
    [key: string]: string | undefined
  }

  const tabConfig: TabConfig = useMemo(() => {
    if (!plantData?.tab_config) return {}
    try {
      return JSON.parse(plantData.tab_config) as TabConfig
    } catch (e) {
      console.error("Error parsing tab_config:", e)
      return {}
    }
  }, [plantData?.tab_config])

  const isTabVisible = useCallback(
    (tabKey: string): boolean => tabConfig[tabKey] !== "none",
    [tabConfig],
  )

  useEffect(() => {
    navigate({
      to: ".",
      search: (prev: any) => ({
        ...prev,
        tab: activeTab,
      }),
      replace: true,
    })
  }, [activeTab, navigate])

  useEffect(() => {
    if (
      !isPlantLoading &&
      activeTab !== "main" &&
      activeTab !== "settings" &&
      !isTabVisible(activeTab)
    ) {
      const firstVisibleTab = [
        "schedule",
        "smdata",
        "essdata",
        "control",
        "settings",
      ].find((tab) =>
        isTabVisible(
          tab === "smdata"
            ? "smartlogger"
            : tab === "essdata"
              ? "ess"
              : tab === "control"
                ? "plcontrol"
                : tab === "settings"
                  ? "settings"
                  : tab,
        ),
      )

      if (firstVisibleTab) {
        const tabMap: Record<string, string> = {
          smartlogger: "smdata",
          ess: "essdata",
          plccontrol: "control",
          settings: "settings",
        }
        const mappedTab = tabMap[firstVisibleTab] || firstVisibleTab
        setActiveTab(mappedTab)
      } else {
        setActiveTab("main")
      }
    }
  }, [isPlantLoading, activeTab, isTabVisible])

  if (isLoadingDashboard) {
    return (
      <Box display="flex" justifyContent="center" py={10}>
        <Spinner size="xl" color="ui.Interactive.accent" />
      </Box>
    )
  }

  if (!selectedTenant) {
    return (
      <Box display="flex" justifyContent="center" py={10}>
        <Spinner size="xl" color="ui.Interactive.accent" />
      </Box>
    )
  }

  if (isPlantLoading) {
    return (
      <Box display="flex" justifyContent="center" py={10}>
        <Spinner size="xl" color="ui.Interactive.accent" />
      </Box>
    )
  }

  return (
    <Tabs.Root colorScheme="blue" mt={0} value={activeTab}>
      <Tabs.Content value="main" p={0}>
        <EnergyTrendChart
          tenantId={selectedTenant}
          energyDataIds={energyDataIds}
          socDataId={socDataId}
          stationName={stationName}
          plantConfig={plantConfig}
        />
      </Tabs.Content>

      {isTabVisible("schedule") && (
        <Tabs.Content value="schedule" p={0}>
          <TabRenderer tabType="schedule" tenantId={selectedTenant} plantId={plantId} />
        </Tabs.Content>
      )}

      {isTabVisible("smartlogger") && (
        <Tabs.Content value="smdata" p={0}>
          <TabRenderer
            tabType="smartlogger"
            tenantId={selectedTenant}
            plantId={plantId}
          />
        </Tabs.Content>
      )}

      {isTabVisible("ess") && (
        <Tabs.Content value="essdata" p={0}>
          <TabRenderer tabType="ess" tenantId={selectedTenant} plantId={plantId} />
        </Tabs.Content>
      )}

      {isTabVisible("plccontrol") && (
        <Tabs.Content value="control" p={0}>
          <TabRenderer
            tabType="plccontrol"
            tenantId={selectedTenant}
            plantId={plantId}
            isActive={activeTab === "control"}
          />
        </Tabs.Content>
      )}

      {isTabVisible("settings") && (
        <Tabs.Content value="settings" p={0}>
          <TabRenderer
            tabType="settings"
            tenantId={selectedTenant}
            plantId={plantId}
          />
        </Tabs.Content>
      )}
    </Tabs.Root>
  )
}

export default DashboardTabs

