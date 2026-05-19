/**
 * Schedule Mobile Table within the Rayton operator UI (components_2/Pages/schedule/ScheduleMobileTable/ScheduleMobileTable.tsx).
 * Built with Chakra UI and shared theme tokens to stay consistent with dashboards, management, and control surfaces.
 * Primary contract: exported component props and functions below (see TypeScript types for required fields).
 */
import { VStack } from "@chakra-ui/react"
import { useCallback, useState } from "react"
import type { ScheduleRow } from "@/client"
import type { ScheduleControlTableVariant } from "../ScheduleControlTable"
import type { ScheduleDisplayRow } from "../ScheduleControlTable/scheduleControlTableTypes"
import { SCHEDULE_UI } from "../scheduleUi"
import ScheduleMobileRow from "./ScheduleMobileRow"

export type ScheduleMobileTableProps = {
  displayData: ScheduleDisplayRow[]
  invalidRows: number[]
  variant: ScheduleControlTableVariant
  handleChange: (id: number, field: keyof ScheduleRow, value: unknown) => void
}

export default function ScheduleMobileTable({
  displayData,
  invalidRows,
  variant,
  handleChange,
}: ScheduleMobileTableProps) {
  const m = SCHEDULE_UI.table.mobile
  const [expandedIds, setExpandedIds] = useState<Set<number>>(() => new Set())

  const toggle = useCallback((id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  return (
    <VStack align="stretch" gap={`${m.stackGapPx}px`} w="100%">
      {displayData.map((row) => (
        <ScheduleMobileRow
          key={row.id}
          row={row}
          invalidRows={invalidRows}
          variant={variant}
          expanded={expandedIds.has(row.id)}
          onToggleExpand={() => toggle(row.id)}
          handleChange={handleChange}
        />
      ))}
    </VStack>
  )
}
