/**
 * User avatar trigger that opens profile and logout entries sized for navbar breakpoints.
 * On large screens labels expand; menus avoid fixed narrow width constraints on phones.
 */

import { Box, HStack, Portal, Text, useBreakpointValue } from "@chakra-ui/react"
import { useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import {
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuTrigger,
} from "@/components_2/ui/Menu"
import { Button, type ButtonProps } from "@/components_2/ui/Button"
import useAuth from "@/hooks/useAuth"

export type UserSettingsProps = Omit<ButtonProps, "children" | "onClick">

export function UserSettings(props: UserSettingsProps) {
  const { t } = useTranslation("Navbar")
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { logout, user } = useAuth()

  const displayName =
    user?.full_name?.trim() || user?.email || t("user")
  const isDesktop =
    useBreakpointValue({ base: false, lg: true }, { ssr: false }) ?? false

  const triggerStyles: Partial<ButtonProps> = {
    bg: open ? "background.hover" : "background.normal",
    borderWidth: "1px",
    borderColor: "border.normal",
    borderRadius: "8px",
    px: "8px",
    py: "6px",
    h: "auto",
    cursor: "pointer",
    transition: "all 0.2s",
    _hover: { bg: "background.hover" },
    _active: { bg: "background.hover" },
  }

  return (
    <MenuRoot
      open={open}
      onOpenChange={(e) => setOpen(e.open)}
      positioning={{
        placement: "bottom-end",
        gutter: 4,
        // On mobile, avoid forcing menu width to 44px trigger width.
        sameWidth: isDesktop,
      }}
    >
      <MenuTrigger asChild>
        <Button
          variant="ghost"
          {...triggerStyles}
          width={{ base: "40px", lg: "auto" }}
          height={{ base: "40px", lg: "auto" }}
          {...props}
        >
          <HStack gap={{ base: "0", lg: "4px" }} justify="center">
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              w="20px"
              h="20px"
              bg="ui.UserSettings.icon"
              flexShrink={0}
              style={{
                maskImage: "url(/assets/icons/user-02.svg)",
                WebkitMaskImage: "url(/assets/icons/user-02.svg)",
                maskRepeat: "no-repeat",
                WebkitMaskRepeat: "no-repeat",
                maskSize: "contain",
                WebkitMaskSize: "contain",
                maskPosition: "center",
                WebkitMaskPosition: "center",
              }}
            />

            <Text
              color="text.normal"
              fontSize="0.875rem"
              fontFamily="Inter"
              fontWeight="400"
              lineHeight="1"
              whiteSpace="nowrap"
              display={{ base: "none", lg: "block" }}
              maxW={{ lg: "200px" }}
              truncate
              title={displayName}
            >
              {displayName}
            </Text>
          </HStack>
        </Button>
      </MenuTrigger>

      <Portal>
        <MenuContent
          bg="background.normal"
          p={0}
          minW={{ base: "fit-content", lg: "unset" }}
          w={{ base: "max-content", lg: "unset" }}
          border="none"
          boxShadow="ui.menuOverlay"
          zIndex="max"
        >
          <MenuItem
            value="profile"
            color="text.normal"
            fontSize="0.875rem"
            py="6px"
            px="8px"
            _hover={{ bg: "background.hover" }}
            cursor="pointer"
            borderRadius="0"
            onClick={() => {
              setOpen(false)
              navigate({ to: "/settings" })
            }}
          >
            {t("profile")}
          </MenuItem>

          <MenuItem
            value="logout"
            color="ui.Form.errorText"
            fontSize="0.875rem"
            py="6px"
            px="8px"
            _hover={{ bg: "background.hover" }}
            cursor="pointer"
            borderRadius="0"
            onClick={() => {
              setOpen(false)
              logout()
            }}
          >
            {t("logout")}
          </MenuItem>
        </MenuContent>
      </Portal>
    </MenuRoot>
  )
}
