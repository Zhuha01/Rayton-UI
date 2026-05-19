/**
 * Anchored toolbar control for navigating dates with prev/next arrows and calendar popover.
 * Supports dashboard and compact mobile variants and wires Chakra Popover positioning per layout.
 */

import {
  Box,
  HStack,
  IconButton,
  Popover,
  Portal,
  Text,
} from "@chakra-ui/react"
import type { ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { StrArrowIcon } from "@/components_2/ui/StrArrowIcon"
import { colors } from "@/theme/tokens/colors"

const CalendarIcon = ({
  width = 18,
  height = 20,
}: {
  width?: number
  height?: number
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 18 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M5 3H4.2002C3.08009 3 2.51962 3 2.0918 3.21799C1.71547 3.40973 1.40973 3.71547 1.21799 4.0918C1 4.51962 1 5.08009 1 6.2002V7M5 3H13M5 3V1M13 3H13.8002C14.9203 3 15.4796 3 15.9074 3.21799C16.2837 3.40973 16.5905 3.71547 16.7822 4.0918C17 4.5192 17 5.07899 17 6.19691V7M13 3V1M1 7V15.8002C1 16.9203 1 17.4801 1.21799 17.9079C1.40973 18.2842 1.71547 18.5905 2.0918 18.7822C2.5192 19 3.07899 19 4.19691 19H13.8031C14.921 19 15.48 19 15.9074 18.7822C16.2837 18.5905 16.5905 18.2842 16.7822 17.9079C17 17.4805 17 16.9215 17 15.8036V7M1 7H17M13 15H13.002L13.002 15.002L13 15.002V15ZM9 15H9.002L9.00195 15.002L9 15.002V15ZM5 15H5.002L5.00195 15.002L5 15.002V15ZM13.002 11V11.002L13 11.002V11H13.002ZM9 11H9.002L9.00195 11.002L9 11.002V11ZM5 11H5.002L5.00195 11.002L5 11.002V11Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export interface DateSwitcherProps {
  dateText: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onPrev: () => void
  onNext: () => void
  isNextDisabled?: boolean
  /**
   * - default: toolbar style (dashboard/desktop)
   * - scheduleMobile: full-width gray bar layout used on Schedule mobile header
   * - dashboardMobile: larger date text on small screens WITHOUT the Schedule gray chrome
   */
  variant?: "default" | "scheduleMobile" | "dashboardMobile"
  children: ReactNode
}

export function DateSwitcher({
  dateText,
  open,
  onOpenChange,
  onPrev,
  onNext,
  isNextDisabled = false,
  variant = "default",
  children,
}: DateSwitcherProps) {
  const { t } = useTranslation("Dashboard")
  // Calendar navigation arrows: slightly smaller than the Schedule table arrows.
  const navArrowProps = { width: 2.5, height: 4.5, strokeWidth: 1 as number }

  // Match Dashboard toolbar interactions (TimeRangePicker / Export / DatePicker).
  const activeAndHoverBg = "ui.Interactive.hoverBg"
  const isScheduleMobile = variant === "scheduleMobile"
  const isDashboardMobile = variant === "dashboardMobile"
  const useLargeMobileDateText = isScheduleMobile || isDashboardMobile
  const isAnyMobileVariant = isScheduleMobile || isDashboardMobile
  // Keep control/icon sizes consistent with desktop across variants.
  const calendarSize = { width: 18, height: 20 }
  const navSvgSizePx = "12px"
  const middleGap = isScheduleMobile
    ? { base: "10px", sm: "12px", md: "16px" }
    : undefined
  const middlePx = isScheduleMobile
    ? { base: "10px", sm: "12px", md: "16px" }
    : undefined

  return (
    <Popover.Root
      open={open}
      onOpenChange={(e) => onOpenChange(e.open)}
      positioning={
        isScheduleMobile
          ? { placement: "bottom", gutter: 8 }
          : { placement: "bottom-start", gutter: 8 }
      }
    >
      <Popover.Anchor asChild>
        <HStack
          gap={isScheduleMobile ? "0px" : { base: "6px", md: "10px" }}
          align="center"
          p={
            isScheduleMobile
              ? { base: "0px", md: "10px" }
              : { base: "6px", md: "10px" }
          }
          borderRadius={isScheduleMobile ? { base: "8px", md: "12px" } : "12px"}
          display="flex"
          maxW="100%"
          minW={0}
          bg={
            isScheduleMobile
              ? { base: "ui.NavbarComponent.border", md: "transparent" }
              : "transparent"
          }
          w={isScheduleMobile ? { base: "100%", md: "auto" } : "auto"}
          justifyContent={isScheduleMobile ? "space-between" : "flex-start"}
          px={
            isScheduleMobile
              ? { base: "8px", sm: "10px", md: undefined }
              : undefined
          }
          boxShadow={
            isScheduleMobile
              ? {
                  base: "-2px 2px 2px rgba(0, 0, 0, 0.25)",
                  md: undefined,
                }
              : undefined
          }
          h={isScheduleMobile ? { base: "49px", md: "auto" } : "auto"}
          css={{
            "@media (max-width: 385px)": {
              ...(isAnyMobileVariant
                ? {}
                : {
                    gap: "4px",
                    padding: "4px",
                  }),
            },
          }}
        >
         <IconButton
            variant="ghost"
            onClick={onPrev}
            aria-label={t("calendar.prev")}
            w="fit-content"
            h="fit-content"
            minW="fit-content"
            alignSelf="center"
            flexShrink={0}
            p={{ base: "4px", md: "6px" }}
            color="text.normal"
            _hover={{ bg: activeAndHoverBg, color: "text.normal" }}
            css={{
              "& svg": {
                width: `${navSvgSizePx} !important`,
                height: `${navSvgSizePx} !important`,
              },
            }}
          >
            <StrArrowIcon rotateDeg={180} {...navArrowProps} />
          </IconButton>
          <HStack
            gap={
              isScheduleMobile
                ? middleGap
                : { base: isDashboardMobile ? "6px" : "6px", md: "10px" }
            }
            px={isScheduleMobile ? middlePx : 0}
            py={isScheduleMobile ? "8px" : 0}
            minW={0}
            css={
              isDashboardMobile
                ? {
                    "@media (max-width: 385px)": {
                      gap: "2px",
                      paddingLeft: "0px",
                      paddingRight: "0px",
                    },
                  }
                : undefined
            }
          >
            <Text
              color="text.normal"
              fontSize={{
                base: useLargeMobileDateText ? "14px" : "12px",
                sm: useLargeMobileDateText ? "15px" : "12px",
                md: "14px",
              }}
              fontWeight={isScheduleMobile ? 600 : "500"}
              userSelect="none"
              whiteSpace="nowrap"
              textAlign={isScheduleMobile ? "center" : undefined}
              minW={0}
              overflow={isAnyMobileVariant ? "hidden" : undefined}
              textOverflow={isAnyMobileVariant ? "ellipsis" : undefined}
              css={
                isDashboardMobile
                  ? {
                      "@media (max-width: 385px)": {
                        fontSize: "12px",
                      },
                    }
                  : undefined
              }
            >
              {dateText}
            </Text>

            <Popover.Trigger asChild>
              <Box
                as="button"
                display="inline-flex"
                alignItems="center"
                justifyContent="center"
                alignSelf="center"
                flexShrink={0}
                w="fit-content"
                h="fit-content"
                p={{ base: "4px", md: "6px" }}
                cursor="pointer"
                outline="none"
                borderRadius="md"
                transition="all 0.2s"
                bg={open ? activeAndHoverBg : "transparent"}
                color={open ? "ui.Interactive.accent" : "text.normal"}
                _hover={{
                  bg: activeAndHoverBg,
                  color: "ui.Interactive.accent",
                }}
              >
                <CalendarIcon
                  width={calendarSize.width}
                  height={calendarSize.height}
                />
              </Box>
            </Popover.Trigger>
          </HStack>

          <IconButton
            variant="ghost"
            onClick={onNext}
            disabled={isNextDisabled}
            aria-label={t("calendar.next")}
            w="fit-content"
            h="fit-content"
            minW="fit-content"
            alignSelf="center"
            flexShrink={0}
            p={{ base: "4px", md: "6px" }}
            color="text.normal"
            _hover={{ bg: activeAndHoverBg, color: "text.normal" }}
            _disabled={{ opacity: 0.3, cursor: "not-allowed" }}
            css={{
              "& svg": {
                width: `${navSvgSizePx} !important`,
                height: `${navSvgSizePx} !important`,
              },
            }}
          >
            <StrArrowIcon {...navArrowProps} />
          </IconButton>
        </HStack>
      </Popover.Anchor>

      <Portal>
        <Popover.Positioner>
          <Popover.Content
            w="255px"
            bg="background.normal"
            border="1px solid"
            borderColor="border.normal"
            borderRadius="12px"
            boxShadow="xl"
            overflow="hidden"
          >
            <Popover.Body p={0}>{children}</Popover.Body>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  )
}
