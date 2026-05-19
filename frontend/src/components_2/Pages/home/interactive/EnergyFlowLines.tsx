/**
 * Overlay SVG that snaps orthogonal connectors between interactive energy-flow nodes.
 * Shares trend token colors with the parent diagram so gradients stay synced across themes.
 */

import { Box, useToken } from "@chakra-ui/react"
import {
  type RefObject,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { useLocation } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { TELEMETRY_ACTIVE_EPSILON as EPSILON } from "@/components_2/Pages/dashboard/chartUtils"
import type { PlantUIConfig } from "@/components_2/Pages/dashboard/dashboardTypes"

export type EnergyFlowValues = {
  ses: number
  grid: number
  battery: number
  factory: number
  generator: number
  /** SOC % (0–100); used by battery icon, not line layout */
  soc: number
}

export type EnergyLineId =
  | "sesToFactory"
  | "sesToGrid"
  | "gridToFactory"
  | "generatorToFactory"
  | "batteryToFactory"
  | "sesToBattery"
  | "gridToBattery"
  | "batteryToGrid"

type Point = { x: number; y: number }
type Edge = "top" | "bottom" | "left" | "right"

type AnchorDef = { edge: Edge; offset: number }

type NodeRect = {
  top: number
  bottom: number
  left: number
  right: number
  cx: number
  cy: number
}
type Nodes = Partial<
  Record<"ses" | "grid" | "factory" | "battery" | "generator", NodeRect>
>

/** End each path this many px outside the target block so the arrow sits before the border. */
const ARROW_END_GAP = 4
/** Motion dot cycle duration (must match opacity keyframes). */
const FLOW_DOT_DURATION = "2.5s"
const PORT_SPACING = 20

function distribute(count: number): number[] {
  if (count === 1) return [0]
  if (count === 2) return [-PORT_SPACING / 2, PORT_SPACING / 2]
  if (count === 3) return [-PORT_SPACING, 0, PORT_SPACING]
  if (count === 4)
    return [
      -PORT_SPACING * 1.5,
      -PORT_SPACING / 2,
      PORT_SPACING / 2,
      PORT_SPACING * 1.5,
    ]
  return []
}

// Builds anchor offsets per edge based on which optional nodes are present.
function getDynamicRouting(
  hasEss: boolean,
  hasGen: boolean,
): Record<EnergyLineId, { from: AnchorDef; to: AnchorDef }> {
  // Bottom edge of SES (2 or 3 lines): factory + battery? + grid.
  const sesBottomCount = 1 + (hasEss ? 1 : 0) + 1
  const sesBot = distribute(sesBottomCount)
  let sIdx = 0
  const sesBatFrom = hasEss ? sesBot[sIdx++] : 0
  const sesFacFrom = sesBot[sIdx++]
  const sesGridFrom = sesBot[sIdx++]

  // Top edge of factory (2..4 lines): generator? + battery? + ses + grid.
  const facTopCount = (hasGen ? 1 : 0) + (hasEss ? 1 : 0) + 1 + 1
  const facTop = distribute(facTopCount)
  let fIdx = 0
  const genFacTo = hasGen ? facTop[fIdx++] : 0
  const batFacTo = hasEss ? facTop[fIdx++] : 0
  const sesFacTo = facTop[fIdx++]
  const gridFacTo = facTop[fIdx++]

  // Left edge of grid (2 or 4 lines).
  const gridLeftCount = 1 + 1 + (hasEss ? 2 : 0)
  const gridLeft = distribute(gridLeftCount)

  let sesGridTo = 0,
    gridFacFrom = 0,
    gridBatFrom = 0,
    batGridTo = 0

  if (hasEss && hasGen) {
    // 5 blocks: battery slides up because the generator pushes it,
    // so its lines connect to the upper ports [0] and [1].
    gridBatFrom = gridLeft[0]
    batGridTo = gridLeft[1]
    sesGridTo = gridLeft[2]
    gridFacFrom = gridLeft[3]
  } else {
    // 4 or fewer blocks: keep battery lines on the lower ports [2] and [3].
    let glIdx = 0
    sesGridTo = gridLeft[glIdx++]
    gridFacFrom = gridLeft[glIdx++]
    if (hasEss) {
      gridBatFrom = gridLeft[glIdx++]
      batGridTo = gridLeft[glIdx++]
    }
  }

  // Right edge of battery (0 or 4 lines).
  const batRightCount = hasEss ? 4 : 0
  const batRight = distribute(batRightCount)
  let brIdx = 0
  const sesBatTo = hasEss ? batRight[brIdx++] : 0
  const batFacFrom = hasEss ? batRight[brIdx++] : 0
  const gridBatTo = hasEss ? batRight[brIdx++] : 0
  const batGridFrom = hasEss ? batRight[brIdx++] : 0

  return {
    sesToBattery: {
      from: { edge: "bottom", offset: sesBatFrom },
      to: { edge: "right", offset: sesBatTo },
    },
    sesToFactory: {
      from: { edge: "bottom", offset: sesFacFrom },
      to: { edge: "top", offset: sesFacTo },
    },
    sesToGrid: {
      from: { edge: "bottom", offset: sesGridFrom },
      to: { edge: "left", offset: sesGridTo },
    },

    gridToFactory: {
      from: { edge: "left", offset: gridFacFrom },
      to: { edge: "top", offset: gridFacTo },
    },
    gridToBattery: {
      from: { edge: "left", offset: gridBatFrom },
      to: { edge: "right", offset: gridBatTo },
    },

    batteryToFactory: {
      from: { edge: "right", offset: batFacFrom },
      to: { edge: "top", offset: batFacTo },
    },
    batteryToGrid: {
      from: { edge: "right", offset: batGridFrom },
      to: { edge: "left", offset: batGridTo },
    },

    generatorToFactory: {
      from: { edge: "right", offset: 0 },
      to: { edge: "top", offset: genFacTo },
    },
  } as Record<EnergyLineId, { from: AnchorDef; to: AnchorDef }>
}

function getAnchor(rect: NodeRect, anchor: AnchorDef): Point {
  const { edge, offset } = anchor
  switch (edge) {
    case "top":
      return { x: rect.cx + offset, y: rect.top }
    case "bottom":
      return { x: rect.cx + offset, y: rect.bottom }
    case "left":
      return { x: rect.left, y: rect.cy + offset }
    case "right":
      return { x: rect.right, y: rect.cy + offset }
  }
}

/** Endpoint shifted outward from the target edge by `gap` px (line stops before the block; marker at path end). */
function getAnchorTo(rect: NodeRect, anchor: AnchorDef, gap: number): Point {
  const p = getAnchor(rect, anchor)
  switch (anchor.edge) {
    case "top":
      return { x: p.x, y: p.y - gap }
    case "bottom":
      return { x: p.x, y: p.y + gap }
    case "left":
      return { x: p.x - gap, y: p.y }
    case "right":
      return { x: p.x + gap, y: p.y }
  }
}

// 90-degree orthogonal point generator.
function getOrthogonalPoints(
  p1: Point,
  side1: Edge,
  p2: Point,
  side2: Edge,
): Point[] {
  const pts = [p1]

  if (side1 === "bottom" && side2 === "top") {
    const midY = (p1.y + p2.y) / 2
    pts.push({ x: p1.x, y: midY }, { x: p2.x, y: midY })
  } else if (side1 === "bottom" && side2 === "left") {
    pts.push({ x: p1.x, y: p2.y })
  } else if (side1 === "bottom" && side2 === "right") {
    pts.push({ x: p1.x, y: p2.y })
  } else if (side1 === "right" && side2 === "top") {
    pts.push({ x: p2.x, y: p1.y })
  } else if (side1 === "left" && side2 === "top") {
    pts.push({ x: p2.x, y: p1.y })
  } else if (side1 === "right" && side2 === "left") {
    const midX = (p1.x + p2.x) / 2
    pts.push({ x: midX, y: p1.y }, { x: midX, y: p2.y })
  } else if (side1 === "left" && side2 === "right") {
    const midX = (p1.x + p2.x) / 2
    pts.push({ x: midX, y: p1.y }, { x: midX, y: p2.y })
  }

  pts.push(p2)

  const clean = [pts[0]]
  for (let i = 1; i < pts.length; i++) {
    const prev = clean[clean.length - 1]
    const curr = pts[i]
    if (Math.abs(curr.x - prev.x) > 0.5 || Math.abs(curr.y - prev.y) > 0.5) {
      clean.push(curr)
    }
  }
  return clean
}

// Rounds orthogonal corners (8px radius).
function buildRoundedOrthogonalPath(points: Point[], r: number = 8): string {
  if (points.length < 2) return ""
  let d = `M ${points[0].x} ${points[0].y}`

  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1]
    const curr = points[i]
    const next = points[i + 1]

    const d1 = Math.hypot(curr.x - prev.x, curr.y - prev.y)
    const d2 = Math.hypot(next.x - curr.x, next.y - curr.y)
    const radius = Math.min(r, d1 / 2, d2 / 2)

    const p1x = curr.x - (curr.x - prev.x) * (radius / d1)
    const p1y = curr.y - (curr.y - prev.y) * (radius / d1)
    const p2x = curr.x + (next.x - curr.x) * (radius / d2)
    const p2y = curr.y + (next.y - curr.y) * (radius / d2)

    d += ` L ${p1x} ${p1y} Q ${curr.x} ${curr.y} ${p2x} ${p2y}`
  }
  d += ` L ${points[points.length - 1].x} ${points[points.length - 1].y}`
  return d
}

