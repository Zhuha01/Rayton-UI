/**
 * Main theme configuration entry point using Chakra UI's createSystem.
 * Combines primitive tokens, semantic tokens, and global styles into a unified theme system.
 */

import { createSystem, defaultConfig } from "@chakra-ui/react"
import { globalCss } from "./globalCss"
import { semanticColors } from "./semanticTokens/colors"
import { semanticShadows } from "./semanticTokens/shadows"
import { colors } from "./tokens/colors"

export const system = createSystem(defaultConfig, {
  globalCss,
  theme: {
    tokens: {
      fonts: {
        body: { value: "Inter, sans-serif" }, // Fallback stack if Inter fails to load
        heading: { value: "Inter, sans-serif" },
      },
      fontWeights: {
        normal: { value: 400 },
        medium: { value: 500 },
        semi_bold: { value: 600 },
        bold: { value: 700 },
      },
      colors,
      shadows: {
        uiSwitchThumb: { value: "0px 2px 4px rgba(0,0,0,0.2)" },
      },
    },
    semanticTokens: {
      colors: semanticColors,
      shadows: semanticShadows,
    },
  },
})
