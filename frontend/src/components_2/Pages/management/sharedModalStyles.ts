/**
 * shared Modal Styles within the Rayton operator UI (components_2/Pages/management/sharedModalStyles.ts).
 * Built with Chakra UI and shared theme tokens to stay consistent with dashboards, management, and control surfaces.
 * Primary contract: exported component props and functions below (see TypeScript types for required fields).
 */
// Tokens reference adaptive light/dark values from `theme/semanticTokens/colors.ts` (`ui.Modal.*`).
// Names are kept (MODAL_BG, FIELD_BG, MUTED_TEXT, ...) for backward compatibility — Chakra resolves
// the token strings at runtime.

export const MODAL_BG = "ui.Modal.bg"
export const FIELD_BG = "ui.Modal.fieldBg"
export const DARK_FIELD_BG = "ui.Modal.fieldBgDark"
export const MUTED_TEXT = "ui.Modal.mutedText"
export const PRIMARY_BUTTON_BG = "ui.Interactive.accent"
export const PRIMARY_BUTTON_TEXT = "ui.Button.primaryText"

export const fieldControlProps = {
  bg: FIELD_BG,
  borderRadius: "8px",
  px: "16px",
  h: "38px",
  fontSize: "15px",
  color: "ui.Modal.fieldText",
  borderWidth: "1px",
  borderColor: "transparent",
  _placeholder: { color: "ui.Modal.fieldPlaceholder" },
  _hover: {
    borderColor: "ui.Modal.fieldBorderHover",
  },
  _focus: {
    borderColor: "ui.Modal.fieldBorderHover",
    outline: "none",
    color: "ui.Modal.fieldText",
  },
  _focusVisible: {
    borderColor: "ui.Modal.fieldBorderHover",
    outline: "none",
    color: "ui.Modal.fieldText",
  },
} as const

export const darkFieldControlProps = {
  ...fieldControlProps,
  bg: DARK_FIELD_BG,
} as const

const numberInputBaseRadius = "8px"
const numberInputControlWidth = "34px"
const numberInputTriggerHoverBg = "ui.Modal.menuItemHoverBg"
const numberInputIconMaskUrl = "url(/assets/icons/str.svg)"

function makeNumberInputStyles(bgToken: string) {
  return {
    rootProps: {
      position: "relative",
      role: "group",
      w: "100%",
    } as const,
    inputProps: {
      pr: `calc(${numberInputControlWidth} + 10px)`,
    } as const,
    controlProps: {
      position: "absolute",
      top: "0px",
      right: "-0.2px",
      bottom: "0px",
      w: numberInputControlWidth,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      border: "none",
      borderLeft: "none",
      borderStart: "none",
      boxShadow: "none",
      borderRadius: `calc(${numberInputBaseRadius} - 1px)`,
      bg: bgToken,
      pointerEvents: "auto",
    } as const,
    triggerBaseProps: {
      w: "100%",
      flex: "1 1 50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      bg: bgToken,
      border: "none",
      outline: "none",
      transition: "background 0.15s ease, border-color 0.15s ease",
      _hover: { bg: numberInputTriggerHoverBg },
      _active: { bg: numberInputTriggerHoverBg },
      _disabled: { opacity: 0.5, cursor: "not-allowed" },
    } as const,
    incrementTriggerProps: {
      borderTopRightRadius: `calc(${numberInputBaseRadius} - 1px)`,
    } as const,
    decrementTriggerProps: {
      borderBottomRightRadius: `calc(${numberInputBaseRadius} - 1px)`,

      _groupHover: {

      },
      _groupFocusWithin: {

      },
    } as const,
    iconBoxProps: {
      w: "10px",
      h: "10px",
      bg: "currentColor",
      style: {
        maskImage: numberInputIconMaskUrl,
        WebkitMaskImage: numberInputIconMaskUrl,
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
        maskSize: "contain",
        WebkitMaskSize: "contain",
      },
    } as const,
  }
}

export const numberInputStyles = makeNumberInputStyles(FIELD_BG)
export const darkNumberInputStyles = makeNumberInputStyles(DARK_FIELD_BG)

export const textareaFieldProps = {
  ...fieldControlProps,
  h: "auto",
  minH: "100px",
  py: "10px",
} as const

