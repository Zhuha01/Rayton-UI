/**
 * Full-width sidebar search input with embedded magnifier icon aligned to semantic tokens.
 * Forwards typed value updates for filtering linked navigation items upstream.
 */

import { Box, Icon, Input } from "@chakra-ui/react"
import { Search } from "lucide-react"
import type { Dispatch, SetStateAction } from "react"

interface SidebarSearchProps {
  value: string
  onChange: Dispatch<SetStateAction<string>>
  placeholder?: string
}

export function SidebarSearch({
  value,
  onChange,
  placeholder = "Search station...",
}: SidebarSearchProps) {
  return (
    <Box position="relative" w="192px" flexShrink={0} alignSelf="flex-start">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        w="full"
        h="40px"
        bg="ui.Sidebar.search_bg"
        borderWidth="1px"
        borderStyle="solid"
        borderColor="ui.Sidebar.search_border"
        borderRadius="12px"
        color="ui.Sidebar.item_text_default"
        fontSize="14px"
        fontWeight="medium"
        ps="48px"
        pe="16px"
        outline="none"
        transition="all 0.2s ease-in-out"
        _placeholder={{
          color: "ui.Sidebar.search_placeholder",
        }}
        // Hover/focus border color comes from Sidebar semantic tokens.
        _hover={{
          borderColor: "ui.Interactive.accent",
          bg: "ui.Sidebar.search_bg",
        }}
        _focusVisible={{
          outline: "none",
          boxShadow: "none",
          borderColor: "ui.Interactive.accent",
          borderWidth: "1.5px",
        }}
      />

      <Box
        as="span"
        position="absolute"
        left="16px"
        top="50%"
        transform="translateY(-50%)"
        display="flex"
        alignItems="center"
        pointerEvents="none"
        zIndex={2}
      >
        <Icon as={Search} color="ui.Sidebar.search_icon" boxSize="20px" />
      </Box>
    </Box>
  )
}
