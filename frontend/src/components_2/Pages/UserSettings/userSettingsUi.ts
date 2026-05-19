/**
 * Visual tokens for the user settings form (SettingsForm).
 * Values reference `ui.SettingsForm.*` in theme/semanticTokens/colors.ts (light/dark).
 */

export const userSettingsUi = {
  card: {
    bg: "ui.SettingsForm.cardBg",
    borderRadius: "8px",
  },
  title: {
    color: "ui.SettingsForm.pageTitle",
  },
  /** Section headings + field row labels */
  mutedLabel: {
    color: "ui.SettingsForm.labelIconLine",
  },
  divider: {
    bg: "ui.SettingsForm.divider",
    opacity: 1,
  },
  actions: {
    cancel: {
      bg: "ui.SettingsForm.actionCancelBg",
      color: "ui.SettingsForm.actionCancelText",
      hoverBg: "ui.SettingsForm.actionCancelHover",
    },
    submit: {
      bg: "ui.SettingsForm.actionSubmitBg",
      color: "ui.SettingsForm.actionSubmitText",
      hoverBg: "ui.SettingsForm.actionSubmitHover",
    },
  },
} as const

/** Shared Chakra field props for `/settings` inputs (light/dark via `ui.SettingsForm.*` tokens). */
export const settingsFormInputProps = {
  bg: "ui.SettingsForm.fieldBg",
  color: "ui.SettingsForm.fieldText",
  borderColor: "ui.SettingsForm.fieldBorder",
  iconIdleColor: "ui.SettingsForm.labelIconLine",
  focusWithinIconColor: "ui.SettingsForm.fieldBorderFocus",
  passwordMutedColor: "ui.SettingsForm.labelIconLine",
  _placeholder: { color: "ui.SettingsForm.fieldPlaceholder" },
  _hover: { borderColor: "ui.SettingsForm.fieldBorderHover" },
  _focus: { borderColor: "ui.SettingsForm.fieldBorderFocus !important" },
  _focusVisible: { borderColor: "ui.SettingsForm.fieldBorderFocus !important" },
} as const
