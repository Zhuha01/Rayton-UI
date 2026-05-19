/**
 * Interactive recursive device tree with custom connector lanes and expandable parents.
 * Syncs disclosure state, renders leaf presets, and routes selection through callback props.
 */

import { Box, Flex, Grid, VStack, useBreakpointValue } from "@chakra-ui/react"
import type React from "react"
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import { DEVICE_TREE_PAGE_UI } from "@/components_2/Pages/device/deviceTreePageUi"
import { DeviceTreeDisclosureItem } from "@/components_2/ui/DeviceTreeDisclosureItem"
import {
  DeviceTreeListItem,
  deviceTreeLeafPreset,
  inferDeviceTreeLeafKind,
} from "@/components_2/ui/DeviceTreeListItem"

type PlantConfigDevice = {
  device_id: number
  parent_id: number
  name: string
  class_id: number
  plant_id?: number | string
  children?: PlantConfigDevice[]
}

interface GetDeviceTreeProps {
  deviceTree: PlantConfigDevice[]
  selectedDevice: PlantConfigDevice | null
  setSelectedDevice: (device: PlantConfigDevice | null) => void
  formatDeviceLabel?: (device: PlantConfigDevice) => string
  renderMobileSelectedDevice?: (device: PlantConfigDevice) => React.ReactNode
  /**
   * Optional i18next namespace for small UI strings (e.g. connected-device counts).
   * When omitted, `connectedDevicesLabel` uses inline pluralization helpers below.
   */
  i18nNs?: string
}

const { connector: C, layout: L, disclosure: D, leaf: leafUi } =
  DEVICE_TREE_PAGE_UI

/** Active connector stroke matches the selected leaf or disclosure border color. */
function connectorPathAccent(
  selected: PlantConfigDevice | null,
  formatDeviceLabel: (d: PlantConfigDevice) => string,
): string {
  if (!selected) return C.active
  if (selected.children?.length) return D.borderSelected
  const name = formatDeviceLabel(selected)
  const kind = inferDeviceTreeLeafKind({ ...selected, name })
  return leafUi.selectedBorderByKind[kind]
}

/** Active connector segments use stroke color only (no box-shadow glow). */
const connectorAccentGlow = (_color: string) => ({}) as const

const CONNECTOR_TRUNK_X_PX = 23
/** Horizontal connector segment from the trunk to the card column. */
const CONNECTOR_ARM_LEN_PX = 43
const CHILD_INDENT_PX =
  CONNECTOR_TRUNK_X_PX +
  CONNECTOR_ARM_LEN_PX +
  L.horizontalGapBeforeLeafPx

/**
 * Fixed connector-row metrics aligned to layout constants (first-row padding plus leaf/disclosure heights).
 * Lines are drawn with 2px borders only—no `calc()` or background rectangles.
 */
const CONNECTOR_ROW = {
  firstLeaf: { armTop: 38, splitY: 39 },
  firstDisclosure: { armTop: 57, splitY: 58 },
  leaf: { armTop: 16, splitY: 17 },
  disclosure: { armTop: 35, splitY: 36 },
} as const

function uaPlural(n: number, one: string, few: string, many: string): string {
  const nn = Math.abs(n)
  const mod10 = nn % 10
  const mod100 = nn % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) return few
  return many
}

function connectedDevicesLabel(n: number): string {
  const phrase = uaPlural(n, "підключений", "підключені", "підключених")
  const noun = uaPlural(n, "пристрій", "пристрої", "пристроїв")
  return `${n} ${phrase} ${noun}`
}

type ConnectorRowKey = keyof typeof CONNECTOR_ROW

function connectorRowKey(
  segIdx: number,
  childHasChildren: boolean,
): ConnectorRowKey {
  if (segIdx === 0) return childHasChildren ? "firstDisclosure" : "firstLeaf"
  return childHasChildren ? "disclosure" : "leaf"
}

function containsDeviceId(
  nodes: PlantConfigDevice[] | undefined,
  deviceId: number,
): boolean {
  if (!nodes) return false
  for (const n of nodes) {
    if (n.device_id === deviceId) return true
    if (containsDeviceId(n.children, deviceId)) return true
  }
  return false
}

function collectLeafNodes(
  nodes: PlantConfigDevice[] | undefined,
): PlantConfigDevice[] {
  const out: PlantConfigDevice[] = []
  const walk = (arr: PlantConfigDevice[] | undefined) => {
    if (!arr) return
    for (const n of arr) {
      const hasChildren = !!n.children?.length
      if (!hasChildren) out.push(n)
      else walk(n.children)
    }
  }
  walk(nodes)
  return out
}

