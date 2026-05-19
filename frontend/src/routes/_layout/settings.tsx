/**
 * User settings route: hosts profile editing and account deletion for the authenticated user inside the main layout.
 * Reads the current session from `useAuth` and delegates form work to dedicated settings components.
 */

import { Box, Container, Flex } from "@chakra-ui/react"
import { createFileRoute } from "@tanstack/react-router"

import DeleteAccount from "@/components_2/Pages/UserSettings/DeleteAccount"
import SettingsForm from "@/components_2/Pages/UserSettings/SettingsForm"
import useAuth from "@/hooks/useAuth"

export const Route = createFileRoute("/_layout/settings")({
  component: UserSettings,
})

function UserSettings() {
  const { user: currentUser } = useAuth()

  if (!currentUser) {
    return null
  }

  return (
    <Container maxW="full" py="24px" px={{ base: "16px", md: "24px" }}>
      <Flex w="full" justify={{ base: "center", lg: "flex-start" }}>
        <Flex
          w="full"
          maxW={{ base: "552px", lg: "1120px" }}
          direction={{ base: "column", lg: "row" }}
          justify="flex-start"
          align={{ base: "stretch", lg: "flex-start" }}
          gap="16px"
        >
          <Box w={{ base: "100%", md: "552px" }}>
            <SettingsForm />
          </Box>

          {!currentUser.is_superuser && (
            <Box w={{ base: "100%", md: "552px" }}>
              <DeleteAccount />
            </Box>
          )}
        </Flex>
      </Flex>
    </Container>
  )
}
