/**
 * UZE / ESS telemetry tab redirect route: resolves optional plant search params and mounts the storage telemetry tab.
 * Composes `PlantTabRedirect` with the `essdata` slug expected by the plant sidebar configuration.
 */

import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"

import { PlantTabRedirect } from "@/components_2/Sidebar/PlantTabRedirect"

const searchSchema = z.object({
  plantId: z.number().optional(),
})

export const Route = createFileRoute("/_layout/uze")({
  component: () => <PlantTabRedirect tab="essdata" />,
  validateSearch: (search) => searchSchema.parse(search),
})
