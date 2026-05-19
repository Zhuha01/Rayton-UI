/**
 * Dialog within the Rayton operator UI (components_2/ui/Dialog.tsx).
 * Built with Chakra UI and shared theme tokens to stay consistent with dashboards, management, and control surfaces.
 * Primary contract: exported component props and functions below (see TypeScript types for required fields).
 */
import { Dialog as ChakraDialog, Portal } from "@chakra-ui/react"
import * as React from "react"
import { CloseButton } from "@/components_2/ui/CloseButton"
import { colors } from "@/theme/tokens/colors"

type DialogBackdropProps = React.ComponentProps<typeof ChakraDialog.Backdrop>
type DialogPositionerProps = React.ComponentProps<typeof ChakraDialog.Positioner>

interface DialogContentProps extends ChakraDialog.ContentProps {
  portalled?: boolean
  portalRef?: React.RefObject<HTMLElement | null>
  backdrop?: boolean
  backdropProps?: DialogBackdropProps
  positionerProps?: DialogPositionerProps
}

export const DialogContent = React.forwardRef<
  HTMLDivElement,
  DialogContentProps
>(function DialogContent(props, ref) {
  const {
    children,
    portalled = true,
    portalRef,
    backdrop = true,
    backdropProps,
    positionerProps,
    ...rest
  } = props

  const mergedBackdropProps: DialogBackdropProps = {
    zIndex: 2500,
    bg: "rgba(0, 0, 0, 0.4)",
    backdropFilter: "blur(2px)",
    ...backdropProps,
  }
  const mergedPositionerProps: DialogPositionerProps = {
    zIndex: 2500,
    ...positionerProps,
  }

  return (
    <Portal disabled={!portalled} container={portalRef}>
      {backdrop && <ChakraDialog.Backdrop {...mergedBackdropProps} />}
      <ChakraDialog.Positioner {...mergedPositionerProps}>
        <ChakraDialog.Content ref={ref} {...rest} asChild={false}>
          {children}
        </ChakraDialog.Content>
      </ChakraDialog.Positioner>
    </Portal>
  )
})

export const DialogCloseTrigger = React.forwardRef<
  HTMLButtonElement,
  ChakraDialog.CloseTriggerProps
>(function DialogCloseTrigger(props, ref) {
  return (
    <ChakraDialog.CloseTrigger
      position="absolute"
      top="2"
      insetEnd="2"
      {...props}
      asChild
    >
      <CloseButton size="sm" ref={ref}>
        {props.children}
      </CloseButton>
    </ChakraDialog.CloseTrigger>
  )
})

export const DialogRoot = ChakraDialog.Root
export const DialogFooter = ChakraDialog.Footer
export const DialogHeader = ChakraDialog.Header
export const DialogBody = ChakraDialog.Body
export const DialogBackdrop = ChakraDialog.Backdrop
export const DialogTitle = ChakraDialog.Title
export const DialogDescription = ChakraDialog.Description
export const DialogTrigger = ChakraDialog.Trigger
export const DialogActionTrigger = ChakraDialog.ActionTrigger
