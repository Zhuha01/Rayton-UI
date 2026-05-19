/**
 * SVG-based icons for management cards (user, tenant, solar) with shared sizing and borders.
 * Stroke and border colors follow Chakra `currentColor` or management semantic tokens where set.
 */

import { Box, type BoxProps } from "@chakra-ui/react"
import { useId } from "react"

const ICON_BOX_PROPS = {
  boxSize: "50px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  "aria-hidden": true as const,
}

export type ManagementCardUserIconProps = BoxProps & {
  /** When true, no circular border (user management card only). */
  frameless?: boolean
}

/** User profile mark from user-02.svg; stroke follows currentColor for hover/white states. */
export function ManagementCardUserIcon({
  frameless = false,
  ...props
}: ManagementCardUserIconProps) {
  return (
    <Box
      {...ICON_BOX_PROPS}
      {...(!frameless
        ? {
            borderRadius: "full",
            borderWidth: "1px",
            borderColor: "ui.ManagementCard.labelMuted",
          }
        : {})}
      {...props}
    >
      <svg
        width="32"
        height="32"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M16.6663 17.5C16.6663 15.1988 13.6816 13.3333 9.99967 13.3333C6.31778 13.3333 3.33301 15.1988 3.33301 17.5M9.99967 10.8333C7.69849 10.8333 5.83301 8.96785 5.83301 6.66667C5.83301 4.36548 7.69849 2.5 9.99967 2.5C12.3009 2.5 14.1663 4.36548 14.1663 6.66667C14.1663 8.96785 12.3009 10.8333 9.99967 10.8333Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Box>
  )
}

/** Building / tenant mark from tenant.svg. */
export function ManagementCardTenantIcon(props: BoxProps) {
  return (
    <Box {...ICON_BOX_PROPS} {...props}>
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g transform="translate(1 2.5)">
          <path
            d="M1 18H3M3 18H13M3 18V4.2002C3 3.08009 3 2.51962 3.21799 2.0918C3.40973 1.71547 3.71547 1.40973 4.0918 1.21799C4.51962 1 5.08009 1 6.2002 1H9.8002C10.9203 1 11.4796 1 11.9074 1.21799C12.2837 1.40973 12.5905 1.71547 12.7822 2.0918C13 2.5192 13 3.07899 13 4.19691V10M13 18H19M13 18V10M19 18H21M19 18V10C19 9.06812 18.9999 8.60241 18.8477 8.23486C18.6447 7.74481 18.2557 7.35523 17.7656 7.15224C17.3981 7 16.9316 7 15.9997 7C15.0679 7 14.6019 7 14.2344 7.15224C13.7443 7.35523 13.3552 7.74481 13.1522 8.23486C13 8.60241 13 9.06812 13 10M6 8H10M6 5H10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    </Box>
  )
}

/** Plant / solar mark from solar-panel.svg; unique clipPath per instance for list safety. */
export function ManagementCardSolarPanelIcon(props: BoxProps) {
  const rawId = useId()
  const clipId = `mc-solar-clip-${rawId.replace(/:/g, "")}`

  return (
    <Box {...ICON_BOX_PROPS} {...props}>
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g clipPath={`url(#${clipId})`}>
          <path
            d="M22.5 19.5V10.5H9.75V19.5H13.5V21H1.5V22.5H22.5V21H18.75V19.5H22.5ZM18.75 18V15.75H21V18H18.75ZM17.25 15.75V18H15V15.75H17.25ZM15 14.25V12H17.25V14.25H15ZM21 14.25H18.75V12H21V14.25ZM13.5 12V14.25H11.25V12H13.5ZM11.25 18V15.75H13.5V18H11.25ZM17.25 21H15V19.5H17.25V21Z"
            fill="currentColor"
          />
          <path
            d="M6.9996 11.2357C6.62669 10.902 6.34316 10.4804 6.17483 10.0092C6.0065 9.53794 5.95872 9.03208 6.03584 8.53767C6.11296 8.04325 6.31252 7.57598 6.61636 7.17839C6.9202 6.7808 7.31867 6.46553 7.77548 6.26129C8.2323 6.05704 8.73294 5.9703 9.23184 6.00897C9.73074 6.04764 10.212 6.21049 10.6319 6.48269C11.0518 6.7549 11.3969 7.1278 11.6359 7.56746C11.8748 8.00712 12 8.49957 12 8.99996H10.5C10.5 8.74975 10.4374 8.50351 10.3179 8.28367C10.1985 8.06382 10.0259 7.87736 9.81593 7.74126C9.60597 7.60515 9.36531 7.52373 9.11584 7.50441C8.86638 7.48509 8.61604 7.52847 8.38763 7.63062C8.15922 7.73277 7.95999 7.89044 7.80808 8.08926C7.65617 8.28808 7.55641 8.52175 7.51789 8.76897C7.47936 9.0162 7.50329 9.26914 7.5875 9.50476C7.67171 9.74037 7.81352 9.95118 8.00003 10.118L6.9996 11.2357Z"
            fill="currentColor"
          />
          <path d="M9.75 1.5H8.25V4.5H9.75V1.5Z" fill="currentColor" />
          <path d="M4.5 8.25H1.5V9.75H4.5V8.25Z" fill="currentColor" />
          <path
            d="M4.22698 3.16639L3.16632 4.22705L5.28764 6.34837L6.3483 5.28771L4.22698 3.16639Z"
            fill="currentColor"
          />
          <path
            d="M11.6516 5.28773L12.7123 6.34839L14.8336 4.22707L13.7729 3.16641L11.6516 5.28773Z"
            fill="currentColor"
          />
        </g>
        <defs>
          <clipPath id={clipId}>
            <rect width="24" height="24" fill="white" />
          </clipPath>
        </defs>
      </svg>
    </Box>
  )
}

/**
 * str.svg: outer layer rotates asset to point down when collapsed; inner applies
 * rotate(-180deg) when expanded (counter-clockwise). Padded viewBox + min size reduce stroke clipping.
 */
export function ManagementCardStrToggleIcon({
  expanded,
  ...props
}: BoxProps & { expanded: boolean }) {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexShrink={0}
      minW="40px"
      minH="40px"
      overflow="visible"
      aria-hidden
      {...props}
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        transform="rotate(90deg)"
      >
        <Box
          transform={expanded ? "rotate(180deg)" : "rotate(0deg)"}
          transition="transform 0.25s ease"
          transformOrigin="center"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <svg
            width="14"
            height="14"
            viewBox="-0.75 -0.75 7.5 12.5"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ overflow: "visible" }}
          >
            <path
              d="M1 10L5 5.49927L1 1"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Box>
      </Box>
    </Box>
  )
}
