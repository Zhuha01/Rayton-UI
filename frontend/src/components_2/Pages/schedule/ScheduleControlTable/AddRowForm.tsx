/**
 * Add Row Form within the Rayton operator UI (components_2/Pages/schedule/ScheduleControlTable/AddRowForm.tsx).
 * Built with Chakra UI and shared theme tokens to stay consistent with dashboards, management, and control surfaces.
 * Primary contract: exported component props and functions below (see TypeScript types for required fields).
 */

import { Field, Flex, IconButton, Input, Table } from "@chakra-ui/react"
import { LuPlus } from "react-icons/lu"
import { SCHEDULE_NUMERIC_MAX, SCHEDULE_NUMERIC_MAX_DIGITS } from "./scheduleControlTableConstants"
import { NumericCell } from "./NumericCell"
import { TableCheckbox } from "./TableCheckbox"
import type { NewScheduleRow } from "./scheduleControlTableTypes"
import { formatScheduleTimeHm } from "../timeFormat"

interface AddRowFormProps {
  newRow: NewScheduleRow
  isNewRowStartTimeInvalid: boolean
  nextRecNoDisplay: number
  handleNewRowChange: (field: keyof NewScheduleRow, value: any) => void
  handleAddRow: () => void
}

const AddRowForm = ({
  newRow,
  isNewRowStartTimeInvalid,
  nextRecNoDisplay,
  handleNewRowChange,
  handleAddRow,
}: AddRowFormProps) => {
  const rowBg = "ui.ScheduleTable.rowBgEven"

  return (
    <Table.Row key="new-row" bg="transparent">
      {/* Display calculated next rec_no */}
      <Table.Cell bg={rowBg}>{nextRecNoDisplay}</Table.Cell>
      {/* ... Rest of the 'Add New' row inputs ... */}
      <Table.Cell bg={rowBg}>
        <Field.Root
          invalid={isNewRowStartTimeInvalid} // Use new state here
        >
          <Input
            type="time"
            size="sm"
            value={formatScheduleTimeHm(newRow.start_time)}
            onChange={(e) =>
              handleNewRowChange(
                "start_time",
                `${e.target.value || "00:00"}:00`,
              )
            }
            step={60}
            css={{
              "&::-webkit-calendar-picker-indicator": { display: "none" },
            }}
          />
        </Field.Root>
      </Table.Cell>
      <Table.Cell bg={rowBg}>
        {/* End time is implicit */}
        <Input
          type="text"
          size="sm"
          readOnly
          placeholder="--"
          bg="ui.ScheduleTable.headerBg"
        />
      </Table.Cell>
      <Table.Cell bg={rowBg} textAlign="end">
        <Flex justify="center" align="center" flexShrink={0} overflow="visible">
          <TableCheckbox
            checked={newRow.charge_from_grid}
            onChange={(checked) =>
              handleNewRowChange("charge_from_grid", checked)
            }
          />
        </Flex>
      </Table.Cell>
      <Table.Cell bg={rowBg} textAlign="end">
        <Flex justify="center" align="center" flexShrink={0} overflow="visible">
          <TableCheckbox
            checked={newRow.allow_to_sell}
            onChange={(checked) => handleNewRowChange("allow_to_sell", checked)}
          />
        </Flex>
      </Table.Cell>
      <Table.Cell bg={rowBg} textAlign="end">
        <NumericCell
          value={newRow.charge_power}
          min={0}
          max={SCHEDULE_NUMERIC_MAX}
          maxDigits={SCHEDULE_NUMERIC_MAX_DIGITS}
          onChange={(next) => handleNewRowChange("charge_power", next)}
        />
      </Table.Cell>
      <Table.Cell bg={rowBg} textAlign="end">
        <NumericCell
          value={newRow.charge_limit}
          min={0}
          max={SCHEDULE_NUMERIC_MAX}
          maxDigits={SCHEDULE_NUMERIC_MAX_DIGITS}
          onChange={(next) => handleNewRowChange("charge_limit", next)}
        />
      </Table.Cell>
      <Table.Cell bg={rowBg} textAlign="end">
        <NumericCell
          value={newRow.discharge_power}
          min={0}
          max={SCHEDULE_NUMERIC_MAX}
          maxDigits={SCHEDULE_NUMERIC_MAX_DIGITS}
          onChange={(next) => handleNewRowChange("discharge_power", next)}
        />
      </Table.Cell>
      <Table.Cell bg={rowBg}>
        <IconButton
          aria-label="Add Row"
          size="sm"
          colorScheme="green"
          onClick={handleAddRow}
        >
          <LuPlus />
        </IconButton>
      </Table.Cell>
    </Table.Row>
  )
}

export default AddRowForm
