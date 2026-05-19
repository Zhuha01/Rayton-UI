/**
 * Plant settings tab redirect route: validates optional `plantId` search params and forwards to the plant tab shell.
 * Implemented via `PlantTabRedirect` so deep links stay consistent with other plant sub-routes.
 */

import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"

import { PlantTabRedirect } from "@/components_2/Sidebar/PlantTabRedirect"

const searchSchema = z.object({
  plantId: z.number().optional(),
})

export const Route = createFileRoute("/_layout/plant-settings")({
  component: () => <PlantTabRedirect tab="settings" />,
  validateSearch: (search) => searchSchema.parse(search),
})
