/**
 * Management Dialog Shell within the Rayton operator UI (components_2/Pages/management/ManagementDialogShell.tsx).
 * Built with Chakra UI and shared theme tokens to stay consistent with dashboards, management, and control surfaces.
 * Primary contract: exported component props and functions below (see TypeScript types for required fields).
 */
import { Box, DialogTitle, Text } from '@chakra-ui/react';
import type { FormEventHandler, ReactNode } from 'react';

import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogHeader,
  DialogRoot,
  DialogTrigger,
} from '@/components_2/ui/Dialog';
import {
  dialogBodyProps,
  dialogContentProps,
  dialogHeaderProps,
  dialogTitleProps,
  MUTED_TEXT,
} from './sharedModalStyles';

export interface ManagementDialogShellProps {
  open: boolean;
  onOpenChange: (details: { open: boolean }) => void;
  trigger?: ReactNode;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  onSubmit?: FormEventHandler<HTMLDivElement>;
}

export function ManagementDialogShell({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  children,
  footer,
  onSubmit,
}: ManagementDialogShellProps) {
  return (
    <DialogRoot
      size="md"
      placement="center"
      open={open}
      onOpenChange={onOpenChange}
    >
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent {...dialogContentProps}>
        <Box
          as="form"
          onSubmit={onSubmit}
          display="flex"
          flexDirection="column"
          w="100%"
          flex="0 0 auto"
        >
          <DialogHeader {...dialogHeaderProps}>
            <DialogTitle {...dialogTitleProps}>{title}</DialogTitle>
          </DialogHeader>

          <DialogBody {...dialogBodyProps}>
            {description ? (
              <Text mb={4} fontSize="14px" color={MUTED_TEXT}>
                {description}
              </Text>
            ) : null}
            {children}
          </DialogBody>

          {footer}
        </Box>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  );
}
