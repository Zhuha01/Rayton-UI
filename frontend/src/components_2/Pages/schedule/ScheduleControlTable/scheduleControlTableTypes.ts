/**
 * schedule Control Table Types within the Rayton operator UI (components_2/Pages/schedule/ScheduleControlTable/scheduleControlTableTypes.ts).
 * Built with Chakra UI and shared theme tokens to stay consistent with dashboards, management, and control surfaces.
 * Primary contract: exported component props and functions below (see TypeScript types for required fields).
 */

import type { ScheduleRow } from "@/client"

export interface ScheduleDisplayRow extends ScheduleRow {
  displayEndTime: string
}

export interface ScheduleControlTableProps {
  tenantId: string
  date: string
  onScheduleDataChange?: (data: ScheduleRow[]) => void
  onSaveStateChange?: (state: {
    invalidRowsCount: number
    isDirty: boolean
    isSaving: boolean
    commandStatus: "idle" | "sending" | "success" | "failed"
  }) => void
}

export type NewScheduleRow = Omit<
  ScheduleRow,
  "id" | "updated_at" | "rec_no" | "updated_by"
>
