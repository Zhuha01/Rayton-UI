/**
 * Reusable destructive confirmation dialog with optional trigger, loading state, and i18n-aware actions.
 * Wraps the shared dialog shell and management modal style tokens.
 */

import { Box, DialogTitle, Text } from "@chakra-ui/react"
import type { ReactNode } from "react"
import { useTranslation } from "react-i18next"
import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTrigger,
} from "@/components_2/ui/Dialog"
import { Button } from "@/components_2/ui/Button"
import {
  cancelButtonProps,
  dangerButtonProps,
  dialogBodyProps,
  dialogContentProps,
  dialogFooterProps,
  dialogHeaderProps,
  dialogTitleProps,
  MUTED_TEXT,
} from "./sharedModalStyles"

export interface ConfirmDeleteDialogProps {
  open: boolean
  onOpenChange: (details: { open: boolean }) => void
  trigger?: ReactNode
  title: string
  description: ReactNode
  belowDescription?: ReactNode
  confirmText?: string
  cancelText?: string
  isLoading?: boolean
  onConfirm: () => void
}

export const ConfirmDeleteDialog = ({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  belowDescription,
  confirmText,
  cancelText,
  isLoading,
  onConfirm,
}: ConfirmDeleteDialogProps) => {
  const { t } = useTranslation("management")
  const effectiveConfirmText = confirmText ?? t("common.actions.delete")
  const effectiveCancelText = cancelText ?? t("common.actions.cancel")
  return (
    <DialogRoot
      size="md"
      placement="center"
      role="alertdialog"
      open={open}
      onOpenChange={onOpenChange}
    >
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent {...dialogContentProps}>
        <Box as="form" onSubmit={(e) => e.preventDefault()}>
          <DialogHeader {...dialogHeaderProps}>
            <DialogTitle {...dialogTitleProps}>{title}</DialogTitle>
          </DialogHeader>
          <DialogBody {...dialogBodyProps}>
            <Text mb={4} fontSize="14px" color={MUTED_TEXT}>
              {description}
            </Text>
            {belowDescription}
          </DialogBody>
          <DialogFooter {...dialogFooterProps}>
            <DialogActionTrigger asChild>
              <Button {...cancelButtonProps} type="button" disabled={isLoading}>
                {effectiveCancelText}
              </Button>
            </DialogActionTrigger>
            <Button
              {...dangerButtonProps}
              type="button"
              onClick={onConfirm}
              loading={isLoading}
            >
              {effectiveConfirmText}
            </Button>
          </DialogFooter>
          <DialogCloseTrigger />
        </Box>
      </DialogContent>
    </DialogRoot>
  )
}
