/**
 * Link Button within the Rayton operator UI (components_2/ui/LinkButton.tsx).
 * Built with Chakra UI and shared theme tokens to stay consistent with dashboards, management, and control surfaces.
 * Primary contract: exported component props and functions below (see TypeScript types for required fields).
 */
"use client"


import type { HTMLChakraProps, RecipeProps } from "@chakra-ui/react"
import { createRecipeContext } from "@chakra-ui/react"

export interface LinkButtonProps
  extends HTMLChakraProps<"a", RecipeProps<"button">> {}

const { withContext } = createRecipeContext({ key: "button" })

// Replace "a" with your framework's link component
export const LinkButton = withContext<HTMLAnchorElement, LinkButtonProps>("a")
