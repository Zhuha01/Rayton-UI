/**
 * Start Stop Buttons within the Rayton operator UI (components_2/ui/StartStopButtons.tsx).
 * Built with Chakra UI and shared theme tokens to stay consistent with dashboards, management, and control surfaces.
 * Primary contract: exported component props and functions below (see TypeScript types for required fields).
 */
import { Button, Flex } from "@chakra-ui/react"
import { useTranslation } from "react-i18next"
import { FaPlay, FaStop } from "react-icons/fa"
import { plcControlUi } from "@/components_2/Pages/control/controlUi"

export function StartStopButtons({
  isStartActive,
  isStopActive,
  isInCommunication,
  onStart,
  onStop,
}: {
  isStartActive: boolean
  isStopActive: boolean
  isInCommunication?: boolean
  onStart: () => void
  onStop: () => void
}) {
  const { t } = useTranslation("control")
  const desktopMinW = plcControlUi.managementCard.startButton.desktopMinW
  const desktopH = plcControlUi.managementCard.startButton.desktopHeight

  return (
    <Flex
      w="100%"
      gap={plcControlUi.managementCard.startStopButtonsGap}
      flexWrap={{ base: "wrap", md: "nowrap" }}
      align={{ md: "stretch" }}
    >
      <Button
        flex={{ base: "1", md: "1 1 0%" }}
        minW={{ base: undefined, md: desktopMinW }}
        h={{ base: "auto", md: desktopH }}
        aria-pressed={isStartActive}
        aria-busy={Boolean(isInCommunication)}
        bg={plcControlUi.managementCard.startButton.bg}
        borderRadius={plcControlUi.managementCard.startButton.radius}
        px={plcControlUi.managementCard.startButton.px}
        py={{ base: plcControlUi.managementCard.startButton.py, md: 0 }}
        alignItems="center"
        justifyContent="center"
        fontSize={plcControlUi.managementCard.startButton.fontSize}
        color={plcControlUi.managementCard.startButton.color}
        display="flex"
        gap={plcControlUi.managementCard.startButton.gap}
        textTransform="uppercase"
        _hover={{
          bg: plcControlUi.managementCard.startButton.hoverBg,
          color: plcControlUi.managementCard.startButton.hoverColor,
        }}
        onClick={onStart}
      >
        <FaPlay style={{ color: "currentColor" }} /> {t("actions.start")}
      </Button>
      <Button
        flex={{ base: "1", md: "1 1 0%" }}
        minW={{ base: undefined, md: plcControlUi.managementCard.stopButton.desktopMinW }}
        h={{ base: "auto", md: plcControlUi.managementCard.stopButton.desktopHeight }}
        aria-pressed={isStopActive}
        aria-busy={Boolean(isInCommunication)}
        bg={plcControlUi.managementCard.stopButton.bg}
        borderRadius={plcControlUi.managementCard.stopButton.radius}
        px={plcControlUi.managementCard.stopButton.px}
        py={{ base: plcControlUi.managementCard.stopButton.py, md: 0 }}
        alignItems="center"
        justifyContent="center"
        fontSize={plcControlUi.managementCard.stopButton.fontSize}
        color={plcControlUi.managementCard.stopButton.color}
        borderColor={plcControlUi.managementCard.stopButton.borderColor}
        borderWidth={plcControlUi.managementCard.stopButton.borderWidth}
        boxShadow={plcControlUi.managementCard.stopButton.boxShadow}
        display="flex"
        gap={plcControlUi.managementCard.stopButton.gap}
        textTransform="uppercase"
        _hover={{
          bg: plcControlUi.managementCard.stopButton.hoverBg,
          color: plcControlUi.managementCard.stopButton.hoverColor,
          borderColor: plcControlUi.managementCard.stopButton.hoverBorderColor,
          boxShadow: plcControlUi.managementCard.stopButton.hoverShadow,
        }}
        onClick={onStop}
      >
        <FaStop style={{ color: "currentColor" }} /> {t("actions.stop")}
      </Button>
    </Flex>
  )
}
