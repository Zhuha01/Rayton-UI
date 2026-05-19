/**
 * PLCControl within the Rayton operator UI (components_2/Pages/control/PLCControl.tsx).
 * Built with Chakra UI and shared theme tokens to stay consistent with dashboards, management, and control surfaces.
 * Primary contract: exported component props and functions below (see TypeScript types for required fields).
 */
import { Flex, Spinner, Text } from "@chakra-ui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import i18n from "@/i18n"
import type { CommandResponse, PlcDataControlExtendedRow } from "@/client"
import { ControlService } from "@/client"
import { toaster } from "@/components_2/ui/Toaster"
import {
  useBulkUpdatePlcDataControl,
  useGetPlcDataControl,
} from "@/hooks/usePlcControlQueries"
import {
  PLCControlView,
  type PlcCommandStatus,
  type PlcControlRow,
  type PlcControlStatusMap,
} from "./PLCControlView"
import { plcControlUi } from "./controlUi"
import { isPlcStatusIndicatorRow } from "./plcControlFilters"

interface PLCControlProps {
  tenantId: string | null
  isActive?: boolean
}

interface ModifiedPlcDataRow extends PlcDataControlExtendedRow {
  originalData: number | null
  isModified: boolean
}

const PLCControl = ({ tenantId, isActive }: PLCControlProps) => {
  const { t } = useTranslation("control")
  const queryClient = useQueryClient()
  const {
    data: serverData,
    isLoading: loadingControl,
    error,
    refetch,
  } = useGetPlcDataControl({ tenantId })

  const { mutate: _bulkUpdatePlcDataControl, isPending: _isSaving } =
    useBulkUpdatePlcDataControl({ tenantId })

  const [localData, setLocalData] = useState<ModifiedPlcDataRow[]>([])

  const [controlStatus, setControlStatus] = useState<
    Record<
      number,
      { status: PlcCommandStatus; message?: string; messageId?: string }
    >
  >({})

  const commandTimeoutIdRef = useRef<NodeJS.Timeout | null>(null)
  const _commandMessageIdRef = useRef<string | null>(null)

  const [_wsConnection, setWsConnection] = useState<WebSocket | null>(null)
  const [_wsConnected, setWsConnected] = useState<boolean>(false)

  const ongoingRequests = useRef<Set<number>>(new Set())
  const debounceTimers = useRef<Record<number, NodeJS.Timeout>>({})
  const commandTimeoutTimers = useRef<Record<number, NodeJS.Timeout>>({})

  const COMMAND_TIMEOUT_DURATION = 10000

  const handleMutationSuccess = (
    response: any,
    controlRow: ModifiedPlcDataRow,
  ) => {
    if (response && typeof response === "object" && "message_id" in response) {
      const commandResponse = response as CommandResponse
      const messageId = commandResponse.message_id
      if (messageId) {
        setControlStatus((prev) => ({
          ...prev,
          [controlRow.id]: {
            status: "sent",
            message: i18n.t("commandState.sent", { ns: "control" }),
            messageId,
          },
        }))

        if (commandTimeoutTimers.current[controlRow.id]) {
          clearTimeout(commandTimeoutTimers.current[controlRow.id])
        }

        commandTimeoutTimers.current[controlRow.id] = setTimeout(() => {
          setControlStatus((prev) => {
            const currentStatus = prev[controlRow.id]
            if (currentStatus && currentStatus.status === "sent") {
              return {
                ...prev,
                [controlRow.id]: {
                  status: "failed",
                  message: i18n.t("commandState.timeoutMessage", { ns: "control" }),
                  messageId,
                },
              }
            }
            return prev
          })

          toaster.create({
            title: i18n.t("toasts.commandTimeoutTitle", { ns: "control" }),
            description: i18n.t("toasts.commandTimeoutDescription", {
              ns: "control",
              messageId,
            }),
            type: "error",
          })
        }, COMMAND_TIMEOUT_DURATION)
      }
    } else {
      setControlStatus((prev) => ({
        ...prev,
        [controlRow.id]: {
          status: "confirmation_received",
          message: i18n.t("commandState.changesSaved", { ns: "control" }),
        },
      }))
      setTimeout(() => {
        setControlStatus((prev) => ({
          ...prev,
          [controlRow.id]: { status: "idle" },
        }))
      }, 300)
    }
  }

  const handleMutationError = (err: Error, controlRow: ModifiedPlcDataRow) => {
    console.error("Failed to update single PLC data command", err)
    setControlStatus((prev) => ({
      ...prev,
      [controlRow.id]: {
        status: "failed",
        message: i18n.t("commandState.failed", { ns: "control" }),
      },
    }))
    setTimeout(() => {
      setControlStatus((prev) => ({
        ...prev,
        [controlRow.id]: { status: "idle" },
      }))
    }, 3000)
    toaster.create({
      title: i18n.t("toasts.updateFailedTitle", { ns: "control" }),
      description:
        err.message ||
        i18n.t("toasts.updateFailedDescription", { ns: "control" }),
      type: "error",
    })
  }

  const singleUpdateMutation = useMutation({
    mutationFn: async (controlRow: ModifiedPlcDataRow) => {
      setControlStatus((prev) => ({
        ...prev,
        [controlRow.id]: {
          status: "sending",
          message: i18n.t("commandState.sending", { ns: "control" }),
        },
      }))

      const transformedData = [
        {
          id: controlRow.id,
          data: controlRow.data,
          updated_by: controlRow.updated_by,
        },
      ]

      return ControlService.updatePlcControl({
        tenantId: tenantId!,
        requestBody: transformedData,
      })
    },
    onSuccess: handleMutationSuccess,
    onError: handleMutationError,
  })

  const handleChange = (id: number, value: string | boolean | number) => {
    if (debounceTimers.current[id]) clearTimeout(debounceTimers.current[id])

    debounceTimers.current[id] = setTimeout(() => {
      setLocalData((prev) =>
        prev.map((row) => {
          if (row.id !== id) return row

          let newValue: number | null
          if (typeof value === "boolean") {
            newValue = value ? 1 : 0
          } else if (typeof value === "number") {
            newValue = value
          } else {
            if (row.input_type === "textlist" && row.textlist_entries) {
              const textToValue = Object.entries(row.textlist_entries).find(
                ([_key, text]) => text === value,
              )
              newValue = textToValue ? parseFloat(textToValue[0]) : null
            } else {
              newValue = value === "" ? null : parseFloat(value)
            }
          }

          const isModified = newValue !== row.originalData
          const updatedRow = { ...row, data: newValue, isModified }

          if ([1, 145, 146, 141, 142].includes(row.control_type)) {
            if (!ongoingRequests.current.has(row.id)) {
              ongoingRequests.current.add(row.id)
              const clearOngoingRequest = () => ongoingRequests.current.delete(row.id)

              singleUpdateMutation.mutate(updatedRow, {
                onSuccess: (response, variables) => {
                  clearOngoingRequest()
                  handleMutationSuccess(response, variables)
                },
                onError: (e, variables) => {
                  clearOngoingRequest()
                  handleMutationError(e, variables)
                },
              })
            }
          }

          return updatedRow
        }),
      )
    }, 30)
  }

  useEffect(() => {
    if (!isActive) return
    const intervalId = setInterval(() => {
      refetch()
    }, 2000)
    return () => clearInterval(intervalId)
  }, [isActive, refetch])

  useEffect(() => {
    if (serverData) {
      setLocalData((prevData) => {
        if (prevData.length === 0) {
          return serverData.map((row) => ({
            ...row,
            originalData: row.data,
            isModified: false,
          }))
        }

        return serverData.map((serverRow) => {
          const existingRow = prevData.find((r) => r.id === serverRow.id)
          if (existingRow?.isModified) return existingRow
          return {
            ...serverRow,
            originalData: serverRow.data,
            isModified: false,
          }
        })
      })
    } else {
      setLocalData([])
    }
  }, [serverData])

  useEffect(() => {
    if (!tenantId) return
    const apiUrl = "/api/v1"

    let ws: WebSocket | null = null
    let reconnectTimeout: NodeJS.Timeout | null = null
    let isUnmounted = false

    const connectWebSocket = () => {
      if (isUnmounted) return

      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close(100, "New connection requested")
      }

      const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:"
      const wsUrl = `${wsProtocol}//${window.location.host}${apiUrl}/ws/${tenantId}`

      try {
        ws = new WebSocket(wsUrl)
        setWsConnection(ws)

        ws.onopen = () => {
          if (isUnmounted) return
          setWsConnected(true)
        }

        ws.onmessage = (event) => {
          if (isUnmounted) return
          try {
            const data = JSON.parse(event.data)
            if (data.type === "command_response") {
              if (commandTimeoutIdRef.current) {
                clearTimeout(commandTimeoutIdRef.current)
                commandTimeoutIdRef.current = null
              }

              setControlStatus((prev) => {
                const updatedStatus = { ...prev }
                for (const [id, status] of Object.entries(prev)) {
                  if (status.messageId === data.message_id) {
                    const controlId = parseInt(id, 10)
                    if (commandTimeoutTimers.current[controlId]) {
                      clearTimeout(commandTimeoutTimers.current[controlId])
                      delete commandTimeoutTimers.current[controlId]
                    }

                    updatedStatus[controlId] = {
                      status:
                        data.status === "ok" || data.status === "success"
                          ? "confirmation_received"
                          : "failed",
                      message:
                        data.status === "ok" || data.status === "success"
                          ? i18n.t("commandState.saved", { ns: "control" })
                          : i18n.t("commandState.failed", { ns: "control" }),
                      messageId: data.message_id,
                    }

                    setTimeout(() => {
                      setControlStatus((p) => ({
                        ...p,
                        [controlId]: { status: "idle" },
                      }))
                    }, 3000)

                    break
                  }
                }
                return updatedStatus
              })

              if (data.status === "ok" || data.status === "success") {
                queryClient.invalidateQueries({
                  queryKey: ["plcDataControl", { tenantId }],
                })
              }
            }
          } catch (e) {
            console.error("Error parsing WebSocket message:", e)
          }
        }

        ws.onclose = (event) => {
          if (isUnmounted) return
          setWsConnected(false)

          if (event.code !== 10 && !isUnmounted) {
            reconnectTimeout = setTimeout(() => {
              if (!isUnmounted) connectWebSocket()
            }, 30)
          }
        }

        ws.onerror = (e) => {
          if (isUnmounted) return
          console.error("WebSocket error:", e)
          setWsConnected(false)
        }
      } catch (e) {
        console.error("Failed to create WebSocket connection:", e)
        if (!isUnmounted) {
          reconnectTimeout = setTimeout(() => {
            if (!isUnmounted) connectWebSocket()
          }, 300)
        }
      }
    }

    connectWebSocket()

    return () => {
      isUnmounted = true
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close(1000, "Component unmounting")
      }
      if (reconnectTimeout) clearTimeout(reconnectTimeout)
      if (commandTimeoutIdRef.current) clearTimeout(commandTimeoutIdRef.current)

      Object.values(debounceTimers.current).forEach((timer) => {
        if (timer) clearTimeout(timer)
      })
      Object.values(commandTimeoutTimers.current).forEach((timer) => {
        if (timer) clearTimeout(timer)
      })
    }
  }, [tenantId, queryClient])

  const handleStateButtonClick = (id: number) => {
    if (debounceTimers.current[id]) clearTimeout(debounceTimers.current[id])
    debounceTimers.current[id] = setTimeout(() => {
      setLocalData((prev) =>
        prev.map((row) => {
          if (row.id !== id) return row
          const newValue = 1
          const isModified = newValue !== row.originalData
          const updatedRow = { ...row, data: newValue, isModified }

          if (row.control_type === 141) {
            if (!ongoingRequests.current.has(row.id)) {
              ongoingRequests.current.add(row.id)
              const clearOngoingRequest = () => ongoingRequests.current.delete(row.id)
              singleUpdateMutation.mutate(updatedRow, {
                onSuccess: (response, variables) => {
                  clearOngoingRequest()
                  handleMutationSuccess(response, variables)
                },
                onError: (e, variables) => {
                  clearOngoingRequest()
                  handleMutationError(e, variables)
                },
              })
            }
          }
          return updatedRow
        }),
      )
    }, 30)
  }

  const handleDualButtonClick = (id: number, value: number) => {
    if (debounceTimers.current[id]) clearTimeout(debounceTimers.current[id])
    debounceTimers.current[id] = setTimeout(() => {
      setLocalData((prev) =>
        prev.map((row) => {
          if (row.id !== id) return row
          const isModified = value !== row.originalData
          const updatedRow = { ...row, data: value, isModified }

          if (row.control_type === 142) {
            if (!ongoingRequests.current.has(row.id)) {
              ongoingRequests.current.add(row.id)
              const clearOngoingRequest = () => ongoingRequests.current.delete(row.id)
              singleUpdateMutation.mutate(updatedRow, {
                onSuccess: (response, variables) => {
                  clearOngoingRequest()
                  handleMutationSuccess(response, variables)
                },
                onError: (e, variables) => {
                  clearOngoingRequest()
                  handleMutationError(e, variables)
                },
              })
            }
          }

          return updatedRow
        }),
      )
    }, 30)
  }

  if (loadingControl) {
    return (
      <Flex
        justify="center"
        align="center"
        h={plcControlUi.layout.loadingHeight}
      >
        <Spinner size="xl" color="ui.Interactive.accent" />
      </Flex>
    )
  }
  if (error) {
    return (
      <Text color={plcControlUi.status.failColor}>
        {t("errors.loadFailed", { message: error.message })}
      </Text>
    )
  }

  const statusData = localData
    .filter((row) => row.control_type === 2 || row.control_type === 3)
    .sort((a, b) => {
      const order = [3, 2]
      return order.indexOf(a.control_type) - order.indexOf(b.control_type)
    })

  const controlData = localData
    .filter((row) => [1, 145, 146, 141, 142].includes(row.control_type))
    .sort((a, b) => {
      const order = [145, 146, 1, 141, 142]
      return order.indexOf(a.control_type) - order.indexOf(b.control_type)
    })

  const statusIndicators = localData
    .filter(isPlcStatusIndicatorRow)
    .filter((row) => Boolean(row.data_text?.trim()))
    .sort((a, b) => a.data_id - b.data_id)

  const viewStatusMap: PlcControlStatusMap = Object.fromEntries(
    Object.entries(controlStatus).map(([id, st]) => [
      Number(id),
      { status: st.status, message: st.message },
    ]),
  )

  return (
    <PLCControlView
      statusData={statusData as unknown as PlcControlRow[]}
      controlData={controlData as unknown as PlcControlRow[]}
      statusIndicators={statusIndicators as unknown as PlcControlRow[]}
      controlStatus={viewStatusMap}
      onChange={handleChange}
      onStateButtonClick={handleStateButtonClick}
      onDualButtonClick={handleDualButtonClick}
    />
  )
}

export default PLCControl

