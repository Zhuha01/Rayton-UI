/**
 * Narrow-width chip for displaying the selected plant name beside chart toolbar actions.
 * Truncates with ellipsis on small breakpoints so SOC and export controls retain space.
 */

import { Box, Text } from "@chakra-ui/react"

export interface StationNameBadgeProps {
  name: string
}

export function StationNameBadge({ name }: StationNameBadgeProps) {
  return (
    <Box
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      px="16px"
      py="10px"
      borderRadius="8px"
      width={{ base: "140px", md: "fit-content" }}
      flexShrink={1}
      bg="ui.StationNameBadge.background"
    >
      <Text
        fontSize="14px"
        fontWeight="500"
        lineHeight="1"
        whiteSpace="nowrap"
        overflow={{ base: "hidden", md: "visible" }}
        textOverflow={{ base: "ellipsis", md: "clip" }}
        color="text.normal"
      >
        {name}
      </Text>
    </Box>
  )
}
