/**
 * PLCControl View within the Rayton operator UI (components_2/Pages/control/PLCControlView.tsx).
 * Built with Chakra UI and shared theme tokens to stay consistent with dashboards, management, and control surfaces.
 * Primary contract: exported component props and functions below (see TypeScript types for required fields).
 */
import { Box, VStack } from "@chakra-ui/react"
import { plcControlUi } from "./controlUi"
import { ManagementControlCard } from "./ManagementControlCard"
import { PlcStatusIndicatorsCard } from "./PlcStatusIndicatorsCard"
import { SchematicViewerCard } from "./SchematicViewerCard"
import { StatusControlCard } from "./StatusControlCard"

export type PlcCommandStatus =
  | "idle"
  | "sending"
  | "sent"
  | "confirmation_received"
  | "failed"

export type PlcControlStatusMap = Record<
  number,
  { status: PlcCommandStatus; message?: string }
>

export type PlcControlRow = {
  id: number
  data_id: number
  data_text?: string | null
  data: number | null
  control_type: number
  input_type?: string | null
  textlist_entries?: Record<string, string> | null
}

export function PLCControlView({
  statusData,
  controlData,
  statusIndicators,
  controlStatus,
  onChange,
  onStateButtonClick,
  onDualButtonClick,
}: {
  statusData: PlcControlRow[]
  controlData: PlcControlRow[]
  /** Indicator rows (`control_type` 4 or 100–199), sorted by `data_id`. */
  statusIndicators: PlcControlRow[]
  controlStatus: PlcControlStatusMap
  onChange: (id: number, value: string | boolean | number) => void
  onStateButtonClick: (id: number) => void
  onDualButtonClick: (id: number, value: number) => void
}) {
  const hasIndicators = statusIndicators.length > 0
  const controlType1 = controlData.find((r) => r.control_type === 1)
  const selectedModeLabel =
    controlType1?.textlist_entries &&
    controlType1.data !== null &&
    controlType1.data !== undefined
      ? controlType1.textlist_entries[controlType1.data.toString()] ??
        controlType1.data.toString()
      : ""

  const outerPx = {
    base: plcControlUi.layout.containerPaddingMobile,
    md: plcControlUi.layout.containerPadding,
  }
  const outerPy = {
    base: plcControlUi.layout.containerPaddingMobile,
    md: plcControlUi.layout.containerPadding,
  }
  const sectionGap = {
    base: plcControlUi.layout.sectionGapMobile,
    md: plcControlUi.layout.sectionGap,
  }

  return (
    <VStack w="100%" px={outerPx} py={outerPy} align="stretch" gap={0}>
      <VStack gap={sectionGap} align="stretch" minW={0}>
        <StatusControlCard rows={statusData} activeModeLabel={selectedModeLabel} />
        <ManagementControlCard
          rows={controlData}
          controlStatus={controlStatus}
          onChange={onChange}
          onStateButtonClick={onStateButtonClick}
          onDualButtonClick={onDualButtonClick}
        />
      </VStack>
      {hasIndicators ? (
        <Box mt={plcControlUi.layout.indicatorsBlockMarginTop} minW={0}>
          <PlcStatusIndicatorsCard rows={statusIndicators} />
        </Box>
      ) : null}
      <Box mt={plcControlUi.layout.indicatorsBlockMarginTop} minW={0}>
        <SchematicViewerCard />
      </Box>
    </VStack>
  )
}