export function computeEnergyFlowLineFlows(
  values: EnergyFlowValues,
  plantConfig: Pick<PlantUIConfig, "hasEss" | "hasGenerator">,
): Record<EnergyLineId, number> {
  const out = {
    sesToFactory: 0,
    sesToGrid: 0,
    gridToFactory: 0,
    generatorToFactory: 0,
    batteryToFactory: 0,
    sesToBattery: 0,
    gridToBattery: 0,
    batteryToGrid: 0,
  } satisfies Record<EnergyLineId, number>

  const Z = Math.max(0, values.factory)
  const G = Math.max(0, values.generator)
  const S0 = Math.max(0, values.ses)
  const M = values.grid
  const B = values.battery

  const M_imp = Math.max(0, M)
  const M_exp = Math.max(0, -M)
  const U_dis = plantConfig.hasEss ? Math.max(0, B) : 0
  const U_chg = plantConfig.hasEss ? Math.max(0, -B) : 0

  let genToFactory = 0
  if (plantConfig.hasGenerator && G > EPSILON && Z > EPSILON) {
    genToFactory = Math.min(G, Z)
  }
  out.generatorToFactory = genToFactory
  const Zr = Math.max(0, Z - genToFactory)

  let sRem = S0,
    mImpRem = M_imp,
    mExpRem = M_exp,
    uDisRem = U_dis,
    uChgRem = U_chg,
    zNeed = Zr

  const bf = plantConfig.hasEss ? Math.min(uDisRem, zNeed) : 0
  out.batteryToFactory = bf
  uDisRem -= bf
  zNeed -= bf

  const sf = Math.min(sRem, zNeed)
  out.sesToFactory = sf
  sRem -= sf
  zNeed -= sf

  const gf = Math.min(mImpRem, zNeed)
  out.gridToFactory = gf
  mImpRem -= gf
  zNeed -= gf

  if (plantConfig.hasEss) {
    const sb = Math.min(sRem, uChgRem)
    out.sesToBattery = sb
    sRem -= sb
    uChgRem -= sb

    const gb = Math.min(mImpRem, uChgRem)
    out.gridToBattery = gb
    mImpRem -= gb
    uChgRem -= gb
  }

  const sg = Math.min(sRem, mExpRem)
  out.sesToGrid = sg
  sRem -= sg
  mExpRem -= sg

  if (plantConfig.hasEss) {
    const bg = Math.min(uDisRem, mExpRem)
    out.batteryToGrid = bg
    uDisRem -= bg
    mExpRem -= bg
  }

  return out
}

