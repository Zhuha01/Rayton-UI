/**
 * Schedule Mobile Row within the Rayton operator UI (components_2/Pages/schedule/ScheduleMobileTable/ScheduleMobileRow.tsx).
 * Built with Chakra UI and shared theme tokens to stay consistent with dashboards, management, and control surfaces.
 * Primary contract: exported component props and functions below (see TypeScript types for required fields).
 */
import { Box, Flex, HStack, Input, Text, VStack } from "@chakra-ui/react"
import { type KeyboardEvent, useRef } from "react"
import { FiChevronDown, FiChevronUp } from "react-icons/fi"
import { useTranslation } from "react-i18next"
import type { ScheduleRow } from "@/client"
import type { ScheduleControlTableVariant } from "../ScheduleControlTable"
import {
  SCHEDULE_NUMERIC_MAX,
  SCHEDULE_NUMERIC_MAX_DIGITS,
} from "../ScheduleControlTable/scheduleControlTableConstants"
import type { ScheduleDisplayRow } from "../ScheduleControlTable/scheduleControlTableTypes"
import { SCHEDULE_UI } from "../scheduleUi"
import { formatScheduleTimeHm } from "../timeFormat"
import { MobileNumericStepper } from "./MobileNumericStepper"
import { MobileToggle } from "./MobileToggle"

export type ScheduleMobileRowProps = {
  row: ScheduleDisplayRow
  invalidRows: number[]
  variant: ScheduleControlTableVariant
  expanded: boolean
  onToggleExpand: () => void
  handleChange: (id: number, field: keyof ScheduleRow, value: unknown) => void
}

function SummaryPart({ value }: { value: number }) {
  const m = SCHEDULE_UI.table.mobile
  return (
    <Text
      as="span"
      fontSize={`${m.summaryFontSizePx}px`}
      fontWeight={600}
      color={m.mobileMutedText}
    >
      {Number.isFinite(value) ? value : 0}
    </Text>
  )
}

