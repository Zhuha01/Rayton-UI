/**
 * SVG battery silhouette with SOC fill stripe and bolt overlay reacting to ESS activity.
 */

import type { SVGProps } from "react"
import { forwardRef, useId } from "react"
import { colors } from "@/theme/tokens/colors"

const OUTLINE_PATH_D =
  "M14.3336 3.22219V0H3.95643V3.22219H0V30H18.29V3.22219H14.3336ZM15.5821 27.2921H2.70791V5.9301H6.66439V2.70768H11.6258V5.9301H15.5822V27.2921H15.5821Z"

const INNER_X = 2.71
const INNER_W = 12.87
const INNER_H = 21.36
const INNER_BOTTOM = 27.29

export interface BatteryIconProps extends SVGProps<SVGSVGElement> {
  isActive?: boolean
  soc?: number
  isCharging?: boolean
}

function clampSoc(raw: number | undefined): number {
  if (raw == null || !Number.isFinite(raw)) return 0
  return Math.min(100, Math.max(0, raw))
}

export const BatteryIcon = forwardRef<SVGSVGElement, BatteryIconProps>(
  function BatteryIcon(
    { color, isActive, soc, isCharging = false, width, height, ...rest },
    ref,
  ) {
    const reactId = useId()
    const safeId = reactId.replace(/[^a-zA-Z0-9_-]/g, "")
    const filterId = `batGlow_${safeId}`

    const fillColor = color || "currentColor"
    const lightningFill = colors.rayton_neutral["0"].value

    // Fill is scaled from 0 to 100% SOC.
    const pct = clampSoc(soc)
    const fillHeight = INNER_H * (pct / 100)
    const fillY = INNER_BOTTOM - fillHeight

    const bleed = 0.5
    const isFull = pct === 100
    const rectX = INNER_X - bleed
    const rectW = INNER_W + bleed * 2
    const rectY = isFull ? fillY - bleed : fillY
    const rectH = fillHeight > 0 ? fillHeight + bleed + (isFull ? bleed : 0) : 0

    return (
      <svg
        ref={ref}
        viewBox="0 0 19 30"
        width={width || "19"}
        height={height || "30"}
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: "visible" }}
        {...rest}
      >
        <defs>
          <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="0.8"
              result="blur"
            />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g style={{ transition: "all 0.3s ease" }}>
          {fillHeight > 0 && (
            <rect
              x={rectX}
              y={rectY}
              width={rectW}
              height={rectH}
              fill={fillColor}
              style={{ transition: "y 0.5s ease, height 0.5s ease" }}
            />
          )}

          <path d={OUTLINE_PATH_D} fill={fillColor} />

          {isCharging && (
            <path
              d="M10.9544 9.60645L5.875 16.6078L8.84934 17.4315L7.96469 22.6513L12.4155 16.0335L9.44102 15.2099L10.9544 9.60645Z"
              fill={lightningFill}
              filter={`url(#${filterId})`}
              style={{
                opacity: isActive ? 1 : 0.5,
                transition: "opacity 0.3s ease, filter 0.3s ease",
              }}
            />
          )}
        </g>
      </svg>
    )
  },
)