export function computeEnergyFlowLineActive(
  flows: Record<EnergyLineId, number>,
): Record<EnergyLineId, boolean> {
  return {
    sesToFactory: flows.sesToFactory > EPSILON,
    sesToGrid: flows.sesToGrid > EPSILON,
    gridToFactory: flows.gridToFactory > EPSILON,
    generatorToFactory: flows.generatorToFactory > EPSILON,
    batteryToFactory: flows.batteryToFactory > EPSILON,
    sesToBattery: flows.sesToBattery > EPSILON,
    gridToBattery: flows.gridToBattery > EPSILON,
    batteryToGrid: flows.batteryToGrid > EPSILON,
  }
}

type FlowKey = "ses" | "grid" | "battery" | "generator" | "factory"

function flowKeyForLine(lineId: EnergyLineId): FlowKey {
  switch (lineId) {
    case "sesToFactory":
    case "sesToGrid":
    case "sesToBattery":
      return "ses"
    case "gridToFactory":
    case "gridToBattery":
      return "grid"
    case "batteryToFactory":
    case "batteryToGrid":
      return "battery"
    case "generatorToFactory":
      return "generator"
    default:
      return "factory"
  }
}

export interface EnergyFlowLinesProps {
  containerRef: RefObject<HTMLElement | null>
  sesRef: RefObject<HTMLElement | null>
  gridRef: RefObject<HTMLElement | null>
  factoryRef: RefObject<HTMLElement | null>
  batteryRef?: RefObject<HTMLElement | null>
  generatorRef?: RefObject<HTMLElement | null>
  values: EnergyFlowValues
  plantConfig: PlantUIConfig
  /**
   * A key that changes when the real content finishes loading / re-renders.
   * This forces a deterministic re-measure after route navigation + data fetch.
   */
  dataReadyKey?: string | number | boolean
}

