/**
 * Plant Tab Redirect within the Rayton operator UI (components_2/Sidebar/PlantTabRedirect.tsx).
 * Built with Chakra UI and shared theme tokens to stay consistent with dashboards, management, and control surfaces.
 * Primary contract: exported component props and functions below (see TypeScript types for required fields).
 */
import { Container, Spinner } from "@chakra-ui/react"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { useEffect } from "react"

import useAuth from "@/hooks/useAuth"
import { useTenant, useTenants } from "@/hooks/useTenantQueries"

interface PlantTabRedirectProps {
  tab: string
}

export function PlantTabRedirect({ tab }: PlantTabRedirectProps) {
  const { user: currentUser } = useAuth()
  const navigate = useNavigate()

  const isPrivilegedUser =
    currentUser?.is_superuser ||
    currentUser?.role === "admin" ||
    currentUser?.role === "manager"

  // NavButton injects plantId into search params when navigating from a plant page.
  // This lets privileged users retain context after clicking a nav item.
  const searchParams = useSearch({ strict: false }) as { plantId?: number }
  const plantIdFromSearch = searchParams.plantId ?? null

  // For regular users, fall back to their tenant's plant when no plantId in URL.
  const { data: userTenantData, isLoading: isLoadingTenant } = useTenant(
    currentUser?.tenant_id ?? null,
  )

  const { data: tenantsData, isLoading: isLoadingTenants } = useTenants(
    {},
    { enabled: !!isPrivilegedUser },
  )

  const privilegedPlantId =
    isPrivilegedUser && tenantsData
      ? (tenantsData.data.find((t) => t.plant_id)?.plant_id ?? null)
      : null

  const resolvedPlantId: number | null =
    plantIdFromSearch ??
    privilegedPlantId ??
    (!isPrivilegedUser ? (userTenantData?.plant_id ?? null) : null)

  const isResolving =
    !plantIdFromSearch && (isLoadingTenant || (isPrivilegedUser && isLoadingTenants))

  useEffect(() => {
    if (!isResolving && resolvedPlantId != null) {
      navigate({
        to: "/plant/$plantId",
        params: { plantId: String(resolvedPlantId) },
        search: { tab },
        replace: true,
      })
    }
  }, [isResolving, resolvedPlantId, navigate, tab])

  return (
    <Container py={8} centerContent>
      <Spinner size="xl" color="ui.Interactive.accent" />
    </Container>
  )
}

export default PlantTabRedirect
