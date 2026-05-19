/**
 * Management Control Card within the Rayton operator UI (components_2/Pages/control/ManagementControlCard.tsx).
 * Built with Chakra UI and shared theme tokens to stay consistent with dashboards, management, and control surfaces.
 * Primary contract: exported component props and functions below (see TypeScript types for required fields).
 */
import { Box, Button, Flex, Spinner, Text } from "@chakra-ui/react"
import { Icon } from "@chakra-ui/react"
import { useTranslation } from "react-i18next"
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa"
import { StartStopButtons } from "@/components_2/ui/StartStopButtons"
import { AutomationToggleSwitch } from "@/components_2/ui/AutomationToggleSwitch"
import { PlcModeSelect } from "@/components_2/ui/PlcModeSelect"
import { plcControlUi } from "./controlUi"
import type { PlcCommandStatus, PlcControlRow, PlcControlStatusMap } from "./PLCControlView"

/** Horizontal dividers use fill plus explicit pixel `style` heights; desktop verticals use borders so thin flex tracks stay crisp. */
const managementDivider = (() => {
  const px = plcControlUi.managementCard.dividerThicknessPx
  const bg = plcControlUi.managementCard.dividerColor
  return {
    bg,
    hLine: { height: px, minHeight: px, maxHeight: px } as const,
    borderW: `${px}px`,
  }
})()

function ManagementDividerVertical() {
  return (
    <Box
      alignSelf="stretch"
      flexShrink={0}
      flexGrow={0}
      w={0}
      boxSizing="content-box"
      borderLeftWidth={managementDivider.borderW}
      borderLeftStyle="solid"
      borderLeftColor={managementDivider.bg}
      aria-hidden
    />
  )
}

const CommandStatusDisplay = ({ status }: { status: PlcCommandStatus }) => {
  if (status === "idle") return null

  if (status === "sending" || status === "sent") {
    return (
      <Flex
        alignItems="center"
        gap={plcControlUi.layout.rowGap}
        color={plcControlUi.status.sendingColor}
        minW={plcControlUi.layout.statusIconMinW}
      >
        <Spinner size="xl" color="ui.Interactive.accent" />
      </Flex>
    )
  }

  if (status === "confirmation_received") {
    return (
      <Flex
        alignItems="center"
        gap={plcControlUi.layout.rowGap}
        color={plcControlUi.status.okColor}
        minW={plcControlUi.layout.statusIconMinW}
      >
        <Icon as={FaCheckCircle} fontSize="lg" />
      </Flex>
    )
  }

  if (status === "failed") {
    return (
      <Flex
        alignItems="center"
        gap={plcControlUi.layout.rowGap}
        color={plcControlUi.status.failColor}
        minW={plcControlUi.layout.statusIconMinW}
      >
        <Icon as={FaTimesCircle} fontSize="lg" />
      </Flex>
    )
  }

  return null
}

const buildModeSelectProps = (
  selectRow: PlcControlRow,
  t: (key: string) => string,
) => ({
  valueKey:
    selectRow.data !== null && selectRow.data !== undefined
      ? selectRow.data.toString()
      : null,
  entries: selectRow.textlist_entries,
  placeholder: t("management.modePlaceholder"),
  triggerFontSize: plcControlUi.managementCard.select.fontSize,
})

