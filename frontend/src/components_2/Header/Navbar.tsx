/**
 * Sticky top navigation with logo, plant-aware tab links, theme and user controls.
 * Renders separate mobile (two-row) and tablet/desktop layouts with horizontal tab scrolling.
 */

import { Box, Flex, HStack, Image, VStack } from "@chakra-ui/react"
import { Menu as MenuIcon } from "lucide-react"
import { useLocation } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { NavButton } from "@/components_2/Header/NavButton"
import { LanguageSwitcher } from "@/components_2/ui/LanguageSwitcher"
import { MobileSettings } from "@/components_2/ui/MobileSettings"
import { ThemeSwitcher } from "@/components_2/ui/ThemeSwitcher"
import { UserSettings } from "@/components_2/ui/UserSettings"
import { useNavItems } from "@/hooks/useNavItems"
import BlackLogo from "/assets/images/new-black-logo.png"
import WhiteLogo from "/assets/images/new-white-logo.png"

interface NavbarProps {
  onMenuClick?: () => void
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { t } = useTranslation("Navbar")
  const { navItems, currentPlantId } = useNavItems()
  const { pathname } = useLocation()
  const isPlantPath = /(^|\/)plant(\/|$)/.test(pathname)

  const navbarBg = "ui.NavbarComponent.barBackground"
  const borderColor = "ui.NavbarComponent.barBorder"

  // Height adapts: 116px (mobile) -> 80px (tablet & desktop)
  const navHeight = { base: isPlantPath ? "116px" : "60px", md: "80px", lg: "80px" }

  return (
    <Flex
      as="nav"
      w="100%"
      h={navHeight}
      bg={navbarBg}
      borderBottom="2px solid"
      borderColor={borderColor}
      position="sticky"
      top={0}
      zIndex="2000"
      justify="center"
      transition="all 0.2s ease"
    >
      <Box w="100%" h="100%">
        <VStack
          display={{ base: "flex", md: "none" }}
          w="100%"
          h="100%"
          gap={0}
          align="stretch"
        >
          <Box
            display="grid"
            gridTemplateColumns="1fr auto 1fr"
            alignItems="center"
            h="60px"
            flexShrink={0}
            px="max(16px, env(safe-area-inset-left))"
          >
            <Box
              justifySelf="start"
              color="ui.LanguageSwitcher.text"
              cursor="pointer"
              p="2"
              borderRadius="8px"
              transition="background-color 0.2s ease"
              _hover={{ bg: "ui.Interactive.hoverBg" }}
              onClick={onMenuClick}
            >
              <MenuIcon size={24} />
            </Box>

            <Box justifySelf="center">
              <Image
                src={WhiteLogo}
                _light={{ content: `url(${BlackLogo})` }}
                alt="Rayton Logo"
                h="28px"
                objectFit="contain"
                userSelect="none"
                draggable="false"
              />
            </Box>

            <HStack justifySelf="end" gap="16px">
              <MobileSettings />
              <UserSettings />
            </HStack>
          </Box>

          {isPlantPath && (
            <HStack
              w="100%"
              h="56px"
              px="16px"
              gap="8px"
              align="center"
              overflowX="auto"
              _before={{ content: '""', margin: "auto" }}
              _after={{ content: '""', margin: "auto" }}
              css={{
                "&::-webkit-scrollbar": { display: "none" },
                msOverflowStyle: "none",
                scrollbarWidth: "none",
              }}
            >
              {navItems.map((item) => (
                <Box key={item.to} flexShrink={0}>
                  <NavButton
                    label={t(item.label)}
                    to={item.to}
                    routeTab={item.routeTab}
                    isActive={item.isActive}
                    currentPlantId={currentPlantId}
                  />
                </Box>
              ))}
            </HStack>
          )}
        </VStack>

        <Box
          display={{ base: "none", md: "grid" }}
          gridTemplateColumns="auto 1fr auto"
          alignItems="center"
          h="100%"
          px="24px"
          gap={{ md: "8px", lg: "clamp(12px, 1.5vw, 24px)" }}
          transition="all 0.2s ease"
        >
          <HStack gap="13px" flexShrink={0}>
            <Box
              color="ui.LanguageSwitcher.text"
              cursor="pointer"
              p="1"
              borderRadius="8px"
              transition="background-color 0.2s ease"
              _hover={{ bg: "ui.Interactive.hoverBg" }}
              onClick={onMenuClick}
            >
              <MenuIcon size={24} />
            </Box>

            <Box flexShrink={0}>
              <Image
                src={WhiteLogo}
                _light={{ content: `url(${BlackLogo})` }}
                alt="Rayton Logo"
                h="28px"
                objectFit="contain"
                userSelect="none"
                draggable="false"
              />
            </Box>
          </HStack>

          <Box minW={0} h="100%">
            {isPlantPath && (
              <HStack
                h="100%"
                _before={{ content: '""', margin: "auto" }}
                _after={{ content: '""', margin: "auto" }}
                gap={{ md: "8px", lg: "clamp(8px, 1.5vw, 24px)" }}
                overflowX="auto"
                whiteSpace="nowrap"
                css={{
                  "&::-webkit-scrollbar": { display: "none" },
                  msOverflowStyle: "none",
                  scrollbarWidth: "none",
                  paddingInline: "4px",
                }}
              >
                {navItems.map((item) => (
                  <Box key={item.to} flexShrink={0}>
                    <NavButton
                      label={t(item.label)}
                      to={item.to}
                      routeTab={item.routeTab}
                      isActive={item.isActive}
                      currentPlantId={currentPlantId}
                    />
                  </Box>
                ))}
              </HStack>
            )}
          </Box>

          <Box justifySelf="end">
            <HStack gap="16px" display={{ md: "flex", lg: "none" }}>
              <MobileSettings />
              <UserSettings />
            </HStack>
            <HStack gap="24px" display={{ md: "none", lg: "flex" }}>
              <ThemeSwitcher />
              {/* LanguageSwitcher is `position="absolute"` by default; force in-flow to avoid overlap. */}
              <LanguageSwitcher position="static" />
              <UserSettings />
            </HStack>
          </Box>
        </Box>
      </Box>
    </Flex>
  )
}

export default Navbar
