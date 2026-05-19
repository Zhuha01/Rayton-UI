/**
 * Mobile Toggle within the Rayton operator UI (components_2/Pages/schedule/ScheduleMobileTable/MobileToggle.tsx).
 * Built with Chakra UI and shared theme tokens to stay consistent with dashboards, management, and control surfaces.
 * Primary contract: exported component props and functions below (see TypeScript types for required fields).
 */
import { HStack, Text } from "@chakra-ui/react"
import { TableCheckbox } from "../ScheduleControlTable/TableCheckbox"

type MobileToggleProps = {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}

export function MobileToggle({ label, checked, onChange }: MobileToggleProps) {
  return (
    <HStack justify="flex-end" gap="16px" flexShrink={0}>
      <Text
        fontSize="16px"
        fontWeight={400}
        color="text.normal"
        whiteSpace="nowrap"
      >
        {label}
      </Text>
      <TableCheckbox
        checked={checked}
        onChange={onChange}
        checkedAccent="orange"
      />
    </HStack>
  )
}
