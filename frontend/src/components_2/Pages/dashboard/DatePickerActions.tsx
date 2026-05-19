/**
 * Calendar popover content paired with dashboard DateSwitcher for single-day picks.
 * Builds a padded month grid, localized labels, and keeps month navigation isolated from upstream date commits.
 */

import {
  Box,
  Button,
  HStack,
  IconButton,
  SimpleGrid,
  Text,
  useBreakpointValue,
  VStack,
} from "@chakra-ui/react"
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday as isTodayFn,
  isValid,
  isWeekend,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns"
import { de, enUS, pl, uk } from "date-fns/locale"
import { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { DateSwitcher } from "@/components_2/ui/DateSwitcher"
import { StrArrowIcon } from "@/components_2/ui/StrArrowIcon"

interface DatePickerActionsProps {
  timeRange: string
  currentDate: Date
  isToday: boolean
  onDateChange: (dateString: string) => void
  onNavigate: (direction: "prev" | "next") => void
}

const toIsoDate = (date: Date) => format(date, "yyyy-MM-dd")

const capitalize = (value: string) =>
  value.length > 0 ? value.charAt(0).toUpperCase() + value.slice(1) : value

// Always render six weeks (42 cells) so the popover keeps a steady height across months.
const buildMonthMatrix = (viewDate: Date) => {
  const monthStart = startOfMonth(viewDate)
  const monthEnd = endOfMonth(viewDate)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const gridEndCandidate = endOfWeek(monthEnd, { weekStartsOn: 1 })

  let days = eachDayOfInterval({ start: gridStart, end: gridEndCandidate })

  if (days.length < 42) {
    const extraStart = new Date(gridEndCandidate)
    extraStart.setDate(extraStart.getDate() + 1)
    const extraEnd = new Date(gridEndCandidate)
    extraEnd.setDate(extraEnd.getDate() + (42 - days.length))
    days = days.concat(eachDayOfInterval({ start: extraStart, end: extraEnd }))
  }

  return days.slice(0, 42)
}

export const DatePickerActions = ({
  timeRange,
  currentDate,
  isToday,
  onDateChange,
  onNavigate,
}: DatePickerActionsProps) => {
  const { t, i18n } = useTranslation("Dashboard")
  const [open, setOpen] = useState(false)
  const isDesktop =
    useBreakpointValue({ base: false, md: true }, { ssr: false }) ?? false
  const dateSwitcherVariant = isDesktop ? "default" : "dashboardMobile"
  const monthNavArrowProps = {
    width: 5,
    height: 9,
    strokeWidth: 1.75 as number,
  }

  const selected = useMemo(
    () => (isValid(currentDate) ? currentDate : undefined),
    [currentDate],
  )

  // `viewDate` drives intra-calendar month paging; keep it synced with upstream `currentDate`.
  const [viewDate, setViewDate] = useState<Date>(
    isValid(currentDate) ? currentDate : new Date(),
  )

  useEffect(() => {
    if (isValid(currentDate)) {
      setViewDate(currentDate)
    }
  }, [currentDate])

  const days = useMemo(() => buildMonthMatrix(viewDate), [viewDate])

  const dateLocale = useMemo(() => {
    const lang = i18n.resolvedLanguage?.split("-")[0]?.toLowerCase()
    if (lang === "de") return de
    if (lang === "pl") return pl
    if (lang === "en") return enUS
    return uk
  }, [i18n.resolvedLanguage])

  const weekdayLabels = useMemo(() => {
    const raw = t("calendar.weekdaysShort", {
      returnObjects: true,
      defaultValue: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"],
    }) as unknown
    return Array.isArray(raw) ? (raw as string[]) : ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"]
  }, [t, i18n.resolvedLanguage])

  const headerLabel = useMemo(
    () => capitalize(format(viewDate, "LLLL yyyy", { locale: dateLocale })),
    [viewDate, dateLocale],
  )

  // For "All" we still allow picking/navigating a focus date (used to center the year view).

  const handleSelect = (date: Date) => {
    onDateChange(toIsoDate(date))
    setOpen(false)
  }

  const dateText = isValid(currentDate)
    ? timeRange === "All"
      ? format(currentDate, "yyyy")
      : format(currentDate, "dd.MM.yyyy")
    : ""

  return (
    <DateSwitcher
      dateText={dateText}
      open={open}
      onOpenChange={setOpen}
      onPrev={() => onNavigate("prev")}
      onNext={() => onNavigate("next")}
      isNextDisabled={isToday}
      variant={dateSwitcherVariant}
    >
      <VStack gap="6px" align="stretch" h="100%" px="12px" py="8px">
        <Box
          display="grid"
          gridTemplateColumns="20px minmax(0, 1fr) 20px"
          alignItems="center"
          w="100%"
          columnGap="8px"
        >
          <IconButton
            variant="ghost"
            size="xs"
            aria-label={t("calendar.prevMonth")}
            onClick={() => setViewDate((d) => subMonths(d, 1))}
            h="20px"
            w="20px"
            minW="20px"
            p={0}
            borderRadius="4px"
            color="ui.Chart.calendarNavText"
            justifySelf="center"
            _hover={{
              bg: "ui.Chart.calendarNavHoverBg",
              color: "ui.Chart.calendarNavHoverText",
            }}
          >
            <StrArrowIcon rotateDeg={180} {...monthNavArrowProps} />
          </IconButton>

          <HStack justify="center" gap="4px" minW={0}>
            <Button
              size="xs"
              variant="plain"
              h="24px"
              px="10px"
              borderRadius="8px"
              bg="transparent"
              color="text.normal"
              flexShrink={0}
              _hover={{ bg: "ui.Interactive.hoverBg" }}
              _active={{ bg: "ui.Interactive.hoverBg" }}
              onClick={() => handleSelect(new Date())}
            >
              {t("calendar.today")}
            </Button>

            <Box
              bg="ui.Chart.calendarMonthBadgeBg"
              px="8px"
              py="2px"
              borderRadius="4px"
              minH="20px"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Text
                fontSize="11px"
                fontWeight={500}
                color="ui.Chart.calendarMonthBadgeText"
                lineHeight="1"
                whiteSpace="nowrap"
              >
                {headerLabel}
              </Text>
            </Box>
          </HStack>

          <IconButton
            variant="ghost"
            size="xs"
            aria-label={t("calendar.nextMonth")}
            onClick={() => setViewDate((d) => addMonths(d, 1))}
            h="20px"
            w="20px"
            minW="20px"
            p={0}
            borderRadius="4px"
            color="ui.Chart.calendarNavText"
            justifySelf="center"
            _hover={{
              bg: "ui.Chart.calendarNavHoverBg",
              color: "ui.Chart.calendarNavHoverText",
            }}
          >
            <StrArrowIcon {...monthNavArrowProps} />
          </IconButton>
        </Box>

        {/* Weekdays */}
        <SimpleGrid columns={7} gap="2px" w="100%">
          {weekdayLabels.map((label, idx) => {
            const isWeekendLabel = idx >= 5
            return (
              <Box
                key={label}
                h="20px"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Text
                  fontSize="10px"
                  fontWeight={500}
                  color={
                    isWeekendLabel
                      ? "ui.Interactive.accent"
                      : "ui.Chart.calendarWeekdayText"
                  }
                  lineHeight="1"
                >
                  {label}
                </Text>
              </Box>
            )
          })}
        </SimpleGrid>

        <SimpleGrid columns={7} gap="2px" w="100%" flex="1">
          {days.map((day) => {
            const outside = !isSameMonth(day, viewDate)
            const selectedDay = selected ? isSameDay(day, selected) : false
            const weekendDay = isWeekend(day)
            const today = isTodayFn(day)

            let color: string
            if (selectedDay) {
              color = "ui.Chart.calendarSelectedDayText"
            } else if (outside) {
              color = "ui.Chart.calendarOutsideMonthDayText"
            } else if (weekendDay) {
              color = "ui.Interactive.accent"
            } else {
              color = "ui.Chart.calendarRegularDayText"
            }

            return (
              <Box
                key={day.toISOString()}
                role="button"
                tabIndex={0}
                onClick={() => handleSelect(day)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    handleSelect(day)
                  }
                }}
                h="24px"
                w="100%"
                display="flex"
                alignItems="center"
                justifyContent="center"
                borderRadius="4px"
                cursor="pointer"
                bg={selectedDay ? "ui.Interactive.accent" : "transparent"}
                color={color}
                boxShadow={
                  today && !selectedDay
                    ? "ui.Chart.calendarTodayRing"
                    : undefined
                }
                fontWeight={today ? 600 : 400}
                transition="background-color 0.12s, color 0.12s"
                _hover={
                  selectedDay
                    ? undefined
                    : {
                        bg: "ui.Chart.calendarDayHoverBg",
                        color: "ui.Chart.calendarDayHoverText",
                      }
                }
              >
                <Text fontSize="11px" lineHeight="1">
                  {format(day, "d")}
                </Text>
              </Box>
            )
          })}
        </SimpleGrid>
      </VStack>
    </DateSwitcher>
  )
}
