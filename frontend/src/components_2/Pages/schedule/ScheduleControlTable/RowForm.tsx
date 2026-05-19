/**
 * Row Form within the Rayton operator UI (components_2/Pages/schedule/ScheduleControlTable/RowForm.tsx).
 * Built with Chakra UI and shared theme tokens to stay consistent with dashboards, management, and control surfaces.
 * Primary contract: exported component props and functions below (see TypeScript types for required fields).
 */

import { Field, Flex, Input, Table } from "@chakra-ui/react"
import type { ScheduleRow } from "@/client"
import { SCHEDULE_UI } from "../scheduleUi"
import { SCHEDULE_NUMERIC_MAX, SCHEDULE_NUMERIC_MAX_DIGITS } from "./scheduleControlTableConstants"
import { NumericCell } from "./NumericCell"
import { TableCheckbox } from "./TableCheckbox"
import type { ScheduleDisplayRow } from "./scheduleControlTableTypes"
import { formatScheduleTimeHm } from "../timeFormat"

interface RowFormProps {
  row: ScheduleDisplayRow
  rowIndex: number
  invalidRows: number[]
  handleChange: (id: number, field: keyof ScheduleRow, value: any) => void
}

const RowForm = ({
  row,
  rowIndex,
  invalidRows,
  handleChange,
}: RowFormProps) => {
  const isInvalid = invalidRows.includes(row.id)
  // --- FIX: Refine Start Time Invalid Condition ---
  // Mark invalid IF the row ID is in the invalid list,
  // UNLESS it's the very first record (rec_no 1) AND its start time is 00:00:00
  const isStartTimeInvalid =
    isInvalid && !(row.rec_no === 1 && row.start_time === "00:00:00")
  // --- END FIX ---
  const zebraBg =
    rowIndex % 2 === 0
      ? SCHEDULE_UI.table.rowBgEven
      : SCHEDULE_UI.table.rowBgOdd
  const rowBg = isStartTimeInvalid ? SCHEDULE_UI.table.invalidRowBg : zebraBg

  return (
    <Table.Row
      key={row.id}
      bg="transparent"
      color={SCHEDULE_UI.table.cellTextColor}
      h={`${SCHEDULE_UI.table.rowHeightPx}px`}
    >
      <Table.Cell
        bg={rowBg}
        px={SCHEDULE_UI.table.cellPx}
        py={0}
        h={`${SCHEDULE_UI.table.rowHeightPx}px`}
        fontSize={`${SCHEDULE_UI.table.fontSizePx}px`}
        whiteSpace="nowrap"
        color={SCHEDULE_UI.table.mutedTextColor}
        textAlign="center"
        borderTopLeftRadius={SCHEDULE_UI.table.radius}
        borderBottomLeftRadius={SCHEDULE_UI.table.radius}
      >
        {row.rec_no}
      </Table.Cell>
      <Table.Cell
        bg={rowBg}
        px={SCHEDULE_UI.table.cellPx}
        py={0}
        h={`${SCHEDULE_UI.table.rowHeightPx}px`}
        fontSize={`${SCHEDULE_UI.table.fontSizePx}px`}
        whiteSpace="nowrap"
        textAlign="center"
      >
        <Field.Root
          // --- Pass invalid prop here ---
          invalid={isStartTimeInvalid}
          // Optionally add a unique ID if needed for accessibility later
          // id={`start-time-${row.id}`}
        >
          <Input
            type="time"
            size="sm"
            value={formatScheduleTimeHm(row.start_time)}
            onChange={(e) =>
              handleChange(
                row.id,
                "start_time",
                `${e.target.value || "00:00"}:00`,
              )
            }
            readOnly={row.rec_no === 1 && row.start_time === "00:00:00"}
            bg={
              isStartTimeInvalid
                ? SCHEDULE_UI.table.invalidInputBg
                : "transparent"
            }
            color={SCHEDULE_UI.table.cellTextColor}
            whiteSpace="nowrap"
            variant="flushed"
            borderColor="transparent"
            _focusVisible={{ boxShadow: "none", borderColor: "transparent" }}
            textAlign="center"
            w="100%"
            step={60}
            css={{
              "&::-webkit-calendar-picker-indicator": { display: "none" },
            }}
          />
          {/* <TimePicker
            size="sm"
            value={formatScheduleTimeHm(row.start_time)} // Only pass HH:mm part
            onChange={(time) => handleChange(row.id, "start_time", time)}
            readOnly={row.rec_no === 1 && row.start_time === "00:00:00"}
            bg={row.rec_no === 1 && row.start_time === "00:00:0" ? "gray.100" : "white"}
          /> */}
        </Field.Root>
      </Table.Cell>
      <Table.Cell
        bg={rowBg}
        px={SCHEDULE_UI.table.cellPx}
        py={0}
        h={`${SCHEDULE_UI.table.rowHeightPx}px`}
        fontSize={`${SCHEDULE_UI.table.fontSizePx}px`}
        whiteSpace="nowrap"
        textAlign="center"
      >
        {formatScheduleTimeHm(row.displayEndTime)}
      </Table.Cell>
      <Table.Cell
        bg={rowBg}
        px={SCHEDULE_UI.table.cellPx}
        py={0}
        h={`${SCHEDULE_UI.table.rowHeightPx}px`}
        fontSize={`${SCHEDULE_UI.table.fontSizePx}px`}
        whiteSpace="nowrap"
        textAlign="center"
      >
        <Flex justify="center" align="center" flexShrink={0} overflow="visible">
          <TableCheckbox
            checked={row.charge_from_grid}
            onChange={(checked) =>
              handleChange(row.id, "charge_from_grid", checked)
            }
          />
        </Flex>
      </Table.Cell>
      <Table.Cell
        bg={rowBg}
        px={SCHEDULE_UI.table.cellPx}
        py={0}
        h={`${SCHEDULE_UI.table.rowHeightPx}px`}
        fontSize={`${SCHEDULE_UI.table.fontSizePx}px`}
        whiteSpace="nowrap"
        textAlign="center"
      >
        <Flex justify="center" align="center" flexShrink={0} overflow="visible">
          <TableCheckbox
            checked={row.allow_to_sell}
            onChange={(checked) =>
              handleChange(row.id, "allow_to_sell", checked)
            }
          />
        </Flex>
      </Table.Cell>
      <Table.Cell
        bg={rowBg}
        px={SCHEDULE_UI.table.cellPx}
        py={0}
        h={`${SCHEDULE_UI.table.rowHeightPx}px`}
        fontSize={`${SCHEDULE_UI.table.fontSizePx}px`}
        whiteSpace="nowrap"
        textAlign="center"
      >
        <NumericCell
          value={row.charge_power}
          min={0}
          max={SCHEDULE_NUMERIC_MAX}
          maxDigits={SCHEDULE_NUMERIC_MAX_DIGITS}
          onChange={(next) => handleChange(row.id, "charge_power", next)}
        />
      </Table.Cell>
      <Table.Cell
        bg={rowBg}
        px={SCHEDULE_UI.table.cellPx}
        py={0}
        h={`${SCHEDULE_UI.table.rowHeightPx}px`}
        fontSize={`${SCHEDULE_UI.table.fontSizePx}px`}
        whiteSpace="nowrap"
        textAlign="center"
      >
        <NumericCell
          value={row.charge_limit}
          min={0}
          max={SCHEDULE_NUMERIC_MAX}
          maxDigits={SCHEDULE_NUMERIC_MAX_DIGITS}
          onChange={(next) => handleChange(row.id, "charge_limit", next)}
        />
      </Table.Cell>
      <Table.Cell
        bg={rowBg}
        px={SCHEDULE_UI.table.cellPx}
        py={0}
        h={`${SCHEDULE_UI.table.rowHeightPx}px`}
        fontSize={`${SCHEDULE_UI.table.fontSizePx}px`}
        whiteSpace="nowrap"
        textAlign="center"
        borderTopRightRadius={SCHEDULE_UI.table.radius}
        borderBottomRightRadius={SCHEDULE_UI.table.radius}
      >
        <NumericCell
          value={row.discharge_power}
          min={0}
          max={SCHEDULE_NUMERIC_MAX}
          maxDigits={SCHEDULE_NUMERIC_MAX_DIGITS}
          onChange={(next) => handleChange(row.id, "discharge_power", next)}
        />
      </Table.Cell>
    </Table.Row>
  )
}

export default RowForm
