/**
 * Primary plant dashboard route: loads dashboard configuration, tab state from search params, and energy chart datasets.
 * Hosts `DashboardTabs` and centralizes plant access checks plus navigation when config or auth is missing.
 */

import { Box, Container, Spinner } from "@chakra-ui/react"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useMemo } from "react"
import { z } from "zod"
import { type ApiError, type DashboardData, DashboardService } from "@/client"
import DashboardTabs from "@/components_2/Pages/dashboard/DashboardTabs"
import { buildEnergyDataIds } from "@/components_2/Pages/dashboard/chartUtils"
import useAuth from "@/hooks/useAuth"
import { useGetPlantConfig } from "@/hooks/usePlantConfigQueries"
import { useTenant, useTenants } from "@/hooks/useTenantQueries"

const plantSearchSchema = z.object({
  tab: z.string().optional(),
})

export const Route = createFileRoute("/_layout/plant_/$plantId")({
  component: PlantDashboard,
  validateSearch: (search) => plantSearchSchema.parse(search),
})

// Dashboard Hook - now accepts plantId instead of tenantId
const useDashboardData = (plantId?: number | null) => {
  return useQuery<DashboardData, ApiError>({
    queryKey: ["dashboard", { plantId: plantId ?? "current" }],
    queryFn: () =>
      DashboardService.readDashboardData({
        tenantIdOverride: undefined, // We'll modify backend to use plantId
      }),
    enabled: !!plantId,
  })
}

function PlantDashboard() {
  const { user: currentUser } = useAuth()
  const { plantId } = Route.useParams() // Get plantId from path parameters
  const { tab } = Route.useSearch() // Get tab from search parameters
  const _navigate = useNavigate({ from: Route.fullPath })

  // Convert plantId to number
  const plantIdNumber = Number(plantId)

  // Determine if user is privileged
  const isPrivilegedUser =
    currentUser?.is_superuser ||
    currentUser?.role === "admin" ||
    currentUser?.role === "manager"

  // Fetch all tenants (for privileged users to map plantId to tenantId)
  const { data: tenantsData, isLoading: isLoadingTenants } = useTenants(
    {},
    { enabled: !!isPrivilegedUser },
  )

  // Get user's tenant
  const { data: userTenantData, isLoading: isLoadingUserTenant } = useTenant(
    currentUser?.tenant_id ?? null,
  )

  // --- THE FIX: Correctly determine effectiveTenantId for all user types ---
  let effectiveTenantId: string | undefined
  if (isPrivilegedUser) {
    // For privileged users, find the tenant ID from the plantId in the URL.
    effectiveTenantId = plantIdNumber
      ? tenantsData?.data.find((t) => t.plant_id === plantIdNumber)?.id
      : undefined // No plantId selected, so no tenant.
  } else {
    // For regular users, the effective tenant is ALWAYS their own tenant.
    effectiveTenantId = currentUser?.tenant_id
  }
  // --- END FIX ---

  // Determine effective plantId
  const effectivePlantId = plantIdNumber

  // Fetch dashboard data
  const {
    data: dashboardData,
    isLoading: isLoadingDashboard,
    error,
  } = useDashboardData(effectivePlantId)

  const stationName = useMemo(() => {
    if (isPrivilegedUser) {
      return (
        tenantsData?.data.find((t) => t.plant_id === effectivePlantId)?.name ??
        `Plant ${effectivePlantId}`
      )
    }
    return userTenantData?.name ?? `Plant ${effectivePlantId}`
  }, [effectivePlantId, isPrivilegedUser, tenantsData, userTenantData])

  const socDataId = 10

  // Plant hardware capability detection by device name
  const { data: plantConfigData, isSuccess: isPlantConfigSuccess } =
    useGetPlantConfig({
      tenantId: effectiveTenantId ?? null,
    })

  const plantConfig = useMemo(() => {
    const devices = plantConfigData?.devices ?? []
    // Device naming differs across plants; cover common ESS/UZE aliases.
    const essRegex = /ess|bess|uze|узе|battery|батарея|акумулятор/i
    const generatorRegex = /generator|генератор/i
    return {
      hasEss: devices.some((d) => essRegex.test(d.name)),
      hasGenerator: devices.some((d) => generatorRegex.test(d.name)),
    }
  }, [plantConfigData])

  // Align requested series with plant hardware (mirrors chartUtils.isSeriesAllowedByPlantConfig).
  // Until plant config loads, request full id set so charts do not miss ESS/gen series.
  const energyDataIds = useMemo(() => {
    if (!isPlantConfigSuccess) return [1, 2, 3, 4, 5, 6, 7, 8, 9]
    return buildEnergyDataIds(plantConfig)
  }, [isPlantConfigSuccess, plantConfig])

  // Loading state
  if (
    !currentUser ||
    (isPrivilegedUser && isLoadingTenants && !plantIdNumber) ||
    isLoadingUserTenant
  ) {
    return (
      <Container py={8} centerContent>
        <Spinner size="xl" color="ui.Interactive.accent" />
      </Container>
    )
  }

  return (
    <Box w="100%" p={0}>
      {/* Render tabs with plantId and tenantId */}
      <DashboardTabs
        isLoadingDashboard={isLoadingDashboard}
        dashboardData={dashboardData}
        error={error}
        selectedTenant={effectiveTenantId ?? null}
        stationName={stationName}
        energyDataIds={energyDataIds}
        socDataId={socDataId}
        initialTab={tab || "main"} // Pass the tab from URL search params
        plantId={effectivePlantId} // Pass plantId for tab configuration
        plantConfig={plantConfig}
      />
    </Box>
  )
}
