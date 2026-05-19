/**
 * Global not-found view: localized copy, home navigation, and minimal layout used outside the authenticated shell when needed.
 * Consumes the `not-found` i18n namespace and Chakra primitives for consistent typography with auth pages.
 */

import { Center, Flex, Text } from "@chakra-ui/react"
import { Link } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"

import { ButtonCustom } from "@/components_2/ui/ButtonCustom"

const NotFound = () => {
  const { t } = useTranslation("not-found")

  return (
    <Flex
      height="100vh"
      align="center"
      justify="center"
      flexDir="column"
      data-testid="not-found"
      p={4}
    >
      <Flex alignItems="center" zIndex={1}>
        <Flex flexDir="column" ml={4} align="center" justify="center" p={4}>
          <Text
            fontSize={{ base: "6xl", md: "8xl" }}
            fontWeight="bold"
            lineHeight="1"
            mb={4}
          >
            {t("title")}
          </Text>
          <Text fontSize="2xl" fontWeight="bold" mb={2}>
            {t("heading")}
          </Text>
        </Flex>
      </Flex>

      <Text fontSize="lg" color="gray.600" mb={4} textAlign="center" zIndex={1}>
        {t("description")}
      </Text>
      <Center zIndex={1}>
        <Link to="/">
          <ButtonCustom mt={4} alignSelf="center">
            {t("actions.goBack")}
          </ButtonCustom>
        </Link>
      </Center>
    </Flex>
  )
}

export default NotFound

