/**
 * Full-featured schedule grid for tenant power rows with WebSocket-driven command status, validation, and mobile layout.
 * Used on the schedule tab; supports default, light, and without-sell variants via the `variant` prop and optional `tenantId`.
 */


import {
  Box,
  Flex,
  Spinner,
  Table, // This is now the main namespace
  Text,
  useBreakpointValue,
  VStack,
} from "@chakra-ui/react"
import { useQueryClient } from "@tanstack/react-query"
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react"
import { useTranslation } from "react-i18next"
import type { CommandResponse, ScheduleRow } from "@/client"
import { toaster } from "@/components_2/ui/Toaster"
import {
  useBulkUpdateSchedule,
  useGetSchedule,
} from "@/hooks/useScheduleQueries"
import { CommandStatusDisplay } from "./ScheduleControlTable/CommandStatusDisplay"
import { SCHEDULE_TABLE_MAX_ROWS } from "./ScheduleControlTable/scheduleControlTableConstants"
import RowForm from "./ScheduleControlTable/RowForm"
import RowFormLight from "./ScheduleControlTable/RowFormLight"
import RowFormWoSell from "./ScheduleControlTable/RowFormWoSell"
import type {
  ScheduleControlTableProps,
  ScheduleDisplayRow,
} from "./ScheduleControlTable/scheduleControlTableTypes"
import {
  createNewScheduleRowTemplate,
  timeToMinutes,
  validateRows,
} from "./ScheduleControlTable/validation"
import ScheduleMobileTable from "./ScheduleMobileTable/ScheduleMobileTable"
import { SCHEDULE_UI } from "./scheduleUi"

export type ScheduleControlTableVariant = "default" | "woSell" | "light"

type ScheduleControlTableUnifiedProps = ScheduleControlTableProps & {
  variant?: ScheduleControlTableVariant
}

export type ScheduleControlTableHandle = {
  saveAll: () => void
}

const ScheduleControlTable = forwardRef<
  ScheduleControlTableHandle,
  ScheduleControlTableUnifiedProps
