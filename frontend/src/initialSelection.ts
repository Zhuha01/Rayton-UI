import { TenantsService, UsersService, type TenantPublic } from "@/client"

export type InitialSelectionResult =
  | { kind: "ok"; tenant: TenantPublic; plantId: number }
  | { kind: "noTenants" }
  | { kind: "noPlants" }

export async function resolveInitialTenantAndPlant(): Promise<InitialSelectionResult> {
  const user = await UsersService.readUserMe()

  const isPrivilegedUser =
    user.is_superuser || user.role === "admin" || user.role === "manager"

  if (isPrivilegedUser) {
    const tenants = (await TenantsService.readTenants({
      skip: 0,
      limit: 50,
    })) as unknown as { data?: TenantPublic[]; count?: number }

    if ((tenants?.count ?? 0) === 0) return { kind: "noTenants" }

    const tenant = tenants?.data?.find((t) => Boolean(t.plant_id))
    const plantId = tenant?.plant_id ?? null
    if (!tenant || plantId == null) return { kind: "noPlants" }

    return { kind: "ok", tenant, plantId }
  }

  if (!user.tenant_id) return { kind: "noTenants" }

  const tenant = (await TenantsService.readTenantById({
    tenantId: user.tenant_id,
  })) as unknown as TenantPublic

  if (!tenant?.plant_id) return { kind: "noPlants" }
  return { kind: "ok", tenant, plantId: tenant.plant_id }
}

