/**
 * Legacy `/plant` route: mirrors the index resolver by redirecting to the concrete plant dashboard path.
 * Retained so bookmarks and older links continue to land on the correct tenant-scoped experience.
 */

import { createFileRoute, redirect } from "@tanstack/react-router"

import { resolveInitialTenantAndPlant } from "@/initialSelection"

export const Route = createFileRoute("/_layout/plant")({
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