>(function ScheduleControlTable(
  {
    tenantId,
    date,
    onScheduleDataChange,
    onSaveStateChange,
    variant = "default",
  },
  ref,
) {
  const { t, i18n } = useTranslation("Schedule")
  const queryClient = useQueryClient()

  const {
    data: serverData,
    isLoading: loadingSchedule,
    error,
    dataUpdatedAt,
  } = useGetSchedule({ tenantId, date })

  const { mutate: bulkUpdateSchedule, isPending: isSaving } =
    useBulkUpdateSchedule({ tenantId, date })

  const [localData, setLocalData] = useState<ScheduleRow[]>([])
  const [originalData, setOriginalData] = useState<ScheduleRow[]>([])

  const [invalidRows, setInvalidRows] = useState<number[]>([])
  const [newRow, setNewRow] = useState(createNewScheduleRowTemplate())
  const [isNewRowStartTimeInvalid, setIsNewRowStartTimeInvalid] =
    useState(false)

  const [commandStatus, setCommandStatus] = useState<{
    status: "idle" | "sending" | "success" | "failed"
    message?: string
  }>({ status: "idle" })

  const commandTimeoutIdRef = useRef<NodeJS.Timeout | null>(null)
  const commandMessageIdRef = useRef<string | null>(null)

  const [_wsConnection, setWsConnection] = useState<WebSocket | null>(null)
  const [_wsConnected, setWsConnected] = useState<boolean>(false)

  useEffect(() => {
    if (serverData) {
      setLocalData(serverData)
      setOriginalData(serverData)
      const invalidIds = validateRows(serverData)
      setInvalidRows(invalidIds)
    } else {
      setLocalData([])
      setOriginalData([])
      setInvalidRows([])
    }
    setNewRow(createNewScheduleRowTemplate())
  }, [serverData])

  const isDirty = useMemo(() => {
    // Compare only user-editable fields; ignore server-managed metadata.
    const pickComparable = (r: ScheduleRow) => ({
      id: r.id,
      rec_no: r.rec_no,
      start_time: r.start_time,
      charge_from_grid: r.charge_from_grid,
      allow_to_sell: r.allow_to_sell,
      charge_power: r.charge_power,
      charge_limit: r.charge_limit,
      discharge_power: r.discharge_power,
    })

    const normalize = (arr: ScheduleRow[]) =>
      arr
        .map(pickComparable)
        // stable ordering for deterministic compare
        .sort((a, b) => (a.rec_no - b.rec_no) || (a.id - b.id))

    const a = normalize(originalData)
    const b = normalize(localData)
    if (a.length !== b.length) return true
    for (let i = 0; i < a.length; i++) {
      const ai = a[i]
      const bi = b[i]
      if (!ai || !bi) return true
      if (
        ai.id !== bi.id ||
        ai.rec_no !== bi.rec_no ||
        ai.start_time !== bi.start_time ||
        ai.charge_from_grid !== bi.charge_from_grid ||
        ai.allow_to_sell !== bi.allow_to_sell ||
        ai.charge_power !== bi.charge_power ||
        ai.charge_limit !== bi.charge_limit ||
        ai.discharge_power !== bi.discharge_power
      ) {
        return true
      }
    }
    return false
  }, [localData, originalData])

  // Live WebSocket for schedule command acknowledgements; reconnects unless the tab unmounts or closes cleanly (code 1000).
  useEffect(() => {
    if (!tenantId) return

    // Use relative path for API, matching VITE_API_URL=""
    const apiUrl = "/api/v1"

    let ws: WebSocket | null = null
    let reconnectTimeout: NodeJS.Timeout | null = null
    let isUnmounted = false

    const connectWebSocket = () => {
      if (isUnmounted) return

      // Close any existing connection before creating a new one
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close(1000, "New connection requested")
      }

      // const wsProtocol = backendUrl.startsWith('https://') ? 'wss:' : 'ws:';
      // const wsUrl = `${wsProtocol}//${backendUrl.replace(/^https?:\/\//, '')}${apiUrl}/ws/${tenantId}`;
      const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:"
      const wsUrl = `${wsProtocol}//${window.location.host}${apiUrl}/ws/${tenantId}`

      try {
        ws = new WebSocket(wsUrl)
        setWsConnection(ws) // Update the state with the new WebSocket connection

        ws.onopen = () => {
          if (isUnmounted) return
          setWsConnected(true)
        }

        ws.onmessage = (event) => {
          if (isUnmounted) return
          try {
            const data = JSON.parse(event.data)

            if (
              data.type === "command_response" &&
              data.message_id === commandMessageIdRef.current
            ) {
              if (commandTimeoutIdRef.current) {
                clearTimeout(commandTimeoutIdRef.current)
                commandTimeoutIdRef.current = null
              }

              if (data.status === "ok" || data.status === "success") {
                setCommandStatus({
                  status: "success",
                  message: "Command confirmed",
                })
                // Invalidate the query to refetch the updated data from the server
                queryClient.invalidateQueries({
                  queryKey: ["schedule", { tenantId, date }],
                })
              } else {
                setCommandStatus({
                  status: "failed",
                  message: `Command failed: ${data.error || "Unknown error"}`,
                })
              }

              commandMessageIdRef.current = null

              setTimeout(() => {
                if (!isUnmounted) {
                  setCommandStatus({ status: "idle" })
                }
              }, 3000)
            } else if (data.type === "command_response") {
              console.warn(
                `Ignored command response for old/mismatched message_id: ${data.message_id}`,
              )
            }
          } catch (error) {
            console.error("Error parsing WebSocket message:", error)
          }
        }

        ws.onclose = (event) => {
          if (isUnmounted) return
          setWsConnected(false)

          // Attempt to reconnect after a delay, unless it was a deliberate close
          if (event.code !== 1000 && !isUnmounted) {
            // 1000 is normal closure
            reconnectTimeout = setTimeout(() => {
              if (!isUnmounted) {
                connectWebSocket()
              }
            }, 3000) // Reconnect after 3 seconds
          }
        }

        ws.onerror = (error) => {
          if (isUnmounted) return
          console.error("WebSocket error:", error)
          setWsConnected(false)
        }
      } catch (error) {
        console.error("Failed to create WebSocket connection:", error)
        if (!isUnmounted) {
          // Attempt to reconnect after a delay
          reconnectTimeout = setTimeout(() => {
            if (!isUnmounted) {
              connectWebSocket()
            }
          }, 3000)
        }
      }
    }

    connectWebSocket()

    return () => {
      isUnmounted = true
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close(1000, "Component unmounting") // 1000 indicates normal closure
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout)
      }
      if (commandTimeoutIdRef.current) {
        clearTimeout(commandTimeoutIdRef.current)
      }
    }
  }, [
    tenantId,
    date, // Invalidate the query to refetch the updated data from the server
    queryClient.invalidateQueries,
  ])

  useEffect(() => {
    if (onScheduleDataChange) {
      onScheduleDataChange(localData)
    }
  }, [localData, onScheduleDataChange])

  useEffect(() => {
    onSaveStateChange?.({
      invalidRowsCount: invalidRows.length,
      isDirty,
      isSaving,
      commandStatus: commandStatus.status,
    })
  }, [
    commandStatus.status,
    invalidRows.length,
    isDirty,
    isSaving,
    onSaveStateChange,
  ])

  // ... (displayData, nextRecNoDisplay, handleChange, handleNewRowChange, handleAddRow logic remains the same) ...

  const displayData = useMemo((): ScheduleDisplayRow[] => {
    if (localData.length === 0) return []

    // Keep data in rec_no ascending order instead of sorting by start_time
    const ordered = [...localData].sort((a, b) => a.rec_no - b.rec_no)
    const potentialNextStartTime = newRow.start_time
    const potentialNextStartMinutes = timeToMinutes(potentialNextStartTime)

    return ordered.map((row, index) => {
      let nextDistinctStartTime: string
      const currentRowStartTime = row.start_time

      // If this is a padding record (start_time is "00:00:00" and rec_no > 1), set end time to "00:00:00"
      if (currentRowStartTime === "00:00:00" && row.rec_no > 1) {
        nextDistinctStartTime = "00:00:00"
      } else if (index === ordered.length - 1) {
        const firstRowStartTime = ordered[0]?.start_time ?? "00:00:00"
        if (
          potentialNextStartMinutes !== -1 &&
          potentialNextStartMinutes > timeToMinutes(currentRowStartTime)
        ) {
          nextDistinctStartTime = potentialNextStartTime
        } else {
          nextDistinctStartTime = firstRowStartTime
        }
      } else {
        nextDistinctStartTime = "00:00:00"
        for (let j = 1; j < ordered.length; j++) {
          const nextCheckIndex = (index + j) % ordered.length
          if (ordered[nextCheckIndex].start_time !== currentRowStartTime) {
            nextDistinctStartTime = ordered[nextCheckIndex].start_time
            break
          }
        }
      }
      return {
        ...row,
        displayEndTime: nextDistinctStartTime,
      }
    })
  }, [localData, newRow.start_time])

  const _nextRecNoDisplay = useMemo(() => {
    const usedRows = localData.filter(
      (row) => row.rec_no === 1 || row.start_time !== "00:00:00",
    )
    const lastUsedRecNo =
      usedRows.length > 0 ? Math.max(...usedRows.map((r) => r.rec_no)) : 0
    return lastUsedRecNo + 1
  }, [localData])

  const handleChange = (id: number, field: keyof ScheduleRow, value: any) => {
    setLocalData((prev) => {
      const updated = prev.map((row) =>
        row.id === id ? { ...row, [field]: value } : row,
      )
      const invalidIds = validateRows(updated)
      setInvalidRows(invalidIds)
      return updated
    })
  }

  const _handleNewRowChange = (
    field: keyof Omit<ScheduleRow, "id" | "updated_at" | "rec_no">,
    value: any,
  ) => {
    setNewRow((prev) => ({ ...prev, [field]: value }))

    if (field === "start_time") {
      const newStartTime = value as string
      const isValidFormat = timeToMinutes(newStartTime) !== -1
      const isDuplicate = localData.some(
        (row) => row.start_time === newStartTime,
      )
      setIsNewRowStartTimeInvalid(!isValidFormat || isDuplicate)
    }
  }

  const _handleAddRow = () => {
    if (isNewRowStartTimeInvalid) {
      const isValidFormat = timeToMinutes(newRow.start_time) !== -1
      if (!isValidFormat) {
        toaster.create({
          title: "Invalid Start Time",
          description: "Please enter a valid start time.",
          type: "error",
        })
      } else {
        toaster.create({
          title: "Duplicate Start Time",
          description: "A schedule entry already exists for this start time.",
          type: "warning",
        })
      }
      return
    }

    const usedRows = localData.filter(
      (row) => row.rec_no === 1 || row.start_time !== "00:00:00",
    )
    const lastUsedRecNo =
      usedRows.length > 0 ? Math.max(...usedRows.map((r) => r.rec_no)) : 0
    const nextRecNo = lastUsedRecNo + 1

    if (nextRecNo > SCHEDULE_TABLE_MAX_ROWS) {
      toaster.create({
        title: "Limit Reached",
        description: "Cannot add more than 24 schedule entries.",
        type: "warning",
      })
      return
    }

    const tempRow: ScheduleRow = {
      ...newRow,
      rec_no: nextRecNo,
      id: -Date.now(),
      updated_at: new Date().toISOString(),
      updated_by: "",
    }

    setLocalData((prev) => {
      const newData = [...prev, tempRow]
      const invalidIds = validateRows(newData)
      setInvalidRows(invalidIds)
      return newData
    })
    setNewRow(createNewScheduleRowTemplate())
    setIsNewRowStartTimeInvalid(false)
  }

  const handleSaveAll = () => {
    if (commandTimeoutIdRef.current) {
      clearTimeout(commandTimeoutIdRef.current)
      commandTimeoutIdRef.current = null
    }

    const invalidIds = validateRows(localData)
    if (invalidIds.length > 0) {
      toaster.create({
        title: "Invalid Data",
        description: "Please fix duplicate start times (highlighted in red).",
        type: "error",
      })
      return
    }

    // Keep data in rec_no ascending order and ensure proper sequence
    const orderedData = [...localData].sort((a, b) => a.rec_no - b.rec_no)
    const dataToSave = orderedData.map((row, index) => ({
      ...row,
      rec_no: index + 1, // Ensure rec_no is sequential from 1 to N
    }))

    setCommandStatus({ status: "sending", message: "Sending command..." })

    bulkUpdateSchedule(dataToSave, {
      onSuccess: (response: CommandResponse) => {
        const messageId = response.message_id

        if (messageId) {
          commandMessageIdRef.current = messageId

          const timeoutId = setTimeout(() => {
            if (commandMessageIdRef.current === messageId) {
              setCommandStatus({
                status: "failed",
                message: "Command failed (timeout)",
              })
              commandTimeoutIdRef.current = null
              commandMessageIdRef.current = null
            }
          }, 10000)

          commandTimeoutIdRef.current = timeoutId

          // --- CHANGE: Set status to 'success' with a waiting message ---
          // This will show the green checkmark and "Command sent...",
          // which will later be replaced by "Command confirmed"
          setCommandStatus({
            status: "success",
            message: "Command sent, awaiting confirmation...",
          })
        } else {
          setCommandStatus({
            status: "success",
            message: "Changes saved (no msg_id)",
          })
          setTimeout(() => {
            setCommandStatus({ status: "idle" })
          }, 3000)
        }
      },
      onError: (error: Error) => {
        setCommandStatus({
          status: "failed",
          message: "Command failed to send",
        })
        setTimeout(() => {
          setCommandStatus({ status: "idle" })
        }, 3000)

        toaster.create({
          title: "Save Failed",
          description: error.message || "Could not save schedule.",
          type: "error",
        })
      },
    })
  }

  useImperativeHandle(
    ref,
    () => ({
      saveAll: handleSaveAll,
    }),
    [handleSaveAll],
  )

  const RowComponent = useMemo(() => {
    switch (variant) {
      case "woSell":
        return RowFormWoSell
      case "light":
        return RowFormLight
      default:
        return RowForm
    }
  }, [variant])

  const colWidthsPx = useMemo(() => {
    const colCount = variant === "woSell" || variant === "light" ? 7 : 8
    if (colCount === 8) return [...SCHEDULE_UI.table.compact8.colWidthsPx]
    return [
      SCHEDULE_UI.table.firstColWidthPx,
      ...Array.from({ length: colCount - 1 }).map(
        () => SCHEDULE_UI.table.otherColWidthPx,
      ),
    ]
  }, [variant])

  const colWidthsPct = useMemo(() => {
    const sum = colWidthsPx.reduce((acc, w) => acc + w, 0) || 1
    return colWidthsPx.map((w) => `${(w / sum) * 100}%`)
  }, [colWidthsPx])

  const isDesktop = useBreakpointValue({ base: false, md: true }) ?? false

  if (loadingSchedule) {
    return (
      <Flex justify="center" align="center" h="200px">
        <Spinner size="xl" color="ui.Interactive.accent" />
      </Flex>
    )
  }
  if (error) {
    return (
      <Text color={SCHEDULE_UI.table.errorTextColor}>
        Error loading schedule: {error.message}
      </Text>
    )
  }

  //const filteredDisplayData = displayData.filter((row) => row.rec_no === 1 || row.start_time !== "00:00:00");

  return (
    <VStack gap={0} align="stretch">
      {isDesktop ? (
        <Box
          borderRadius={SCHEDULE_UI.table.radius}
          overflow="hidden"
          position="relative"
          w="100%"
          minH={`${SCHEDULE_UI.table.heightPx}px`}
        >
          <Table.Root
            size="sm"
            borderRadius={0}
            borderWidth={0}
            outline="none"
            borderCollapse="separate"
            borderSpacing={0}
            style={{ tableLayout: "fixed", width: "100%" }}
            css={SCHEDULE_UI.table.noCellBorderCss}
          >
            {(() => {
              return (
                <colgroup>
                  {colWidthsPct.map((w, i) => (
                    <col key={i} style={{ width: w }} />
                  ))}
                </colgroup>
              )
            })()}
            <Table.Header
              bg={SCHEDULE_UI.table.headerBg}
              color={SCHEDULE_UI.table.mutedTextColor}
              css={{
                // `Table.ColumnHeader` sets its own `color` on <th> (default fg), so
                // `color` on <thead> does not show through — set the token on `th`.
                "& th": {
                  color: SCHEDULE_UI.table.mutedTextColor,
                  // `bg` on <thead> is covered by the table recipe on each <th>
                  bg: SCHEDULE_UI.table.headerBg,
                },
              }}
            >
              <Table.Row
                bg="ui.NavbarComponent.background"
                h={`${SCHEDULE_UI.table.rowHeightPx}px`}
              >
                {variant === "light" ? (
                  <>
                    <Table.ColumnHeader
                      bg={SCHEDULE_UI.table.headerBg}
                      color={SCHEDULE_UI.table.mutedTextColor}
                      px={SCHEDULE_UI.table.headerPx}
                      py={0}
                      fontSize={`${SCHEDULE_UI.table.fontSizePx}px`}
                      whiteSpace="nowrap"
                      textAlign="center"
                      borderTopLeftRadius={SCHEDULE_UI.table.radius}
                      borderBottomLeftRadius={SCHEDULE_UI.table.radius}
                    >
                      {t("table.headers.light.rec")}
                    </Table.ColumnHeader>
                    <Table.ColumnHeader
                      bg={SCHEDULE_UI.table.headerBg}
                      color={SCHEDULE_UI.table.mutedTextColor}
                      px={SCHEDULE_UI.table.headerPx}
                      py={0}
                      fontSize={`${SCHEDULE_UI.table.fontSizePx}px`}
                      whiteSpace="nowrap"
                      textAlign="center"
                    >
                      {t("table.headers.light.start")}
                    </Table.ColumnHeader>
                    <Table.ColumnHeader
                      bg={SCHEDULE_UI.table.headerBg}
                      color={SCHEDULE_UI.table.mutedTextColor}
                      px={SCHEDULE_UI.table.headerPx}
                      py={0}
                      fontSize={`${SCHEDULE_UI.table.fontSizePx}px`}
                      whiteSpace="nowrap"
                      textAlign="center"
                    >
                      {t("table.headers.light.end")}
                    </Table.ColumnHeader>
                    <Table.ColumnHeader
                      bg={SCHEDULE_UI.table.headerBg}
                      color={SCHEDULE_UI.table.mutedTextColor}
                      px={SCHEDULE_UI.table.headerPx}
                      py={0}
                      fontSize={`${SCHEDULE_UI.table.fontSizePx}px`}
                      whiteSpace="nowrap"
                      textAlign="center"
                    >
                      {t("table.headers.light.offGrid")}
                    </Table.ColumnHeader>
                    <Table.ColumnHeader
                      bg={SCHEDULE_UI.table.headerBg}
                      color={SCHEDULE_UI.table.mutedTextColor}
                      px={SCHEDULE_UI.table.headerPx}
                      py={0}
                      fontSize={`${SCHEDULE_UI.table.fontSizePx}px`}
                      whiteSpace="nowrap"
                      textAlign="center"
                    >
                      {t("table.headers.light.chgPow")}
                    </Table.ColumnHeader>
                    <Table.ColumnHeader
                      bg={SCHEDULE_UI.table.headerBg}
                      color={SCHEDULE_UI.table.mutedTextColor}
                      px={SCHEDULE_UI.table.headerPx}
                      py={0}
                      fontSize={`${SCHEDULE_UI.table.fontSizePx}px`}
                      whiteSpace="nowrap"
                      textAlign="center"
                    >
                      {t("table.headers.light.chgLim")}
                    </Table.ColumnHeader>
                    <Table.ColumnHeader
                      bg={SCHEDULE_UI.table.headerBg}
                      color={SCHEDULE_UI.table.mutedTextColor}
                      px={SCHEDULE_UI.table.headerPx}
                      py={0}
                      fontSize={`${SCHEDULE_UI.table.fontSizePx}px`}
                      whiteSpace="nowrap"
                      textAlign="center"
                      borderTopRightRadius={SCHEDULE_UI.table.radius}
                      borderBottomRightRadius={SCHEDULE_UI.table.radius}
                    >
                      {t("table.headers.light.dischPow")}
                    </Table.ColumnHeader>
                  </>
                ) : (
                  <>
                    {/*
                      8-column (default) table is visually tight; use compact headers to avoid overlap.
                      7-column variants (woSell) keep full labels.
                    */}
                    {(() => {
                      // Only German needs compact headers in 8-col default table.
                      const lang = i18n.resolvedLanguage
                        ?.split("-")[0]
                        ?.toLowerCase()
                      const useCompact = variant === "default" && lang === "de"
                      const key = (k: string) =>
                        useCompact ? `table.headers.compact.${k}` : `table.headers.${k}`
                      return (
                        <>
                          <Table.ColumnHeader
                            bg={SCHEDULE_UI.table.headerBg}
                            color={SCHEDULE_UI.table.mutedTextColor}
                            px={SCHEDULE_UI.table.headerPx}
                            py={0}
                            fontSize={`${SCHEDULE_UI.table.fontSizePx}px`}
                            whiteSpace="nowrap"
                            textAlign="center"
                            borderTopLeftRadius={SCHEDULE_UI.table.radius}
                            borderBottomLeftRadius={SCHEDULE_UI.table.radius}
                          >
                            {t(key("rec"))}
                          </Table.ColumnHeader>
                          <Table.ColumnHeader
                            bg={SCHEDULE_UI.table.headerBg}
                            color={SCHEDULE_UI.table.mutedTextColor}
                            px={SCHEDULE_UI.table.headerPx}
                            py={0}
                            fontSize={`${SCHEDULE_UI.table.fontSizePx}px`}
                            whiteSpace="nowrap"
                            textAlign="center"
                          >
                            {t(key("start"))}
                          </Table.ColumnHeader>
                          <Table.ColumnHeader
                            bg={SCHEDULE_UI.table.headerBg}
                            color={SCHEDULE_UI.table.mutedTextColor}
                            px={SCHEDULE_UI.table.headerPx}
                            py={0}
                            fontSize={`${SCHEDULE_UI.table.fontSizePx}px`}
                            whiteSpace="nowrap"
                            textAlign="center"
                          >
                            {t(key("end"))}
                          </Table.ColumnHeader>
                          <Table.ColumnHeader
                            bg={SCHEDULE_UI.table.headerBg}
                            color={SCHEDULE_UI.table.mutedTextColor}
                            px={SCHEDULE_UI.table.headerPx}
                            py={0}
                            fontSize={`${SCHEDULE_UI.table.fontSizePx}px`}
                            whiteSpace="nowrap"
                            textAlign="center"
                          >
                            {t(key("fromGrid"))}
                          </Table.ColumnHeader>
                          {variant !== "woSell" && (
                            <Table.ColumnHeader
                              bg={SCHEDULE_UI.table.headerBg}
                              color={SCHEDULE_UI.table.mutedTextColor}
                              px={SCHEDULE_UI.table.headerPx}
                              py={0}
                              fontSize={`${SCHEDULE_UI.table.fontSizePx}px`}
                              whiteSpace="nowrap"
                              textAlign="center"
                            >
                              {t(key("sell"))}
                            </Table.ColumnHeader>
                          )}
                          <Table.ColumnHeader
                            bg={SCHEDULE_UI.table.headerBg}
                            color={SCHEDULE_UI.table.mutedTextColor}
                            px={SCHEDULE_UI.table.headerPx}
                            py={0}
                            fontSize={`${SCHEDULE_UI.table.fontSizePx}px`}
                            whiteSpace="nowrap"
                            textAlign="center"
                          >
                            {t(key("charge"))}
                          </Table.ColumnHeader>
                          <Table.ColumnHeader
                            bg={SCHEDULE_UI.table.headerBg}
                            color={SCHEDULE_UI.table.mutedTextColor}
                            px={SCHEDULE_UI.table.headerPx}
                            py={0}
                            fontSize={`${SCHEDULE_UI.table.fontSizePx}px`}
                            whiteSpace="nowrap"
                            textAlign="center"
                          >
                            {t(key("chargeLimit"))}
                          </Table.ColumnHeader>
                          <Table.ColumnHeader
                            bg={SCHEDULE_UI.table.headerBg}
                            color={SCHEDULE_UI.table.mutedTextColor}
                            px={SCHEDULE_UI.table.headerPx}
                            py={0}
                            fontSize={`${SCHEDULE_UI.table.fontSizePx}px`}
                            whiteSpace="nowrap"
                            textAlign="center"
                            borderTopRightRadius={SCHEDULE_UI.table.radius}
                            borderBottomRightRadius={SCHEDULE_UI.table.radius}
                          >
                            {t(key("discharge"))}
                          </Table.ColumnHeader>
                        </>
                      )
                    })()}
                  </>
                )}
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {displayData.map((row, rowIndex) => (
                <RowComponent
                  key={row.id}
                  row={row}
                  rowIndex={rowIndex}
                  invalidRows={invalidRows}
                  handleChange={handleChange}
                />
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
      ) : (
        <Box
          w="100%"
          overflowX="hidden"
          borderRadius={SCHEDULE_UI.table.mobile.cardRadius}
        >
          <ScheduleMobileTable
            displayData={displayData}
            invalidRows={invalidRows}
            variant={variant}
            handleChange={handleChange}
          />
        </Box>
      )}

      <Flex {...SCHEDULE_UI.table.footer} display="flex">
        <CommandStatusDisplay
          status={commandStatus.status}
          message={commandStatus.message}
        />
      </Flex>
    </VStack>
  )
})

export default ScheduleControlTable
