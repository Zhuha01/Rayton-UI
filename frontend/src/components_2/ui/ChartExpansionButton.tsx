/**
 * Thin wrapper that forwards dashboard expand/collapse chart props to ChartExpansionTrigger.
 * Keeps a stable import surface where only the trigger implementation may change.
 */

import { ChartExpansionTrigger } from "@/components_2/ui/ChartExpansionTrigger"

export interface ChartExpansionButtonProps {
  onClick: () => void
  isExpanded?: boolean
  isDisabled?: boolean
  showLabel?: boolean
}

export function ChartExpansionButton({
  onClick,
  isExpanded,
  isDisabled,
  showLabel,
}: ChartExpansionButtonProps) {
  return (
    <ChartExpansionTrigger
      onClick={onClick}
      isExpanded={isExpanded}
      isDisabled={isDisabled}
      showLabel={showLabel}
    />
  )
}