function selectedBranchChildIndex(
  children: PlantConfigDevice[],
  selectedId: number,
): number | null {
  if (selectedId < 0) return null
  for (let i = 0; i < children.length; i++) {
    const c = children[i]
    if (c.device_id === selectedId) return i
    if (containsDeviceId(c.children, selectedId)) return i
  }
  return null
}

type VertMode = "fullIdle" | "fullActive" | "split"

function verticalModeForLane(
  hasPath: boolean,
  selIdx: number | null,
  segIdx: number,
): VertMode {
  if (!hasPath || selIdx === null) return "fullIdle"
  if (segIdx < selIdx) return "fullActive"
  if (segIdx > selIdx) return "fullIdle"
  return "split"
}

function TreeConnectorLane({
  device,
  segIdx,
  siblings,
  selectedId,
  parentBranchContainsSelection,
  /** Extends trunk into inter-row padding for a continuous vertical rail. */
  joinToNextRowPx,
  rowKey,
  pathAccentColor,
}: {
  device: PlantConfigDevice
  segIdx: number
  siblings: PlantConfigDevice[]
  selectedId: number
  parentBranchContainsSelection: boolean
  joinToNextRowPx: number
  rowKey: ConnectorRowKey
  pathAccentColor: string
}) {
  const selIdx = selectedBranchChildIndex(siblings, selectedId)
  const hasPath = parentBranchContainsSelection && selIdx !== null
  const mode = verticalModeForLane(hasPath, selIdx, segIdx)
  const strokePx = C.trunkStrokeUniformPx
  const vBottom = joinToNextRowPx > 0 ? `-${joinToNextRowPx}px` : 0

  const armActive =
    selectedId === device.device_id ||
    (selIdx === segIdx &&
      containsDeviceId(device.children, selectedId))

  const armColor = armActive ? pathAccentColor : C.idle
  const accentGlow = armActive ? connectorAccentGlow(pathAccentColor) : {}

  const lay = CONNECTOR_ROW[rowKey]
  const trunkSplitY = `${lay.splitY}px`

  /** Last child row: vertical trunk stops at the node (no tail past the horizontal arm). */
  const isLastSibling = joinToNextRowPx === 0
  const trunkExtentToArm = trunkSplitY

  const trunkVerticalProps = isLastSibling
    ? { top: 0 as const, h: trunkExtentToArm }
    : { top: 0 as const, bottom: vBottom }

  const trunkBorder = (color: string, withGlow: boolean) => (
    <Box
      position="absolute"
      left={`${CONNECTOR_TRUNK_X_PX}px`}
      w="0"
      borderRadius={0}
      borderLeftWidth={`${strokePx}px`}
      borderLeftStyle="solid"
      borderLeftColor={color}
      {...(withGlow ? connectorAccentGlow(color) : {})}
      {...trunkVerticalProps}
    />
  )

  return (
    <Box position="relative" w={`${CHILD_INDENT_PX}px`} flexShrink={0}>
      {mode === "fullIdle" && trunkBorder(C.idle, false)}
      {mode === "fullActive" && trunkBorder(pathAccentColor, true)}
      {mode === "split" && (
        <>
          <Box
            position="absolute"
            left={`${CONNECTOR_TRUNK_X_PX}px`}
            top={0}
            h={trunkSplitY}
            w="0"
            borderRadius={0}
            borderLeftWidth={`${strokePx}px`}
            borderLeftStyle="solid"
            borderLeftColor={pathAccentColor}
            {...connectorAccentGlow(pathAccentColor)}
          />
          {!isLastSibling && (
            <Box
              position="absolute"
              left={`${CONNECTOR_TRUNK_X_PX}px`}
              top={trunkSplitY}
              bottom={vBottom}
              w="0"
              borderRadius={0}
              borderLeftWidth={`${strokePx}px`}
              borderLeftStyle="solid"
              borderLeftColor={C.idle}
            />
          )}
        </>
      )}
      <Box
        position="absolute"
        left={`${CONNECTOR_TRUNK_X_PX}px`}
        top={`${lay.armTop}px`}
        w={`${CONNECTOR_ARM_LEN_PX}px`}
        h={0}
        borderRadius={0}
        borderTopWidth={`${strokePx}px`}
        borderTopStyle="solid"
        borderTopColor={armColor}
        {...accentGlow}
      />
    </Box>
  )
}

