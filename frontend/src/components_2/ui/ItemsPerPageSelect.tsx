/**
 * Compact control for choosing how many rows to show per page in management lists.
 * Uses pagination semantic tokens and responsive label text (full vs short).
 */

import { Box, Flex, Portal, Text } from "@chakra-ui/react"
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import {
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuTrigger,
} from "@/components_2/ui/Menu"

const DEFAULT_OPTIONS = [6, 10, 14, 18] as const

export interface ItemsPerPageSelectProps {
  value: number
  onChange: (next: number) => void
  options?: readonly number[]
  label?: string
}

export function ItemsPerPageSelect({
  value,
  onChange,
  options = DEFAULT_OPTIONS,
  label,
}: ItemsPerPageSelectProps) {
  const { t } = useTranslation("management")
  const [open, setOpen] = useState(false)
  const [hover, setHover] = useState(false)

  const effectiveLabel = label ?? t("common.pagination.itemsPerPage")

  const normalizedOptions = useMemo(() => {
    const unique = Array.from(new Set(options))
    return unique.filter((n) => Number.isFinite(n)).sort((a, b) => a - b)
  }, [options])

  const isActive = open || hover
  const buttonBg = isActive
    ? "ui.Pagination.selectHoverBg"
    : "ui.Pagination.selectBg"
  const iconColor = isActive
    ? "ui.Pagination.selectIconActive"
    : "ui.Pagination.selectIconIdle"

  const iconRotation = open ? "rotate(-90deg)" : "rotate(90deg)"

  return (
    <Flex gap="16px" alignItems="center">
      <Text
        fontSize="14px"
        color="ui.Pagination.itemText"
        whiteSpace="nowrap"
      >
        <Box as="span" display={{ base: "none", md: "inline" }}>
          {effectiveLabel}
        </Box>
        <Box as="span" display={{ base: "inline", md: "none" }}>
          {t("common.pagination.itemsShort")}
        </Box>
      </Text>

      <MenuRoot
        open={open}
        onOpenChange={(e) => setOpen(e.open)}
        positioning={{ placement: "bottom-start", gutter: 6, sameWidth: true }}
      >
        <MenuTrigger asChild>
          <Box
            as="button"
            display="flex"
            alignItems="center"
            justifyContent="center"
            gap="8px"
            h="35px"
            px="8px"
            borderRadius="8px"
            bg={buttonBg}
            color="ui.Pagination.itemText"
            cursor="pointer"
            transition="background 0.2s ease"
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
          >
            <Text fontSize="14px" fontWeight="semibold" lineHeight="normal">
              {value}
            </Text>
            <Box display="flex" alignItems="center" justifyContent="center">
              <Box
                transform={iconRotation}
                color={iconColor}
                transition="transform 0.2s ease, color 0.2s ease"
                display="flex"
              >
                <Box
                  w="10px"
                  h="10px"
                  bg="currentColor"
                  style={{
                    maskImage: "url(/assets/icons/str.svg)",
                    WebkitMaskImage: "url(/assets/icons/str.svg)",
                    maskRepeat: "no-repeat",
                    WebkitMaskRepeat: "no-repeat",
                    maskPosition: "center",
                    WebkitMaskPosition: "center",
                    maskSize: "contain",
                    WebkitMaskSize: "contain",
                  }}
                />
              </Box>
            </Box>
          </Box>
        </MenuTrigger>

        <Portal>
          <MenuContent
            bg="ui.Pagination.menuBg"
            borderWidth="1px"
            borderStyle="solid"
            borderColor="ui.Pagination.menuBorder"
            borderRadius="8px"
            p="4px"
            boxShadow="lg"
            zIndex="max"
            minW="0"
          >
            {normalizedOptions.map((option) => (
              <MenuItem
                key={option}
                value={String(option)}
                onClick={() => {
                  setOpen(false)
                  onChange(option)
                }}
                px="8px"
                py="8px"
                borderRadius="6px"
                fontSize="14px"
                color="ui.Pagination.itemText"
                _hover={{ bg: "ui.Pagination.menuItemHoverBg" }}
                cursor="pointer"
                justifyContent="center"
              >
                {option}
              </MenuItem>
            ))}
          </MenuContent>
        </Portal>
      </MenuRoot>
    </Flex>
  )
}
