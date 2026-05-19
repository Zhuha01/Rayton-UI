/**
 * Tenant row card: description, plant id, UUID accent, and edit/delete entry points.
 * Composes the shared management card shell with tenant-specific fields.
 */

import { Flex, SimpleGrid, Text } from "@chakra-ui/react"
import { useTranslation } from "react-i18next"
import type { TenantPublic } from "@/client"
import EditTenant from "@/components_2/Pages/management/Tenant/EditTenant"
import DeleteTenant from "@/components_2/Pages/management/Tenant/DeleteTenant"
import { ManagementCardActionButton } from "../ManagementCardActionButton"
import {
  ManagementCardDetailRow,
  ManagementCardShell,
  managementCardLabelProps,
} from "../cards/ManagementCardShell"
import { ManagementCardTenantIcon } from "../cards/ManagementCardSvgs"

export interface TenantManagementCardProps {
  tenant: TenantPublic
}

export function TenantManagementCard({ tenant }: TenantManagementCardProps) {
  const { t } = useTranslation("management")
  const leading = <ManagementCardTenantIcon />

  const desc = tenant.description?.trim() || t("common.status.na")
  const displayPlantId =
    tenant.plant_id != null ? String(tenant.plant_id) : t("common.status.na")

  return (
    <ManagementCardShell leading={leading} title={tenant.name}>
      <Flex py="8px" direction="column" gap="16px">
        <SimpleGrid columns={{ base: 1, md: 2 }} gap="16px" w="full">
          <ManagementCardDetailRow
            label={t("common.labels.description")}
            value={desc}
          />
          <ManagementCardDetailRow
            label={t("common.labels.plantObjectId")}
            value={displayPlantId}
          />
        </SimpleGrid>
        <Flex direction="column" gap="4px" align="flex-start">
          <Text {...managementCardLabelProps()}>{t("common.labels.id")}</Text>
          <Text
            fontSize="14px"
            fontWeight="bold"
            color="ui.TenantManagementCard.uuidAccent"
            wordBreak="break-all"
          >
            {tenant.id}
          </Text>
        </Flex>
        <Flex justify="flex-end" gap="10px" flexWrap="wrap">
          <EditTenant
            tenant={tenant}
            trigger={
              <ManagementCardActionButton intent="edit">
                {t("common.actions.edit")}
              </ManagementCardActionButton>
            }
          />
          <DeleteTenant
            tenant={tenant}
            trigger={
              <ManagementCardActionButton intent="delete">
                {t("common.actions.delete")}
              </ManagementCardActionButton>
            }
          />
        </Flex>
      </Flex>
    </ManagementCardShell>
  )
}
