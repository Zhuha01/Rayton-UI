/**
 * Renders an editable PLC data settings grid.
 * Supports text lists, numeric inputs, and boolean toggles with revert + bulk save,
 * including WebSocket-based command confirmation.
 */

import {
  Box,
  chakra,
  createListCollection,
  Flex,
  Icon,
  Input,
  NumberInput,
  Select,
  Spinner,
  Switch,
  Text,
} from "@chakra-ui/react"
import { useQueryClient } from "@tanstack/react-query"
import { useEffect, useMemo, useRef, useState } from "react"
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa"
import type { CommandResponse, PlcDataSettingsExtendedRow } from "@/client"
import {
  MUTED_TEXT,
  darkFieldControlProps,
  darkNumberInputStyles,
  darkSelectTriggerProps,
  selectContentProps,
  selectItemProps,
} from "@/components_2/Pages/management/sharedModalStyles"
import { ButtonCustom } from "@/components_2/ui/ButtonCustom"
import { toaster } from "@/components_2/ui/Toaster"
import {
  useBulkUpdatePlcDataSettings,
  useGetPlcDataSettings,
} from "@/hooks/usePlcDataSettingsQueries"
import { useTranslation } from "react-i18next"

function toInputValue(v: unknown) {
  if (v == null) return ""
  return String(v)
}

const RevertChangeButton = ({ onRevert }: { onRevert: () => void }) => {
  const { t } = useTranslation("plant-setting")

  return (
    <chakra.button
      type="button"
      aria-label={t("a11y.revertChange")}
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      cursor="pointer"
      bg="transparent"
      border="none"
      p={0}
      color="ui.PLCDataSettingsTable.inputText"
      _hover={{ color: "ui.PLCDataSettingsTable.actionHover" }}
      onClick={(e) => {
        e.preventDefault()
        onRevert()
      }}
    >
      <Box as="span" w="16px" h="16px" display="inline-flex">
        <svg width="16px" height="16px" fill="none" viewBox="0 0 16 16">
          <path
            d="M1.76226 10.1875C2.65299 12.9822 5.20406 15 8.21212 15C11.961 15 15 11.866 15 8C15 4.13401 11.961 1 8.21212 1C5.69965 1 3.506 2.4077 2.33234 4.5M4.39394 5.375H1V1.875"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Box>
    </chakra.button>
  )
}

const CommandStatusDisplay = ({
  status,
  message,
}: {
  status: "idle" | "sending" | "success" | "failed"
  message?: string
}) => {
  const { t } = useTranslation("plant-setting")

  if (status === "idle") return null

  if (status === "sending") {
    return (
      <Flex alignItems="center" gap={2} color="ui.PlcControl.commandSending" minW="20px">
        <Spinner size="xl" color="ui.Interactive.accent" />
      </Flex>
    )
  }

  if (status === "success") {
    return (
      <Flex alignItems="center" gap={2} color="ui.PlcControl.commandOk" minW="220px">
        <Icon as={FaCheckCircle} fontSize="lg" />
        <Text fontSize="sm" fontWeight="medium">
          {message || t("status.success")}
        </Text>
      </Flex>
    )
  }

  if (status === "failed") {
    return (
      <Flex alignItems="center" gap={2} color="ui.Form.errorText" minW="220px">
        <Icon as={FaTimesCircle} fontSize="lg" />
        <Text fontSize="sm" fontWeight="medium">
          {message || t("status.failed")}
        </Text>
      </Flex>
    )
  }

  return null
}

interface PLCDataSettingsTableProps {
  tenantId: string | null
}

interface ModifiedPlcDataRow extends PlcDataSettingsExtendedRow {
  originalData: number | null
  isModified: boolean
}