const GetDeviceTree: React.FC<GetDeviceTreeProps> = ({
  deviceTree,
  selectedDevice,
  setSelectedDevice,
  formatDeviceLabel,
  renderMobileSelectedDevice,
  i18nNs,
}) => {
  const { t } = useTranslation(i18nNs)
  const connectedLabel = useMemo(() => {
    return (count: number) => {
      if (!i18nNs) return connectedDevicesLabel(count)
      return t("common.connectedDevices", { count })
    }
  }, [i18nNs, t])

  const resolvedFormatDeviceLabel = useMemo(() => {
    if (formatDeviceLabel) return formatDeviceLabel
    const unnamed = i18nNs ? t("common.unnamed") : "Без імені"
    return (d: PlantConfigDevice) => d.name?.trim() || unnamed
  }, [formatDeviceLabel, i18nNs, t])
  // Only 2 modes: mobile (base) and desktop/tablet (md+).
  const isMobile = useBreakpointValue({ base: true, md: false }) ?? false
  const [expandedNodes, setExpandedNodes] = useState<Record<number, boolean>>(
    {},
  )

  const toggleNode = (deviceId: number) => {
    setExpandedNodes((prev) => ({ ...prev, [deviceId]: !prev[deviceId] }))
  }

  const expandNode = (deviceId: number) => {
    setExpandedNodes((prev) => (prev[deviceId] ? prev : { ...prev, [deviceId]: true }))
  }

  const clearSelectionIfCollapsingBranch = (
    branch: PlantConfigDevice,
    isCurrentlyExpanded: boolean,
  ) => {
    if (!isCurrentlyExpanded) return
    const selectedId = selectedDevice?.device_id
    if (selectedId === undefined) return
    if (selectedId === branch.device_id || containsDeviceId(branch.children, selectedId)) {
      setSelectedDevice(null)
    }
  }

  const pathAccentColor = useMemo(
    () => connectorPathAccent(selectedDevice, resolvedFormatDeviceLabel),
    [selectedDevice, resolvedFormatDeviceLabel],
  )

  const mobileLeaves = useMemo(() => {
    if (!isMobile) return []
    return collectLeafNodes(deviceTree)
  }, [deviceTree, isMobile])

  const renderNode = (
    device: PlantConfigDevice,
    level: number,
    /** Skip duplicate horizontal elbows when parent row already renders the lane. */
    hasParentConnectorLane?: boolean,
  ): React.ReactNode => {
    const hasChildren = device.children && device.children.length > 0
    const isExpanded = expandedNodes[device.device_id]
    const isSelected = selectedDevice?.device_id === device.device_id
    const selectedId = selectedDevice?.device_id ?? -1
    const leafKind = inferDeviceTreeLeafKind({
      ...device,
      name: resolvedFormatDeviceLabel(device),
    })
    const subtitle = hasChildren
      ? `${connectedLabel(device.children!.length)} | ID: ${device.device_id}`
      : `ID: ${device.device_id}`

    const branchContainsSelection = Boolean(
      hasChildren && containsDeviceId(device.children, selectedId),
    )

    const body = (
      <>
        {hasChildren ? (
          <Box w="90%">
            <Box
              onClick={(e) => {
                e.stopPropagation()
                setSelectedDevice(device)
              }}
            >
              <DeviceTreeDisclosureItem
                title={resolvedFormatDeviceLabel(device)}
                subtitle={subtitle}
                selected={isSelected}
                expanded={!!isExpanded}
                hasChildren
                onSelect={() => setSelectedDevice(device)}
                onToggleExpanded={() => {
                  clearSelectionIfCollapsingBranch(device, !!isExpanded)
                  toggleNode(device.device_id)
                }}
              />
            </Box>
          </Box>
        ) : level === 0 ? (
          <Box w="85%">
            <DeviceTreeDisclosureItem
              title={resolvedFormatDeviceLabel(device)}
              subtitle={`${connectedLabel(0)} | ID: ${device.device_id}`}
              expanded={false}
              hasChildren={false}
              presentationOnly
            />
          </Box>
        ) : (
          <Box
            position="relative"
            minH={`${L.treeLeafRowMinHeightPx}px`}
            w="100%"
            overflow="visible"
          >
            {!isMobile && !hasParentConnectorLane && level >= 1 && (
              <Box
                position="absolute"
                left={`${CONNECTOR_TRUNK_X_PX}px`}
                top={`${CONNECTOR_ROW.leaf.armTop}px`}
                w={`${CONNECTOR_ARM_LEN_PX}px`}
                h={0}
                borderRadius={0}
                borderTopWidth={`${C.trunkStrokeUniformPx}px`}
                borderTopStyle="solid"
                borderTopColor={isSelected ? pathAccentColor : C.idle}
                {...(isSelected ? connectorAccentGlow(pathAccentColor) : {})}
              />
            )}
            <Box
              ml={
                !isMobile && level >= 1 && !hasParentConnectorLane
                  ? `${CHILD_INDENT_PX}px`
                  : 0
              }
              w={
                !isMobile && level >= 1 && !hasParentConnectorLane
                  ? `calc(85% - ${CHILD_INDENT_PX}px)`
                  : "85%"
              }
            >
              <DeviceTreeListItem
                label={resolvedFormatDeviceLabel(device)}
                kind={leafKind}
                {...deviceTreeLeafPreset(leafKind)}
                selected={isSelected}
                onClick={() => setSelectedDevice(device)}
              />
            </Box>
          </Box>
        )}

        {hasChildren && isExpanded && (
          <Box mt={0} overflow="visible">
            <VStack align="stretch" gap={0} pt={`${C.trunkGapBelowHeaderPx}px`}>
              {device.children!.map((child, segIdx, arr) => {
                const join =
                  segIdx < arr.length - 1 ? C.rowVerticalSpacingPx : 0
                const insetBelowTrunkPx =
                  C.rowVerticalSpacingPx - C.trunkGapBelowHeaderPx
                const childHasChildren = !!child.children?.length
                const rowKey = connectorRowKey(segIdx, childHasChildren)
                return (
                  <Box
                    key={child.device_id}
                    pb={join > 0 ? `${join}px` : 0}
                    overflow="visible"
                  >
                    <Flex align="stretch" gap={0}>
                      {!isMobile ? (
                        <TreeConnectorLane
                          device={child}
                          segIdx={segIdx}
                          siblings={device.children!}
                          selectedId={selectedId}
                          parentBranchContainsSelection={
                            branchContainsSelection
                          }
                          joinToNextRowPx={join}
                          rowKey={rowKey}
                          pathAccentColor={pathAccentColor}
                        />
                      ) : null}
                      <Box
                        flex="1"
                        minW={`${L.treeRowContentMinWidthPx}px`}
                        w="100%"
                        pt={
                          segIdx === 0 ? `${insetBelowTrunkPx}px` : undefined
                        }
                      >
                        {renderNode(child, level + 1, true)}
                      </Box>
                    </Flex>
                  </Box>
                )
              })}
            </VStack>
          </Box>
        )}
      </>
    )

    return <Box key={device.device_id}>{body}</Box>
  }

  if (isMobile) {
    // If there are multiple roots (e.g. SES SmartLogger 1/2/3...), don't treat the first as a "global root".
    const root = deviceTree.length === 1 ? deviceTree[0] : null
    const rootTitle = root ? resolvedFormatDeviceLabel(root) : ""
    const rootSubtitle = root
      ? `${connectedLabel(root.children?.length ?? 0)} | ID: ${root.device_id}`
      : null
    const rootExpanded = root ? !!expandedNodes[root.device_id] : true

    const rootGroups = root?.children?.length ? root.children : deviceTree
    const selectedId = selectedDevice?.device_id ?? -1
    return (
      <Box
        flexShrink={0}
        alignSelf="stretch"
        w="100%"
        bg="transparent"
        borderWidth="0"
        borderRadius="0"
        py={0}
        pr="0"
        pl={0}
        overflowY="auto"
        className="app-scrollbar"
        shadow="none"
      >
        <VStack align="stretch" gap="8px" px={0} pb="8px">
          {root ? (
            <DeviceTreeDisclosureItem
              title={rootTitle}
              subtitle={rootSubtitle}
              selected={selectedDevice?.device_id === root.device_id}
              expanded={rootExpanded}
              hasChildren={!!root.children?.length}
              onSelect={() => {
                setSelectedDevice(root)
                if (root.children?.length) expandNode(root.device_id)
              }}
              onToggleExpanded={() => {
                clearSelectionIfCollapsingBranch(root, rootExpanded)
                toggleNode(root.device_id)
              }}
            />
          ) : null}

          {!root || rootExpanded ? (
            <VStack align="stretch" gap="8px">
              {(() => {
                const leafTiles = rootGroups.filter((g) => !g.children?.length)
                const groupNodes = rootGroups.filter((g) => !!g.children?.length)

                const selectedIsTopLeaf = leafTiles.some(
                  (l) => l.device_id === selectedId,
                )

                return (
                  <>
                    {leafTiles.length > 0 ? (
                      <Box pt="0">
                        <Grid
                          templateColumns="repeat(2, minmax(150px, 1fr))"
                          gap="8px"
                        >
                          {leafTiles.map((g) => {
                            const title = resolvedFormatDeviceLabel(g)
                            const kind = inferDeviceTreeLeafKind({
                              ...g,
                              name: title,
                            })
                            const isSelected =
                              selectedDevice?.device_id === g.device_id
                            return (
                              <DeviceTreeListItem
                                key={g.device_id}
                                label={title}
                                kind={kind}
                                {...deviceTreeLeafPreset(kind)}
                                selected={isSelected}
                                variant="tile"
                                onClick={() => setSelectedDevice(g)}
                              />
                            )
                          })}
                        </Grid>

                        {selectedIsTopLeaf && selectedDevice
                          ? renderMobileSelectedDevice?.(selectedDevice) ?? null
                          : null}
                      </Box>
                    ) : null}

                    {groupNodes.map((g) => {
                      const expanded = !!expandedNodes[g.device_id]
                      const title = resolvedFormatDeviceLabel(g)
                      const subtitle = `${connectedLabel(
                        g.children!.length,
                      )} | ID: ${g.device_id}`

                      const leaves = collectLeafNodes(g.children)
                      const selectedBelongsToGroup =
                        selectedId === g.device_id ||
                        containsDeviceId(g.children, selectedId)

                      return (
                        <Box key={g.device_id}>
                          <DeviceTreeDisclosureItem
                            title={title}
                            subtitle={subtitle}
                            selected={selectedDevice?.device_id === g.device_id}
                            expanded={expanded}
                            hasChildren
                            onSelect={() => {
                              setSelectedDevice(g)
                              expandNode(g.device_id)
                            }}
                            onToggleExpanded={() => {
                              clearSelectionIfCollapsingBranch(g, expanded)
                              toggleNode(g.device_id)
                            }}
                          />

                          {expanded ? (
                            <Box pt="8px">
                              <Grid
                                templateColumns="repeat(2, minmax(150px, 1fr))"
                                gap="8px"
                              >
                                {leaves.map((d) => {
                                  const label = resolvedFormatDeviceLabel(d)
                                  const kind = inferDeviceTreeLeafKind({
                                    ...d,
                                    name: label,
                                  })
                                  const isSelected =
                                    selectedDevice?.device_id === d.device_id
                                  return (
                                    <DeviceTreeListItem
                                      key={d.device_id}
                                      label={label}
                                      kind={kind}
                                      {...deviceTreeLeafPreset(kind)}
                                      selected={isSelected}
                                      variant="tile"
                                      onClick={() => setSelectedDevice(d)}
                                    />
                                  )
                                })}
                              </Grid>

                              {selectedBelongsToGroup && selectedDevice
                                ? renderMobileSelectedDevice?.(selectedDevice) ??
                                  null
                                : null}
                            </Box>
                          ) : null}
                        </Box>
                      )
                    })}
                  </>
                )
              })()}



              {root &&

              selectedDevice?.device_id === root.device_id &&

              rootExpanded

                ? renderMobileSelectedDevice?.(selectedDevice) ?? null

                : null}

            </VStack>

          ) : null}

        </VStack>

      </Box>

    )

  }


  return (
    <Box
      flexShrink={0}
      alignSelf="stretch"
      w="100%"
      minW={{ base: "0", md: "288px" }}
      maxW={{ base: "100%", md: "400px" }}
      bg="transparent"
      borderWidth="0"
      borderRadius="0"
      py={0}
      pr="4px"
      pl={0}
      overflowY="scroll"
      style={{ scrollbarGutter: "stable" }}
      className="app-scrollbar"
      shadow="none"
    >
      <VStack
        align="stretch"
        gap={`${C.rowVerticalSpacingPx}px`}
        pb={`${C.rowVerticalSpacingPx}px`}
      >
        {deviceTree.map((d) => renderNode(d, 0))}
      </VStack>
    </Box>
  )
}

export default GetDeviceTree
