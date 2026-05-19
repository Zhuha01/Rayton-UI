/**
 * Telemetry table for one or more device IDs scoped to the active tenant configuration.
 * Fetches realtime points, merges plant metadata into headers, and sorts logs by freshest timestamp first.
 */

import { Box, Flex, Grid, Spinner, Table, Text } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { useGetDeviceData } from "@/hooks/useDeviceDataQueries"
import { useGetPlantConfig } from "@/hooks/usePlantConfigQueries"
import { SCHEDULE_UI } from "@/components_2/Pages/schedule/scheduleUi"
import { DeviceDataHeader } from "@/components_2/ui/DeviceDataHeader"
import type { RealtimeDataPoint } from "@/client"

interface GetDeviceDataProps {
  tenantId: string
  deviceIds: number[]
  headerTitleOverride?: string
  headerSubtitleOverride?: string | null
  /** Optional i18next namespace for table UI strings. */
  i18nNs?: string
}

export default function GetDeviceData({
  tenantId,
  deviceIds,
  headerTitleOverride,
  headerSubtitleOverride,
  i18nNs,
}: GetDeviceDataProps) {
  const { t } = useTranslation(i18nNs)
  const {
    data: deviceData,
    isLoading,
    error,
  } = useGetDeviceData({
    tenantId,
    deviceIds,
  })

  const { data: plantConfig } = useGetPlantConfig({ tenantId })

  const deviceNamesMap = React.useMemo(() => {
    if (!plantConfig?.devices) return {}
    return plantConfig.devices.reduce(
      (acc, device) => {
        acc[device.device_id] = device.name
        return acc
      },
      {} as Record<number, string>,
    )
  }, [plantConfig])

  const sortedLogs = React.useMemo(() => {
    if (!deviceData?.values) return []
    return [...deviceData.values].sort(
      (a, b) => Number(b.timestamp) - Number(a.timestamp),
    )
  }, [deviceData])

  const ui = React.useMemo(() => {
    if (!i18nNs) {
      return {
        devicePrefix: "Пристрій",
        loadingData: "Завантаження даних...",
        loadError: "Помилка при завантаженні даних",
        parameter: "Параметр",
        value: "Значення",
        dataId: "Data ID",
      }
    }
    return {
      devicePrefix: t("common.device"),
      loadingData: t("common.loadingData"),
      loadError: t("common.loadErrorFallback"),
      parameter: t("table.parameter"),
      value: t("table.value"),
      dataId: t("table.dataId"),
    }
  }, [i18nNs, t])

  const baseTitle = deviceNamesMap[deviceIds[0]]
    ? `${deviceNamesMap[deviceIds[0]]}`
    : `${ui.devicePrefix} ${deviceIds.join(", ")}`
  const title = headerTitleOverride ?? baseTitle

  const subtitle = (() => {
    const n = baseTitle.toLowerCase()
    if (/узе|ess|bess|storage/i.test(n)) {
      return "Моніторинг установки збереження енергії"
    }
    if (/сес|ses|solar|смарт\s*логер|smart\s*logger/i.test(n)) {
      return "Моніторинг сонячної електростанції"
    }
    return null
  })()

  const updatedAt =
    sortedLogs.length > 0
      ? Math.max(...sortedLogs.map((l) => Number(l.timestamp)))
      : null

  if (isLoading)
    return (
      <Flex align="center" justify="center" p={6}>
        <Spinner size="xl" color="ui.Interactive.accent" />
      </Flex>
    )

  if (error)
    return (
      <Box p={6} color="ui.Form.errorText">
        {t("common.loadError", { message: error.message || ui.loadError })}
      </Box>
    )

  return (
    <Box p={0}>
      <Box w="100%" maxW="100%">
        <Box mt="0" mb={4} display={{ base: "none", md: "block" }}>
          <DeviceDataHeader
            title={title}
            subtitle={headerSubtitleOverride ?? subtitle}
            updatedAt={updatedAt}
            i18nNs={i18nNs}
          />
        </Box>

        {/* TABLE (desktop) — match ScheduleControlTable + RowForm styling */}
        <Box
          display={{ base: "none", md: "block" }}
          borderRadius={SCHEDULE_UI.table.radius}
          overflowX="hidden"
          overflowY="hidden"
          w="100%"
        >
          <Box overflowX="auto" w="100%">
            <Table.Root
              size="sm"
              borderCollapse="separate"
              borderSpacing={0}
              style={{ tableLayout: "fixed", width: "100%" }}
              css={SCHEDULE_UI.table.noCellBorderCss}
            >
              <colgroup>
                <col style={{ width: "45%" }} />
                <col style={{ width: "25%" }} />
                <col style={{ width: "30%" }} />
              </colgroup>
              <Table.Header
                bg={SCHEDULE_UI.table.headerBg}
                color={SCHEDULE_UI.table.mutedTextColor}
                css={{
                  "& th": {
                    borderBottomWidth: "0",
                    borderBottom: "none",
                    color: SCHEDULE_UI.table.mutedTextColor,
                    bg: SCHEDULE_UI.table.headerBg,
                  },
                }}
              >
                <Table.Row h={`${SCHEDULE_UI.table.rowHeightPx}px`}>
                  <Table.ColumnHeader
                    bg={SCHEDULE_UI.table.headerBg}
                    color={SCHEDULE_UI.table.mutedTextColor}
                    px={SCHEDULE_UI.table.headerPx}
                    py={0}
                    fontSize={`${SCHEDULE_UI.table.fontSizePx}px`}
                    fontWeight={500}
                    whiteSpace="nowrap"
                    textAlign="left"
                    borderTopLeftRadius={SCHEDULE_UI.table.radius}
                    borderBottomLeftRadius={SCHEDULE_UI.table.radius}
                  >
                    {ui.parameter}
                  </Table.ColumnHeader>
                  <Table.ColumnHeader
                    bg={SCHEDULE_UI.table.headerBg}
                    color={SCHEDULE_UI.table.mutedTextColor}
                    px={SCHEDULE_UI.table.headerPx}
                    py={0}
                    fontSize={`${SCHEDULE_UI.table.fontSizePx}px`}
                    fontWeight={500}
                    whiteSpace="nowrap"
                    textAlign="left"
                  >
                    {ui.value}
                  </Table.ColumnHeader>
                  <Table.ColumnHeader
                    bg={SCHEDULE_UI.table.headerBg}
                    color={SCHEDULE_UI.table.mutedTextColor}
                    px={SCHEDULE_UI.table.headerPx}
                    py={0}
                    fontSize={`${SCHEDULE_UI.table.fontSizePx}px`}
                    fontWeight={500}
                    whiteSpace="nowrap"
                    textAlign="left"
                    borderTopRightRadius={SCHEDULE_UI.table.radius}
                    borderBottomRightRadius={SCHEDULE_UI.table.radius}
                  >
                    {ui.dataId}
                  </Table.ColumnHeader>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {sortedLogs.map((log: RealtimeDataPoint, idx: number) => (
                  <Table.Row
                    key={log.data_id ?? idx}
                    h={`${SCHEDULE_UI.table.rowHeightPx}px`}
                    bg={
                      idx % 2 === 0
                        ? SCHEDULE_UI.table.rowBgEven
                        : SCHEDULE_UI.table.rowBgOdd
                    }
                  >
                    <Table.Cell
                      px={SCHEDULE_UI.table.cellPx}
                      py={0}
                      fontSize={`${SCHEDULE_UI.table.fontSizePx}px`}
                      fontWeight={500}
                      color={SCHEDULE_UI.table.cellTextColor}
                      whiteSpace="nowrap"
                      overflow="hidden"
                      textOverflow="ellipsis"
                      borderTopLeftRadius={SCHEDULE_UI.table.radius}
                      borderBottomLeftRadius={SCHEDULE_UI.table.radius}
                    >
                      {log.name}
                    </Table.Cell>
                    <Table.Cell
                      px={SCHEDULE_UI.table.cellPx}
                      py={0}
                      fontSize={`${SCHEDULE_UI.table.fontSizePx}px`}
                      fontWeight={500}
                      color={SCHEDULE_UI.table.cellTextColor}
                      whiteSpace="nowrap"
                      overflow="hidden"
                      textOverflow="ellipsis"
                    >
                      {log.value ?? "-"}
                    </Table.Cell>
                    <Table.Cell
                      px={SCHEDULE_UI.table.cellPx}
                      py={0}
                      fontSize={`${SCHEDULE_UI.table.fontSizePx}px`}
                      fontWeight={500}
                      color={SCHEDULE_UI.table.cellTextColor}
                      whiteSpace="nowrap"
                      overflow="hidden"
                      textOverflow="ellipsis"
                      borderTopRightRadius={SCHEDULE_UI.table.radius}
                      borderBottomRightRadius={SCHEDULE_UI.table.radius}
                    >
                      {log.plant_id}:{log.device_id}:{log.data_id}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>
        </Box>
      </Box>

      {/* CARDS (mobile) — compact list with name/value row + ID */}
      <Box display={{ base: "flex", md: "none" }} flexDir="column" gap={0}>
        {sortedLogs.map((log: RealtimeDataPoint, idx: number) => {
          const m = SCHEDULE_UI.table.mobile
          const valueText =
            log.value === null || log.value === undefined || log.value === ""
              ? "-"
              : String(log.value)
          return (
            <Box
              key={log.data_id ?? idx}
              px={3}
              py={2}
              borderWidth="1px"
              borderStyle="solid"
              borderRadius={m.cardRadius}
              borderColor={m.mobileCardBorder}
              bg={
                idx % 2 === 0
                  ? SCHEDULE_UI.table.rowBgOdd
                  : SCHEDULE_UI.table.rowBgEven
              }
              overflow="hidden"
            >
              <Grid templateColumns="1fr auto" columnGap={3} alignItems="stretch">
                <Box minW={0}>
                  <Text
                    fontSize="sm"
                    fontWeight={600}
                    color={SCHEDULE_UI.table.cellTextColor}
                    lineClamp={1}
                    minW={0}
                  >
                    {log.name}
                  </Text>
                  <Text fontSize="xs" color={m.mobileMutedText} mt={0.5}>
                    ID: {log.plant_id}:{log.device_id}:{log.data_id}
                  </Text>
                </Box>

                <Flex align="center" justify="center" minW="0" px={1}>
                  <Text
                    fontSize="sm"
                    fontWeight={600}
                    color={SCHEDULE_UI.table.cellTextColor}
                    textAlign="center"
                    whiteSpace="nowrap"
                  >
                    {valueText}
                  </Text>
                </Flex>
              </Grid>
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}
