/**
 * Command Status Display within the Rayton operator UI (components_2/Pages/schedule/ScheduleControlTable/CommandStatusDisplay.tsx).
 * Built with Chakra UI and shared theme tokens to stay consistent with dashboards, management, and control surfaces.
 * Primary contract: exported component props and functions below (see TypeScript types for required fields).
 */
import { Flex, Icon, Spinner, Text } from "@chakra-ui/react"
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa"
import { SCHEDULE_UI } from "../scheduleUi"

export type CommandStatus = "idle" | "sending" | "success" | "failed"

export function CommandStatusDisplay({
  status,
  message,
}: {
  status: CommandStatus
  message?: string
}) {
  if (status === "idle") return null

  if (status === "sending") {
    return (
      <Flex
        alignItems="center"
        gap={2}
        color={SCHEDULE_UI.commandStatus.colors.sending}
        minW={SCHEDULE_UI.commandStatus.minW}
      >
        <Spinner size="xl" color="ui.Interactive.accent" />
      </Flex>
    )
  }

  if (status === "success") {
    return (
      <Flex
        alignItems="center"
        gap={2}
        color={SCHEDULE_UI.commandStatus.colors.success}
        minW={SCHEDULE_UI.commandStatus.minW}
      >
        <Icon as={FaCheckCircle} fontSize="lg" />
        <Text fontSize="sm" fontWeight="medium">
          {message || "Success"}
        </Text>
      </Flex>
    )
  }

  if (status === "failed") {
    return (
      <Flex
        alignItems="center"
        gap={2}
        color={SCHEDULE_UI.commandStatus.colors.failed}
        minW={SCHEDULE_UI.commandStatus.minW}
      >
        <Icon as={FaTimesCircle} fontSize="lg" />
        <Text fontSize="sm" fontWeight="medium">
          {message || "Failed"}
        </Text>
      </Flex>
    )
  }

  return null
}