const ALL_LINE_IDS: EnergyLineId[] = [
  "sesToFactory",
  "sesToGrid",
  "gridToFactory",
  "generatorToFactory",
  "batteryToFactory",
  "sesToBattery",
  "gridToBattery",
  "batteryToGrid",
]

function lineExists(
  lineId: EnergyLineId,
  plantConfig: Pick<PlantUIConfig, "hasEss" | "hasGenerator">,
): boolean {
  if (lineId === "generatorToFactory") return plantConfig.hasGenerator
  if (
    [
      "batteryToFactory",
      "sesToBattery",
      "gridToBattery",
      "batteryToGrid",
    ].includes(lineId)
  )
    return plantConfig.hasEss
  return true
}

export function EnergyFlowLines({
  containerRef,
  sesRef,
  gridRef,
  factoryRef,
  batteryRef,
  generatorRef,
  values,
  plantConfig,
  dataReadyKey,
}: EnergyFlowLinesProps) {
  const location = useLocation()
  const { t } = useTranslation("Interactive")
  const [size, setSize] = useState({ w: 0, h: 0 })
  const [nodes, setNodes] = useState<Nodes>({})
  const rafRef = useRef<number | null>(null)
  const routeRaf1Ref = useRef<number | null>(null)
  const routeRaf2Ref = useRef<number | null>(null)
  const timeout300Ref = useRef<number | null>(null)
  const timeout600Ref = useRef<number | null>(null)

  // Single source of truth: pull stroke colors from the trends semantic
  // tokens and the inactive color from the shared border token.
  const [sesC, gridC, essC, genC, facC, inactiveC] = useToken("colors", [
    "trends.SOLAR_GENERATION",
    "trends.GRID_1",
    "trends.ESS_POWER",
    "trends.GENERATOR_POWER",
    "trends.PLANT_CONSUMPTION",
    "border.normal",
  ])

  const flowColors = useMemo<Record<FlowKey, string>>(
    () => ({
      ses: sesC,
      grid: gridC,
      battery: essC,
      generator: genC,
      factory: facC,
    }),
    [sesC, gridC, essC, genC, facC],
  )

  const routingMap = useMemo(
    () => getDynamicRouting(plantConfig.hasEss, plantConfig.hasGenerator),
    [plantConfig.hasEss, plantConfig.hasGenerator],
  )

  const measure = useCallback(() => {
    const el = containerRef.current
    if (!el) return

    const cr = el.getBoundingClientRect()
    setSize({ w: el.clientWidth, h: el.clientHeight })

    const nodeOf = (
      ref: RefObject<HTMLElement | null>,
    ): NodeRect | undefined => {
      const node = ref.current
      if (!node) return undefined
      const r = node.getBoundingClientRect()
      return {
        top: r.top - cr.top,
        bottom: r.bottom - cr.top,
        left: r.left - cr.left,
        right: r.right - cr.left,
        cx: r.left + r.width / 2 - cr.left,
        cy: r.top + r.height / 2 - cr.top,
      }
    }

    setNodes({
      ses: nodeOf(sesRef),
      grid: nodeOf(gridRef),
      factory: nodeOf(factoryRef),
      battery: batteryRef ? nodeOf(batteryRef) : undefined,
      generator: generatorRef ? nodeOf(generatorRef) : undefined,
    })
  }, [containerRef, sesRef, gridRef, factoryRef, batteryRef, generatorRef])

  const scheduleMeasure = useCallback(() => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null
      measure()
    })
  }, [measure])

  useLayoutEffect(() => {
    scheduleMeasure()
  }, [scheduleMeasure])

  useLayoutEffect(() => {
    if (routeRaf1Ref.current != null) cancelAnimationFrame(routeRaf1Ref.current)
    if (routeRaf2Ref.current != null) cancelAnimationFrame(routeRaf2Ref.current)

    routeRaf1Ref.current = requestAnimationFrame(() => {
      routeRaf1Ref.current = null
      routeRaf2Ref.current = requestAnimationFrame(() => {
        routeRaf2Ref.current = null
        scheduleMeasure()
      })
    })

    return () => {
      if (routeRaf1Ref.current != null) cancelAnimationFrame(routeRaf1Ref.current)
      if (routeRaf2Ref.current != null) cancelAnimationFrame(routeRaf2Ref.current)
    }
  }, [location.pathname, scheduleMeasure])

  useLayoutEffect(() => {
    const containerEl = containerRef.current
    const sesEl = sesRef.current
    const gridEl = gridRef.current
    const factoryEl = factoryRef.current
    const batteryEl = batteryRef?.current ?? null
    const generatorEl = generatorRef?.current ?? null

    const observed = [
      containerEl,
      sesEl,
      gridEl,
      factoryEl,
      batteryEl,
      generatorEl,
    ].filter((x): x is HTMLElement => Boolean(x))

    if (observed.length === 0 || typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", scheduleMeasure)
      return () => {
        window.removeEventListener("resize", scheduleMeasure)
        if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
      }
    }

    const ro = new ResizeObserver(() => scheduleMeasure())
    observed.forEach((el) => ro.observe(el))
    window.addEventListener("resize", scheduleMeasure)

    return () => {
      ro.disconnect()
      window.removeEventListener("resize", scheduleMeasure)
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    }
  }, [
    location.pathname,
    dataReadyKey,
    containerRef,
    sesRef,
    gridRef,
    factoryRef,
    batteryRef,
    generatorRef,
    scheduleMeasure,
  ])

  useLayoutEffect(() => {
    scheduleMeasure()

    if (timeout300Ref.current != null) window.clearTimeout(timeout300Ref.current)
    if (timeout600Ref.current != null) window.clearTimeout(timeout600Ref.current)

    timeout300Ref.current = window.setTimeout(() => scheduleMeasure(), 300)
    timeout600Ref.current = window.setTimeout(() => scheduleMeasure(), 600)

    return () => {
      if (timeout300Ref.current != null) window.clearTimeout(timeout300Ref.current)
      if (timeout600Ref.current != null) window.clearTimeout(timeout600Ref.current)
    }
  }, [location.pathname, dataReadyKey, scheduleMeasure])

  const flows = useMemo(
    () => computeEnergyFlowLineFlows(values, plantConfig),
    [values, plantConfig],
  )
  const active = useMemo(() => computeEnergyFlowLineActive(flows), [flows])
  const ready =
    size.w > 0 && size.h > 0 && nodes.ses && nodes.grid && nodes.factory

  // Separates allowed line IDs into inactive and active lists based on current flows.
  const [inactiveLineIds, activeLineIds] = useMemo(() => {
    if (!ready) return [[], []]
    const allowed = ALL_LINE_IDS.filter((id) => lineExists(id, plantConfig))
    const inactive: EnergyLineId[] = []
    const activeIds: EnergyLineId[] = []
    allowed.forEach((id) => {
      if (active[id]) {
        activeIds.push(id)
      } else {
        inactive.push(id)
      }
    })
    return [inactive, activeIds]
  }, [ready, plantConfig, active])

  // Helper to render a single line group based on its ID and activity status.
  const renderLine = useCallback(
    (lineId: EnergyLineId, isActive: boolean) => {
      const route = routingMap[lineId]
      // Type safety assertions as keys are derived dynamically from string splits.
      const sourceKey = lineId.split("To")[0] as keyof Nodes
      const targetKey = lineId.split("To")[1].toLowerCase() as keyof Nodes

      const sourceNode = nodes[sourceKey]
      const targetNode = nodes[targetKey]

      if (!sourceNode || !targetNode) return null

      const fromPoint = getAnchor(sourceNode, route.from)
      const toPoint = getAnchorTo(targetNode, route.to, ARROW_END_GAP)
      const points = getOrthogonalPoints(
        fromPoint,
        route.from.edge,
        toPoint,
        route.to.edge,
      )
      const pathD = buildRoundedOrthogonalPath(points, 8)

      const stroke = isActive ? flowColors[flowKeyForLine(lineId)] : inactiveC
      const pid = `line-path-${lineId}`

      return (
        <g key={lineId}>
          <path
            id={pid}
            d={pathD}
            fill="none"
            stroke={stroke}
            strokeWidth={1}
            strokeDasharray={isActive ? "none" : "4 4"}
            strokeLinecap="round"
            strokeLinejoin="round"
            markerEnd={`url(#arrow-${lineId})`}
          />

          {isActive && (
            <circle
              r={2.5}
              fill={stroke}
              filter="drop-shadow(0 0 4px currentColor)"
            >
              <animateMotion
                dur={FLOW_DOT_DURATION}
                repeatCount="indefinite"
                rotate="auto"
              >
                <mpath xlinkHref={`#${pid}`} href={`#${pid}`} />
              </animateMotion>
              <animate
                attributeName="opacity"
                values="0;1;1;0"
                keyTimes="0;0.1;0.85;1"
                dur={FLOW_DOT_DURATION}
                repeatCount="indefinite"
              />
            </circle>
          )}
        </g>
      )
    },
    [nodes, routingMap, flowColors, inactiveC],
  )

  return (
    <Box
      position="absolute"
      inset={0}
      zIndex={0}
      pointerEvents="none"
      overflow="visible"
      aria-hidden
    >
      <svg
        width="100%"
        height="100%"
        viewBox={ready ? `0 0 ${size.w} ${size.h}` : "0 0 1 1"}
        preserveAspectRatio="none"
      >
        <title>{t("a11y.energyFlowSvg")}</title>

        <defs>
          {ALL_LINE_IDS.map((lineId) => {
            const isActive = active[lineId]
            const stroke = isActive
              ? flowColors[flowKeyForLine(lineId)]
              : inactiveC
            return (
              <marker
                key={`arrow-${lineId}`}
                id={`arrow-${lineId}`}
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill={stroke} />
              </marker>
            )
          })}
        </defs>

        {ready && (
          <>
            {/* Render inactive lines first so they are at the bottom of the z-stack */}
            {inactiveLineIds.map((id) => renderLine(id, false))}
            {/* Render active lines last so they appear on top */}
            {activeLineIds.map((id) => renderLine(id, true))}
          </>
        )}
      </svg>
    </Box>
  )
}

export default EnergyFlowLines
