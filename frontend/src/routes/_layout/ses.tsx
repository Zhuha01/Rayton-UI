/**
 * SES (solar energy system) tab redirect route: forwards validated search params to the SES telemetry experience.
 * Same redirect helper as other plant tabs to avoid duplicating plant-selection wiring in every feature route.
 */

import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"

import { PlantTabRedirect } from "@/components_2/Sidebar/PlantTabRedirect"

const searchSchema = z.object({
  plantId: z.number().optional(),
})

export const Route = createFileRoute("/_layout/ses")({
  component: () => <PlantTabRedirect tab="smdata" />,
  validateSearch: (search) => searchSchema.parse(search),
})
