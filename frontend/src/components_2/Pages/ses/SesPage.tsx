/**
 * Solar Energy System monitoring page combining configurable device tree navigation and telemetry.
 * Loads tenant plant configuration, derives SES-specific labels, and coordinates selection state across panes.
 */

import { Box, Flex, Grid, Spinner, Text } from "@chakra-ui/react"
import { useCallback, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { useGetPlantConfig } from "@/hooks/usePlantConfigQueries"
import GetDeviceData from "@/components_2/Pages/device/GetDeviceData"
import { DEVICE_TREE_PAGE_UI } from "@/components_2/Pages/device/deviceTreePageUi"
import GetDeviceTree from "@/components_2/Pages/device/GetDeviceTree"
import {
  sesDeviceTreeDisplayName,
  sesTelemetryHeaderTitle,
} from "@/components_2/Pages/ses/sesDeviceTreeLabels"

type PlantConfigDevice = {
  device_id: number
  parent_id: number
  name: string
  class_id: number
  plant_id?: number | string
  children?: PlantConfigDevice[]
}

interface SesPageProps {
  tenantId: string
}

const DEVICE_IDS = [
  10,
  11,
  12,
  13,
  14, // SmartLoggers
  101101,
  101102,
  101103,
  101104,
  101105, // SmartLogger 1 counters
  101201,
  101202,
  101203,
  101204,
  101205, // SmartLogger 1 inverters

  111101,
  111102,
  111103,
  111104,
  111105, // SmartLogger 2 counters
  111201,
  111202,
  111203,
  111204,
  111205, // SmartLogger 2 inverters

  121101,
  121102,
  121103,
  121104,
  121105, // SmartLogger 3 counters
  121201,
  121202,
  121203,
  121204,
  121205, // SmartLogger 3 inverters

  131101,
  131102,
  131103,
  131104,
  131105, // SmartLogger 4 counters
  131201,
  131202,
  131203,
  131204,
  131205, // SmartLogger 4 inverters

  141101,
  141102,
  141103,
  141104,
  141105, // SmartLogger 5 counters
  141201,
  141202,
  141203,
  141204,
  141205, // SmartLogger 5 inverters
]

export default function SesPage({ tenantId }: SesPageProps) {
  const { t } = useTranslation("SES")
  const [selectedDevice, setSelectedDevice] =
    useState<PlantConfigDevice | null>(null)

  const { data, isLoading, error } = useGetPlantConfig({ tenantId })

  const buildTree = useCallback(
    (devices: PlantConfigDevice[]): PlantConfigDevice[] => {
      const map: Record<number, PlantConfigDevice> = {}
      devices.forEach((d) => (map[d.device_id] = { ...d, children: [] }))
      const tree: PlantConfigDevice[] = []
      devices.forEach((d) => {
        const node = map[d.device_id]
        if (d.parent_id === 0) tree.push(node)
        else map[d.parent_id]?.children?.push(node)
      })
      return tree
    },
    [],
  )

  const deviceTree = useMemo(() => {
    if (!data?.devices) return []

    const detectedPlantId =
      data.devices.find((d) => d.plant_id)?.plant_id ?? tenantId

    const filtered = data.devices
      .filter((d) => DEVICE_IDS.includes(d.device_id))
      .map((d) => ({ ...d, plant_id: d.plant_id ?? detectedPlantId }))

    return buildTree(filtered)
  }, [data, tenantId, buildTree])

  if (isLoading)
    return (
      <Flex justify="center" align="center" h="100vh">
        <Spinner size="xl" color="ui.Interactive.accent" />
      </Flex>
    )

  if (error)
    return (
      <Flex justify="center" align="center" h="100vh">
        <Text color="ui.Form.errorText">
          {t("common.loadError", {
            message: error.message || t("common.loadErrorFallback"),
          })}
        </Text>
      </Flex>
    )

  return (
    <Box
      pt="0"
      px={{ base: "16px", md: "24px" }}
      pb="0"
      h={{ base: "auto", md: "calc(100vh - 100px)" }}
    >
      <Grid
        {...DEVICE_TREE_PAGE_UI.sesUzePage.panelFlexBorderProps}
        borderRadius={DEVICE_TREE_PAGE_UI.sesUzePage.panelRadius}
        p={DEVICE_TREE_PAGE_UI.sesUzePage.panelPadding}
        alignItems="stretch"
        h={{ base: "auto", md: "100%" }}
        w="100%"
        templateColumns={{
          base: "1fr",
          md: "minmax(288px, 30%) 24px 1fr",
        }}
        columnGap={0}
        rowGap={6}
        // Mobile should page-scroll; desktop uses inner panes.
      >
        <GetDeviceTree
          deviceTree={deviceTree}
          selectedDevice={selectedDevice}
          setSelectedDevice={setSelectedDevice}
          formatDeviceLabel={(d) => sesDeviceTreeDisplayName(d, t)}
          i18nNs="SES"
          renderMobileSelectedDevice={(device) => {
            const title = sesTelemetryHeaderTitle(device, deviceTree, t)
            return (
              <Box pt="8px">
                <Text fontSize="sm" fontWeight={600} mb={2}>
                  {title}
                </Text>
                <GetDeviceData
                  tenantId={tenantId}
                  deviceIds={[device.device_id]}
                  headerTitleOverride={title}
                  headerSubtitleOverride={t("common.sesMonitoring")}
                  i18nNs="SES"
                />
              </Box>
            )
          }}
        />

        <Box display={{ base: "none", md: "block" }} />

        <Box
          display={{ base: "none", md: "block" }}
          minW={0}
          p={0}
          overflowY={{ base: "visible", md: "auto" }}
          className="app-scrollbar"
        >
          {selectedDevice ? (
            <GetDeviceData
              tenantId={tenantId}
              deviceIds={[selectedDevice.device_id]}
              headerTitleOverride={sesTelemetryHeaderTitle(
                selectedDevice,
                deviceTree,
                t,
              )}
              headerSubtitleOverride={t("common.sesMonitoring")}
              i18nNs="SES"
            />
          ) : (
            <Flex justify="center" align="center" h="full">
              <Text color="text.muted">
                {t("common.selectDevicePrompt")}
              </Text>
            </Flex>
          )}
        </Box>
      </Grid>
    </Box>
  )
}
