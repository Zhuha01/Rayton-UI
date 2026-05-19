/**
 * Delete Account within the Rayton operator UI (components_2/Pages/UserSettings/DeleteAccount.tsx).
 * Built with Chakra UI and shared theme tokens to stay consistent with dashboards, management, and control surfaces.
 * Primary contract: exported component props and functions below (see TypeScript types for required fields).
 */
import { Box, Heading, Text } from "@chakra-ui/react"
import { useTranslation } from "react-i18next"

import { userSettingsUi } from "@/components_2/Pages/UserSettings/userSettingsUi"
import DeleteConfirmation from "./DeleteConfirmation"

const DeleteAccount = () => {
  const { t } = useTranslation("userSettings")

  return (
    <Box
      bg={userSettingsUi.card.bg}
      borderRadius={userSettingsUi.card.borderRadius}
      p={{ base: "16px", md: "20px" }}
      w="full"
    >
      <Heading
        fontSize={{ base: "16px", md: "18px" }}
        fontWeight="bold"
        color={userSettingsUi.title.color}
        mb={{ base: "8px", md: "12px" }}
      >
        {t("deleteAccount.heading")}
      </Heading>

      <Box
        role="separator"
        aria-hidden
        w="full"
        flexShrink={0}
        borderTopWidth="1px"
        borderTopStyle="solid"
        borderTopColor={userSettingsUi.divider.bg}
        opacity={userSettingsUi.divider.opacity}
        mb={{ base: "10px", md: "12px" }}
      />

      <Text color={userSettingsUi.mutedLabel.color} fontSize="14px">
        {t("deleteAccount.description")}
      </Text>

      <Box mt="12px">
        <DeleteConfirmation />
      </Box>
    </Box>
  )
}
export default DeleteAccount