const PLCDataSettingsTable = ({ tenantId }: PLCDataSettingsTableProps) => {
  const { t } = useTranslation("plant-setting")
  const queryClient = useQueryClient()
  const {
    data: serverData,
    isLoading: loadingSettings,
    error,
  } = useGetPlcDataSettings({ tenantId })

  const { mutate: bulkUpdatePlcDataSettings, isPending: isSaving } =
    useBulkUpdatePlcDataSettings({ tenantId })

  const [localData, setLocalData] = useState<ModifiedPlcDataRow[]>([])

  const [commandStatus, setCommandStatus] = useState<{
    status: "idle" | "sending" | "success" | "failed"
    message?: string
  }>({ status: "idle" })

  const commandTimeoutIdRef = useRef<NodeJS.Timeout | null>(null)
  const commandMessageIdRef = useRef<string | null>(null)

  const [_wsConnection, setWsConnection] = useState<WebSocket | null>(null)
  const [_wsConnected, setWsConnected] = useState<boolean>(false)

  const [openSelectByRowId, setOpenSelectByRowId] = useState<
    Record<number, boolean>
  >({})

  const textlistCollections = useMemo(() => {
    const map = new Map<
      number,
      ReturnType<typeof createListCollection<{ label: string; value: string }>>
    >()
    for (const row of localData) {
      if (row.input_type === "textlist" && row.textlist_entries) {
        const items = [
          { label: t("placeholder.selectOption"), value: "" },
          ...Object.entries(row.textlist_entries).map(([_key, text]) => ({
            label: text,
            value: text,
          })),
        ]
        map.set(row.id, createListCollection({ items }))
      }
    }
    return map
  }, [localData, t])

  const handleChange = (id: number, value: string | boolean) => {
    setLocalData((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row

        let newValue: number | null
        if (typeof value === "boolean") {
          newValue = value ? 1 : 0
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
        return { ...row, data: newValue, isModified }
      }),
    )
  }

  useEffect(() => {
    if (serverData) {
      const mappedData = serverData.map((row) => ({
        ...row,
        originalData: row.data,
        isModified: false,
      }))
      setLocalData(mappedData)
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
        ws.close(1000, "New connection requested")
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
                  message: t("command.confirmed"),
                })
                queryClient.invalidateQueries({
                  queryKey: ["plcDataSettings", { tenantId }],
                })
              } else {
                setCommandStatus({
                  status: "failed",
                  message: t("command.failedWithError", {
                    error: data.error || t("command.unknownError"),
                  }),
                })
              }

              commandMessageIdRef.current = null

              setTimeout(() => {
                if (!isUnmounted) setCommandStatus({ status: "idle" })
              }, 3000)
            }
          } catch {
            // ignore malformed messages
          }
        }

        ws.onclose = (event) => {
          if (isUnmounted) return
          setWsConnected(false)

          if (event.code !== 100 && !isUnmounted) {
            reconnectTimeout = setTimeout(() => {
              if (!isUnmounted) connectWebSocket()
            }, 30)
          }
        }

        ws.onerror = () => {
          if (isUnmounted) return
          setWsConnected(false)
        }
      } catch {
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
    }
  }, [tenantId, queryClient, t])

  const handleRevert = (id: number) => {
    setLocalData((prev) =>
      prev.map((row) =>
        row.id === id ? { ...row, data: row.originalData, isModified: false } : row,
      ),
    )
  }

  const handleSaveAll = () => {
    if (commandTimeoutIdRef.current) {
      clearTimeout(commandTimeoutIdRef.current)
      commandTimeoutIdRef.current = null
    }

    setCommandStatus({ status: "sending", message: t("command.sending") })

    const modifiedData = localData.filter((row) => row.isModified)
    if (modifiedData.length === 0) {
      setCommandStatus({
        status: "success",
        message: t("command.noChangesToSave"),
      })
      setTimeout(() => setCommandStatus({ status: "idle" }), 3000)
      return
    }

    bulkUpdatePlcDataSettings(modifiedData, {
      onSuccess: (response: unknown) => {
        if (response && typeof response === "object" && "message_id" in response) {
          const commandResponse = response as CommandResponse
          const messageId = commandResponse.message_id

          if (messageId) {
            commandMessageIdRef.current = messageId

            const timeoutId = setTimeout(() => {
              if (commandMessageIdRef.current === messageId) {
                setCommandStatus({
                  status: "failed",
                  message: t("command.failedTimeout"),
                })
                commandTimeoutIdRef.current = null
                commandMessageIdRef.current = null
              }
            }, 10000)

            commandTimeoutIdRef.current = timeoutId

            setCommandStatus({
              status: "success",
              message: t("command.sentAwaitingConfirmation"),
            })
          } else {
            setCommandStatus({
              status: "success",
              message: t("command.savedNoMsgId"),
            })
            setTimeout(() => setCommandStatus({ status: "idle" }), 300)
          }
        } else {
          setCommandStatus({ status: "success", message: t("command.saved") })
          setTimeout(() => setCommandStatus({ status: "idle" }), 3000)
        }
      },
      onError: (saveError: Error) => {
        setCommandStatus({
          status: "failed",
          message: t("command.failedToSend"),
        })
        setTimeout(() => setCommandStatus({ status: "idle" }), 30)

        toaster.create({
          title: t("toasts.saveFailedTitle"),
          description:
            saveError.message || t("toasts.saveFailedFallbackDescription"),
          type: "error",
        })
      },
    })
  }

  const inputHoverBorder = {
    borderColor: "ui.PLCDataSettingsTable.actionHover",
  }

  const selectTriggerMerged = {
    ...darkSelectTriggerProps,
    h: "43px",
    px: "12px",
    fontSize: "16px",
    fontWeight: "normal" as const,
    bg: "ui.PLCDataSettingsTable.inputBg",
    color: "ui.PLCDataSettingsTable.inputText",
    borderWidth: "1px",
    borderColor: "transparent",
    w: "100%",
    _hover: { ...(darkSelectTriggerProps._hover ?? {}), ...inputHoverBorder },
    _focus: {
      ...(darkSelectTriggerProps._focus ?? {}),
      ...inputHoverBorder,
    },
    _focusVisible: {
      ...(darkSelectTriggerProps._focusVisible ?? {}),
      ...inputHoverBorder,
    },
  }

  const numberInputMerged = {
    ...darkFieldControlProps,
    ...darkNumberInputStyles.inputProps,
    h: "43px",
    px: "12px",
    fontSize: "16px",
    fontWeight: "normal" as const,
    bg: "ui.PLCDataSettingsTable.inputBg",
    color: "ui.PLCDataSettingsTable.inputText",
    borderWidth: "1px",
    borderColor: "transparent",
    _hover: { ...darkFieldControlProps._hover, ...inputHoverBorder },
    _focus: {
      ...darkFieldControlProps._focus,
      borderColor: "ui.PLCDataSettingsTable.actionHover !important",
    },
    _focusVisible: {
      ...darkFieldControlProps._focusVisible,
      borderColor: "ui.PLCDataSettingsTable.actionHover !important",
    },
  }

  const numberControlMerged = {
    ...darkNumberInputStyles.controlProps,
    borderRadius: "7px",
  }

  if (loadingSettings) {
    return (
      <Flex justify="center" align="center" h="200px" p="24px">
        <Spinner size="xl" color="ui.Interactive.accent" />
      </Flex>
    )
  }
  if (error) {
    return (
      <Text color="ui.Form.errorText" p="24px">
        {t("errors.loadingSettingsPrefix")} {error.message}
      </Text>
    )
  }

  return (
    <Box w="100%" p="24px">
      <Box
        display="grid"
        w="100%"
        gap="16px"
        gridTemplateColumns={{
          base: "minmax(0, 1fr)",
          md: "repeat(2, minmax(0, 1fr))",
          lg: "repeat(3, minmax(0, 1fr))",
        }}
      >
        {localData.map((row) => {
          const labelText = row.data_text || t("labels.dataWithId", { id: row.data_id })
          const collection = textlistCollections.get(row.id)
          const listDisplay =
            row.data !== null &&
            row.data !== undefined &&
            row.textlist_entries?.[row.data.toString()]
          const selectOpen = !!openSelectByRowId[row.id]

          return (
            <Flex
              key={row.id}
              borderWidth="1px"
              borderStyle="solid"
              borderColor="ui.PLCDataSettingsTable.cardBorder"
              borderRadius="8px"
              p="16px"
              bg="ui.PLCDataSettingsTable.cardBg"
              direction="column"
              h="100%"
            >
              <Box display="flex" flexDirection="column" h="100%">
                <Text
                  as="div"
                  fontSize="16px"
                  fontWeight="normal"
                  color="ui.PLCDataSettingsTable.labelText"
                  mb="16px"
                >
                  {labelText}
                </Text>

                <Flex align="center" gap={0} w="100%" mt="auto">
                  <Box flex="1" minW={0}>
                    {row.input_type === "textlist" && row.textlist_entries && collection ? (
                      <Select.Root
                        collection={collection}
                        w="100%"
                        value={listDisplay ? [listDisplay as string] : []}
                        onValueChange={(details) => {
                          handleChange(row.id, details.value[0] ?? "")
                        }}
                        onOpenChange={(e) => {
                          setOpenSelectByRowId((prev) => ({
                            ...prev,
                            [row.id]: e.open,
                          }))
                        }}
                        positioning={{
                          strategy: "fixed",
                          hideWhenDetached: true,
                        }}
                      >
                        <Select.HiddenSelect />
                        <Select.Control>
                          <Select.Trigger {...selectTriggerMerged}>
                            <Select.ValueText
                              placeholder={t("placeholder.selectOption")}
                              color={
                                listDisplay
                                  ? "ui.PLCDataSettingsTable.inputText"
                                  : MUTED_TEXT
                              }
                            />
                          </Select.Trigger>
                          <Select.IndicatorGroup>
                            <Select.Indicator
                              display="inline-flex"
                              transition="transform 0.2s ease, color 0.2s ease"
                              color={
                                selectOpen
                                  ? "ui.PLCDataSettingsTable.selectIndicatorOpen"
                                  : "ui.PLCDataSettingsTable.selectIndicatorIdle"
                              }
                              transform={selectOpen ? "rotate(180deg)" : "rotate(0deg)"}
                            />
                          </Select.IndicatorGroup>
                        </Select.Control>
                        <Select.Positioner>
                          <Select.Content {...selectContentProps}>
                            {collection.items.map((item) => (
                              <Select.Item
                                key={item.value || "__empty__"}
                                item={item}
                                {...selectItemProps}
                              >
                                <Select.ItemText>{item.label}</Select.ItemText>
                              </Select.Item>
                            ))}
                          </Select.Content>
                        </Select.Positioner>
                      </Select.Root>
                    ) : row.input_type === "boolean" ? (
                      <Flex
                        alignItems="center"
                        justifyContent="space-between"
                        gap={2}
                        w="100%"
                        minH="43px"
                      >
                        <Text
                          flex="1"
                          wordBreak="break-word"
                          fontSize="16px"
                          fontWeight="normal"
                          color="ui.PLCDataSettingsTable.inputText"
                        >
                          {row.data ? t("status.enabled") : t("status.disabled")}
                        </Text>
                        <Switch.Root
                          checked={!!row.data}
                          onCheckedChange={(details) =>
                            handleChange(row.id, details.checked)
                          }
                        >
                          <Switch.HiddenInput />
                          <Switch.Control>
                            <Switch.Thumb />
                          </Switch.Control>
                        </Switch.Root>
                      </Flex>
                    ) : (
                      <NumberInput.Root
                        value={toInputValue(row.data)}
                        onValueChange={(details) => handleChange(row.id, details.value)}
                        min={0}
                        {...darkNumberInputStyles.rootProps}
                      >
                        <NumberInput.Input
                          as={Input}
                          type="text"
                          inputMode="numeric"
                          {...numberInputMerged}
                        />

                        <NumberInput.Control {...numberControlMerged}>
                          <NumberInput.IncrementTrigger
                            aria-label={t("a11y.incrementValue")}
                            {...darkNumberInputStyles.triggerBaseProps}
                            {...darkNumberInputStyles.incrementTriggerProps}
                            bg="ui.PLCDataSettingsTable.inputBg"
                          >
                            <Box
                              {...darkNumberInputStyles.iconBoxProps}
                              transform="rotate(-90deg)"
                            />
                          </NumberInput.IncrementTrigger>
                          <NumberInput.DecrementTrigger
                            aria-label={t("a11y.decrementValue")}
                            {...darkNumberInputStyles.triggerBaseProps}
                            {...darkNumberInputStyles.decrementTriggerProps}
                            bg="ui.PLCDataSettingsTable.inputBg"
                          >
                            <Box
                              {...darkNumberInputStyles.iconBoxProps}
                              transform="rotate(90deg)"
                            />
                          </NumberInput.DecrementTrigger>
                        </NumberInput.Control>
                      </NumberInput.Root>
                    )}
                  </Box>

                  <Flex
                    w="40px"
                    pl="16px"
                    shrink={0}
                    align="center"
                    justify="center"
                    minH="43px"
                  >
                    {row.isModified && (
                      <RevertChangeButton onRevert={() => handleRevert(row.id)} />
                    )}
                  </Flex>
                </Flex>
              </Box>
            </Flex>
          )
        })}
      </Box>

      <Flex my="24px" justify="flex-end" align="center" gap={3} w="100%">
        <CommandStatusDisplay status={commandStatus.status} message={commandStatus.message} />
        <ButtonCustom
          onClick={handleSaveAll}
          loading={isSaving || commandStatus.status === "sending"}
          disabled={isSaving || commandStatus.status === "sending"}
        >
          {t("actions.saveChanges")}
        </ButtonCustom>
      </Flex>
    </Box>
  )
}

export default PLCDataSettingsTable

