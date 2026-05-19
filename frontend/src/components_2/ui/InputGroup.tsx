/**
 * Positions optional start/end adornments around a single Chakra input using absolute slots.
 * Adjusts input padding so content does not overlap the icons or controls.
 */

import type { BoxProps, InputElementProps } from "@chakra-ui/react"
import { Box, InputElement } from "@chakra-ui/react"
import * as React from "react"

export interface InputGroupProps extends BoxProps {
  startElementProps?: InputElementProps
  endElementProps?: InputElementProps
  startElement?: React.ReactNode
  endElement?: React.ReactNode
  children: React.ReactElement<InputElementProps>
  startOffset?: InputElementProps["paddingStart"]
  endOffset?: InputElementProps["paddingEnd"]
}

export const InputGroup = React.forwardRef<HTMLDivElement, InputGroupProps>(
  function InputGroup(props, ref) {
    const {
      startElement,
      startElementProps,
      endElement,
      endElementProps,
      children,
      startOffset = "6px",
      endOffset = "6px",
      ...rest
    } = props

    const child =
      React.Children.only<React.ReactElement<InputElementProps>>(children)

    return (
      <Box
        ref={ref}
        display="flex"
        alignItems="center"
        position="relative"
        {...rest}
      >
        {startElement && (
          <InputElement
            pointerEvents="none"
            position="absolute"
            left="3px"
            top="50%"
            transform="translateY(-50%)"
            {...startElementProps}
          >
            {startElement}
          </InputElement>
        )}
        {React.cloneElement(child, {
          ...(startElement && {
            ps: `calc(var(--input-height) - ${startOffset})`,
          }),
          ...(endElement && { pe: `calc(var(--input-height) - ${endOffset})` }),
          ...children.props,
        })}
        {endElement && (
          <InputElement
            placement="end"
            position="absolute"
            right="3px"
            top="50%"
            transform="translateY(-50%)"
            {...endElementProps}
          >
            {endElement}
          </InputElement>
        )}
      </Box>
    )
  },
)
