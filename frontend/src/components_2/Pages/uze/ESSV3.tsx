/**
 * ESS monitoring entry used by v3 routing, reusing the SES-style tree and telemetry layout.
 * Mirrors ESS.tsx behavior while keeping a separate import surface for gradual migrations.
 */

import { Box, Flex, Grid, Spinner, Text } from "@chakra-ui/react"
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
  30,
  31,
  32,
  33,
  34,
  35,
  36,
  37,
  38,
  39, // ESS devices

  303301,
  303302,
  303303,
  303304,
  303305, // PCS devices
  303401,
  303402,
  303403,
  303404,
  303405, // Cells
  303501,
  303502,
  303503,
  303504,
  303505, // BMS

  313301,
  313302,
  313303,
  313304,
  313305, // PCS devices
  313401,
  313402,
  313403,
  313404,
  313405, // Cells
  313501,
  313502,
  313503,
  313504,
  313505, // BMS

  323301,
  323302,
  323303,
  323304,
  323305, // PCS devices
  323401,
  323402,
  323403,
  323404,
  323405, // Cells
  323501,
  323502,
  323503,
  323504,
  323505, // BMS

  333301,
  333302,
  333303,
  333304,
  333305, // PCS devices
  333401,
  333402,
  333403,
  333404,
  333405, // Cells
  333501,
  333502,
  333503,
  333504,
  333505, // BMS
]

export default function ESS_v3({ tenantId }: UzePageProps) {
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
      </Grid>
    </Box>
  )
}
