/**
 * Clickable pill that toggles light/dark theme and animates a sliding thumb indicator.
 * Sun and moon assets use semantic filters so both modes remain legible against the track.
 */

import { Box, type BoxProps, chakra } from "@chakra-ui/react"
import { useThemeLogic } from "../../hooks/useThemeLogic"

export function ThemeSwitcher(props: BoxProps) {
  const { toggleTheme, thumbPosition, sunOpacity, moonOpacity } =
    useThemeLogic()

  const isDark = thumbPosition !== "4px"

  return (
    <Box
      {...props}
      onClick={toggleTheme}
      cursor="pointer"
      position="relative"
      width="70px"
      height="32px"
      bg="ui.ThemeSwitcher.background"
      borderRadius="full"
      border="1px solid"
      borderColor="ui.ThemeSwitcher.border"
      flexShrink={0}
      userSelect="none"
      overflow="hidden"
      transitionProperty="background, border-color"
      transitionDuration="slow"
    >
      <chakra.img
        src="/assets/icons/moon.svg"
        alt="Dark Mode"
        position="absolute"
        top="50%"
        left="7px"
        transform="translateY(-50%)"
        boxSize="18px"
        zIndex={1}
        opacity={moonOpacity}
        transition="opacity 0.2s ease-in-out"
        _light={{ filter: "brightness(0) saturate(100%) invert(8%)" }}
      />

      <chakra.img
        src="/assets/icons/sun.svg"
        alt="Light Mode"
        position="absolute"
        top="50%"
        right="7px"
        transform="translateY(-50%)"
        boxSize="18px"
        zIndex={1}
        opacity={sunOpacity}
        transition="opacity 0.2s ease-in-out"
        _light={{ filter: "brightness(0) saturate(100%) invert(8%)" }}
      />

      <Box
        position="absolute"
        top="4px"
        left="4px"
        width="22px"
        height="22px"
        bg="ui.ThemeSwitcher.thumb"
        borderRadius="full"
        boxShadow="sm"
        zIndex={2}
        transform={isDark ? "translateX(38px)" : "translateX(0px)"}
        transitionProperty="transform"
        transitionDuration="normal"
        transitionTimingFunction="cubic-bezier(0.4, 0, 0.2, 1)"
        willChange="transform"
      />
    </Box>
  )
}
