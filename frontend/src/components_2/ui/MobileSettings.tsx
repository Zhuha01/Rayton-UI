/**
 * Collapsed navbar menu bundling language, theme, and tenant branding for small breakpoints.
 * Surfaces the same capabilities as split desktop controls inside a single flyout surface.
 */

import { Box, HStack, Image, Portal, Separator, Text } from "@chakra-ui/react"
import { Check, Moon, Sun } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useColorMode } from "@/components_2/ui/ColorMode"

import {
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuTrigger,
} from "@/components_2/ui/Menu"

export function MobileSettings() {
  const { t, i18n } = useTranslation("Navbar")
  const { colorMode, setColorMode } = useColorMode()
  const [open, setOpen] = useState(false)

  const languages = [
    { code: "uk", label: "Ukrainian" },
    { code: "en", label: "English" },
    { code: "de", label: "German" },
    { code: "pl", label: "Polish" },
  ]

  const themes = [
    { id: "light", label: t("Light"), icon: <Sun size={18} /> },
    { id: "dark", label: t("Dark"), icon: <Moon size={18} /> },
  ]

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
  }

  const textColor = "ui.UserSettings.text"
  const activeColor = "ui.Interactive.accent"
  const hoverBg = "ui.Interactive.hoverBg"

  return (
    <MenuRoot
      open={open}
      onOpenChange={(e) => setOpen(e.open)}
      positioning={{ placement: "bottom-end", gutter: 8 }}
    >
      <MenuTrigger asChild>
        <Box
          w="29px"
          h="27.5px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          cursor="pointer"
          flexShrink={0}
          _focus={{ outline: "none" }}
          _active={{ outline: "none" }}
        >
          <Image
            src="/assets/icons/mobilenavsettings.svg"
            alt="Settings"
            w="29px"
            h="27.5px"
            pointerEvents="none"
          />
        </Box>
      </MenuTrigger>

      <Portal>
        <MenuContent
          bg="ui.NavbarComponent.barBackground"
          borderColor="ui.Sidebar.search_border"
          borderRadius="12px"
          p="8px"
          zIndex="max"
          minW="200px"
          boxShadow="ui.menuOverlay"
        >
          {/* Theme */}
          <Box px="12px" pt="8px" pb="4px">
            <Text
              fontSize="xs"
              color="ui.Sidebar.search_placeholder"
              fontWeight="bold"
              textTransform="uppercase"
            >
              {t("Theme")}
            </Text>
          </Box>

          {themes.map((theme) => {
            const isSelected = colorMode === theme.id
            return (
              <MenuItem
                key={theme.id}
                value={theme.id}
                onClick={() => setColorMode(theme.id as any)}
                borderRadius="8px"
                color={isSelected ? activeColor : textColor}
                fontWeight={isSelected ? "bold" : "normal"}
                cursor="pointer"
                _hover={{ bg: hoverBg }}
              >
                <HStack w="100%" justify="space-between">
                  <HStack gap="10px">
                    {theme.icon}
                    <Text>{theme.label}</Text>
                  </HStack>
                  {isSelected && <Check size={16} />}
                </HStack>
              </MenuItem>
            )
          })}

          <Separator my="8px" borderColor="ui.Sidebar.search_border" />

          {/* Language */}
          <Box px="12px" pt="4px" pb="4px">
            <Text
              fontSize="xs"
              color="ui.Sidebar.search_placeholder"
              fontWeight="bold"
              textTransform="uppercase"
            >
              {t("Language")}
            </Text>
          </Box>

          {languages.map((lang) => {
            const isSelected = i18n.language === lang.code
            return (
              <MenuItem
                key={lang.code}
                value={lang.code}
                onClick={() => changeLanguage(lang.code)}
                borderRadius="8px"
                color={isSelected ? activeColor : textColor}
                fontWeight={isSelected ? "bold" : "normal"}
                cursor="pointer"
                _hover={{ bg: hoverBg }}
              >
                <HStack w="100%" justify="space-between">
                  <Text>{lang.label}</Text>
                  {isSelected && <Check size={16} />}
                </HStack>
              </MenuItem>
            )
          })}
        </MenuContent>
      </Portal>
    </MenuRoot>
  )
}
