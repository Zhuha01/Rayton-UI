/**
 * Outlined action button for management cards with fixed edit vs delete styling.
 * Maps intent to semantic management action colors shared across user/tenant/plant cards.
 */

import type { ReactNode } from "react"

import type { ButtonProps } from "@chakra-ui/react"

import { ManagementCardOutlinedButton } from "./cards/ManagementCardShell"

export type ManagementCardActionIntent = "edit" | "delete"

export interface ManagementCardActionButtonProps extends ButtonProps {
  intent: ManagementCardActionIntent
  children: ReactNode
}

const intentStyles: Record<ManagementCardActionIntent, ButtonProps> = {
  edit: {
    color: "ui.ManagementCardAction.editText",
    bg: "transparent",
    border: "1px solid",
    borderColor: "ui.ManagementCardAction.editBorder",
    _hover: {
      bg: "ui.ManagementCardAction.editHoverBg",
      color: "ui.ManagementCardAction.editHoverText",
    },
  },
  delete: {
    color: "ui.ManagementCardAction.deleteText",
    bg: "transparent",
    border: "1px solid",
    borderColor: "ui.ManagementCardAction.deleteBorder",
    _hover: {
      bg: "ui.ManagementCardAction.deleteHoverBg",
      color: "ui.ManagementCardAction.deleteHoverText",
    },
  },
}

export function ManagementCardActionButton({
  intent,
  children,
  ...props
}: ManagementCardActionButtonProps) {
  return (
    <ManagementCardOutlinedButton {...intentStyles[intent]} {...props}>
      {children}
    </ManagementCardOutlinedButton>
  )
}
