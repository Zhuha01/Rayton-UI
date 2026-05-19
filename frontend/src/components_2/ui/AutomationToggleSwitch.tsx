/**
 * Automation Toggle Switch within the Rayton operator UI (components_2/ui/AutomationToggleSwitch.tsx).
 * Built with Chakra UI and shared theme tokens to stay consistent with dashboards, management, and control surfaces.
 * Primary contract: exported component props and functions below (see TypeScript types for required fields).
 */
import { Box, Switch } from "@chakra-ui/react"

/**
 * Automation toggle for PLC Control, mirroring the layered fill approach of `OrangeToggleSwitch`.
 * The outer `Switch.Control` carries a subtle `trackBg` tint; an inner absolute `Box` paints `fillBg` when ON; the thumb
 * uses `thumbBg` for a brighter green accent. Defaults map to `ui.PlcControl.*` semantic tokens so themes stay in sync.
 */
export function AutomationToggleSwitch({
  checked,
  onCheckedChange,
  disabled = false,
  trackBg,
  fillBg = "ui.PlcControl.automationToggleFill",
  thumbBg = "ui.PlcControl.automationToggleThumb",
  trackW = 65,
  trackH = 30,
  pad = 4,
  thumb = 22,
}: {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  /** Track tint when OFF (under the fill layer). */
  trackBg: string
  /** Inner fill color when ON (under the thumb). */
  fillBg?: string
  /** Thumb (knob) color. */
  thumbBg?: string
  trackW?: number
  trackH?: number
  pad?: number
  thumb?: number
}) {
  const travelPx = trackW - thumb - pad * 2
  const padPx = `${pad}px`

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
        bg={trackBg}
        borderRadius="full"
        position="relative"
        p={padPx}
        cursor={disabled ? "not-allowed" : "pointer"}
        opacity={disabled ? 0.6 : 1}
        _focusVisible={{ outline: "none" }}
      >
        <Box
          position="absolute"
          inset={padPx}
          borderRadius="full"
          bg={!disabled && checked ? fillBg : "transparent"}
          transition="background 0.2s"
          pointerEvents="none"
          aria-hidden
        />
        <Switch.Thumb style={{ transform: "none", all: "unset" }}>
          <Box
            width={`${thumb}px`}
            height={`${thumb}px`}
            bg={thumbBg}
            borderRadius="full"
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
