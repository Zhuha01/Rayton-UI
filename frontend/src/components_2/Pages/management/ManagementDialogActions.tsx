/**
 * Management Dialog Actions within the Rayton operator UI (components_2/Pages/management/ManagementDialogActions.tsx).
 * Built with Chakra UI and shared theme tokens to stay consistent with dashboards, management, and control surfaces.
 * Primary contract: exported component props and functions below (see TypeScript types for required fields).
 */
import type { ReactNode } from 'react';

import { DialogActionTrigger, DialogFooter } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

import { Button } from "@/components_2/ui/Button"
import {
  cancelButtonProps,
  dialogFooterProps,
  primaryButtonProps,
} from './sharedModalStyles';

export interface ManagementDialogActionsProps {
  onCancel: () => void;
  cancelText?: ReactNode;
  submitText?: ReactNode;
  isSubmitting?: boolean;
  isSubmitDisabled?: boolean;
  submitButtonType?: 'submit' | 'button';
}

export function ManagementDialogActions({
  onCancel,
  cancelText,
  submitText,
  isSubmitting,
  isSubmitDisabled,
  submitButtonType = 'submit',
}: ManagementDialogActionsProps) {
  const { t } = useTranslation('management');
  const effectiveCancelText = cancelText ?? t('common.actions.cancel');
  const effectiveSubmitText = submitText ?? t('common.actions.save');
  return (
    <DialogFooter {...dialogFooterProps}>
      <DialogActionTrigger asChild>
        <Button
          {...cancelButtonProps}
          disabled={Boolean(isSubmitting)}
          type="button"
          onClick={onCancel}
        >
          {effectiveCancelText}
        </Button>
      </DialogActionTrigger>
      <Button
        type={submitButtonType}
        {...primaryButtonProps}
        disabled={Boolean(isSubmitting) || Boolean(isSubmitDisabled)}
        loading={isSubmitting}
      >
        {effectiveSubmitText}
      </Button>
    </DialogFooter>
  );
}
