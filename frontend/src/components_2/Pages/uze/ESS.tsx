/**
 * Energy Storage System monitoring surface mirroring SES layout sans custom tree renaming.
 * Renders expandable plant hardware tree beside streaming device parameter tables per tenant scope.
 */

import { Box, Flex, Spinner, Text } from "@chakra-ui/react"
import { useCallback, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { useGetPlantConfig } from "@/hooks/usePlantConfigQueries"
import { DEVICE_TREE_PAGE_UI } from "@/components_2/Pages/device/deviceTreePageUi"
import GetDeviceData from "@/components_2/Pages/device/GetDeviceData"
import GetDeviceTree from "@/components_2/Pages/device/GetDeviceTree"
import {
  uzeDeviceTreeDisplayName,
  uzeTelemetryHeaderTitle,
} from "@/components_2/Pages/uze/uzeTelemetryHeaderTitle"

type PlantConfigDevice = {
  device_id: number
  parent_id: number
  name: string
  class_id: number
  plant_id?: number | string
  children?: PlantConfigDevice[]
}

interface UzePageProps {
  tenantId: string
}

const DEVICE_IDS = [
  20,
  21,
  22,
  23,
  24, // SmartLoggers
  201101,
  201102,
  201103,
  201104,
  201105, // SmartLogger 1 counters
  201201,
  201202,
  201203,
  201204,
  201205, // SmartLogger 1 inverters

  211101,
  211102,
  211103,
  211104,
  211105, // SmartLogger 2 counters
  211201,
  211202,
  211203,
  211204,
  211205, // SmartLogger 2 inverters

  221101,
  221102,
  221103,
  221104,
  221105, // SmartLogger 3 counters
  221201,
  221202,
  221203,
  221204,
  221205, // SmartLogger 3 inverters

  231101,
  231102,
  231103,
  231104,
  231105, // SmartLogger 4 counters
  231201,
  231202,
  231203,
  231204,
  231205, // SmartLogger 4 inverters

  241101,
  241102,
  241103,
  241104,
  241105, // SmartLogger 5 counters
  241201,
  241202,
  241203,
  241204,
  241205, // SmartLogger 5 inverters
]

export default function ESS({ tenantId }: UzePageProps) {
  const { t } = useTranslation("Uze")
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
      <Flex
        {...DEVICE_TREE_PAGE_UI.sesUzePage.panelFlexBorderProps}
        borderRadius={DEVICE_TREE_PAGE_UI.sesUzePage.panelRadius}
        p={DEVICE_TREE_PAGE_UI.sesUzePage.panelPadding}
        gap={6}
        align="stretch"
        justify="space-between"
        h={{ base: "auto", md: "100%" }}
      >
        <GetDeviceTree
          deviceTree={deviceTree}
          selectedDevice={selectedDevice}
          setSelectedDevice={setSelectedDevice}
          i18nNs="Uze"
          formatDeviceLabel={(d) => uzeDeviceTreeDisplayName(d, t)}
          renderMobileSelectedDevice={(device) => {
            const title = uzeTelemetryHeaderTitle(device, t)
            return (
              <Box pt="8px">
                <Text fontSize="sm" fontWeight={600} mb={2}>
                  {title}
                </Text>
                <GetDeviceData
                  tenantId={tenantId}
                  deviceIds={[device.device_id]}
                  headerTitleOverride={title}
                  headerSubtitleOverride={t("common.essMonitoring")}
                  i18nNs="Uze"
                />
              </Box>
            )
          }}
        />

        <Box
          display={{ base: "none", md: "block" }}
          flex="1"
          p={0}
          overflowY={{ base: "visible", md: "auto" }}
          className="app-scrollbar"
        >
          {selectedDevice ? (
            <GetDeviceData
              tenantId={tenantId}
              deviceIds={[selectedDevice.device_id]}
              headerTitleOverride={uzeTelemetryHeaderTitle(selectedDevice, t)}
              headerSubtitleOverride={t("common.essMonitoring")}
              i18nNs="Uze"
            />
          ) : (
            <Flex justify="center" align="center" h="full">
              <Text color="text.muted">
                {t("common.selectDevicePrompt")}
              </Text>
            </Flex>
          )}
        </Box>
      </Flex>
    </Box>
  )
}
