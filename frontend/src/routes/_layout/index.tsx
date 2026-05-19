/**
 * Default `/_layout/` index route: resolves the user’s initial tenant and plant, then redirects into `/plant/$plantId`.
 * Renders nothing itself; navigation is entirely handled in `beforeLoad`.
 */

import { createFileRoute, redirect } from "@tanstack/react-router"

import { resolveInitialTenantAndPlant } from "@/initialSelection"

export const Route = createFileRoute("/_layout/")({
  beforeLoad: async () => {
    const selection = await resolveInitialTenantAndPlant()
    if (selection.kind === "ok") {
      throw redirect({
        to: "/plant/$plantId",
        params: { plantId: String(selection.plantId) },
        replace: true,
      })
    }
  },
  component: () => null,
})
