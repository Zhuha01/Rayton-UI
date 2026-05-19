/**
 * Time-range segmented control pairing a mobile carousel strip with desktop grouped buttons.
 * Optional narrow layout stacks buttons with wrap for cramped dashboard headers.
 */

import {
  Box,
  ButtonGroup,
  Flex,
  HStack,
} from "@chakra-ui/react"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components_2/ui/Button"

export type TimeRange = "1D" | "1W" | "1M" | "1Y" | "All"

interface TimeRangePickerProps {
  value: TimeRange
  onChange: (range: TimeRange) => void
  narrowTabLayout?: boolean
}

export const TimeRangePicker = ({
  value,
  onChange,
  narrowTabLayout = false,
}: TimeRangePickerProps) => {
  const { t, i18n } = useTranslation("Dashboard")
  const activeAndHoverBg = "ui.Interactive.hoverBg"
  const defaultTextColor = "text.normal"

  const items = useMemo(
    () =>
      (["1D", "1W", "1M", "1Y", "All"] as const).map((v) => ({
        value: v,
        label: t(`timeRange.${v}`, { defaultValue: v }),
      })),
    // `t` may be referentially stable; depend on language explicitly.
    [t, i18n.resolvedLanguage],
  )

  const desktopButtons = items.map((item) => {
    const isActive = value === item.value
    return (
      <Button
        key={item.value}
        onClick={() => onChange(item.value as TimeRange)}
        px="12px"
        py="8px"
        h="auto"
        borderRadius="12px"
        fontSize="14px"
        fontWeight="500"
        cursor="pointer"
        transition="all 0.2s"
        bg={isActive ? activeAndHoverBg : "transparent"}
        color={isActive ? "ui.Interactive.accent" : defaultTextColor}
        _hover={{
          bg: activeAndHoverBg,
          color: isActive ? "ui.Interactive.accent" : defaultTextColor,
        }}
        _active={{
          bg: activeAndHoverBg,
        }}
        border="none"
        outline="none"
        _focus={{ boxShadow: "none" }}
        _focusVisible={{ boxShadow: "none" }}
      >
        {item.label}
      </Button>
    )
  })

  return (
    <>
      <Box
        display={{ base: "block", md: "none" }}
        w="100%"
        bg="ui.Chart.toolbarBg"
        borderRadius="12px"
        boxShadow="ui.chartToolbarCard"
        px="6px"
        py="6px"
        overflow="hidden"
        css={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        <HStack w="100%" justify="space-evenly" align="center" gap={0}>
          {items.map((item) => {
            const isActive = value === item.value
            return (
              <Button
                key={item.value}
                onClick={() => onChange(item.value as TimeRange)}
                variant="plain"
                size="sm"
                px={isActive ? "10px" : "8px"}
                py="7px"
                h="34px"
                borderRadius="12px"
                fontSize="12px"
                fontWeight="500"
                lineHeight="1"
                display="inline-flex"
                alignItems="center"
                justifyContent="center"
                cursor="pointer"
                transition="all 0.2s"
                bg={isActive ? activeAndHoverBg : "transparent"}
                color={isActive ? "ui.Interactive.accent" : defaultTextColor}
                whiteSpace="nowrap"
                _hover={{
                  bg: activeAndHoverBg,
                  color: isActive ? "ui.Interactive.accent" : defaultTextColor,
                }}
                _active={{ bg: activeAndHoverBg }}
                border="none"
                outline="none"
                _focus={{ boxShadow: "none" }}
                _focusVisible={{ boxShadow: "none" }}
              >
                {item.label}
              </Button>
            )
          })}
        </HStack>
      </Box>

      {narrowTabLayout ? (
        <Flex
          display={{ base: "none", md: "flex" }}
          flexWrap="wrap"
          alignItems="center"
          justifyContent="flex-start"
          gap="8px"
          rowGap="8px"
          maxW="100%"
          minW={0}
        >
          {items.map((item) => {
            const isActive = value === item.value
            return (
              <Button
                key={item.value}
                variant="plain"
                size="sm"
                onClick={() => onChange(item.value as TimeRange)}
                px="12px"
                py="8px"
                h="auto"
                borderRadius="12px"
                fontSize="14px"
                fontWeight="500"
                cursor="pointer"
                transition="all 0.2s"
                flexShrink={0}
                bg={isActive ? activeAndHoverBg : "transparent"}
                color={isActive ? "ui.Interactive.accent" : defaultTextColor}
                _hover={{
                  bg: activeAndHoverBg,
                  color: isActive ? "ui.Interactive.accent" : defaultTextColor,
                }}
                _active={{ bg: activeAndHoverBg }}
                border="none"
                outline="none"
                _focus={{ boxShadow: "none" }}
                _focusVisible={{ boxShadow: "none" }}
              >
                {item.label}
              </Button>
            )
          })}
        </Flex>
      ) : (
        <ButtonGroup
          variant="plain"
          size="sm"
          display={{ base: "none", md: "flex" }}
          gap="18px"
          p={0}
        >
          {desktopButtons}
        </ButtonGroup>
      )}
    </>
  )
}