export const selectTriggerProps = {
  w: "full",
  borderRadius: "8px",
  px: "16px",
  h: "38px",
  fontSize: "15px",
  bg: FIELD_BG,
  color: "ui.Modal.fieldText",
  borderWidth: "1px",
  borderColor: "transparent",
  cursor: "pointer",
  _hover: { borderColor: "ui.Modal.fieldBorderHover" },
  _focus: { borderColor: "ui.Modal.fieldBorderHover", outline: "none" },
  _focusVisible: { borderColor: "ui.Modal.fieldBorderHover", outline: "none" },
} as const

export const darkSelectTriggerProps = {
  ...selectTriggerProps,
  bg: DARK_FIELD_BG,
} as const

export const checkboxFigmaCss = {
  "& [data-part='control']": {
    width: "25px",
    height: "25px",
  },
  "& [data-part='label']": {
    fontSize: "15px",
    color: "ui.Modal.fieldText",
  },
} as const

export const labelProps = {
  fontSize: "14px",
  color: "ui.Modal.fieldText",
} as const

export const dialogContentProps = {
  maxW: "500px",
  w: { base: "calc(100vw - 32px)", md: "100%" },
  h: "fit-content",
  minH: "min-content",
  display: "flex",
  flexDirection: "column",
  flex: "0 0 auto",
  alignSelf: "center",
  borderRadius: "16px",
  bg: MODAL_BG,
  px: { base: 4, sm: 6 },
  pt: 4,
  pb: 0,
  position: "relative",
  positionerProps: {
    alignItems: "center",
    justifyContent: "center",
  },
} as const

export const dialogBodyProps = {
  flex: "0 0 auto",
  px: 0,
  pt: 2,
  pb: 0,
  overflowY: "auto",
  css: {
    "&::-webkit-scrollbar": { display: "none" },
    scrollbarWidth: "none",
  },
} as const

export const dialogHeaderProps = {
  flex: "0 0 auto",
  px: 0,
  pt: 0,
  pb: 0,
} as const

export const dialogFooterProps = {
  flex: "0 0 auto",
  px: 0,
  pt: 4,
  mt: 4,
  borderTopWidth: "1px",
  borderTopColor: "ui.Modal.divider",
  gap: 4,
  display: "flex",
  justifyContent: "flex-end",
  flexWrap: "wrap",
} as const

export const dialogTitleProps = {
  fontSize: "18px",
  fontWeight: "semibold",
  color: "ui.Modal.titleText",
} as const

export const selectContentProps = {
  bg: MODAL_BG,
  borderRadius: "8px",
  borderWidth: "1px",
  borderColor: "ui.Modal.fieldBorderHover",
  p: 1,
  maxH: "280px",
  overflowY: "auto",
  minW: "var(--reference-width)",
  boxShadow: "lg",
  css: {
    "&::-webkit-scrollbar": {
      display: "none",
    },
    scrollbarWidth: "none",
  },
} as const

export const selectItemProps = {
  rounded: "md",
  px: 3,
  py: 2,
  mb: 0.5,
  color: "ui.Modal.fieldText",
  cursor: "pointer",
  _hover: { bg: "ui.Modal.menuItemHoverBg" },
  _highlighted: { bg: "ui.Modal.menuItemHoverBg" },
} as const

export const cancelButtonProps = {
  variant: "outline" as const,
  borderColor: "ui.Modal.cancelBorder",
  color: "ui.Modal.fieldText",
  fontWeight: "bold",
  fontSize: "15px",
  px: "16px",
  py: "11px",
  borderRadius: "8px",
  bg: "transparent",
  _hover: { bg: "ui.Modal.cancelHoverBg" },
}

export const primaryButtonProps = {
  bg: PRIMARY_BUTTON_BG,
  color: PRIMARY_BUTTON_TEXT,
  fontWeight: "bold",
  fontSize: "15px",
  px: "16px",
  py: "11px",
  borderRadius: "8px",
  _hover: { bg: "ui.Interactive.accentHover" },
}

export const dangerButtonProps = {
  bg: "red.600",
  color: "white",
  fontWeight: "bold",
  fontSize: "15px",
  px: "16px",
  py: "11px",
  borderRadius: "8px",
  _hover: { bg: "red.700" },
} as const
