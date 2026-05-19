/**
 * Accessible button that toggles expanded chart grid state with responsive styling.
 * Mobile uses SVG grid icon and hover token aligned with toolbar controls; desktop uses masked icon.
 */

import { Box, chakra, type HTMLChakraProps, Text } from "@chakra-ui/react"
import { useTranslation } from "react-i18next"

export interface ChartExpansionTriggerProps
  extends Omit<HTMLChakraProps<"button">, "onClick"> {
  onClick: () => void
  isExpanded?: boolean
  isDisabled?: boolean
  showLabel?: boolean
}

export function ChartExpansionTrigger({
  onClick,
  isExpanded,
  isDisabled,
  showLabel = true,
  ...props
}: ChartExpansionTriggerProps) {
  const { t } = useTranslation("Dashboard")
  const activeAndHoverBg = "ui.Interactive.hoverBg"
  const isActive = !!isExpanded

  return (
    <chakra.button
      type="button"
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      display="flex"
      flexShrink={0}
      alignItems="center"
      gap="18px"
      px="12px"
      py="8px"
      h="auto"
      cursor={isDisabled ? "not-allowed" : "pointer"}
      userSelect="none"
      transition="all 0.2s"
      borderRadius="12px"
      // Mobile: active styles like TimeRangePicker "Day" button.
      // Desktop: keep neutral styling (no orange active highlight).
      bg={{
        base: isActive ? activeAndHoverBg : "transparent",
        md: "transparent",
      }}
      color={{
        base: isActive ? "ui.Interactive.accent" : "text.normal",
        md: "text.normal",
      }}
      border="none"
      outline="none"
      opacity={isDisabled ? 0.4 : 1}
      _hover={
        isDisabled
          ? undefined
          : {
              bg: activeAndHoverBg,
              color: {
                base: isActive ? "ui.Interactive.accent" : "text.normal",
                md: "text.normal",
              },
            }
      }
      _active={
        isDisabled
          ? undefined
          : {
              bg: activeAndHoverBg,
              transform: "scale(0.98)",
            }
      }
      _focus={{ boxShadow: "none" }}
      _focusVisible={{ boxShadow: "none" }}
      {...props}
    >
      {showLabel && (
        <Text fontSize="14px" fontWeight="500" whiteSpace="nowrap">
          {isExpanded ? t("chartControls.collapseCharts") : t("chartControls.expandCharts")}
        </Text>
      )}

      {/* Mobile: inline SVG (brighter like TimeRangePicker active label) */}
      <Box
        as="span"
        display={{ base: "inline-flex", md: "none" }}
        alignItems="center"
        justifyContent="center"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ display: "block" }}
        >
          <path
            d="M2.40002 3.60002C2.40002 2.93728 2.93728 2.40002 3.60002 2.40002H6.00002C6.66277 2.40002 7.20002 2.93728 7.20002 3.60002V6.00002C7.20002 6.66277 6.66277 7.20002 6.00002 7.20002H3.60002C2.93728 7.20002 2.40002 6.66277 2.40002 6.00002V3.60002Z"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M9.60002 3.60002C9.60002 2.93728 10.1373 2.40002 10.8 2.40002H13.2C13.8628 2.40002 14.4 2.93728 14.4 3.60002V6.00002C14.4 6.66277 13.8628 7.20002 13.2 7.20002H10.8C10.1373 7.20002 9.60002 6.66277 9.60002 6.00002V3.60002Z"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M16.8 3.60002C16.8 2.93728 17.3373 2.40002 18 2.40002H20.4C21.0628 2.40002 21.6 2.93728 21.6 3.60002V6.00002C21.6 6.66277 21.0628 7.20002 20.4 7.20002H18C17.3373 7.20002 16.8 6.66277 16.8 6.00002V3.60002Z"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M2.40002 10.8C2.40002 10.1373 2.93728 9.60002 3.60002 9.60002H6.00002C6.66277 9.60002 7.20002 10.1373 7.20002 10.8V13.2C7.20002 13.8628 6.66277 14.4 6.00002 14.4H3.60002C2.93728 14.4 2.40002 13.8628 2.40002 13.2V10.8Z"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M9.60002 10.8C9.60002 10.1373 10.1373 9.60002 10.8 9.60002H13.2C13.8628 9.60002 14.4 10.1373 14.4 10.8V13.2C14.4 13.8628 13.8628 14.4 13.2 14.4H10.8C10.1373 14.4 9.60002 13.8628 9.60002 13.2V10.8Z"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M16.8 10.8C16.8 10.1373 17.3373 9.60002 18 9.60002H20.4C21.0628 9.60002 21.6 10.1373 21.6 10.8V13.2C21.6 13.8628 21.0628 14.4 20.4 14.4H18C17.3373 14.4 16.8 13.8628 16.8 13.2V10.8Z"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M2.40002 18C2.40002 17.3373 2.93728 16.8 3.60002 16.8H6.00002C6.66277 16.8 7.20002 17.3373 7.20002 18V20.4C7.20002 21.0628 6.66277 21.6 6.00002 21.6H3.60002C2.93728 21.6 2.40002 21.0628 2.40002 20.4V18Z"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M9.60002 18C9.60002 17.3373 10.1373 16.8 10.8 16.8H13.2C13.8628 16.8 14.4 17.3373 14.4 18V20.4C14.4 21.0628 13.8628 21.6 13.2 21.6H10.8C10.1373 21.6 9.60002 21.0628 9.60002 20.4V18Z"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M16.8 18C16.8 17.3373 17.3373 16.8 18 16.8H20.4C21.0628 16.8 21.6 17.3373 21.6 18V20.4C21.6 21.0628 21.0628 21.6 20.4 21.6H18C17.3373 21.6 16.8 21.0628 16.8 20.4V18Z"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      </Box>

      {/* Desktop: keep existing icon rendering (mask-based) */}
      <Box
        as="span"
        display={{ base: "none", md: "inline-block" }}
        w="24px"
        h="24px"
        bg="currentColor"
        style={{
          maskImage: `url('/assets/icons/grid.svg')`,
          maskRepeat: "no-repeat",
          maskPosition: "center",
          maskSize: "contain",
          WebkitMaskImage: `url('/assets/icons/grid.svg')`,
          WebkitMaskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          WebkitMaskSize: "contain",
        }}
      />
    </chakra.button>
  )
}
