/**
 * Global CSS styles applied across the entire application.
 * Includes base element resets, scrollbar styling, and third-party library overrides.
 */

export const globalCss = {
  html: {
    fontSize: "16px",
  },
  body: {
    margin: 0,
    padding: 0,
    fontFamily: "Inter, sans-serif",
    backgroundColor: "{colors.ui.NavbarComponent.background}",
    scrollbarGutter: "stable",
  },
  "#root": {
    minHeight: "100vh",
    backgroundColor: "{colors.ui.NavbarComponent.background}",
  },
  // Added for Sidebar — scrollbar uses palette tokens (no hardcoded colors in components)
  ".sidebar-scrollbar": {
    // Reserve scrollbar gutter when the list is short (e.g. after search) to avoid width jump.
    scrollbarGutter: "stable",
    scrollbarWidth: "thin",
    scrollbarColor: "{colors.ui.Scrollbar.thumb} transparent",
    "&::-webkit-scrollbar": {
      width: "2px",
      height: "2px",
    },
    "&::-webkit-scrollbar-track": {
      background: "transparent",
    },
    "&::-webkit-scrollbar-button": {
      width: 0,
      height: 0,
      display: "none",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "{colors.ui.Scrollbar.thumb}",
      borderRadius: "1px",
    },
  },
  // App/content scrollbar: same look as sidebar but WITHOUT reserving gutter space.
  // Prevents Chrome from adding extra side spacing in charts/containers.
  ".app-scrollbar": {
    scrollbarWidth: "thin",
    scrollbarColor: "{colors.ui.Scrollbar.thumb} transparent",
    "&::-webkit-scrollbar": {
      width: "2px",
      height: "2px",
    },
    "&::-webkit-scrollbar-track": {
      background: "transparent",
    },
    "&::-webkit-scrollbar-button": {
      width: 0,
      height: 0,
      display: "none",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "{colors.ui.Scrollbar.thumb}",
      borderRadius: "1px",
    },
  },
  // Recharts: prevent browser focus outlines ("white frame") after click
  ".recharts-wrapper:focus, .recharts-wrapper:focus-visible": {
    outline: "none",
  },
  ".recharts-wrapper:focus-within": {
    outline: "none",
  },
  ".recharts-surface:focus, .recharts-surface:focus-visible": {
    outline: "none",
  },
  // Some browsers apply focus ring/box-shadow to inner SVG elements on click.
  ".recharts-wrapper *:focus, .recharts-wrapper *:focus-visible": {
    outline: "none",
    boxShadow: "none",
  },
  "svg:focus, svg:focus-visible": {
    outline: "none",
  },
  // Recharts Tooltip cursor sometimes renders a full-plot rectangle (white frame).
  // We replace it with custom line cursors in charts and suppress the default rect.
  ".recharts-tooltip-cursor": {
    fill: "none !important",
    stroke: "none !important",
  },
  "rect.recharts-tooltip-cursor": {
    display: "none !important",
  },
}
