/**
 * Semantic color tokens with light/dark mode support for the entire application.
 * Maps primitive color tokens to meaningful UI component contexts.
 */

export const semanticColors = {
  rayton_orange: {
    normal: {
      value: "{colors.rayton_orange.300}",
    },
    hover: {
      value: "{colors.rayton_orange.400}",
    },
  },

  background: {
    normal: {
      value: {
        _light: "{colors.rayton_neutral.50}", // #F3F4F6
        _dark: "{colors.rayton_neutral.500}", // #1E1E1E
      },
    },
    hover: {
      value: {
        _light: "{colors.rayton_neutral.100}", // #EDEEF0
        _dark: "{colors.rayton_neutral.450}", // #2E2E2E
      },
    },
  },

  border: {
    normal: {
      value: {
        _light: "{colors.rayton_neutral.200}", // #AAAAAA
        _dark: "{colors.rayton_neutral.400}", //  #3D3D3D
      },
    },
  },

  text: {
    normal: {
      value: {
        _light: "{colors.rayton_neutral.550}", // #1A1A1A
        _dark: "{colors.rayton_neutral.0}", // #FFFFFF
      },
    },
    muted: {
      value: {
        _light: "{colors.rayton_neutral.300}", // ~ #787878
        _dark: "{colors.rayton_neutral.250}", // ~ #8E8F90
      },
    },
    hover: {
      value: {
        _light: "{colors.rayton_neutral.500}", // #1E1E1E
        _dark: "{colors.rayton_neutral.0}", // #FFFFFF
      },
    },
  },

  ui: {
    // Usage:
    // - components_2/Header/Navbar.tsx
    // - layout backgrounds: routes/_layout.tsx, dashboard/schedule wrappers
    NavbarComponent: {
      background: {
        value: {
          _light: "{colors.rayton_neutral.50}", // #F3F4F6
          _dark: "{colors.rayton_neutral.500}", // #1E1E1E
        },
      },
      border: {
        value: {
          _light: "{colors.rayton_neutral.150}", // #D6D6D6
          _dark: "{colors.rayton_neutral.400}", // #3D3D3D
        },
      },
      /** Sticky nav bar strip (was raw neutral.0 / neutral.600 + Sidebar.search_border). */
      barBackground: {
        value: {
          _light: "{colors.rayton_neutral.0}",
          _dark: "{colors.rayton_neutral.600}",
        },
      },
      barBorder: {
        value: {
          _light: "{colors.rayton_neutral.200}",
          _dark: "{colors.rayton_neutral.0/10}",
        },
      },
      text: {
        value: {
          _light: "{colors.rayton_neutral.550}", // #1A1A1A
          _dark: "{colors.rayton_neutral.0}", // #FFFFFF
        },
      },
    },

    // - components_2/Header/NavButton.tsx
    NavButton: {
      text: {
        value: {
          _light: "{colors.rayton_neutral.550}", // #1A1A1A
          _dark: "{colors.rayton_neutral.0}", // #FFFFFF
        },
      },
      line: {
        value: {
          _light: "{colors.rayton_neutral.550}", // #1A1A1A
          _dark: "{colors.rayton_neutral.0}", // #FFFFFF
        },
      },
      mobileActiveBg: {
        value: {
          _light: "{colors.rayton_neutral.250}",
          _dark: "{colors.rayton_neutral.500}",
        },
      },
    },

    // - components_2/ui/ButtonCustom.tsx
    Button: {
      primaryText: {
        value: {
          _light: "{colors.rayton_neutral.550}",
          _dark: "{colors.rayton_neutral.550}",
        },
      },
    },

    // - components_2/ui/ThemeSwitcher.tsx
    ThemeSwitcher: {
      background: {
        value: {
          _light: "{colors.rayton_neutral.50}",
          _dark: "{colors.rayton_neutral.500}",
        },
      },
      border: {
        value: {
          _light: "{colors.rayton_neutral.200}",
          _dark: "{colors.rayton_neutral.400}",
        },
      },
      thumb: {
        value: {
          _light: "{colors.rayton_neutral.250}",
          _dark: "{colors.rayton_neutral.0}",
        },
      },
    },

    // - Header hover (Navbar)
    // - sidebar/search focus/hover
    // - chart controls (TimeRange, DateSwitcher, Export)
    // - schedule controls/buttons/checks
    Interactive: {
      hoverBg: {
        value: {
          _light: "{colors.rayton_neutral.250}",
          _dark: "{colors.rayton_neutral.450}",
        },
      },
      accent: {
        value: {
          _light: "{colors.rayton_orange.300}",
          _dark: "{colors.rayton_orange.300}",
        },
      },
      accentHover: {
        value: {
          _light: "{colors.rayton_orange.400}",
          _dark: "{colors.rayton_orange.400}",
        },
      },
    },

    Form: {
      errorText: {
        value: {
          _light: "{colors.rayton_red.600}",
          _dark: "{colors.rayton_red.600}",
        },
      },
      validationBorder: {
        value: {
          _light: "{colors.rayton_red.600}",
          _dark: "{colors.rayton_red.600}",
        },
      },
    },

    Overlay: {
      backdrop: {
        value: {
          _light: "rgba(0, 0, 0, 0.6)",
          _dark: "rgba(0, 0, 0, 0.6)",
        },
      },
    },

    Badge: {
      transparentBg: {
        value: {
          _light: "rgba(0, 0, 0, 0.4)",
          _dark: "rgba(0, 0, 0, 0.4)",
        },
      },
    },

    // - components_2/ui/UserSettings.tsx
    // - components_2/ui/MobileSettings.tsx (text)
    UserSettings: {
      background: {
        value: {
          _light: "{colors.rayton_neutral.50}",
          _dark: "{colors.rayton_neutral.500}",
        },
      },
      border: {
        value: {
          _light: "{colors.rayton_neutral.200}",
          _dark: "{colors.rayton_neutral.400}",
        },
      },
      text: {
        value: {
          _light: "{colors.rayton_neutral.550}",
          _dark: "{colors.rayton_neutral.0}",
        },
      },
      icon: {
        value: {
          _light: "{colors.rayton_orange.300}",
          _dark: "{colors.rayton_orange.300}",
        },
      },
    },

    // - components_2/Pages/UserSettings/userSettingsUi.ts
    // - components_2/Pages/UserSettings/SettingsForm.tsx
    SettingsForm: {
      /** Card background */
      cardBg: {
        value: {
          _light: "{colors.rayton_neutral.150}", // #D6D6D6
          _dark: "{colors.rayton_neutral.600}", // #292929
        },
      },
      /** Input field background */
      fieldBg: {
        value: {
          _light: "{colors.rayton_neutral.200}", // #ABACAD
          /** Same as InputCustom `background.normal` in dark theme (#1E1E1E) */
          _dark: "{colors.rayton_neutral.500}",
        },
      },
      /** Field border */
      fieldBorder: {
        value: {
          /** User settings light theme only: field border #1E1E1E */
          _light: "{colors.rayton_neutral.350}",
          _dark: "{colors.rayton_neutral.350}", // #656565
        },
      },
      /** Border hover: overrides default InputCustom (`white`) for User settings only */
      fieldBorderHover: {
        value: {
          _light: "{colors.rayton_neutral.550}",  // #1A1A1A
          _dark: "{colors.rayton_neutral.0}",
        },
      },
      fieldBorderFocus: {
        value: {
          _light: "{colors.rayton_neutral.500}", // #1E1E1E
          _dark: "{colors.rayton_neutral.0}", // #FFFFFF
        },
      },
      fieldText: {
        value: {
          _light: "{colors.rayton_neutral.500}", // #1E1E1E
          _dark: "{colors.rayton_neutral.0}", // #FFFFFF
        },
      },
      fieldPlaceholder: {
        value: {
          _light: "{colors.rayton_neutral.300}", // #787878
          _dark: "{colors.rayton_neutral.350}", // #656565
        },
      },
      /** Section captions, row labels, field icons, separators */
      labelIconLine: {
        value: {
          _light: "{colors.rayton_neutral.350}", // #5E5E5E
          _dark: "{colors.rayton_neutral.250}", // #8E8F90
        },
      },
      /** Page title for user settings */
      pageTitle: {
        value: {
          _light: "{colors.rayton_neutral.500}", // #1E1E1E
          _dark: "{colors.rayton_neutral.0}", // #FFFFFF
        },
      },
      divider: {
        value: {
          _light: "{colors.rayton_neutral.350}",
          _dark: "{colors.rayton_neutral.350}",
        },
      },
      actionCancelBg: {
        value: {
          _light: "{colors.rayton_neutral.500}", // #1E1E1E
          _dark: "{colors.rayton_neutral.500}",
        },
      },
      actionCancelText: {
        value: {
          _light: "{colors.rayton_neutral.0}",
          _dark: "{colors.rayton_neutral.0}",
        },
      },
      actionCancelHover: {
        value: {
          _light: "{colors.rayton_neutral.450}",
          _dark: "{colors.rayton_neutral.450}",
        },
      },
      actionSubmitBg: {
        value: {
          _light: "{colors.rayton_orange.450}", // #F2C94C
          _dark: "{colors.rayton_orange.450}",
        },
      },
      actionSubmitText: {
        value: {
          _light: "{colors.rayton_neutral.600}", // #292929
          _dark: "{colors.rayton_neutral.600}",
        },
      },
      actionSubmitHover: {
        value: {
          _light: "{colors.rayton_orange.400}",
          _dark: "{colors.rayton_orange.400}",
        },
      },
    },
    // Usage:
    // - components_2/Pages/control/controlUi.ts (references `ui.PlcControl.*`)
    PlcControl: {
      /** Shared surface background for all PLC Control cards (status, control,
       * diagnostics, schematic). Light `#EDEEF0`, dark `#292929`. */
      cardBg: {
        value: {
          _light: "{colors.rayton_neutral.100}", // #EDEEF0
          _dark: "{colors.rayton_neutral.600}", // #292929
        },
      },
      /** Divider line color shared across PLC Control cards
       * (schematic, control, diagnostics). */
      cardDividerLine: {
        value: {
          _light: "#8F9296",
          _dark: "{colors.rayton_neutral.500}", // #1E1E1E
        },
      },
      statusAccentBar: {
        value: {
          _light: "#00B246",
          _dark: "{colors.rayton_green.300}",
        },
      },
      /** Values for `linear-gradient` (inline style); see StatusControlCard + useToken. */
      statusGradientFrom: {
        value: {
          _light: "rgba(44, 171, 91, 0.2)",
          _dark: "rgba(80, 246, 145, 0.22)",
        },
      },
      statusGradientMid: {
        value: {
          _light: "rgba(44, 171, 91, 0.09)",
          _dark: "rgba(80, 246, 145, 0.10)",
        },
      },
      statusGradientTo: {
        value: {
          _light: "rgba(214, 214, 214, 0)",
          _dark: "rgba(41, 41, 41, 0)",
        },
      },
      mutedLabel: {
        value: {
          _light: "{colors.rayton_neutral.300}",
          _dark: "{colors.rayton_neutral.300}",
        },
      },
      primaryTitle: {
        value: {
          _light: "{colors.rayton_neutral.500}",
          _dark: "{colors.rayton_neutral.0}",
        },
      },
      phaseBadgeBg: {
        value: {
          _light: "#C5CAC8",
          _dark: "{colors.rayton_green.950}",
        },
      },
      phaseBadgeText: {
        value: {
          _light: "{colors.rayton_green.600}",
          _dark: "{colors.rayton_green.600}",
        },
      },
      toggleTrackTint: {
        value: {
          _light: "rgba(44, 171, 91, 0.5)",
          _dark: "rgba(80, 246, 145, 0.1)",
        },
      },
      /** Inner fill for `AutomationToggleSwitch` when ON: muted green to
       * contrast with the brighter thumb. */
      automationToggleFill: {
        value: {
          _light: "#00B246",
          _dark: "{colors.rayton_green.600}", // #2CAB5B
        },
      },
      /** Thumb for `AutomationToggleSwitch`; brand green #50F691. */
      automationToggleThumb: {
        value: {
          _light: "{colors.rayton_green.300}", // #50F691
          _dark: "{colors.rayton_green.300}", // #50F691
        },
      },
      selectSurfaceBg: {
        value: {
          _light: "{colors.rayton_neutral.200}",
          _dark: "{colors.rayton_neutral.500}",
        },
      },
      selectSurfaceText: {
        value: {
          _light: "{colors.rayton_neutral.500}",
          _dark: "{colors.rayton_neutral.0}",
        },
      },
      secondaryButtonBg: {
        value: {
          _light: "{colors.rayton_neutral.200}",
          _dark: "{colors.rayton_neutral.400}",
        },
      },
      secondaryButtonText: {
        value: {
          _light: "{colors.rayton_neutral.0}",
          _dark: "{colors.rayton_neutral.0}",
        },
      },
      secondaryButtonHoverBg: {
        value: {
          _light: "{colors.rayton_neutral.300}",
          _dark: "{colors.rayton_neutral.450}",
        },
      },
      secondaryButtonHoverText: {
        value: {
          _light: "{colors.rayton_neutral.0}",
          _dark: "{colors.rayton_neutral.0}",
        },
      },
      startPrimaryBg: {
        value: {
          _light: "{colors.rayton_green.600}",
          _dark: "{colors.rayton_green.600}",
        },
      },
      startPrimaryHoverBg: {
        value: {
          _light: "{colors.rayton_green.700}",
          _dark: "{colors.rayton_green.700}",
        },
      },
      startPrimaryText: {
        value: {
          _light: "{colors.rayton_neutral.500}",
          _dark: "{colors.rayton_neutral.500}",
        },
      },
      stopBorder: {
        value: {
          _light: "{colors.rayton_red.600}",
          _dark: "{colors.rayton_red.600}",
        },
      },
      stopText: {
        value: {
          _light: "{colors.rayton_red.600}",
          _dark: "{colors.rayton_red.600}",
        },
      },
      stopHoverBg: {
        value: {
          _light: "{colors.rayton_red.600}",
          _dark: "{colors.rayton_red.600}",
        },
      },
      /** Text/icon on filled red Stop hover: light theme white, dark theme card background. */
      stopHoverOnDangerText: {
        value: {
          _light: "{colors.rayton_neutral.0}",
          _dark: "{colors.rayton_neutral.600}",
        },
      },
      commandSending: {
        value: {
          _light: "{colors.rayton_blue.500}",
          _dark: "{colors.rayton_blue.500}",
        },
      },
      commandOk: {
        value: {
          _light: "{colors.rayton_green.600}",
          _dark: "{colors.rayton_green.600}",
        },
      },
      commandFail: {
        value: {
          _light: "{colors.rayton_red.600}",
          _dark: "{colors.rayton_red.600}",
        },
      },

      /** Diagnostic panel shell: same background as status/control cards (`cardBg`). */
      diagnosticShellBg: {
        value: {
          _light: "{colors.rayton_neutral.150}",
          _dark: "{colors.rayton_neutral.600}",
        },
      },
      diagnosticRowBg: {
        value: {
          _light: "{colors.rayton_neutral.50}",
          _dark: "#242424",
        },
      },
      diagnosticRowTintGreen: {
        value: {
          _light: "#BEE2CE",
          _dark: "#2A2F2C",
        },
      },
      diagnosticRowTintRed: {
        value: {
          _light: "#EABFC1",
          _dark: "#2F2828",
        },
      },
      diagnosticRowTintOrange: {
        value: {
          _light: "#E2D8C0",
          _dark: "#493723",
        },
      },
      diagnosticRowTintNeutral: {
        value: {
          _light: "#D5D5D7",
          _dark: "{colors.rayton_neutral.400}",
        },
      },
      diagnosticTitle: {
        value: {
          _light: "{colors.rayton_neutral.300}",
          _dark: "{colors.rayton_neutral.250}",
        },
      },
      diagnosticRowLabel: {
        value: {
          _light: "{colors.rayton_neutral.500}",
          _dark: "{colors.rayton_neutral.0}",
        },
      },
      diagnosticAccentGreen: {
        value: {
          _light: "#00B246",
          _dark: "{colors.rayton_green.300}",
        },
      },
      diagnosticAccentRed: {
        value: {
          _light: "{colors.rayton_red.600}",
          _dark: "{colors.rayton_red.600}",
        },
      },
      diagnosticAccentOrange: {
        value: {
          _light: "#F48D0F",
          _dark: "{colors.rayton_orange.500}",
        },
      },
      diagnosticAccentNeutral: {
        value: {
          _light: "#7B7B7B",
          _dark: "#757575",
        },
      },
      /** Text on filled segment for Indicators filter (active / hover). */
      diagnosticFilterSegmentFillText: {
        value: {
          _light: "{colors.rayton_neutral.0}",
          _dark: "{colors.rayton_neutral.0}",
        },
      },
    },

    // PLC data settings cards (Dashboard)
    // Usage:
    // - components/Dashboard/PLCDataSettingsTable.tsx
    PLCDataSettingsTable: {
      cardBg: {
        value: {
          _light: "{colors.rayton_neutral.150}", // #D6D6D6
          _dark: "{colors.rayton_neutral.600}", // #292929
        },
      },
      cardBorder: {
        value: {
          _light: "{colors.rayton_neutral.300}", // #7A7A7A
          _dark: "{colors.rayton_neutral.350}", // #656565
        },
      },
      labelText: {
        value: {
          _light: "{colors.rayton_neutral.500}", // #1E1E1E
          _dark: "{colors.rayton_neutral.300}", // #787878
        },
      },
      inputBg: {
        value: {
          _light: "{colors.rayton_neutral.200}", // #ABACAD
          _dark: "{colors.rayton_neutral.500}", // #1E1E1E
        },
      },
      inputText: {
        value: {
          _light: "{colors.rayton_neutral.500}", // #1E1E1E
          _dark: "{colors.rayton_neutral.0}", // #FFFFFF
        },
      },
      /** Hover/focus accent used on inputs + revert action */
      actionHover: {
        value: {
          _light: "{colors.rayton_orange.400}", // existing hover orange
          _dark: "{colors.rayton_orange.400}", // #FDCB6E
        },
      },
      /** Select chevron/indicator in idle state */
      selectIndicatorIdle: {
        value: {
          _light: "{colors.rayton_neutral.300}", // #787878
          _dark: "{colors.rayton_neutral.300}", // #787878
        },
      },
      /** Select chevron/indicator when open */
      selectIndicatorOpen: {
        value: {
          _light: "{colors.rayton_neutral.0}", // #FFFFFF
          _dark: "{colors.rayton_neutral.0}", // #FFFFFF

        },
      },
    },

    // - components_2/ui/AuthCard.tsx
    AuthCard: {
      background: {
        value: {
          _light: "{colors.rayton_neutral.550}",
          _dark: "{colors.rayton_neutral.550}",
        },
      },
    },

    // - components_2/ui/StationNameBadge.tsx
    StationNameBadge: {
      background: {
        value: {
          _light: "transparent",
          _dark: "{colors.rayton_neutral.450}", // same as `background.hover` in dark theme
        },
      },
    },

    // - components_2/Pages/management/cards/ManagementCardShell.tsx
    ManagementCard: {
      bgIdle: {
        value: {
          _light: "{colors.rayton_neutral.150}",
          _dark: "{colors.rayton_neutral.600}",
        },
      },
      bgHover: {
        value: {
          _light: "{colors.rayton_neutral.150}",
          _dark: "{colors.rayton_neutral.450}",
        },
      },
      titleText: {
        value: {
          _light: "{colors.rayton_neutral.500}",
          _dark: "{colors.rayton_neutral.0}",
        },
      },
      valueText: {
        value: {
          _light: "{colors.rayton_neutral.500}",
          _dark: "{colors.rayton_neutral.0}",
        },
      },
      toggleHoverText: {
        value: {
          _light: "{colors.rayton_neutral.550}",
          _dark: "{colors.rayton_neutral.0}",
        },
      },
      labelMuted: {
        value: {
          _light: "{colors.rayton_neutral.300}",
          _dark: "{colors.rayton_neutral.300}",
        },
      },
      divider: {
        value: {
          _light: "{colors.rayton_neutral.300}",
          _dark: "{colors.rayton_neutral.300}",
        },
      },
    },

    // - components_2/Pages/management/ManagementCardActionButton.tsx
    ManagementCardAction: {
      editText: {
        value: {
          _light: "{colors.rayton_orange.220}",
          _dark: "{colors.rayton_orange.220}",
        },
      },
      editBorder: {
        value: {
          _light: "{colors.rayton_orange.220}",
          _dark: "{colors.rayton_orange.220}",
        },
      },
      editHoverBg: {
        value: {
          _light: "{colors.rayton_orange.220}",
          _dark: "{colors.rayton_orange.220}",
        },
      },
      editHoverText: {
        value: {
          _light: "{colors.rayton_neutral.500}",
          _dark: "{colors.rayton_neutral.500}",
        },
      },
      deleteText: {
        value: {
          _light: "{colors.rayton_red.600}",
          _dark: "{colors.rayton_red.600}",
        },
      },
      deleteBorder: {
        value: {
          _light: "{colors.rayton_red.600}",
          _dark: "{colors.rayton_red.600}",
        },
      },
      deleteHoverBg: {
        value: {
          _light: "{colors.rayton_red.600}",
          _dark: "{colors.rayton_red.600}",
        },
      },
      deleteHoverText: {
        value: {
          _light: "{colors.rayton_neutral.0}",
          _dark: "{colors.rayton_neutral.0}",
        },
      },
    },

    // - components_2/Pages/management/User/UserManagementCard.tsx
    UserManagementCard: {
      roleBorder: {
        value: {
          _light: "{colors.rayton_neutral.300}",
          _dark: "{colors.rayton_neutral.300}",
        },
      },
      iconSelf: {
        value: {
          _light: "{colors.rayton_blue.500}",
          _dark: "{colors.rayton_blue.500}",
        },
      },
      iconSuperuser: {
        value: {
          _light: "{colors.rayton_orange.400}",
          _dark: "{colors.rayton_orange.300}",
        },
      },
      iconRegular: {
        value: {
          _light: "{colors.rayton_neutral.300}",
          _dark: "{colors.rayton_neutral.300}",
        },
      },
      statusActive: {
        value: {
          _light: "{colors.rayton_green.800}",
          _dark: "{colors.rayton_green.300}",
        },
      },
      statusInactive: {
        value: {
          _light: "{colors.rayton_neutral.500}",
          _dark: "{colors.rayton_neutral.0}",
        },
      },
    },

    // - components_2/Pages/management/Tenant/TenantManagementCard.tsx
    TenantManagementCard: {
      uuidAccent: {
        value: {
          _light: "{colors.rayton_green.800}",
          _dark: "{colors.rayton_green.300}",
        },
      },
    },

    // - components_2/Pages/management/Plant/PlantManagementCard.tsx
    PlantManagementCard: {
      timezoneAccent: {
        value: {
          _light: "{colors.rayton_blue.500}",
          _dark: "{colors.rayton_blue.500}",
        },
      },
    },

    // - components_2/ui/DeviceDataHeader.tsx
    DeviceDataHeader: {
      barBg: {
        value: {
          _light: "{colors.rayton_neutral.600}",
          _dark: "{colors.rayton_neutral.600}",
        },
      },
      mutedText: {
        value: {
          _light: "{colors.rayton_neutral.300}",
          _dark: "{colors.rayton_neutral.300}",
        },
      },
    },

    // - components_2/Pages/schedule/ScheduleControlTable/TableCheckbox.tsx
    TableCheckbox: {
      rowHoverBg: {
        value: {
          _light: "rgba(0, 0, 0, 0.04)",
          _dark: "rgba(255, 255, 255, 0.1)",
        },
      },
    },

    // - components_2/ui/OrangeToggleSwitch.tsx
    // - components_2/ui/SocCombinedSwitch.tsx
    Switch: {
      trackDisabledBg: {
        value: {
          _light: "{colors.rayton_neutral.150}",
          _dark: "{colors.rayton_neutral.500}",
        },
      },
      thumbDisabledBg: {
        value: {
          _light: "{colors.rayton_neutral.0}",
          _dark: "{colors.rayton_neutral.0}",
        },
      },
    },

    // - components_2/Sidebar/Sidebar.tsx
    // - components_2/Sidebar/SidebarItems.tsx
    // - components_2/ui/SidebarLink.tsx
    // - components_2/ui/SidebarSearch.tsx
    Sidebar: {
      background: {
        value: {
          _light: "{colors.rayton_neutral.0}",  // #FFFFFF
          _dark: "{colors.rayton_neutral.600}",  // #292929
        },
      },
      item_bg_active: {
        value: {
          _light: "{colors.rayton_orange.250}",
          _dark: "{colors.rayton_neutral.450}",  // #3E3A33
        },
      },
      item_text_active: {
        value: {
          _light: "{colors.rayton_neutral.500}", // #1E1E1E
          _dark: "{colors.rayton_orange.300}",
        },
      },
      item_border_active: {
        value: {
          _light: "{colors.rayton_orange.300}",
          _dark: "{colors.rayton_orange.300}",
        },
      },
      item_text_default: {
        value: {
          _light: "{colors.rayton_neutral.550}",  // #1A1A1A
          _dark: "{colors.rayton_neutral.0}",  // #FFFFFF
        },
      },
      search_bg: {
        value: {
          _light: "{colors.rayton_neutral.50}",
          _dark: "{colors.rayton_neutral.500/23}",
        },
      },
      search_border: {
        value: {
          _light: "{colors.rayton_neutral.200}",
          _dark: "{colors.rayton_neutral.0/10}",
        },
      },
      search_placeholder: {
        value: {
          _light: "{colors.rayton_neutral.400}",
          _dark: "{colors.rayton_neutral.0/40}",
        },
      },
      search_icon: {
        value: {
          _light: "{colors.rayton_neutral.400}",
          _dark: "{colors.rayton_neutral.0/60}",
        },
      },
      divider: {
        value: {
          _light: "{colors.rayton_neutral.300}",
          _dark: "{colors.rayton_neutral.350}",
        },
      },
    },

    // Scrollbars (app + sidebar containers)
    Scrollbar: {
      thumb: {
        value: {
          // Light: almost invisible thumb
          _light: "{colors.rayton_neutral.650/10}",
          // Dark: visible thumb
          _dark: "{colors.rayton_neutral.500}",
        },
      },
    },

    Chart: {
      axisText: {
        value: {
          _light: "#1E1E1E",
          _dark: "rgba(242, 242, 242, 0.6)",
        },
      },
      grid: {
        value: {
          _light: "#858687",
          _dark: "rgba(255, 255, 255, 0.08)",
        },
      },
      border: {
        value: {
          _light: "#858687",
          _dark: "#2F2F2F",
        },
      },
      cardFrameBorder: {
        value: {
          _light: "#858687",
          _dark: "#2F2F2F",
        },
      },
      cursorLine: {
        value: {
          _light: "rgba(26, 26, 26, 0.18)",
          _dark: "rgba(255, 255, 255, 0.18)",
        },
      },
      cursorFill: {
        value: {
          _light: "rgba(26, 26, 26, 0.04)",
          _dark: "rgba(255, 255, 255, 0.04)",
        },
      },
      tooltipBg: {
        value: {
          _light: "{colors.rayton_neutral.0}",
          _dark: "{colors.rayton_neutral.600}",
        },
      },
      tooltipText: {
        value: {
          _light: "{colors.rayton_neutral.550}",
          _dark: "{colors.rayton_neutral.0}",
        },
      },
      divider: {
        value: {
          _light: "#858687",
          _dark: "rgba(255, 255, 255, 0.06)",
        },
      },
      toolbarBorder: {
        value: {
          _light: "#858687",
          _dark: "rgba(255, 255, 255, 0.08)",
        },
      },
      toolbarBg: {
        value: {
          _light: "{colors.rayton_neutral.50}",
          _dark: "{colors.rayton_neutral.500}",
        },
      },
      mutedText: {
        value: {
          _light: "rgba(26, 26, 26, 0.48)",
          _dark: "rgba(255, 255, 255, 0.48)",
        },
      },
      calendarNavText: {
        value: {
          _light: "{colors.rayton_neutral.300}",
          _dark: "{colors.rayton_neutral.300}",
        },
      },
      calendarNavHoverBg: {
        value: {
          _light: "{colors.rayton_neutral.500}",
          _dark: "{colors.rayton_neutral.500}",
        },
      },
      calendarNavHoverText: {
        value: {
          _light: "{colors.rayton_neutral.0}",
          _dark: "{colors.rayton_neutral.0}",
        },
      },
      calendarMonthBadgeBg: {
        value: {
          _light: "{colors.rayton_neutral.500}",
          _dark: "{colors.rayton_neutral.500}",
        },
      },
      calendarMonthBadgeText: {
        value: {
          _light: "{colors.rayton_neutral.0}",
          _dark: "{colors.rayton_neutral.0}",
        },
      },
      calendarWeekdayText: {
        value: {
          _light: "{colors.rayton_neutral.300}",
          _dark: "{colors.rayton_neutral.300}",
        },
      },
      calendarOutsideMonthDayText: {
        value: {
          _light: "{colors.rayton_neutral.450}",
          _dark: "{colors.rayton_neutral.450}",
        },
      },
      calendarRegularDayText: {
        value: {
          _light: "{colors.rayton_neutral.300}",
          _dark: "{colors.rayton_neutral.300}",
        },
      },
      calendarSelectedDayText: {
        value: {
          _light: "{colors.rayton_neutral.0}",
          _dark: "{colors.rayton_neutral.0}",
        },
      },
      calendarDayHoverBg: {
        value: {
          _light: "{colors.rayton_neutral.500}",
          _dark: "{colors.rayton_neutral.500}",
        },
      },
      calendarDayHoverText: {
        value: {
          _light: "{colors.rayton_neutral.0}",
          _dark: "{colors.rayton_neutral.0}",
        },
      },
      calendarTodayRing: {
        value: {
          _light: "inset 0 0 0 1px rgba(255,255,255,0.4)",
          _dark: "inset 0 0 0 1px rgba(255,255,255,0.4)",
        },
      },
    },

    // - components_2/Pages/schedule/ScheduleControlTable*.tsx
    // - components_2/Pages/schedule/ScheduleMobileTable/*.tsx
    // - components_2/Pages/schedule/CommandStatusDisplay.tsx
    ScheduleTable: {
      // Header
      headerBg: {
        value: {
          _light: "{colors.rayton_neutral.150}", // #D6D6D6
          _dark: "#1B1B1B",
        },
      },
      headerText: {
        value: {
          _light: "{colors.rayton_neutral.550}", // #1A1A1A
          _dark: "{colors.rayton_neutral.250}", // ~ #8E8F90
        },
      },

      // Body zebra rows
      rowBgOdd: {
        value: {
          _light: "{colors.rayton_neutral.150}", // #D6D6D6
          _dark: "{colors.rayton_neutral.400}", // ~ #343434
        },
      },
      rowBgEven: {
        value: {
          _light: "{colors.rayton_neutral.50}", // #F3F4F6
          _dark: "{colors.rayton_neutral.500}", // ~ #1E1E1E
        },
      },
      rowHoverBg: {
        value: {
          _light: "{colors.rayton_neutral.100}",
          _dark: "{colors.rayton_neutral.450}",
        },
      },

      // Text / controls
      cellText: {
        value: {
          _light: "{colors.rayton_neutral.550}",
          _dark: "{colors.rayton_neutral.0}",
        },
      },
      mutedText: {
        value: {
          _light: "{colors.rayton_neutral.300}",
          _dark: "{colors.rayton_neutral.250}",
        },
      },

      // Invalid state
      invalidRowBg: {
        value: {
          _light: "{colors.rayton_red.600/10}",
          _dark: "{colors.rayton_red.600/16}",
        },
      },
      invalidInputBg: {
        value: {
          _light: "{colors.rayton_red.600/14}",
          _dark: "{colors.rayton_red.600/22}",
        },
      },
      invalidOutline: {
        value: {
          _light: "{colors.rayton_red.600}",
          _dark: "{colors.rayton_red.600}",
        },
      },
      errorText: {
        value: {
          _light: "{colors.rayton_red.600}",
          _dark: "{colors.rayton_red.600}",
        },
      },
      statusSending: {
        value: {
          _light: "{colors.rayton_blue.500}",
          _dark: "{colors.rayton_blue.500}",
        },
      },
      statusSuccess: {
        value: {
          _light: "{colors.rayton_green.650}",
          _dark: "{colors.rayton_green.650}",
        },
      },
      statusFailed: {
        value: {
          _light: "{colors.rayton_red.600}",
          _dark: "{colors.rayton_red.600}",
        },
      },

      // Mobile schedule cards (Figma 119:9435)
      mobileCardBg: {
        value: {
          _light: "{colors.rayton_neutral.0}",
          _dark: "{colors.rayton_neutral.600}",
        },
      },
      mobileCardBorder: {
        value: {
          _light: "{colors.rayton_neutral.150}",
          _dark: "transparent",
        },
      },
      mobileCardBorderActive: {
        value: {
          _light: "{colors.rayton_orange.300}",
          _dark: "{colors.rayton_orange.300}",
        },
      },
      mobileBadgeBg: {
        value: {
          _light: "{colors.rayton_neutral.50}",
          _dark: "{colors.rayton_neutral.500}",
        },
      },
      mobileBadgeBorder: {
        value: {
          _light: "{colors.rayton_neutral.200}",
          _dark: "{colors.rayton_neutral.350}",
        },
      },
      mobileTimeText: {
        value: {
          _light: "{colors.rayton_neutral.550}",
          _dark: "{colors.rayton_neutral.0}",
        },
      },
      mobileTimeTextActive: {
        value: {
          _light: "{colors.rayton_orange.300}",
          _dark: "{colors.rayton_orange.300}",
        },
      },
      mobileMutedText: {
        value: {
          _light: "{colors.rayton_neutral.300}",
          _dark: "{colors.rayton_neutral.250}",
        },
      },
      mobileStepperRowBg: {
        value: {
          _light: "{colors.rayton_neutral.50}",
          _dark: "{colors.rayton_neutral.500}",
        },
      },
      mobileStepperBtnBg: {
        value: {
          _light: "{colors.rayton_neutral.100}",
          _dark: "{colors.rayton_neutral.600}",
        },
      },
      mobileStepperValueBorder: {
        value: {
          _light: "{colors.rayton_neutral.200}",
          _dark: "{colors.rayton_neutral.350}",
        },
      },
      mobileDivider: {
        value: {
          _light: "{colors.rayton_neutral.200}",
          _dark: "{colors.rayton_neutral.350}",
        },
      },
      mobileChevron: {
        value: {
          _light: "{colors.rayton_neutral.300}",
          _dark: "{colors.rayton_neutral.250}",
        },
      },

      checkboxUnchecked: {
        value: {
          _light: "{colors.rayton_neutral.550}", // black icon in light table
          _dark: "{colors.rayton_neutral.0}", // white icon in dark table
        },
      },
      checkboxCheckedGreen: {
        value: {
          _light: "#22C55E",
          _dark: "#22C55E",
        },
      },
    },

    // SES/UZE Device tree + telemetry pane
    // Usage:
    // - components_2/Pages/device/deviceTreePageUi.ts
    // - components_2/ui/DeviceTree* + DeviceDataHeader
    DeviceTree: {
      titleText: {
        value: {
          _light: "{colors.rayton_neutral.500}", // #1E1E1E
          _dark: "{colors.rayton_neutral.0}", // #FFFFFF
        },
      },
      panelBorder: {
        value: {
          _light: "{colors.rayton_neutral.200}",
          _dark: "{colors.rayton_neutral.350}", // #656565
        },
      },
      connectorIdle: {
        value: {
          _light: "{colors.rayton_neutral.350}",
          _dark: "{colors.rayton_neutral.0/30}", // brighter idle connector in dark
        },
      },
      connectorActive: {
        value: {
          _light: "#ffbe50",
          _dark: "#ffbe50",
        },
      },
      disclosureBg: {
        value: {
          _light: "{colors.rayton_neutral.150}",
          _dark: "{colors.rayton_neutral.600}",
        },
      },
      disclosureSubtitle: {
        value: {
          _light: "{colors.rayton_neutral.300}",
          _dark: "{colors.rayton_neutral.300}",
        },
      },
      disclosureBorderSelected: {
        value: {
          _light: "{colors.rayton_neutral.650/12}",
          _dark: "{colors.rayton_neutral.0/22}",
        },
      },
      leafStatusOnline: {
        value: {
          _light: "#00C853",
          _dark: "#00C853",
        },
      },
      leafStatusOffline: {
        value: {
          _light: "#EF4444",
          _dark: "#EF4444",
        },
      },
      leafBgDefault: {
        value: {
          _light: "{colors.rayton_neutral.150/22}",
          _dark: "{colors.rayton_neutral.150/10}",
        },
      },
      leafSelectedBorder: {
        value: {
          _light: "#ffbe50",
          _dark: "#ffbe50",
        },
      },
      leafBgCounter: {
        value: {
          _light: "#E8E8EA",
          _dark: "#303030",
        },
      },
      leafBgPcs: {
        value: {
          _light: "#F3E2B2",
          _dark: "#332F23",
        },
      },
      leafBgBms: {
        value: {
          _light: "#A4D0EC",
          _dark: "#1F2B31",
        },
      },
      leafBgTms: {
        value: {
          _light: "#B1DBD9",
          _dark: "#202424",
        },
      },
      leafBgCell: {
        value: {
          _light: "#B2F4CE",
          _dark: "#233429",
        },
      },
      leafBgOther: {
        value: {
          _light: "#D0B2EE",
          _dark: "#2A2331",
        },
      },
      leafIconCounter: {
        value: {
          _light: "#1E1E1E",
          _dark: "#FFFFFF",
        },
      },
      leafIconPcs: {
        value: {
          _light: "#ffbe50",
          _dark: "#ffbe50",
        },
      },
      leafIconBms: {
        value: {
          _light: "#71CBFF",
          _dark: "#71CBFF",
        },
      },
      leafIconTms: {
        value: {
          _light: "#4DB6AC",
          _dark: "#4DB6AC",
        },
      },
      leafIconCell: {
        value: {
          _light: "#50F691",
          _dark: "#50F691",
        },
      },
      leafIconOther: {
        value: {
          _light: "#9B51E0",
          _dark: "#9B51E0",
        },
      },
      leafIconStrongCounter: {
        value: {
          _light: "#1E1E1E",
          _dark: "#FFFFFF",
        },
      },
      leafIconStrongPcs: {
        value: {
          _light: "#7E5F00",
          _dark: "#ffbe50",
        },
      },
      leafIconStrongBms: {
        value: {
          _light: "#48748D",
          _dark: "#71CBFF",
        },
      },
      leafIconStrongTms: {
        value: {
          _light: "#254433",
          _dark: "#4DB6AC",
        },
      },
      leafIconStrongCell: {
        value: {
          _light: "#008936",
          _dark: "#50F691",
        },
      },
      leafIconStrongOther: {
        value: {
          _light: "#503F84",
          _dark: "#9B51E0",
        },
      },
    },

    // - components_2/ui/CheckboxCustom.tsx
    checkbox: {
      border: {
        value: {
          _light: "{colors.rayton_neutral.300}", // #787878
          _dark: "{colors.rayton_neutral.350}", // #656565
        },
      },
      border_hover: {
        value: {
          _light: "{colors.rayton_neutral.550}", // #1A1A1A
          _dark: "{colors.rayton_neutral.0}", // #FFFFFF
        },
      },
      background: {
        value: {
          _light: "{colors.rayton_neutral.0}", // #FFFFFF
          _dark: "{colors.rayton_neutral.550}", // #1A1A1A
        },
      },
    },

    // - routes/_layout/admin.tsx
    // - routes/_layout/tenant.tsx
    // - routes/_layout/plant-management.tsx
    PageHeader: {
      divider: {
        value: {
          _light: "{colors.rayton_neutral.500/50}", // rgba(30,30,30,0.5)
          _dark: "{colors.rayton_neutral.350}", // #656565
        },
      },
      title: {
        value: {
          _light: "{colors.rayton_neutral.500}", // #1E1E1E
          _dark: "{colors.rayton_neutral.0}", // #FFFFFF
        },
      },
    },

    // - components_2/ui/Pagination.tsx
    // - components_2/ui/ItemsPerPageSelect.tsx
    Pagination: {
      itemBg: {
        value: {
          _light: "{colors.rayton_neutral.150}", // #D6D6D6
          _dark: "{colors.rayton_neutral.600}", // #292929
        },
      },
      itemHoverBg: {
        value: {
          _light: "{colors.rayton_neutral.150}",
          _dark: "{colors.rayton_neutral.450}",
        },
      },
      itemText: {
        value: {
          _light: "{colors.rayton_neutral.500}", // #1E1E1E
          _dark: "{colors.rayton_neutral.0}", // #FFFFFF
        },
      },
      itemDisabledText: {
        value: {
          _light: "{colors.rayton_neutral.200}", // #AAAAAA
          _dark: "{colors.rayton_neutral.350}", // #656565
        },
      },
      selectBg: {
        value: {
          _light: "{colors.rayton_neutral.150}", // #D6D6D6
          _dark: "{colors.rayton_neutral.600}", // #292929
        },
      },
      selectHoverBg: {
        value: {
          _light: "{colors.rayton_neutral.150}",
          _dark: "{colors.rayton_neutral.450}",
        },
      },
      selectIconIdle: {
        value: {
          _light: "{colors.rayton_neutral.300}", // #787878
          _dark: "{colors.rayton_neutral.350}", // #656565
        },
      },
      selectIconActive: {
        value: {
          _light: "{colors.rayton_neutral.500}", // #1E1E1E
          _dark: "{colors.rayton_neutral.0}", // #FFFFFF
        },
      },
      menuBg: {
        value: {
          _light: "{colors.rayton_neutral.0}", // #FFFFFF
          _dark: "{colors.rayton_neutral.500}", // #1E1E1E
        },
      },
      menuBorder: {
        value: {
          _light: "{colors.rayton_neutral.200}", // #AAAAAA
          _dark: "{colors.rayton_neutral.350}", // #656565
        },
      },
      menuItemHoverBg: {
        value: {
          _light: "{colors.rayton_neutral.100}", // #EDEEF0
          _dark: "#333333",
        },
      },
    },

    // - components_2/Pages/management/sharedModalStyles.ts
    // - components_2/Pages/management/ManagementDialogShell.tsx
    // - components_2/Pages/management/ManagementDialogActions.tsx
    // - components_2/Pages/management/ConfirmDeleteDialog.tsx
    // - components_2/Pages/management/{User,Tenant,Plant}/{Add,Edit,Delete}*.tsx
    Modal: {
      bg: {
        value: {
          _light: "{colors.rayton_neutral.0}", // #FFFFFF
          _dark: "{colors.rayton_neutral.500}", // #1E1E1E
        },
      },
      titleText: {
        value: {
          _light: "{colors.rayton_neutral.500}", // #1E1E1E
          _dark: "{colors.rayton_neutral.0}", // #FFFFFF
        },
      },
      mutedText: {
        value: {
          _light: "{colors.rayton_neutral.300}", // #787878
          _dark: "{colors.rayton_neutral.350}", // #656565
        },
      },
      divider: {
        value: {
          _light: "{colors.rayton_neutral.150}", // #D6D6D6
          _dark: "{colors.rayton_neutral.350}", // #656565
        },
      },
      fieldBg: {
        value: {
          _light: "{colors.rayton_neutral.50}", // #F3F4F6
          _dark: "{colors.rayton_neutral.600}", // #292929
        },
      },
      fieldBgDark: {
        value: {
          _light: "{colors.rayton_neutral.150}", // #EDEEF0
          _dark: "#141414",
        },
      },
      fieldText: {
        value: {
          _light: "{colors.rayton_neutral.500}", // #1E1E1E
          _dark: "{colors.rayton_neutral.0}", // #FFFFFF
        },
      },
      fieldPlaceholder: {
        value: {
          _light: "{colors.rayton_neutral.300}", // #787878
          _dark: "{colors.rayton_neutral.350}", // #656565
        },
      },
      fieldBorderHover: {
        value: {
          _light: "{colors.rayton_neutral.200}", // #AAAAAA
          _dark: "{colors.rayton_neutral.350}", // #656565
        },
      },
      cancelBorder: {
        value: {
          _light: "{colors.rayton_neutral.200}", // #AAAAAA
          _dark: "{colors.rayton_neutral.350}", // #656565
        },
      },
      cancelHoverBg: {
        value: {
          _light: "{colors.rayton_neutral.100}", // #EDEEF0
          _dark: "rgba(255,255,255,0.06)",
        },
      },
      menuItemHoverBg: {
        value: {
          _light: "{colors.rayton_neutral.150}", // #EDEEF0
          _dark: "#333333",
        },
      },
    },
  },

  // - chartUtils + all trend charts (dashboard/schedule)
  trends: {
    PLANT_CONSUMPTION: {
      value: {
        _light: "{colors.rayton_chart.consumption}",
        _dark: "{colors.rayton_chart.consumption}",
      },
    },
    SOLAR_GENERATION: {
      value: {
        _light: "{colors.rayton_chart.solar}",
        _dark: "{colors.rayton_chart.solar}",
      },
    },
    GRID_1: {
      value: {
        _light: "{colors.rayton_chart.grid_1}",
        _dark: "{colors.rayton_chart.grid_1}",
      },
    },
    GRID_2: {
      value: {
        _light: "{colors.rayton_chart.grid_2}",
        _dark: "{colors.rayton_chart.grid_2}",
      },
    },
    GENERATOR_POWER: {
      value: {
        _light: "{colors.rayton_chart.generator}",
        _dark: "{colors.rayton_chart.generator}",
      },
    },
    ESS_SOC: {
      value: {
        _light: "{colors.rayton_chart.ess_soc}",
        _dark: "{colors.rayton_chart.ess_soc}",
      },
    },
    ESS_POWER: {
      value: {
        _light: "{colors.rayton_chart.ess_power}",
        _dark: "{colors.rayton_chart.ess_power}",
      },
    },
    ESS_CHARGE_FROM_PV: {
      value: {
        _light: "{colors.rayton_chart.ess_charge_from_pv}",
        _dark: "{colors.rayton_chart.ess_charge_from_pv}",
      },
    },
    ESS_CHARGE_TOTAL: {
      value: {
        _light: "{colors.rayton_chart.ess_charge_total}",
        _dark: "{colors.rayton_chart.ess_charge_total}",
      },
    },
    ESS_DISCHARGE_TOTAL: {
      value: {
        _light: "{colors.rayton_chart.ess_discharge_total}",
        _dark: "{colors.rayton_chart.ess_discharge_total}",
      },
    },
  },

  page: {},
}
