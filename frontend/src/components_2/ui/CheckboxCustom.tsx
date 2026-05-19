/**
 * Styled checkbox built on the shared Checkbox primitive with Rayton border and accent tokens.
 * Merges optional `css` overrides after the default control/indicator rules.
 */

import * as React from "react"

import { Checkbox, type CheckboxProps } from "@/components_2/ui/Checkbox"

export const CheckboxCustom = React.forwardRef<HTMLInputElement, CheckboxProps>(
  function CheckboxCustom(props, ref) {
    const { css, ...rest } = props

    return (
      <Checkbox
        ref={ref}
        colorPalette="gray"
        size="md"
        {...rest}
        css={[
          {
            cursor: "pointer",
            "& [data-part='control']": {
              width: "22px",
              height: "22px",
              borderRadius: "4px",
              borderWidth: "1px",
              borderColor: "ui.checkbox.border",
              boxShadow: "none !important",
              outline: "none",
              cursor: "pointer",
              transition: "background-color 0.2s ease, border-color 0.2s ease",
            },
            "&:hover [data-part='control'][data-state='unchecked']": {
              borderColor: "ui.checkbox.border_hover",
            },
            "& [data-part='control'][data-state='checked']": {
              bg: "ui.Interactive.accent",
              borderColor: "ui.Interactive.accent",
              color: "ui.checkbox.background",
            },
            "&:hover [data-part='control'][data-state='checked']": {
              bg: "ui.Interactive.accentHover",
              borderColor: "ui.Interactive.accentHover",
            },
            "& [data-part='control'][data-focus], & [data-part='control'][data-focus-visible], & [data-part='control']:focus-visible":
              {
                boxShadow: "none !important",
                outline: "none",
              },
            "& [data-part='control'] svg": {
              color: "currentColor",
              transition: "none !important",
              animation: "none !important",
            },
            "& [data-part='indicator']": {
              transition: "none !important",
              animation: "none !important",
            },
            "& [data-part='label']": {
              fontSize: "1rem",
              fontWeight: "normal",
              cursor: "pointer",
            },
          },
          css,
        ]}
      />
    )
  },
)
