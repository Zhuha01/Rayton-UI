/**
 * Numeric Cell within the Rayton operator UI (components_2/Pages/schedule/ScheduleControlTable/NumericCell.tsx).
 * Built with Chakra UI and shared theme tokens to stay consistent with dashboards, management, and control surfaces.
 * Primary contract: exported component props and functions below (see TypeScript types for required fields).
 */
import { Flex, IconButton, Input } from "@chakra-ui/react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { StrArrowIcon } from "@/components_2/ui/StrArrowIcon"

import {
  commitPowerFieldInput,
  normalizePowerFieldInput,
} from "./schedulePowerInput"

type NumericCellProps = {
  value: number
  onChange: (nextValue: number) => void
  step?: number
  min?: number
  max?: number
  /** Only allow this many digits (e.g. 3 with max 220). Ignores non-digits while typing. */
  maxDigits?: number
  isDisabled?: boolean
}

export function NumericCell({
  value,
  onChange,
  step = 1,
  min,
  max,
  maxDigits,
  isDisabled,
}: NumericCellProps) {
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

  useEffect(() => {
    if (!isFocusedRef.current) {
      setTextValue(String(safeValue))
    }
  }, [safeValue])

  const digitOpts = useMemo((): {
    maxDigits: number
    min?: number
    max?: number
  } | null => {
    if (typeof maxDigits !== "number") return null
    return { maxDigits, min, max }
  }, [maxDigits, min, max])

  const commit = useCallback(
    (raw: string) => {
      if (digitOpts) {
        const n = commitPowerFieldInput(raw, digitOpts, 0)
        onChange(n)
        setTextValue(String(n))
        return
      }

      const trimmed = raw.trim()
      if (trimmed === "" || trimmed === "-" || trimmed === "+") {
        onChange(clamp(0))
        setTextValue("0")
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
    [clamp, digitOpts, onChange, safeValue],
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

  const handleControlledChange = useCallback(
    (raw: string) => {
      if (!digitOpts) {
        const nextText = raw
        setTextValue(nextText)
        if (nextText.trim() === "" || nextText === "-" || nextText === "+") return
        const parsed = Number(nextText)
        if (Number.isFinite(parsed)) {
          onChange(clamp(parsed))
        }
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
    <Flex align="center" justify="center" gap="4px" w="fit-content" mx="auto">
      <IconButton
  aria-label="Decrease"
  variant="ghost"
  size="xs"
  onClick={decrement}
  disabled={isDisabled}
  minW="16px"
  w="16px"
  h="24px"
  p={0}
  borderRadius="6px"
  transition="background-color 0.2s ease"
  _hover={{ bg: "ui.Interactive.hoverBg" }}
  _active={{ bg: "ui.Interactive.hoverBg" }}
>
  <StrArrowIcon rotateDeg={180} />
</IconButton>

      <Input
        type={typeof maxDigits === "number" ? "text" : "number"}
        inputMode={typeof maxDigits === "number" ? "numeric" : undefined}
        autoComplete="off"
        size="sm"
        w="44px"
        minW="44px"
        bg="transparent"
        color="inherit"
        value={textValue}
        onFocus={() => {
          isFocusedRef.current = true
        }}
        onBlur={() => {
          isFocusedRef.current = false
          commit(textValue)
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            ;(e.currentTarget as HTMLInputElement).blur()
          }
        }}
        onChange={(e) => handleControlledChange(e.target.value)}
        variant="flushed"
        borderColor="transparent"
        _focusVisible={{ boxShadow: "none", borderColor: "transparent" }}
        textAlign="center"
        disabled={isDisabled}
        css={{
          MozAppearance: "textfield",
          "&::-webkit-outer-spin-button, &::-webkit-inner-spin-button": {
            WebkitAppearance: "none",
            margin: 0,
          },
        }}
      />

<IconButton
  aria-label="Increase"
  variant="ghost"
  size="xs"
  onClick={increment}
  disabled={isDisabled}
  minW="16px"
  w="16px"
  h="24px"
  p={0}
  borderRadius="6px"
  transition="background-color 0.2s ease"
  _hover={{ bg: "ui.Interactive.hoverBg" }}
  _active={{ bg: "ui.Interactive.hoverBg" }}
>
  <StrArrowIcon />
</IconButton>
    </Flex>
  )
}
