/**
 * Table Checkbox within the Rayton operator UI (components_2/Pages/schedule/ScheduleControlTable/TableCheckbox.tsx).
 * Built with Chakra UI and shared theme tokens to stay consistent with dashboards, management, and control surfaces.
 * Primary contract: exported component props and functions below (see TypeScript types for required fields).
 */
import { Box } from "@chakra-ui/react"

import { Checkbox } from "@/components_2/ui/Checkbox"

function TableCheckboxIcon({ color }: { color: string }) {
  return (
    <Box
      display="inline-flex"
      justifyContent="center"
      alignItems="center"
      color={color}
      lineHeight="1"
      flexShrink={0}
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 22 22"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="presentation"
        aria-hidden="true"
        style={{ display: "block", overflow: "visible" }}
      >
        <path
          d="M14.75 8.49996L9.15663 13.4999L7.25 11.7956M21 4.74998L21 17.25C21 19.3211 19.3211 21 17.25 21H4.75C2.67893 21 1 19.3211 1 17.25V4.74998C1 2.67892 2.67893 1 4.75 1H17.25C19.3211 1 21 2.67892 21 4.74998Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Box>
  )
}

type TableCheckboxProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  /** Desktop table uses green check; mobile schedule cards use orange (Figma). */
  checkedAccent?: "green" | "orange"
}

export function TableCheckbox({
  checked,
  onChange,
  checkedAccent = "green",
}: TableCheckboxProps) {
  const checkedColor =
    checkedAccent === "orange"
      ? "ui.Interactive.accent"
      : "ui.ScheduleTable.checkboxCheckedGreen"
  const uncheckedColor =
    checkedAccent === "orange"
      ? "ui.ScheduleTable.mobileChevron"
      : "ui.ScheduleTable.checkboxUnchecked"

  return (
    <Checkbox
      variant="plain"
      checked={checked}
      w="max-content"
      minW="max-content"
      overflow="visible"
      onCheckedChange={(e: { checked: boolean | "indeterminate" }) =>
        onChange(Boolean(e.checked))
      }
      icon={
        <TableCheckboxIcon color={checked ? checkedColor : uncheckedColor} />
      }
      controlProps={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        minW: "max-content",
        minH: "max-content",
        w: "max-content",
        h: "max-content",
        borderWidth: "0",
        border: "none",
        outline: "none",
        bg: "transparent",
        p: 1,
        borderRadius: "md",
        overflow: "visible",
        transition: "background-color 200ms ease-in-out",
        _hover: {
          bg: "ui.TableCheckbox.rowHoverBg",
        },
        css: {
          overflow: "visible !important",
          "&:focus-visible": { boxShadow: "none", outline: "none" },
        },
      }}
    />
  )
}
