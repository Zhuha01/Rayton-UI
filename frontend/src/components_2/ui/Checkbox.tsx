/**
 * Thin wrapper around Chakra v3 Checkbox supporting an extra `plain` variant for tables.
 * Accepts optional icon, input props, and separate refs for root versus input.
 */

import { Checkbox as ChakraCheckbox } from "@chakra-ui/react"
import * as React from "react"

export interface CheckboxProps
  extends Omit<ChakraCheckbox.RootProps, "variant"> {
  variant?: ChakraCheckbox.RootProps["variant"] | "plain"
  icon?: React.ReactNode
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>
  rootRef?: React.Ref<HTMLLabelElement>
  controlProps?: React.ComponentPropsWithoutRef<typeof ChakraCheckbox.Control>
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox(props, ref) {
    const {
      icon,
      children,
      inputProps,
      rootRef,
      controlProps,
      variant,
      ...rest
    } = props
    return (
      <ChakraCheckbox.Root
        ref={rootRef}
        {...rest}
        variant={variant as ChakraCheckbox.RootProps["variant"]}
      >
        <ChakraCheckbox.HiddenInput ref={ref} {...inputProps} />
        <ChakraCheckbox.Control {...controlProps}>
          {icon || <ChakraCheckbox.Indicator />}
        </ChakraCheckbox.Control>
        {children != null && (
          <ChakraCheckbox.Label>{children}</ChakraCheckbox.Label>
        )}
      </ChakraCheckbox.Root>
    )
  },
)
