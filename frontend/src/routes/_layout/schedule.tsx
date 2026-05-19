/**
 * Schedule tab redirect route: shares the lightweight search schema used by other plant tabs, then opens scheduling UI.
 * Uses `PlantTabRedirect` so the schedule feature mounts under the same plant context as dashboard tabs.
 */

import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"

import { PlantTabRedirect } from "@/components_2/Sidebar/PlantTabRedirect"

const searchSchema = z.object({
  plantId: z.number().optional(),
})

export const Route = createFileRoute("/_layout/schedule")({
  component: () => <PlantTabRedirect tab="schedule" />,
  validateSearch: (search) => searchSchema.parse(search),
})
