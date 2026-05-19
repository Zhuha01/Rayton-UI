/**
 * Presents auth-related forms inside a styled card with accent title and subtitle.
 * Handles optional error text and wraps children in a semantic form with shared spacing.
 */

import { Box, Heading, Text, VStack } from "@chakra-ui/react"
import type * as React from "react"

interface AuthCardProps {
  children: React.ReactNode
  titlePrefix: React.ReactNode
  titleHighlight: React.ReactNode
  subtitle: React.ReactNode
  onSubmit: React.FormEventHandler<HTMLDivElement>
  errorMessage?: string
}

export function AuthCard({
  children,
  titlePrefix,
  titleHighlight,
  subtitle,
  onSubmit,
  errorMessage,
}: AuthCardProps) {
  return (
    <Box
      bg="ui.AuthCard.background"
      borderRadius="16px"
      w="full"
      maxW="512px"
      px={{ base: "24px", md: "55px" }}
      py="24px"
    >
      <VStack as="form" onSubmit={onSubmit} gap="16px" align="stretch">
        <Heading
          as="h1"
          textAlign="center"
          fontSize={{ base: "1.875rem", md: "2.25rem" }}
          lineHeight="1.2"
          fontWeight="bold"
          cursor="default"
        >
          {titlePrefix}{" "}
          <Text as="span" color="ui.Interactive.accent">
            {titleHighlight}
          </Text>
        </Heading>

        <Text
          color="text.muted"
          textAlign="center"
          fontSize="1rem"
          lineHeight="1.2"
          fontWeight="normal"
          cursor="default"
        >
          {subtitle}
        </Text>

        {errorMessage && (
          <Text color="ui.Form.errorText" fontSize="0.875rem" textAlign="center">
            {errorMessage}
          </Text>
        )}

        {children}
      </VStack>
    </Box>
  )
}
