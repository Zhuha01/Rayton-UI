/**
 * Compact language picker menu anchored to navbar layout with abbreviated locale codes.
 * Persists selection through i18n and highlights the resolved language chip.
 */

import { Box, type BoxProps, HStack, Portal, Text } from "@chakra-ui/react"
import { ChevronDown } from "lucide-react"
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import {
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuTrigger,
} from "@/components_2/ui/Menu"
import { Button } from "@/components_2/ui/Button"

const LANGUAGES = [
  { label: "UA", value: "uk" },
  { label: "EN", value: "en" },
  { label: "PL", value: "pl" },
  { label: "DE", value: "de" },
] as const

export function LanguageSwitcher(props: BoxProps) {
  const { i18n, t } = useTranslation()
  const [open, setOpen] = useState(false)

  const currentLanguage = useMemo(() => {
    const code = i18n.resolvedLanguage?.split("-")[0]
    return LANGUAGES.find((l) => l.value === code) ?? LANGUAGES[1]
  }, [i18n.resolvedLanguage])

  const triggerStyles = {
    width: "60px",
    bg: open ? "background.hover" : "background.normal",
    borderWidth: "1px",
    borderColor: "border.normal",
    borderRadius: "8px",
    px: "8px",
    py: "6px",
    h: "auto",
    cursor: "pointer",
    _hover: { bg: "background.hover" },
    _active: { bg: "background.hover" },
  }

  return (
    <Box position="absolute" {...props}>
      <MenuRoot
        open={open}
        onOpenChange={(e) => setOpen(e.open)}
        positioning={{ placement: "bottom", gutter: 4, sameWidth: true }}
      >
        <MenuTrigger asChild>
          <Button
            variant="ghost"
            {...triggerStyles}
            aria-label={t("languageSwitcherLabel")}
          >
            <HStack gap="4px">
              <Text fontSize="0.875rem" color="text.normal">
                {currentLanguage.label}
              </Text>

              <Box
                as={ChevronDown}
                display="inline-flex"
                boxSize="16px"
                strokeWidth={3.5}
                transition="all 0.2s"
                color="ui.Interactive.accent"
                transform={open ? "rotate(180deg)" : "rotate(0deg)"}
              />
            </HStack>
          </Button>
        </MenuTrigger>

        <Portal>
          <MenuContent
            bg="background.normal"
            p={0}
            minW="unset"
            border="none"
            boxShadow="ui.menuOverlay"
            zIndex="max"
          >
            {LANGUAGES.map((option) => (
              <MenuItem
                key={option.value}
                value={option.value}
                hidden={option.value === currentLanguage.value}
                onClick={() => i18n.changeLanguage(option.value)}
                color="text.normal"
                fontSize="0.875rem"
                py="6px"
                px="8px"
                _hover={{ bg: "background.hover" }}
                cursor="pointer"
                borderRadius="0"
              >
                {option.label}
              </MenuItem>
            ))}
          </MenuContent>
        </Portal>
      </MenuRoot>
    </Box>
  )
}
