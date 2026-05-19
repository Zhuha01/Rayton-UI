/**
 * Provider within the Rayton operator UI (components_2/ui/Provider.tsx).
 * Built with Chakra UI and shared theme tokens to stay consistent with dashboards, management, and control surfaces.
 * Primary contract: exported component props and functions below (see TypeScript types for required fields).
 */
"use client"

import { ChakraProvider } from "@chakra-ui/react"
import { type PropsWithChildren } from "react"
import { system } from "@theme"
import { ColorModeProvider } from "@/components_2/ui/ColorMode"
import { Toaster } from "@/components_2/ui/Toaster"

export function CustomProvider(props: PropsWithChildren) {
  return (
    <ChakraProvider value={system}>
      <ColorModeProvider defaultTheme="dark">{props.children}</ColorModeProvider>
      <Toaster />
    </ChakraProvider>
  )
}

