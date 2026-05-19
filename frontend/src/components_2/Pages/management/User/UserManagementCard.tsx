/**
 * User row card for admin/tenant management: identity, role badge, status, and edit/delete actions.
 * Uses shared management card shell and semantic tokens for role/status/icon colors.
 */

import { Box, Flex, SimpleGrid, Text } from "@chakra-ui/react"
import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import type { UserPublic } from "@/client"
import EditUser from "@/components_2/Pages/management/User/EditUser"
import DeleteUser from "@/components_2/Pages/management/User/DeleteUser"
import { ManagementCardActionButton } from "../ManagementCardActionButton"
import {
  ManagementCardDetailRow,
  ManagementCardShell,
  managementCardLabelProps,
} from "../cards/ManagementCardShell"
import { ManagementCardUserIcon } from "../cards/ManagementCardSvgs"

export interface UserManagementCardProps {
  user: UserPublic
  tenantLabel: string
  /** When true, this card is the logged-in user (settings link, no delete). */
  actionsDisabled?: boolean
}

export function UserManagementCard({
  user,
  tenantLabel,
  actionsDisabled = false,
}: UserManagementCardProps) {
  const { t } = useTranslation("management")
  const navigate = useNavigate()
  const leadingIconIdleColor = actionsDisabled
    ? "ui.UserManagementCard.iconSelf"
    : user.is_superuser
      ? "ui.UserManagementCard.iconSuperuser"
      : "ui.UserManagementCard.iconRegular"

  const title = user.full_name?.trim() || user.email
  const roleBadge = (
    <Box
      as="span"
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      px="8px"
      py="4px"
      borderRadius="8px"
      borderWidth="1px"
      borderColor="ui.UserManagementCard.roleBorder"
      w="fit-content"
    >
      <Text
        fontSize="12px"
        fontWeight="regular"
        color="ui.UserManagementCard.roleBorder"
        lineHeight="1"
      >
        {user.is_superuser
          ? t("common.roles.superUser")
          : t("common.roles.user")}
      </Text>
    </Box>
  )

  const leading = <ManagementCardUserIcon frameless />

  return (
    <ManagementCardShell
      leading={leading}
      title={title}
      badge={roleBadge}
      leadingIconIdleColor={leadingIconIdleColor}
    >
      <Flex py="8px" direction="column" gap="16px">
        <SimpleGrid columns={{ base: 1, md: 2 }} gap="16px" w="full">
          <ManagementCardDetailRow
            label={t("common.labels.email")}
            value={user.email}
          />
          <ManagementCardDetailRow
            label={t("common.labels.company")}
            value={tenantLabel}
          />
        </SimpleGrid>
        <Flex direction="column" gap="8px" align="flex-start">
          <Text {...managementCardLabelProps()}>
            {t("common.labels.status")}
          </Text>
          <Box
            display="inline-flex"
            alignItems="center"
            justifyContent="center"
            px="8px"
            py="4px"
            borderRadius="8px"
            borderWidth="1px"
            borderColor={
              user.is_active
                ? "ui.UserManagementCard.statusActive"
                : "ui.UserManagementCard.statusInactive"
            }
          >
            <Text
              fontSize="14px"
              fontWeight="bold"
              color={
                user.is_active
                  ? "ui.UserManagementCard.statusActive"
                  : "gray.400"
              }
            >
              {user.is_active
                ? t("common.status.active")
                : t("common.status.inactive")}
            </Text>
          </Box>
        </Flex>
        <Flex justify="flex-end" gap="16px" flexWrap="wrap">
          {actionsDisabled ? (
            <ManagementCardActionButton
              intent="edit"
              type="button"
              onClick={() => navigate({ to: "/settings" })}
            >
              {t("common.actions.edit")}
            </ManagementCardActionButton>
          ) : (
            <>
              <EditUser
                user={user}
                trigger={
                  <ManagementCardActionButton intent="edit">
                    {t("common.actions.edit")}
                  </ManagementCardActionButton>
                }
              />
              <DeleteUser
                id={user.id}
                trigger={
                  <ManagementCardActionButton intent="delete">
                    {t("common.actions.delete")}
                  </ManagementCardActionButton>
                }
              />
            </>
          )}
        </Flex>
      </Flex>
    </ManagementCardShell>
  )
}
