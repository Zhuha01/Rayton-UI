/**
 * Inline translucent badge highlighting the active station label in dashboards.
 * Accepts ordinary Box props for spacing while keeping typography consistent.
 */

import { Box, type BoxProps, Text } from "@chakra-ui/react"

export interface StationBadgeProps extends BoxProps {
  name: string
}

export function StationBadge({ name, ...props }: StationBadgeProps) {
  return (
    <Box
      px={3}
      py={1.5}
      bg="ui.Badge.transparentBg"
      borderRadius="lg"
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      minH="32px"
      {...props}
    >
      <Text
        fontSize="sm"
        fontWeight="medium"
        color="rgba(255, 255, 255, 0.9)"
        textAlign="center"
        whiteSpace="nowrap"
      >
        {name}
      </Text>
    </Box>
  )
}