export function ManagementControlCard({
  rows,
  controlStatus,
  onChange,
  onStateButtonClick,
  onDualButtonClick,
}: {
  rows: PlcControlRow[]
  controlStatus: PlcControlStatusMap
  onChange: (id: number, value: string | boolean | number) => void
  onStateButtonClick: (id: number) => void
  onDualButtonClick: (id: number, value: number) => void
}) {
  const automationRow = rows.find((r) => r.control_type === 146 || r.control_type === 145)
  const selectRow = rows.find((r) => r.control_type === 1)
  const pickRow = rows.find((r) => r.control_type === 141)
  const startStopRow = rows.find((r) => r.control_type === 142)

  const { t } = useTranslation("control")
  const currentStatusPick = pickRow ? controlStatus[pickRow.id]?.status || "idle" : "idle"
  const currentStatusStartStop = startStopRow
    ? controlStatus[startStopRow.id]?.status || "idle"
    : "idle"

  return (
    <Box
      bg={plcControlUi.managementCard.bg}
      minH={plcControlUi.managementCard.minHeight}
      h={{ base: "auto", md: plcControlUi.managementCard.desktopHeight }}
      borderRadius={plcControlUi.managementCard.radius}
      boxShadow={plcControlUi.managementCard.shadow}
      overflow="hidden"
      display="flex"
      alignItems={{ base: "stretch", md: "center" }}
    >
      {/* Desktop: single horizontal row with vertical separators */}
      <Flex
        display={{ base: "none", md: "flex" }}
        w="100%"
        minH="100%"
        px={plcControlUi.managementCard.paddingX}
        py={plcControlUi.managementCard.paddingY}
        align="center"
        justify="space-between"
        gap={4}
        flexWrap="nowrap"
      >
        <Flex align="center" gap={4} flexShrink={0}>
          <Text
            fontWeight="bold"
            fontSize={plcControlUi.managementCard.titleFontSize}
            lineHeight="normal"
            color={plcControlUi.managementCard.titleColor}
            whiteSpace="nowrap"
          >
            {t("management.automation")}
          </Text>
          {automationRow && (
            <AutomationToggleSwitch
              checked={automationRow.data === 1}
              onCheckedChange={(checked) => onChange(automationRow.id, checked)}
              trackBg={plcControlUi.managementCard.toggleTrackBg}
            />
          )}
        </Flex>

        <ManagementDividerVertical />

        <Flex flex="1" minW="320px" maxW="469px">
          {selectRow ? (
            <PlcModeSelect
              {...buildModeSelectProps(selectRow, t)}
              onChangeValueText={(valueText) => onChange(selectRow.id, valueText)}
            />
          ) : (
            <Box />
          )}
        </Flex>

        {pickRow && (
          <Button
            bg={plcControlUi.managementCard.pickButton.bg}
            borderRadius={plcControlUi.managementCard.pickButton.radius}
            px={plcControlUi.managementCard.pickButton.px}
            py={plcControlUi.managementCard.pickButton.py}
            fontSize={plcControlUi.managementCard.pickButton.fontSize}
            color={plcControlUi.managementCard.pickButton.color}
            _hover={{
              bg: plcControlUi.managementCard.pickButton.hoverBg,
              color: plcControlUi.managementCard.pickButton.hoverColor,
            }}
            onClick={() => onStateButtonClick(pickRow.id)}
            flexShrink={0}
          >
            {currentStatusPick === "sending" || currentStatusPick === "sent"
              ? t("management.picked")
              : t("management.pick")}
          </Button>
        )}

        <Flex
          align="center"
          alignSelf="stretch"
          gap={plcControlUi.managementCard.dividerToStartStopGap}
          flexShrink={0}
        >
          <ManagementDividerVertical />
          {startStopRow && (
            <Flex align="center" gap={3} flexShrink={0}>
              <StartStopButtons
                isStartActive={startStopRow.data === 1}
                isStopActive={startStopRow.data === 0}
                isInCommunication={
                  currentStatusStartStop === "sending" || currentStatusStartStop === "sent"
                }
                onStart={() => onDualButtonClick(startStopRow.id, 1)}
                onStop={() => onDualButtonClick(startStopRow.id, 0)}
              />
              <CommandStatusDisplay status={currentStatusStartStop} />
            </Flex>
          )}
        </Flex>
      </Flex>

      {/* Mobile: full-width dividers; line spacing comes from column gap and row padding only */}
      <Flex
        display={{ base: "flex", md: "none" }}
        direction="column"
        w="100%"
        px={0}
        pt={plcControlUi.managementCard.mobilePaddingY}
        pb={plcControlUi.managementCard.mobilePaddingY}
        gap={plcControlUi.managementCard.mobilePaddingY}
        align="stretch"
      >
        <Flex
          justify="space-between"
          align="center"
          w="100%"
          minH="40px"
          px={plcControlUi.managementCard.paddingXMobile}
        >
          <Text
            fontWeight="bold"
            fontSize={plcControlUi.managementCard.titleFontSize}
            lineHeight="normal"
            color={plcControlUi.managementCard.titleColor}
            whiteSpace="nowrap"
          >
            {t("management.automation")}
          </Text>
          {automationRow && (
            <AutomationToggleSwitch
              checked={automationRow.data === 1}
              onCheckedChange={(checked) => onChange(automationRow.id, checked)}
              trackBg={plcControlUi.managementCard.toggleTrackBg}
            />
          )}
        </Flex>

        <Box
          alignSelf="stretch"
          flexShrink={0}
          flexGrow={0}
          bg={managementDivider.bg}
          style={managementDivider.hLine}
        />

        <Flex
          w="100%"
          align="center"
          gap={3}
          flexWrap="nowrap"
          px={plcControlUi.managementCard.paddingXMobile}
        >
          <Box flex="1" minW={0}>
            {selectRow ? (
              <PlcModeSelect
                {...buildModeSelectProps(selectRow, t)}
                onChangeValueText={(valueText) => onChange(selectRow.id, valueText)}
              />
            ) : null}
          </Box>
          {pickRow && (
            <Button
              flexShrink={0}
              bg={plcControlUi.managementCard.pickButton.bg}
              borderRadius={plcControlUi.managementCard.pickButton.radius}
              px={plcControlUi.managementCard.pickButton.px}
              py={plcControlUi.managementCard.pickButton.py}
              fontSize={plcControlUi.managementCard.pickButton.fontSize}
              color={plcControlUi.managementCard.pickButton.color}
              _hover={{
                bg: plcControlUi.managementCard.pickButton.hoverBg,
                color: plcControlUi.managementCard.pickButton.hoverColor,
              }}
              onClick={() => onStateButtonClick(pickRow.id)}
            >
              {currentStatusPick === "sending" || currentStatusPick === "sent"
                ? t("management.picked")
                : t("management.pick")}
            </Button>
          )}
        </Flex>

        <Box
          alignSelf="stretch"
          flexShrink={0}
          flexGrow={0}
          bg={managementDivider.bg}
          style={managementDivider.hLine}
        />

        {startStopRow && (
          <Flex
            align="center"
            gap={3}
            w="100%"
            justify="space-between"
            px={plcControlUi.managementCard.paddingXMobile}
          >
            <Box flex="1" minW={0}>
              <StartStopButtons
                isStartActive={startStopRow.data === 1}
                isStopActive={startStopRow.data === 0}
                isInCommunication={
                  currentStatusStartStop === "sending" || currentStatusStartStop === "sent"
                }
                onStart={() => onDualButtonClick(startStopRow.id, 1)}
                onStop={() => onDualButtonClick(startStopRow.id, 0)}
              />
            </Box>
            <CommandStatusDisplay status={currentStatusStartStop} />
          </Flex>
        )}
      </Flex>
    </Box>
  )
}
