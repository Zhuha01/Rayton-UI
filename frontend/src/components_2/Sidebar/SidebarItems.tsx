/**
 * Renders searchable plant list and section links for the sidebar.
 * Data from tenant queries; loading and empty states preserved.
 */

import { Box, Flex, Spinner, Text } from "@chakra-ui/react"
import { useQueryClient } from "@tanstack/react-query"
import type { SVGProps } from "react"
import { forwardRef, useId, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import type { TenantPublic, UserPublic } from "@/client"
import { SidebarLink, type SidebarNavItem } from "@/components_2/ui/SidebarLink"
import { SidebarSearch } from "@/components_2/ui/SidebarSearch"
import { useTenant, useTenants } from "@/hooks/useTenantQueries"

type SvgProps = SVGProps<SVGSVGElement>

const UsersGroupIcon = forwardRef<SVGSVGElement, SvgProps>(
  function UsersGroupIcon(props, ref) {
    return (
      <svg
        ref={ref}
        width={24}
        height={24}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
        {...props}
      >
        <g transform="translate(2 3.5)">
          <path
            d="M15 16C15 14.3431 12.7614 13 10 13C7.23858 13 5 14.3431 5 16M19 13.0004C19 11.7702 17.7659 10.7129 16 10.25M1 13.0004C1 11.7702 2.2341 10.7129 4 10.25M16 6.23611C16.6137 5.68679 17 4.8885 17 4C17 2.34315 15.6569 1 14 1C13.2316 1 12.5308 1.28885 12 1.76389M4 6.23611C3.38625 5.68679 3 4.8885 3 4C3 2.34315 4.34315 1 6 1C6.76835 1 7.46924 1.28885 8 1.76389M10 10C8.34315 10 7 8.65685 7 7C7 5.34315 8.34315 4 10 4C11.6569 4 13 5.34315 13 7C13 8.65685 11.6569 10 10 10Z"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    )
  },
)

const TenantBuildingIcon = forwardRef<SVGSVGElement, SvgProps>(
  function TenantBuildingIcon(props, ref) {
    return (
      <svg
        ref={ref}
        width={24}
        height={24}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
        {...props}
      >
        <g transform="translate(1 2.5)">
          <path
            d="M1 18H3M3 18H13M3 18V4.2002C3 3.08009 3 2.51962 3.21799 2.0918C3.40973 1.71547 3.71547 1.40973 4.0918 1.21799C4.51962 1 5.08009 1 6.2002 1H9.8002C10.9203 1 11.4796 1 11.9074 1.21799C12.2837 1.40973 12.5905 1.71547 12.7822 2.0918C13 2.5192 13 3.07899 13 4.19691V10M13 18H19M13 18V10M19 18H21M19 18V10C19 9.06812 18.9999 8.60241 18.8477 8.23486C18.6447 7.74481 18.2557 7.35523 17.7656 7.15224C17.3981 7 16.9316 7 15.9997 7C15.0679 7 14.6019 7 14.2344 7.15224C13.7443 7.35523 13.3552 7.74481 13.1522 8.23486C13 8.60241 13 9.06812 13 10M6 8H10M6 5H10"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    )
  },
)

const SolarPanelIcon = forwardRef<SVGSVGElement, SvgProps>(
  function SolarPanelIcon(props, ref) {
    const uid = useId().replace(/:/g, "")
    const clipId = `clip_solar_${uid}`
    return (
      <svg
        ref={ref}
        width={24}
        height={24}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
        {...props}
      >
        <g clipPath={`url(#${clipId})`}>
          <path
            d="M22.5 19.5V10.5H9.75V19.5H13.5V21H1.5V22.5H22.5V21H18.75V19.5H22.5ZM18.75 18V15.75H21V18H18.75ZM17.25 15.75V18H15V15.75H17.25ZM15 14.25V12H17.25V14.25H15ZM21 14.25H18.75V12H21V14.25ZM13.5 12V14.25H11.25V12H13.5ZM11.25 18V15.75H13.5V18H11.25ZM17.25 21H15V19.5H17.25V21Z"
            fill="currentColor"
          />
          <path
            d="M6.9996 11.2357C6.62669 10.902 6.34316 10.4804 6.17483 10.0092C6.0065 9.53794 5.95872 9.03208 6.03584 8.53767C6.11296 8.04325 6.31252 7.57598 6.61636 7.17839C6.9202 6.7808 7.31867 6.46553 7.77548 6.26129C8.2323 6.05704 8.73294 5.9703 9.23184 6.00897C9.73074 6.04764 10.212 6.21049 10.6319 6.48269C11.0518 6.7549 11.3969 7.1278 11.6359 7.56746C11.8748 8.00712 12 8.49957 12 8.99996H10.5C10.5 8.74975 10.4374 8.50351 10.3179 8.28367C10.1985 8.06382 10.0259 7.87736 9.81593 7.74126C9.60597 7.60515 9.36531 7.52373 9.11584 7.50441C8.86638 7.48509 8.61604 7.52847 8.38763 7.63062C8.15922 7.73277 7.95999 7.89044 7.80808 8.08926C7.65617 8.28808 7.55641 8.52175 7.51789 8.76897C7.47936 9.0162 7.50329 9.26914 7.5875 9.50476C7.67171 9.74037 7.81352 9.95118 8.00003 10.118L6.9996 11.2357Z"
            fill="currentColor"
          />
          <path d="M9.75 1.5H8.25V4.5H9.75V1.5Z" fill="currentColor" />
          <path d="M4.5 8.25H1.5V9.75H4.5V8.25Z" fill="currentColor" />
          <path
            d="M4.22698 3.16639L3.16632 4.22705L5.28764 6.34837L6.3483 5.28771L4.22698 3.16639Z"
            fill="currentColor"
          />
          <path
            d="M11.6516 5.28773L12.7123 6.34839L14.8336 4.22707L13.7729 3.16641L11.6516 5.28773Z"
            fill="currentColor"
          />
        </g>
        <defs>
          <clipPath id={clipId}>
            <rect width="24" height="24" fill="white" />
          </clipPath>
        </defs>
      </svg>
    )
  },
)

const COLUMN_W = "192px"

function SidebarDivider() {
  return (
    <Flex w="100%" justify="center" flexShrink={0}>
      <Box
        w={COLUMN_W}
        minW={COLUMN_W}
        maxW={COLUMN_W}
        h="0px"
        borderTop="2px solid"
        borderColor="ui.Sidebar.divider"
        aria-hidden
      />
    </Flex>
  )
}

interface SidebarItemsProps {
  onItemClick?: () => void
}

const SidebarItems = ({ onItemClick }: SidebarItemsProps) => {
  const { t, i18n } = useTranslation("Sidebar")
  const queryClient = useQueryClient()
  const currentUser = queryClient.getQueryData<UserPublic>(["currentUser"])
  const [searchTerm, setSearchTerm] = useState("")

  const isPrivilegedUser = Boolean(
    currentUser &&
      (currentUser.is_superuser ||
        currentUser.role === "admin" ||
        currentUser.role === "manager"),
  )

  const { data: tenantsData, isLoading: isLoadingTenants } = useTenants(
    {},
    { enabled: isPrivilegedUser },
  )

  const { data: userTenant, isLoading: isLoadingUserTenant } = useTenant(
    currentUser?.tenant_id ?? null,
    {
      enabled: !isPrivilegedUser && !!currentUser?.tenant_id,
    },
  )

  const plantItems = useMemo((): SidebarNavItem[] => {
    if (isPrivilegedUser && tenantsData) {
      return tenantsData.data
        .filter((tenant: TenantPublic) => tenant.plant_id)
        .map((tenant: TenantPublic) => ({
          icon: SolarPanelIcon,
          title: tenant.name,
          path: `/plant/${tenant.plant_id}`,
        }))
    }
    if (userTenant?.plant_id) {
      return [
        {
          icon: SolarPanelIcon,
          title: userTenant.name,
          path: `/plant/${userTenant.plant_id}`,
        },
      ]
    }
    return []
  }, [isPrivilegedUser, tenantsData, userTenant])

  const filteredPlantItems = useMemo(() => {
    if (!searchTerm.trim()) {
      return plantItems
    }
    const term = searchTerm.toLowerCase()
    return plantItems.filter((item) => item.title.toLowerCase().includes(term))
  }, [plantItems, searchTerm])

  const staticItems: SidebarNavItem[] = []

  const shouldShowAdminItems =
    isPrivilegedUser && currentUser?.email !== "solar@rayton.com.ua"

  const adminItems: SidebarNavItem[] = useMemo(() => {
    if (!shouldShowAdminItems) {
      return []
    }
    return [
      { icon: UsersGroupIcon, title: t("userManagement"), path: "/admin" },
      {
        icon: TenantBuildingIcon,
        title: t("tenantManagement"),
        path: "/tenant",
      },
      {
        icon: SolarPanelIcon,
        title: t("plantManagement"),
        path: "/plant-management",
      },
    ]
  }, [shouldShowAdminItems, t])

  const isLoading = isLoadingTenants || isLoadingUserTenant

  if (isLoading) {
    return (
      <Flex w="100%" justify="center" flexShrink={0}>
        <Flex align="center" gap={2} w={COLUMN_W} maxW={COLUMN_W} minW={0}>
          <Spinner size="xl" color="ui.Interactive.accent" />
        </Flex>
      </Flex>
    )
  }

  return (
    <Flex direction="column" w="100%" minW={0} flexShrink={0} gap="16px">
      {/* Omit this wrapper when empty so the parent column gap does not reserve space above search for non-admin users. */}
      {adminItems.length > 0 && (
        <Flex direction="column" w="100%" alignItems="center" gap="16px">
          {adminItems.map((item) => (
            <SidebarLink key={item.path} item={item} onClick={onItemClick} />
          ))}
        </Flex>
      )}

      {adminItems.length > 0 && plantItems.length > 0 && <SidebarDivider />}

      {plantItems.length > 0 && (
        <Flex w="100%" justify="center" flexShrink={0}>
          <SidebarSearch
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder={t("searchPlaceholder")}
          />
        </Flex>
      )}

      <Flex direction="column" w="100%" alignItems="center" gap="16px">
        {filteredPlantItems.map((item) => (
          <SidebarLink key={item.path} item={item} onClick={onItemClick} />
        ))}
      </Flex>

      {filteredPlantItems.length > 0 && staticItems.length > 0 && (
        <SidebarDivider />
      )}

      <Flex direction="column" w="100%" alignItems="center" gap="16px">
        {staticItems.map((item) => (
          <SidebarLink key={item.path} item={item} onClick={onItemClick} />
        ))}
      </Flex>
    </Flex>
  )
}

export default SidebarItems
