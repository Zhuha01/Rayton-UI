/**
 * Chakra button wrapper that shows a spinner overlay or loading text while `loading` is true.
 * Forwards ref and standard Chakra button props to the underlying control.
 */

import type { ButtonProps as ChakraButtonProps } from "@chakra-ui/react"
import {
  AbsoluteCenter,
  Button as ChakraButton,
  Span,
  Spinner,
} from "@chakra-ui/react"
import * as React from "react"

interface ButtonLoadingProps {
  loading?: boolean
  loadingText?: React.ReactNode
}

export interface ButtonProps extends ChakraButtonProps, ButtonLoadingProps {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(props, ref) {
    const { loading, disabled, loadingText, children, ...rest } = props
    return (
      <ChakraButton disabled={loading || disabled} ref={ref} {...rest}>
        {loading ? (
          <>
            <AbsoluteCenter display="inline-flex">
              <Spinner size="xl" color="ui.Interactive.accent" />
            </AbsoluteCenter>
            <Span opacity={0}>{children}</Span>
          </>
        ) : (
          children
        )}
      </ChakraButton>
    )
  },
)
