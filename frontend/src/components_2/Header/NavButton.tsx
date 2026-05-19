/**
 * Styled navigation link used in the main navbar for app sections and plant tabs.
 * Resolves the target URL and search params from the current plant when applicable.
 */

import { Box, chakra } from "@chakra-ui/react"
import { Link } from "@tanstack/react-router"

const ChakraLink = chakra(Link) as any

interface NavButtonProps {
  label: string
  to: string
  routeTab: string | null
  isActive: boolean
  currentPlantId?: number | null
}

export function NavButton({
  label,
  to,
  routeTab,
  isActive,
  currentPlantId,
}: NavButtonProps) {
  const hasPlant = currentPlantId != null
  let effectiveTo = to
  let effectiveSearch: Record<string, unknown> | undefined

  if (hasPlant) {
    if (routeTab !== null) {
      effectiveTo = `/plant/${currentPlantId}`
      effectiveSearch = { tab: routeTab }
    } else if (to === "/") {
      effectiveTo = `/plant/${currentPlantId}`
    }
  }

  return (
    <ChakraLink
      to={effectiveTo}
      search={effectiveSearch}
      h={{ base: "auto", md: "100%", lg: "100%" }}
      display="inline-flex"
      alignItems="center"
      textDecoration="none"
      className="group"
      _hover={{ textDecoration: "none" }}
    >
      <Box
        px={{ base: "14px", md: "12px", lg: "1vw" }}
        py={{ base: "8px", md: "8px", lg: "8px" }}
        borderRadius={{ base: "8px", md: "0px" }}
        bg={{
          base: isActive ? "ui.NavButton.mobileActiveBg" : "transparent",
          md: "transparent",
        }}
        borderTop={{
          base: "none",
          md: "2px solid",
        }}
        borderColor={{
          base: "transparent",
          md: isActive ? "ui.NavButton.line" : "transparent",
        }}
        transition="all 0.2s ease-in-out"
        _groupHover={{
          borderColor: { base: "transparent", md: "ui.NavButton.line" },
        }}
        display="flex"
        justifyContent="center"
        alignItems="center"
        gap="10px"
        w="auto"
      >
        <Box
          as="span"
          fontFamily="Inter"
          fontSize={{ base: "14px", md: "13px", lg: "14px" }}
          fontWeight={isActive ? 500 : 400}
          color={
            isActive
              ? { base: "ui.Interactive.accent", md: "ui.NavButton.text" }
              : "ui.NavButton.text"
          }
          textAlign="center"
          lineHeight="1.2"
          whiteSpace="nowrap"
          transition="color 0.2s ease"
        >
          {label}
        </Box>
      </Box>
    </ChakraLink>
  )
}

export default NavButton
