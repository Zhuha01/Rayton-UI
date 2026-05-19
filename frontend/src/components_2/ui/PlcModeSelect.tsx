/**
 * Plc Mode Select within the Rayton operator UI (components_2/ui/PlcModeSelect.tsx).
 * Built with Chakra UI and shared theme tokens to stay consistent with dashboards, management, and control surfaces.
 * Primary contract: exported component props and functions below (see TypeScript types for required fields).
 */
import { Select, createListCollection } from "@chakra-ui/react"
import { useMemo, useState } from "react"
import {
  darkSelectTriggerProps,
  MUTED_TEXT,
  selectContentProps,
  selectItemProps,
} from "@/components_2/Pages/management/sharedModalStyles"

/**
 * PLC mode select for the Control tab: same `Select.Root` wiring and trigger/menu styling as user management modals
 * (`AddUser.tsx`) via shared `darkSelectTriggerProps`, `selectContentProps`, and `selectItemProps`.
 * `triggerFontSize` is the only intentional difference so PLC control typography can diverge from management forms.
 */
export function PlcModeSelect({
  valueKey,
  entries,
  placeholder,
  onChangeValueText,
  triggerFontSize,
}: {
  valueKey: string | null
  entries: Record<string, string> | null | undefined
  placeholder: string
  onChangeValueText: (valueText: string) => void
  /** Font size for the trigger and menu items. */
  triggerFontSize: string
}) {
  const [open, setOpen] = useState(false)

  const collection = useMemo(
    () =>
      createListCollection({
        items: Object.entries(entries ?? {}).map(([key, label]) => ({
          value: key,
          label,
        })),
      }),
    [entries],
  )

  return (
    <Select.Root
      collection={collection}
      w="full"
      value={valueKey ? [valueKey] : []}
      onValueChange={(details) => {
        const selectedKey = details.value[0]
        const selectedItem = collection.items.find(
          (i) => i.value === selectedKey,
        )
        if (selectedItem) onChangeValueText(selectedItem.label)
      }}
      onOpenChange={(e) => setOpen(e.open)}
      positioning={{
        strategy: "fixed",
        hideWhenDetached: true,
      }}
    >
      <Select.HiddenSelect />
      <Select.Control>
        <Select.Trigger {...darkSelectTriggerProps} fontSize={triggerFontSize}>
          <Select.ValueText
            placeholder={placeholder}
            color={valueKey ? "ui.Modal.fieldText" : MUTED_TEXT}
          />
        </Select.Trigger>
        <Select.IndicatorGroup>
          <Select.Indicator
            display="inline-flex"
            transition="transform 0.2s ease, color 0.2s ease"
            color={open ? "ui.Modal.fieldText" : MUTED_TEXT}
            transform={open ? "rotate(180deg)" : "rotate(0deg)"}
          />
        </Select.IndicatorGroup>
      </Select.Control>
      <Select.Positioner>
        <Select.Content {...selectContentProps}>
          {collection.items.map((item) => (
            <Select.Item
              key={item.value}
              item={item}
              {...selectItemProps}
              fontSize={triggerFontSize}
            >
              <Select.ItemText>{item.label}</Select.ItemText>
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Positioner>
    </Select.Root>
  )
}
