/**
 * Solar array illustration with alternating sun halo animation when PV generation is flowing.
 */

import type { SVGProps } from "react"
import { forwardRef, useId } from "react"

const SUN_PATH =
  "M30 6.5V5.5H27.0497C26.9798 5.073 26.8222 4.678 26.5973 4.33663L28.684 2.11087L28.0212 1.40375L25.9349 3.629C25.6148 3.38825 25.2444 3.21962 24.8438 3.1445V0H23.9062V3.1435C23.5039 3.218 23.1318 3.38688 22.8105 3.62838L20.727 1.406L20.0641 2.11313L22.1479 4.33563C21.9226 4.67725 21.7648 5.07263 21.6948 5.5H18.75V6.5H21.6948C21.7649 6.9285 21.9233 7.32463 22.1495 7.66687L20.066 9.889L20.7288 10.5961L22.8128 8.37337C23.1335 8.61388 23.5049 8.78225 23.9062 8.8565V12H24.8438V8.8555C25.2434 8.78063 25.6131 8.6125 25.9327 8.37275L28.0191 10.5984L28.6819 9.89137L26.5956 7.66587C26.8214 7.324 26.9795 6.92812 27.0496 6.50012L30 6.5ZM24.3722 4.1C25.3545 4.1 26.1534 4.95237 26.1534 6C26.1534 7.04763 25.3545 7.9 24.3722 7.9C23.39 7.9 22.5911 7.04763 22.5911 6C22.5911 4.95237 23.39 4.1 24.3722 4.1Z"

const PANELS_PATH =
  "M9.14062 29.25V30H4.80469V29.25H6.5625V26.5H7.26562V29.25H9.14062ZM7.21137 10L8.35078 14.75H11.2271L10.0819 10H7.21137ZM9.67008 20.25H12.5532L11.408 15.5H8.53066L9.67008 20.25ZM8.94434 20.25L7.80492 15.5H4.93148L6.0709 20.25H8.94434ZM2.88656 10H0L1.14516 14.75H4.02586L2.88656 10ZM7.62504 14.75L6.48563 10H3.6123L4.75172 14.75H7.62504ZM10.9894 25.75H13.8793L12.7341 21H9.84996L10.9894 25.75ZM6.25078 21L7.3902 25.75H10.2636L9.12422 21H6.25078ZM4.20586 15.5H1.32598L2.47113 20.25H5.34516L4.20586 15.5ZM2.65207 21L3.79723 25.75H6.66445L5.52504 21H2.65207ZM20.7032 23.5H22.7018L23.4853 26.75H21.4827L20.7032 23.5ZM18.8672 29.375V27.375H18.2812V29.375H16.9922V30H20.1562V29.375H18.8672ZM17.96 22.875L17.1205 19.375H19.1089L19.9485 22.875H17.96ZM16.9705 18.75L16.191 15.5H18.1794L18.9589 18.75H16.9705ZM20.0984 23.5L20.8779 26.75H18.8895L18.1099 23.5H20.0984ZM17.5051 23.5L18.2846 26.75H16.3119L15.5284 23.5H17.5051ZM16.3657 18.75H14.3832L13.5997 15.5H15.5862L16.3657 18.75ZM17.3552 22.875H15.3778L14.5339 19.375H16.5157L17.3552 22.875ZM20.7731 15.5L21.5566 18.75H19.5637L18.7842 15.5H20.7731ZM19.7136 19.375H21.7073L22.5512 22.875H20.5533L19.7136 19.375ZM27.8906 29.5V30H26.0156V29.5H26.7188V28.375H27.1875V29.5H27.8906ZM26.8032 26L27.253 27.875H28.377L27.9272 26H26.8032ZM28.8608 27.875H30L29.5479 26H28.4109L28.8608 27.875ZM25.2011 26L25.6532 27.875H26.7693L26.3195 26H25.2011ZM28.2911 25.5H29.4273L28.9451 23.5H27.8113L28.2911 25.5ZM25.1201 21H23.9955L24.4778 23H25.5998L25.1201 21ZM27.2116 21L27.6914 23H28.8246L28.3424 21H27.2116ZM25.7197 23.5H24.5982L25.0805 25.5H26.1995L25.7197 23.5ZM27.8072 25.5L27.3274 23.5H26.2035L26.6832 25.5H27.8072ZM27.2075 23L26.7278 21H25.6038L26.0836 23H27.2075Z"

export interface SesIconProps extends SVGProps<SVGSVGElement> {
  isActive?: boolean
  /** Used by parent components; should not be forwarded to <svg>. */
  isCharging?: boolean
}

export const SesIcon = forwardRef<SVGSVGElement, SesIconProps>(function SesIcon(
  { isActive, isCharging: _isCharging, color, width, height, ...rest },
  ref,
) {
  const reactId = useId()
  const safeId = reactId.replace(/[^a-zA-Z0-9_-]/g, "")
  const filterId = `sunGlow_${safeId}`
  const animName = `sunPulse_${safeId}`

  const fillColor = color || "currentColor"

  return (
    <svg
      ref={ref}
      viewBox="0 0 34 34"
      width={width || "30"}
      height={height || "30"}
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: "visible" }}
      {...rest}
    >
      <defs>
        <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <style>{`
          @keyframes ${animName} {
            0%, 100% { opacity: 0.35; }
            50% { opacity: 1; }
          }
          .sun-active-${safeId} {
            filter: url(#${filterId});
            animation: ${animName} 2s ease-in-out infinite;
            transform-origin: 24px 6px;
          }
        `}</style>
      </defs>

      <path d={PANELS_PATH} fill={fillColor} />

      <path
        d={SUN_PATH}
        fill={fillColor}
        className={isActive ? `sun-active-${safeId}` : ""}
        style={{ transition: "opacity 0.3s ease" }}
      />
    </svg>
  )
})
