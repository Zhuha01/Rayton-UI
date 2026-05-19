/**
 * Lightweight SVG caret shared by calendar arrows and tightly packed numeric editors.
 * Mirrors `frontend/public/assets/icons/str.svg` while respecting `currentColor` for themes.
 */
export function StrArrowIcon({
  rotateDeg = 0,
  width = 4,
  height = 8,
  strokeWidth = 2,
}: {
  rotateDeg?: number
  /** Pixel size of the icon box (viewBox stays `0 0 6 11`). */
  width?: number
  height?: number
  strokeWidth?: number
}) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 6 11"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        display: "block",
        transform: rotateDeg ? `rotate(${rotateDeg}deg)` : undefined,
        transformOrigin: "center",
        color: "currentColor",
      }}
    >
      <path
        d="M1 10L5 5.49927L1 1"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
