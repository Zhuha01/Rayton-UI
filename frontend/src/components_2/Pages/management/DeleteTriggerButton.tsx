/**
 * Delete Trigger Button within the Rayton operator UI (components_2/Pages/management/DeleteTriggerButton.tsx).
 * Built with Chakra UI and shared theme tokens to stay consistent with dashboards, management, and control surfaces.
 * Primary contract: exported component props and functions below (see TypeScript types for required fields).
 */
import type { ReactNode } from "react"

import { Button, type ButtonProps } from "@chakra-ui/react"
import { FiTrash2 } from "react-icons/fi"
import { useTranslation } from "react-i18next"

export interface DeleteTriggerButtonProps extends ButtonProps {
  children?: ReactNode
}

export function DeleteTriggerButton({
  children,
  ...props
}: DeleteTriggerButtonProps) {
  const { t } = useTranslation("management")
  return (
    <Button variant="ghost" size="sm" colorPalette="red" {...props}>
      <FiTrash2 fontSize="16px" />
      {children ?? t("common.actions.delete")}
    </Button>
  )
}

