/**
 * PLC control tab redirect route: optional `plantId` search validation before delegating to `PlantTabRedirect`.
 * Keeps plant-level deep links aligned with the sidebar tab model without duplicating control page logic.
 */

import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"

import { PlantTabRedirect } from "@/components_2/Sidebar/PlantTabRedirect"

const searchSchema = z.object({
  plantId: z.number().optional(),
})

export const Route = createFileRoute("/_layout/control")({
  component: () => <PlantTabRedirect tab="control" />,
  validateSearch: (search) => searchSchema.parse(search),
})
