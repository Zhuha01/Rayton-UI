/**
 * Lazy-loads plant tab modules (schedule, ESS, SES, PLC control, settings) based on server `tab_config` and defaults.
 * Wraps each remote slice in suspense while `usePlant` resolves plant metadata for the active `plantId`.
 * Expects `tabType`, `tenantId`, optional `plantId`, and `isActive` to mirror the dashboard tab strip contract.
 */

import { Box, Spinner, Text } from "@chakra-ui/react"
import { lazy, Suspense } from "react"
import { usePlant } from "@/hooks/usePlantQueries"

const ScheduleTab = lazy(() => import("@/components_2/Pages/schedule/ScheduleTab"))
const ESS = lazy(() => import("@/components_2/Pages/uze/ESS"))
const ESSV3 = lazy(() => import("@/components_2/Pages/uze/ESSV3"))
const PLCControl = lazy(() => import("@/components_2/Pages/control/PLCControl"))
const PLCDataSettingsTable = lazy(() => import("./PLCDataSettingsTable"))
const Smartlogger = lazy(() => import("@/components_2/Pages/ses/SesPage"))

interface TabRendererProps {
  tabType: "schedule" | "ess" | "smartlogger" | "plccontrol" | "settings"
  tenantId: string
  plantId?: string | number
  isActive?: boolean
}

const TabRenderer = ({ tabType, tenantId, plantId, isActive }: TabRendererProps) => {
  const { data, isLoading, error, isError } = usePlant(
    plantId ? Number(plantId) : null,
  )

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="200px"
      >
        <Spinner size="xl" color="ui.Interactive.accent" />
      </Box>
    )
  }

  if (isError || error) {
    return (
      <Box p={4}>
        <Text color="ui.Form.errorText">
          Error loading configuration: {error?.message || "Unknown error"}
        </Text>
        {renderDefaultTab(tabType, tenantId, isActive)}
      </Box>
    )
  }

  interface TabConfig {
    schedule?: string
    ess?: string
    smartlogger?: string
    plccontrol?: string
    settings?: string
    [key: string]: string | undefined
  }

  let tabConfig: TabConfig = {}
  if (data?.tab_config) {
    try {
      tabConfig = JSON.parse(data.tab_config)
    } catch (e) {
      console.error("Error parsing tab_config:", e)
    }
  }

  const componentType = tabConfig[tabType] || getDefaultComponent(tabType)

  return (
    <Suspense fallback={<TabLoadingFallback />}>
      {renderComponent(componentType, tenantId, isActive)}
    </Suspense>
  )
}

const TabLoadingFallback = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    height="200px"
  >
    <Spinner size="xl" color="ui.Interactive.accent" />
  </Box>
)

const renderComponent = (
  componentType: string,
  tenantId: string,
  isActive?: boolean,
) => {
  switch (componentType) {
    case "ScheduleTab":
    case "ScheduleTab_default":
      return <ScheduleTab tenantId={tenantId} variant="default" />
    case "ScheduleTab_light":
      return <ScheduleTab tenantId={tenantId} variant="light" />
    case "ScheduleTab_woSell":
      return <ScheduleTab tenantId={tenantId} variant="woSell" />
    case "ESSTab_basic":
    case "ESSTab_advanced":
      return <ESS tenantId={tenantId} />
    case "ESS":
      return <ESS tenantId={tenantId} />
    case "ESS_v3":
      return <ESSV3 tenantId={tenantId} />
    case "Smartlogger":
      return <Smartlogger tenantId={tenantId} />
    case "PLCControl":
      return <PLCControl tenantId={tenantId} isActive={isActive} />
    case "PLCDataSettingsTable":
      return <PLCDataSettingsTable tenantId={tenantId} />
    default:
      return <ScheduleTab tenantId={tenantId} />
  }
}

const renderDefaultTab = (tabType: string, tenantId: string, isActive?: boolean) => {
  switch (tabType) {
    case "schedule":
      return <ScheduleTab tenantId={tenantId} variant="default" />
    case "ess":
      return <ESS tenantId={tenantId} />
    case "smartlogger":
      return <Smartlogger tenantId={tenantId} />
    case "plccontrol":
      return <PLCControl tenantId={tenantId} isActive={isActive} />
    case "settings":
      return <PLCDataSettingsTable tenantId={tenantId} />
    default:
      return <ScheduleTab tenantId={tenantId} variant="default" />
  }
}

const getDefaultComponent = (tabType: string) => {
  switch (tabType) {
    case "schedule":
      return "ScheduleTab_default"
    case "ess":
      return "ESS"
    case "smartlogger":
      return "Smartlogger"
    case "plccontrol":
      return "PLCControl"
    case "settings":
      return "PLCDataSettingsTable"
    default:
      return "ScheduleTab_default"
  }
}

export default TabRenderer

