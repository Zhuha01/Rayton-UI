/**
 * Orange-accented toggle built on Chakra Switch with two physical size presets.
 * Exposes sizing tokens that align mobile zoom targets with tighter desktop layouts.
 */

import { Box, Switch } from "@chakra-ui/react"

export interface OrangeToggleSwitchProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  size?: "md" | "sm"
}

const PRESETS = {
  md: { trackW: 44, trackH: 22, thumb: 18, pad: 2 },
  sm: { trackW: 36, trackH: 18, thumb: 14, pad: 2 },
} as const

export function OrangeToggleSwitch({
  checked,
  onCheckedChange,
  disabled = false,
  size = "md",
}: OrangeToggleSwitchProps) {
  const { trackW, trackH, thumb, pad } = PRESETS[size]
  const travelPx = trackW - thumb - pad * 2
  const padPx = `${pad}px`
  const insetPx = `${pad}px`

  return (
    <Switch.Root
      checked={checked}
      disabled={disabled}
      onCheckedChange={(e) => onCheckedChange(!!e.checked)}
    >
      <Switch.HiddenInput />
      <Switch.Control
        width={`${trackW}px`}
        height={`${trackH}px`}
        bg={disabled ? "ui.Switch.trackDisabledBg" : "ui.Interactive.hoverBg"}
        borderRadius="full"
        position="relative"
        p={padPx}
        cursor={disabled ? "not-allowed" : "pointer"}
        opacity={disabled ? 0.6 : 1}
        _focusVisible={{ outline: "none" }}
      >
        <Box
          position="absolute"
          inset={insetPx}
          borderRadius="full"
          bg={
            !disabled && checked ? "ui.Interactive.accentHover" : "transparent"
          }
          transition="background 0.2s"
        />
        <Switch.Thumb style={{ transform: "none", all: "unset" }}>
          <Box
            width={`${thumb}px`}
            height={`${thumb}px`}
            bg={
              disabled ? "ui.Switch.thumbDisabledBg" : "ui.Interactive.accent"
            }
            borderRadius="full"
            boxShadow="uiSwitchThumb"
            transition="transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
            style={{
              transform: checked
                ? `translateX(${travelPx}px)`
                : "translateX(0px)",
            }}
          />
        </Switch.Thumb>
      </Switch.Control>
    </Switch.Root>
  )
}