export default function ScheduleMobileRow({
  row,
  invalidRows,
  variant,
  expanded,
  onToggleExpand,
  handleChange,
}: ScheduleMobileRowProps) {
  const { t } = useTranslation("Schedule")
  const m = SCHEDULE_UI.table.mobile
  const timeInputRef = useRef<HTMLInputElement | null>(null)

  const isInvalid = invalidRows.includes(row.id)
  const isStartTimeInvalid =
    isInvalid && !(row.rec_no === 1 && row.start_time === "00:00:00")
  const isTimeReadOnly = row.rec_no === 1 && row.start_time === "00:00:00"

  const startLabel = formatScheduleTimeHm(row.start_time)
  const endLabel = formatScheduleTimeHm(row.displayEndTime)

  const timeColor = expanded ? m.mobileTimeTextActive : m.mobileTimeText

  const showGridToggle = variant === "default" || variant === "woSell"
  const showSellToggle = variant === "default" || variant === "light"

  const onHeaderKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      onToggleExpand()
    }
  }

  return (
    <Box
      w="100%"
      borderRadius={m.cardRadius}
      bg={isStartTimeInvalid ? SCHEDULE_UI.table.invalidRowBg : m.mobileCardBg}
      borderWidth="1px"
      borderStyle="solid"
      borderColor={expanded ? m.mobileCardBorderActive : m.mobileCardBorder}
      overflow="hidden"
    >
      <Flex
        align="center"
        minH={`${m.headerMinHPx}px`}
        px="16px"
        py="10px"
        gap="8px"
        cursor="pointer"
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        onClick={onToggleExpand}
        onKeyDown={onHeaderKeyDown}
      >
        <Flex
          w={`${m.badgeSizePx}px`}
          h={`${m.badgeSizePx}px`}
          minW={`${m.badgeSizePx}px`}
          align="center"
          justify="center"
          borderRadius={m.cardRadius}
          borderWidth="1px"
          borderStyle="solid"
          borderColor={m.mobileBadgeBorder}
          bg={m.mobileBadgeBg}
          flexShrink={0}
        >
          <Text
            fontSize={`${m.badgeFontSizePx}px`}
            fontWeight={400}
            color={m.mobileTimeText}
          >
            {row.rec_no}
          </Text>
        </Flex>

        <HStack
          flex="1"
          minW={0}
          gap={0}
          align="center"
          justify="flex-start"
          onClick={(e) => {
            e.stopPropagation()
            if (!isTimeReadOnly) {
              timeInputRef.current?.showPicker?.()
              timeInputRef.current?.focus()
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.stopPropagation()
              if (!isTimeReadOnly) {
                timeInputRef.current?.showPicker?.()
                timeInputRef.current?.focus()
              }
            }
          }}
          role={isTimeReadOnly ? undefined : "button"}
          tabIndex={isTimeReadOnly ? undefined : 0}
          position="relative"
          borderRadius="4px"
          outline={isStartTimeInvalid ? "2px solid" : "none"}
          outlineColor={
            isStartTimeInvalid
              ? SCHEDULE_UI.table.invalidOutlineColor
              : "transparent"
          }
          outlineOffset={isStartTimeInvalid ? "2px" : "0"}
        >
          <Text
            pointerEvents="none"
            fontSize={`${m.timeFontSizePx}px`}
            fontWeight={600}
            color={timeColor}
            px="8px"
            minW="70px"
            textAlign="center"
            whiteSpace="nowrap"
          >
            {startLabel}
          </Text>
          <Text
            pointerEvents="none"
            fontSize={`${m.timeFontSizePx}px`}
            fontWeight={600}
            color={m.mobileMutedText}
            whiteSpace="nowrap"
          >
            -
          </Text>
          <Text
            pointerEvents="none"
            fontSize={`${m.timeFontSizePx}px`}
            fontWeight={600}
            color={timeColor}
            px="8px"
            minW="70px"
            textAlign="center"
            whiteSpace="nowrap"
          >
            {endLabel}
          </Text>
          <Input
            ref={timeInputRef}
            type="time"
            step={60}
            value={formatScheduleTimeHm(row.start_time)}
            readOnly={isTimeReadOnly}
            onChange={(e) =>
              handleChange(
                row.id,
                "start_time",
                `${e.target.value || "00:00"}:00`,
              )
            }
            position="absolute"
            opacity={0}
            inset={0}
            w="100%"
            h="100%"
            cursor={isTimeReadOnly ? "default" : "pointer"}
            p={0}
            m={0}
            border="none"
            aria-label={t("table.mobile.startTimeAria")}
            css={{
              "&::-webkit-calendar-picker-indicator": {
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                opacity: 0,
                cursor: isTimeReadOnly ? "default" : "pointer",
              },
            }}
          />
        </HStack>

        <HStack
          flexShrink={1}
          minW={0}
          gap="0"
          align="center"
          justify="flex-end"
          pr="4px"
        >
          <SummaryPart value={row.charge_power} />
          <Text
            as="span"
            fontSize={`${m.summaryFontSizePx}px`}
            fontWeight={600}
            color={m.mobileMutedText}
            px="2px"
          >
            /
          </Text>
          <SummaryPart value={row.charge_limit} />
          <Text
            as="span"
            fontSize={`${m.summaryFontSizePx}px`}
            fontWeight={600}
            color={m.mobileMutedText}
            px="2px"
          >
            /
          </Text>
          <SummaryPart value={row.discharge_power} />
        </HStack>

        <Box flexShrink={0} color={m.mobileChevron} aria-hidden>
          {expanded ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
        </Box>
      </Flex>

      {expanded && (
        <Box px="15px" pb="16px" pt="0">
          <Box
            borderTopWidth="1px"
            borderTopStyle="solid"
            borderColor={m.mobileDivider}
            mb="8px"
          />

          <HStack justify="flex-end" gap="24px" py="10px" px="2px">
            {showGridToggle && (
              <MobileToggle
                label={t("table.mobile.toggles.fromGrid")}
                checked={row.charge_from_grid}
                onChange={(checked) =>
                  handleChange(row.id, "charge_from_grid", checked)
                }
              />
            )}
            {showSellToggle && (
              <MobileToggle
                label={t("table.mobile.toggles.sell")}
                checked={row.allow_to_sell}
                onChange={(checked) =>
                  handleChange(row.id, "allow_to_sell", checked)
                }
              />
            )}
          </HStack>

          <VStack align="stretch" gap="8px" mt="8px">
            <MobileNumericStepper
              label={t("table.mobile.fields.charge")}
              value={row.charge_power}
              min={0}
              max={SCHEDULE_NUMERIC_MAX}
              maxDigits={SCHEDULE_NUMERIC_MAX_DIGITS}
              onChange={(next) => handleChange(row.id, "charge_power", next)}
            />
            <MobileNumericStepper
              label={t("table.mobile.fields.chargeLimit")}
              value={row.charge_limit}
              min={0}
              max={SCHEDULE_NUMERIC_MAX}
              maxDigits={SCHEDULE_NUMERIC_MAX_DIGITS}
              onChange={(next) => handleChange(row.id, "charge_limit", next)}
            />
            <MobileNumericStepper
              label={t("table.mobile.fields.discharge")}
              value={row.discharge_power}
              min={0}
              max={SCHEDULE_NUMERIC_MAX}
              maxDigits={SCHEDULE_NUMERIC_MAX_DIGITS}
              onChange={(next) => handleChange(row.id, "discharge_power", next)}
            />
          </VStack>
        </Box>
      )}
    </Box>
  )
}
