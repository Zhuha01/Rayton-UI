/**
 * Primary-action Chakra button preset with optional left and right icon slots.
 * Applies default accent colors and sizing used across marketing and flows.
 */

import { type ButtonProps, Button as ChakraButton } from "@chakra-ui/react"
import * as React from "react"

interface ButtonCustomProps extends ButtonProps {
  iconLeft?: React.ReactNode
  iconRight?: React.ReactNode
}

export const ButtonCustom = React.forwardRef<
  HTMLButtonElement,
  ButtonCustomProps
>((props, ref) => {
  const { children, iconLeft, iconRight, css: cssFromProps, ...rest } = props

  const svgSizeCss = {
    "& svg": {
      width: "16px !important",
      height: "16px !important",
      strokeWidth: "3px",
    },
  }

  return (
    <ChakraButton
      ref={ref}
      variant="solid"
      h="40px"
      fontSize="1rem"
      fontWeight="semibold"
      borderRadius="8px"
      bg={rest.bg || "ui.Interactive.accent"}
      color={rest.color || "ui.Button.primaryText"}
      _hover={{
        bg: rest._hover?.bg || "ui.Interactive.accentHover",
        ...rest._hover,
      }}
      css={cssFromProps != null ? [svgSizeCss, cssFromProps] : svgSizeCss}
      {...rest}
    >
      {iconLeft && (
        <span
          className="custom-icon-wrapper"
          style={{
            marginRight: "0px",
            display: "inline-flex",
            alignItems: "center",
          }}
        >
          {iconLeft}
        </span>
      )}
      {children}
      {iconRight && (
        <span
          style={{ marginLeft: "0px", display: "inline-flex" }}
          className="custom-icon-wrapper"
        >
          {iconRight}
        </span>
      )}
    </ChakraButton>
  )
})
