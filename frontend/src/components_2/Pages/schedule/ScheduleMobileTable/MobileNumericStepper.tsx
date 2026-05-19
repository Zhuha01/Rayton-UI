/**
 * Mobile Numeric Stepper within the Rayton operator UI (components_2/Pages/schedule/ScheduleMobileTable/MobileNumericStepper.tsx).
 * Built with Chakra UI and shared theme tokens to stay consistent with dashboards, management, and control surfaces.
 * Primary contract: exported component props and functions below (see TypeScript types for required fields).
 */
import { chakra, Flex, Text } from "@chakra-ui/react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { StrArrowIcon } from "@/components_2/ui/StrArrowIcon"
import {
  commitPowerFieldInput,
  normalizePowerFieldInput,
} from "../ScheduleControlTable/schedulePowerInput"
import { SCHEDULE_UI } from "../scheduleUi"

type MobileNumericStepperProps = {
  label: string
  value: number
  onChange: (next: number) => void
  step?: number
  min?: number
  max?: number
  /** If set, only digits and this length; matches desktop `NumericCell`. */
  maxDigits?: number
  isDisabled?: boolean
}

export function MobileNumericStepper({
  label,
  value,
  onChange,
  step = 1,
  min,
  max,
  maxDigits,
  isDisabled,
}: MobileNumericStepperProps) {
  const m = SCHEDULE_UI.table.mobile

  const [textValue, setTextValue] = useState<string>(() =>
    Number.isFinite(value) ? String(value) : "0",
  )
  const isFocusedRef = useRef(false)

  const clamp = useCallback(
    (next: number) => {
      let n = next
      if (typeof min === "number") n = Math.max(min, n)
      if (typeof max === "number") n = Math.min(max, n)
      return n
    },
    [min, max],
  )

  const safeValue = useMemo(() => (Number.isFinite(value) ? value : 0), [value])

  const digitOpts = useMemo((): {
    maxDigits: number
    min?: number
    max?: number
  } | null => {
    if (typeof maxDigits !== "number") return null
    return { maxDigits, min, max }
  }, [maxDigits, min, max])

  useEffect(() => {
    if (!isFocusedRef.current) setTextValue(String(safeValue))
  }, [safeValue])

  const emptyCommitFallback =
    typeof min === "number" && Number.isFinite(min) ? min : 0

  const commit = useCallback(
    (raw: string) => {
      if (digitOpts) {
        const next = commitPowerFieldInput(
          raw,
          digitOpts,
          emptyCommitFallback,
        )
        onChange(next)
        setTextValue(String(next))
        return
      }

      const trimmed = raw.trim()
      if (trimmed === "" || trimmed === "-" || trimmed === "+") {
        const next = clamp(emptyCommitFallback)
        onChange(next)
        setTextValue(String(next))
        return
      }
      const parsed = Number(trimmed)
      if (!Number.isFinite(parsed)) {
        setTextValue(String(safeValue))
        return
      }
      const next = clamp(parsed)
      onChange(next)
      setTextValue(String(next))
    },
    [clamp, digitOpts, emptyCommitFallback, onChange, safeValue],
  )

  const decrement = useCallback(() => {
    const next = clamp(safeValue - step)
    onChange(next)
    if (!isFocusedRef.current) setTextValue(String(next))
  }, [clamp, onChange, safeValue, step])

  const increment = useCallback(() => {
    const next = clamp(safeValue + step)
    onChange(next)
    if (!isFocusedRef.current) setTextValue(String(next))
  }, [clamp, onChange, safeValue, step])

  const handleChange = useCallback(
    (raw: string) => {
      if (!digitOpts) {
        const nextText = raw
        setTextValue(nextText)
        if (
          nextText.trim() === "" ||
          nextText === "-" ||
          nextText === "+"
        )
          return
        const parsed = Number(nextText)
        if (Number.isFinite(parsed)) onChange(clamp(parsed))
        return
      }

      const { displayText, commitValue } = normalizePowerFieldInput(
        raw,
        digitOpts,
      )
      setTextValue(displayText)
      if (commitValue !== undefined) {
        onChange(commitValue)
      }
    },
    [clamp, digitOpts, onChange],
  )

  return (
    <Flex
      align="center"
      justify="space-between"
      w="100%"
      pl="16px"
      pr="8px"
      py="8px"
      borderRadius={m.cardRadius}
      bg={m.mobileStepperRowBg}
      overflow="hidden"
    >
      <Text
        fontSize={`${m.bodyLabelFontSizePx}px`}
        fontWeight={600}
        color={m.mobileMutedText}
        whiteSpace="nowrap"
      >
        {label}
      </Text>
      <Flex align="stretch" flexShrink={0}>
        <chakra.button
          type="button"
          aria-label="Зменшити"
          display="flex"
          alignItems="center"
          justifyContent="center"
          px={m.stepperBtnPx}
          py="16px"
          bg={m.mobileStepperBtnBg}
          borderTopLeftRadius={m.cardRadius}
          borderBottomLeftRadius={m.cardRadius}
          color={m.mobileChevron}
          border="none"
          cursor="pointer"
          disabled={isDisabled}
          onClick={decrement}
          _disabled={{ opacity: 0.4, cursor: "not-allowed" }}
        >
          <StrArrowIcon rotateDeg={180} width={6} height={13} strokeWidth={2} />
        </chakra.button>
        <Flex
          align="center"
          justify="center"
          px={0}
          py={0}
          minW="64px"
          bg={m.mobileStepperBtnBg}
          borderLeftWidth="1px"
          borderRightWidth="1px"
          borderColor={m.mobileStepperValueBorder}
          borderStyle="solid"
        >
          <chakra.input
            type={digitOpts ? "text" : "number"}
            inputMode={digitOpts ? "numeric" : undefined}
            autoComplete="off"
            value={textValue}
            disabled={isDisabled}
            onFocus={() => {
              isFocusedRef.current = true
            }}
            onBlur={() => {
              isFocusedRef.current = false
              commit(textValue)
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter")
                (e.currentTarget as HTMLInputElement).blur()
            }}
            onChange={(e) => handleChange(e.target.value)}
            aria-label={label}
            css={{
              MozAppearance: "textfield",
              "&::-webkit-outer-spin-button, &::-webkit-inner-spin-button": {
                WebkitAppearance: "none",
                margin: 0,
              },
            }}
            style={{
              width: "64px",
              height: "100%",
              background: "transparent",
              border: "none",
              outline: "none",
              padding: "10px 16px",
              textAlign: "center",
              fontSize: `${m.bodyValueFontSizePx}px`,
              fontWeight: 600,
              color: "inherit",
            }}
          />
        </Flex>
        <chakra.button
          type="button"
          aria-label="Збільшити"
          display="flex"
          alignItems="center"
          justifyContent="center"
          px={m.stepperBtnPx}
          py="16px"
          bg={m.mobileStepperBtnBg}
          borderTopRightRadius={m.cardRadius}
          borderBottomRightRadius={m.cardRadius}
          color={m.mobileChevron}
          border="none"
          cursor="pointer"
          disabled={isDisabled}
          onClick={increment}
          _disabled={{ opacity: 0.4, cursor: "not-allowed" }}
        >
          <StrArrowIcon width={6} height={13} strokeWidth={2} />
        </chakra.button>
      </Flex>
    </Flex>
  )
}
