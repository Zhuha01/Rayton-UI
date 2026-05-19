/**
 * Label plus custom-styled switch for toggling combined SOC display on trend charts.
 * Sizes track and thumb from design tokens and animates thumb travel within padded track bounds.
 */

import { Box, HStack, Switch, Text } from "@chakra-ui/react"
import { useTranslation } from "react-i18next"

export interface SocCombinedSwitchProps {
  isChecked: boolean
  onChange: (checked: boolean) => void
  isDisabled?: boolean
  label?: string
  variant?: "default" | "compact"
}

export function SocCombinedSwitch({
  isChecked,
  onChange,
  isDisabled = false,
  label,
  variant = "default",
}: SocCombinedSwitchProps) {
  const { t } = useTranslation("Dashboard")
  const trackWidthPx = 52
  const thumbSizePx = 18
  const paddingPx = 2

  const travelDistance = trackWidthPx - thumbSizePx - paddingPx * 2

  const resolvedLabel =
    label ?? (variant === "compact" ? "SOC" : t("chartControls.socCombined"))

  return (
    <HStack gap={3} align="center">
      <Text
        fontSize="14px"
        fontWeight="500"
        whiteSpace="nowrap"
        color={isDisabled ? "ui.Chart.mutedText" : "text.normal"}
        opacity={isDisabled ? 0.45 : 1}
      >
        {resolvedLabel}
      </Text>

      <Switch.Root
        checked={isChecked}
        disabled={isDisabled}
        onCheckedChange={(e) => onChange(e.checked)}
      >
        <Switch.HiddenInput />
        <Switch.Control
          width={`${trackWidthPx}px`}
          height="22px"
          bg={
            isDisabled ? "ui.Switch.trackDisabledBg" : "ui.Interactive.hoverBg"
          }
          borderRadius="full"
          cursor={isDisabled ? "not-allowed" : "pointer"}
          position="relative"
          p={`${paddingPx}px`}
          _focusVisible={{ outline: "none" }}
          opacity={isDisabled ? 0.6 : 1}
        >
          <Box
            position="absolute"
            inset={`${paddingPx}px`}
            borderRadius="full"
            bg={
              !isDisabled && isChecked
                ? "ui.Interactive.accentHover"
                : "transparent"
            }
            transition="background 0.2s"
          />

          <Switch.Thumb style={{ transform: "none", all: "unset" }}>
            <Box
              width={`${thumbSizePx}px`}
              height={`${thumbSizePx}px`}
              bg={
                isDisabled
                  ? "ui.Switch.thumbDisabledBg"
                  : "ui.Interactive.accent"
              }
              borderRadius="full"
              boxShadow="uiSwitchThumb"
              transition="transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
              style={{
                transform: isChecked
                  ? `translateX(${travelDistance}px)`
                  : "translateX(0px)",
              }}
            />
          </Switch.Thumb>
        </Switch.Control>
      </Switch.Root>
    </HStack>
  )
}
