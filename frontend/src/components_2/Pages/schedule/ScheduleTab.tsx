/**
 * Schedule Tab within the Rayton operator UI (components_2/Pages/schedule/ScheduleTab.tsx).
 * Built with Chakra UI and shared theme tokens to stay consistent with dashboards, management, and control surfaces.
 * Primary contract: exported component props and functions below (see TypeScript types for required fields).
 */
import {
  Box,
  ButtonGroup,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  IconButton,
  SimpleGrid,
  Text,
  useBreakpointValue,
  VStack,
} from '@chakra-ui/react';
import { useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate } from '@tanstack/react-router';
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday as isTodayFn,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
} from 'date-fns';
import { de, enUS, pl, uk } from 'date-fns/locale';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FiRefreshCw } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import type { ScheduleRow } from '@/client';
import { Button } from "@/components_2/ui/Button"
import { DateSwitcher } from '@/components_2/ui/DateSwitcher';
import { StrArrowIcon } from '@/components_2/ui/StrArrowIcon';
import ScheduleChart from './ScheduleChart';
import type { ScheduleControlTableHandle } from './ScheduleControlTable';
import ScheduleControlTable from './ScheduleControlTable';
import { SCHEDULE_UI } from './scheduleUi';

const DownloadIcon = () => (
  <svg
    width="17"
    height="17"
    viewBox="0 0 14 15"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M1 13.3128C1.28667 13.5927 1.67547 13.75 2.08088 13.75H11.2525C11.6579 13.75 12.0467 13.5927 12.3333 13.3128M6.66752 1V9.45925M6.66752 9.45925L10.1615 6.227M6.66752 9.45925L3.17359 6.227"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const toLocalDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const fromIsoDate = (iso: string) => {
  const [y, m, d] = iso.split('-').map((v) => parseInt(v, 10));
  return new Date(y, (m ?? 1) - 1, d ?? 1);
};

const capitalize = (value: string) =>
  value.length > 0 ? value.charAt(0).toUpperCase() + value.slice(1) : value;

// Fixed 6-week (42-day) grid so the calendar height does not jump between months.
const buildMonthMatrix = (viewDate: Date) => {
  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEndCandidate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  let days = eachDayOfInterval({ start: gridStart, end: gridEndCandidate });

  if (days.length < 42) {
    const extraStart = new Date(gridEndCandidate);
    extraStart.setDate(extraStart.getDate() + 1);
    const extraEnd = new Date(gridEndCandidate);
    extraEnd.setDate(extraEnd.getDate() + (42 - days.length));
    days = days.concat(eachDayOfInterval({ start: extraStart, end: extraEnd }));
  }

  return days.slice(0, 42);
};

export type ScheduleTabVariant = 'default' | 'light' | 'woSell';

interface ScheduleTabProps {
  tenantId: string;
  variant?: ScheduleTabVariant;
}

const ScheduleTab = ({ tenantId, variant = 'default' }: ScheduleTabProps) => {
  const { t, i18n } = useTranslation('Schedule');
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isDesktop = useBreakpointValue({ base: false, md: true }) ?? false;
  const dateSwitcherVariant = isDesktop ? 'default' : 'dashboardMobile';
  const monthNavArrowProps = {
    width: 5,
    height: 9,
    strokeWidth: 1.75 as number,
  };

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const urlDate = (location.search as Record<string, any>).date as
      | string
      | undefined;
    if (urlDate && /^\d{4}-\d{2}-\d{2}$/.test(urlDate)) return urlDate;
    return toLocalDateString(new Date());
  });

  const [scheduleData, setScheduleData] = useState<ScheduleRow[] | undefined>(
    undefined
  );
  const [calendarOpen, setCalendarOpen] = useState(false);
  const tableRef = useRef<ScheduleControlTableHandle | null>(null);
  const [saveState, setSaveState] = useState<{
    invalidRowsCount: number;
    isDirty: boolean;
    isSaving: boolean;
    commandStatus: 'idle' | 'sending' | 'success' | 'failed';
  }>({
    invalidRowsCount: 0,
    isDirty: false,
    isSaving: false,
    commandStatus: 'idle',
  });

  const currentDate = useMemo(() => fromIsoDate(selectedDate), [selectedDate]);

  const [viewDate, setViewDate] = useState<Date>(currentDate);
  useEffect(() => {
    if (calendarOpen) {
      setViewDate(currentDate);
    }
  }, [calendarOpen, currentDate]);

  const calendarDays = useMemo(() => buildMonthMatrix(viewDate), [viewDate]);

  const dateLocale = useMemo(() => {
    const lang = i18n.resolvedLanguage?.split('-')[0]?.toLowerCase();
    if (lang === 'de') return de;
    if (lang === 'pl') return pl;
    if (lang === 'en') return enUS;
    return uk;
  }, [i18n.resolvedLanguage]);

  const weekdayLabels = useMemo(() => {
    const raw = t('calendar.weekdaysShort', {
      returnObjects: true,
      defaultValue: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'],
    }) as unknown;
    return Array.isArray(raw)
      ? (raw as string[])
      : ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];
  }, [t, i18n.resolvedLanguage]);

  const headerLabel = useMemo(
    () => capitalize(format(viewDate, 'LLLL yyyy', { locale: dateLocale })),
    [viewDate, dateLocale]
  );
  const dateText = useMemo(
    () => format(currentDate, 'dd.MM.yyyy'),
    [currentDate]
  );

  useEffect(() => {
    const searchObj = location.search as Record<string, any>;
    const urlDate = searchObj.date;
    if (urlDate !== selectedDate) {
      const newParams = { ...searchObj, date: selectedDate };
      navigate({ to: '.', search: newParams as any, replace: true });
    }
  }, [selectedDate, navigate, location.search]);

  const handleDateChange = (newDate: string) => setSelectedDate(newDate);
  const handlePrevDay = () =>
    handleDateChange(toLocalDateString(subDays(currentDate, 1)));
  const handleNextDay = () =>
    handleDateChange(toLocalDateString(addDays(currentDate, 1)));
  const handleYesterday = () =>
    handleDateChange(toLocalDateString(subDays(currentDate, 1)));
  const handleToday = () => handleDateChange(toLocalDateString(new Date()));
  const handleTomorrow = () =>
    handleDateChange(toLocalDateString(addDays(currentDate, 1)));
  const handleRefresh = () => {
    queryClient.invalidateQueries({
      queryKey: ['schedule', { tenantId, date: selectedDate }],
    });
  };

  const actionButtonsFontSize = {
    base: '12px',
    sm: '13px',
    md: '13px',
  } as const;

  const saveButtonDisabled =
    saveState.invalidRowsCount > 0 ||
    saveState.isSaving ||
    saveState.commandStatus === 'sending';

  const saveButtonDirtyProps =
    saveState.isDirty && !saveButtonDisabled
      ? ({
          bg: 'ui.Interactive.hoverBg',
          color: 'ui.Interactive.accent',
          _hover: { bg: 'ui.Interactive.hoverBg' },
          _active: { bg: 'ui.Interactive.hoverBg' },
        } as const)
      : ({} as const);

  // On md+ the table has a fixed visual width (Figma), charts take the remaining space.
  // For 7-column variants we reduce the table width by one column to give charts more space.
  const tableColCount = variant === 'woSell' || variant === 'light' ? 7 : 8;
  const tableWidthPx =
    tableColCount === 8
      ? SCHEDULE_UI.table.compact8.widthPx
      : SCHEDULE_UI.table.widthPx - SCHEDULE_UI.table.otherColWidthPx;
  // Charts should not "squeeze" on narrower widths: keep a stable min width
  // and allow horizontal scrolling inside the charts column.
  const chartsMinWidthPx = 450;
  // Controls row (Yesterday/Today/Tomorrow + calendar) should follow the same rule:
  // keep a stable min width on md+ and scroll horizontally if needed.
  const controlsMinWidthPx = 450;
  // Table may grow when there is extra space (e.g. zoom-out).
  // Charts column uses the remaining space; charts themselves keep a min width and get clipped when needed.
  const mdColumns = `minmax(${tableWidthPx}px, 1fr) minmax(0, 1fr)`;

  return (
    <Box overflowX="hidden" minH={0}>
      <Box
        pl={{ base: '16px', md: '24px' }}
        pr={{ base: '16px', md: '24px' }}
        pt={{ base: '8px', md: '12px' }}
        pb={{ base: '8px', md: '12px' }}
      >
        <Grid
          templateColumns={{ base: '1fr', md: mdColumns }}
          alignItems="center"
          mb={SCHEDULE_UI.tab.header.mb}
          gap={SCHEDULE_UI.tab.header.gap}
        >
          <GridItem>
            <Flex
              justify="space-between"
              align="center"
              gap={SCHEDULE_UI.tab.header.titleGap}
              pl={0}
            >
              <Heading as="h2" size={SCHEDULE_UI.tab.header.headingSize}>
                {t('page.title')}
              </Heading>

              <IconButton
                aria-label={t('actions.refresh')}
                onClick={handleRefresh}
                size={SCHEDULE_UI.tab.refresh.iconButton.size}
                variant={SCHEDULE_UI.tab.refresh.iconButton.variant}
                display={SCHEDULE_UI.tab.refresh.iconButton.display}
              >
                <FiRefreshCw />
              </IconButton>
            </Flex>
          </GridItem>

          <GridItem pr={0}>
            {(() => {
              const calendarContent = (
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
                      aria-label={t('calendar.prevMonth')}
                      onClick={() => setViewDate((d) => subMonths(d, 1))}
                      h="20px"
                      w="20px"
                      minW="20px"
                      p={0}
                      borderRadius="4px"
                      color={SCHEDULE_UI.tab.colors.calendar.navIcon}
                      justifySelf="center"
                      _hover={{
                        bg: SCHEDULE_UI.tab.colors.calendar.navHoverBg,
                        color: SCHEDULE_UI.tab.colors.calendar.navHoverColor,
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
                        _hover={{ bg: 'ui.Interactive.hoverBg' }}
                        _active={{ bg: 'ui.Interactive.hoverBg' }}
                        onClick={() => {
                          const today = new Date();
                          setViewDate(today);
                          handleDateChange(toLocalDateString(today));
                          setCalendarOpen(false);
                        }}
                      >
                        {t('calendar.today')}
                      </Button>

                      <Box
                        bg={SCHEDULE_UI.tab.colors.calendar.monthBadgeBg}
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
                          color={SCHEDULE_UI.tab.colors.calendar.monthBadgeText}
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
                      aria-label={t('calendar.nextMonth')}
                      onClick={() => setViewDate((d) => addMonths(d, 1))}
                      h="20px"
                      w="20px"
                      minW="20px"
                      p={0}
                      borderRadius="4px"
                      color={SCHEDULE_UI.tab.colors.calendar.navIcon}
                      justifySelf="center"
                      _hover={{
                        bg: SCHEDULE_UI.tab.colors.calendar.navHoverBg,
                        color: SCHEDULE_UI.tab.colors.calendar.navHoverColor,
                      }}
                    >
                      <StrArrowIcon {...monthNavArrowProps} />
                    </IconButton>
                  </Box>

                  <SimpleGrid columns={7} gap="2px" w="100%">
                    {weekdayLabels.map((label, idx) => {
                      const isWeekendLabel = idx >= 5;
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
                                ? 'ui.Interactive.accent'
                                : SCHEDULE_UI.tab.colors.calendar.weekdayText
                            }
                            lineHeight="1"
                          >
                            {label}
                          </Text>
                        </Box>
                      );
                    })}
                  </SimpleGrid>

                  <SimpleGrid columns={7} gap="2px" w="100%" flex="1">
                    {calendarDays.map((day) => {
                      const outside = !isSameMonth(day, viewDate);
                      const selectedDay = isSameDay(day, currentDate);
                      const weekendDay =
                        day.getDay() === 0 || day.getDay() === 6;
                      const today = isTodayFn(day);

                      let color: string;
                      if (selectedDay) {
                        color = SCHEDULE_UI.tab.colors.calendar.selectedDayText;
                      } else if (outside) {
                        color =
                          SCHEDULE_UI.tab.colors.calendar.outsideMonthDayText;
                      } else if (weekendDay) {
                        color = 'ui.Interactive.accent';
                      } else {
                        color = SCHEDULE_UI.tab.colors.calendar.regularDayText;
                      }

                      return (
                        <Box
                          key={day.toISOString()}
                          role="button"
                          tabIndex={0}
                          onClick={() => {
                            handleDateChange(toLocalDateString(day));
                            setCalendarOpen(false);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleDateChange(toLocalDateString(day));
                              setCalendarOpen(false);
                            }
                          }}
                          h="24px"
                          w="100%"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          borderRadius="4px"
                          cursor="pointer"
                          bg={
                            selectedDay
                              ? 'ui.Interactive.accent'
                              : 'transparent'
                          }
                          color={color}
                          boxShadow={
                            today && !selectedDay
                              ? SCHEDULE_UI.tab.colors.calendar.todayRing
                              : undefined
                          }
                          fontWeight={today ? 600 : 400}
                          transition="background-color 0.12s, color 0.12s"
                          _hover={
                            selectedDay
                              ? undefined
                              : {
                                  bg: SCHEDULE_UI.tab.colors.calendar
                                    .dayHoverBg,
                                  color:
                                    SCHEDULE_UI.tab.colors.calendar
                                      .dayHoverText,
                                }
                          }
                        >
                          <Text fontSize="11px" lineHeight="1">
                            {format(day, 'd')}
                          </Text>
                        </Box>
                      );
                    })}
                  </SimpleGrid>
                </VStack>
              );

              const controlsRow = isDesktop ? (
                <Flex
                  bg="ui.NavbarComponent.border"
                  h="49px"
                  borderTopRadius="8px"
                  borderBottomRadius="0px"
                  boxShadow="none"
                  overflow="hidden"
                  boxSizing="border-box"
                  pl="0px"
                  pr="0px"
                  py="10px"
                  gap={SCHEDULE_UI.tab.controls.gap}
                  align="center"
                  w="100%"
                  maxW="100%"
                  justifyContent="space-between"
                >
                  <Box
                    flex="1"
                    minW={0}
                    overflowX="auto"
                    overflowY="hidden"
                    pl="8px"
                    css={{
                      scrollbarWidth: 'none', // Firefox
                      msOverflowStyle: 'none', // IE/Edge legacy
                      '&::-webkit-scrollbar': { display: 'none' }, // Chromium/Safari
                    }}
                  >
                    <ButtonGroup
                      variant="plain"
                      size={SCHEDULE_UI.tab.controls.buttonGroup.size}
                      flexWrap="nowrap"
                      gap="4px"
                    >
                      <Button
                        {...SCHEDULE_UI.tab.controls.actionButton}
                        fontSize={actionButtonsFontSize}
                        fontWeight={400}
                        whiteSpace="nowrap"
                        borderRadius="8px"
                        h="auto"
                        px={{ base: '4px', sm: '8px', md: '12px' }}
                        py={{ base: '6px', sm: '7px', md: '8px' }}
                        gap="6px"
                        onClick={handleRefresh}
                      >
                        {t('actions.refresh')} <FiRefreshCw size="17px" />
                      </Button>
                      <Button
                        {...SCHEDULE_UI.tab.controls.actionButton}
                        fontSize={actionButtonsFontSize}
                        whiteSpace="nowrap"
                        borderRadius="8px"
                        h="auto"
                        px={{ base: '8px', sm: '8px', md: '12px' }}
                        py={{ base: '6px', sm: '7px', md: '8px' }}
                        gap="6px"
                        onClick={() => tableRef.current?.saveAll()}
                        loading={
                          saveState.isSaving ||
                          saveState.commandStatus === 'sending'
                        }
                        disabled={saveButtonDisabled}
                        {...saveButtonDirtyProps}
                      >
                        {t('actions.saveChanges')} <DownloadIcon />
                      </Button>
                    </ButtonGroup>
                  </Box>

                  <Box minW={0} flexShrink={0}>
                    <DateSwitcher
                      dateText={dateText}
                      open={calendarOpen}
                      onOpenChange={setCalendarOpen}
                      onPrev={handlePrevDay}
                      onNext={handleNextDay}
                      variant={dateSwitcherVariant}
                    >
                      {calendarContent}
                    </DateSwitcher>
                  </Box>
                </Flex>
              ) : (
                <Flex justify="center" w="100%">
                  <Flex
                    bg="ui.Chart.toolbarBg"
                    borderRadius="12px"
                    boxShadow="ui.chartToolbarCard"
                    overflow="hidden"
                    align="center"
                    px="6px"
                    py="6px"
                  >
                    <DateSwitcher
                      dateText={dateText}
                      open={calendarOpen}
                      onOpenChange={setCalendarOpen}
                      onPrev={handlePrevDay}
                      onNext={handleNextDay}
                      variant={dateSwitcherVariant}
                    >
                      {calendarContent}
                    </DateSwitcher>
                  </Flex>
                </Flex>
              );

              if (isDesktop) {
                return (
                  <Box
                    w="100%"
                    overflowX="auto"
                    overflowY="hidden"
                    className="app-scrollbar"
                    css={{
                      scrollbarWidth: 'none', // Firefox
                      msOverflowStyle: 'none', // IE/Edge legacy
                      '&::-webkit-scrollbar': { display: 'none' }, // Chromium/Safari
                    }}
                  >
                    <Box
                      minW={{ base: '100%', md: `${controlsMinWidthPx}px` }}
                      w="100%"
                    >
                      {controlsRow}
                    </Box>
                  </Box>
                );
              }

              return controlsRow;
            })()}
          </GridItem>
        </Grid>

        <Grid
          templateColumns={{ base: '1fr', md: mdColumns }}
          gap={SCHEDULE_UI.tab.grid.gap}
        >
          <GridItem
            minW={SCHEDULE_UI.tab.grid.itemMinW}
            order={{ base: 0, md: 1 }}
            pr={0}
          >
            <VStack alignItems={SCHEDULE_UI.tab.panels.vStackAlignItems}>
              <Box
                w={SCHEDULE_UI.tab.panels.scrollBox.w}
                pb={SCHEDULE_UI.tab.layout.chartsPb}
                overflowX="auto"
                overflowY="hidden"
                className="app-scrollbar"
                css={{
                  scrollbarWidth: 'thin', // Firefox
                  msOverflowStyle: 'auto', // IE/Edge legacy
                }}
              >
                <Box
                  minW={{ base: '100%', md: `${chartsMinWidthPx}px` }}
                  w="100%"
                >
                  <ScheduleChart
                    tenantId={tenantId}
                    date={selectedDate}
                    scheduleData={scheduleData}
                  />
                </Box>
              </Box>
            </VStack>
          </GridItem>

          <GridItem
            minW={SCHEDULE_UI.tab.grid.itemMinW}
            order={{ base: 1, md: 0 }}
          >
            <VStack
              alignItems={SCHEDULE_UI.tab.panels.vStackAlignItems}
              gap={{ base: 3, md: 0 }}
            >
              {/* Mobile: centered refresh + save block between charts and table */}
              <Flex
                display={{ base: 'flex', md: 'none' }}
                justify="center"
                w="100%"
              >
                <Flex
                  bg="ui.Chart.toolbarBg"
                  borderRadius="12px"
                  boxShadow="ui.chartToolbarCard"
                  overflow="hidden"
                  align="center"
                  px="6px"
                  py="6px"
                >
                  <ButtonGroup size="sm" variant="plain" gap="0px">
                    <Button
                      {...SCHEDULE_UI.tab.controls.actionButton}
                      {...SCHEDULE_UI.tab.controls.actionButtonMobile}
                      fontSize={actionButtonsFontSize}
                      onClick={handleRefresh}
                    >
                      <FiRefreshCw /> {t('actions.refresh')}
                    </Button>
                    <Button
                      {...SCHEDULE_UI.tab.controls.actionButton}
                      {...SCHEDULE_UI.tab.controls.actionButtonMobile}
                      fontSize={actionButtonsFontSize}
                      onClick={() => tableRef.current?.saveAll()}
                      loading={
                        saveState.isSaving ||
                        saveState.commandStatus === 'sending'
                      }
                      disabled={saveButtonDisabled}
                      {...saveButtonDirtyProps}
                    >
                      {t('actions.saveChanges')}
                    </Button>
                  </ButtonGroup>
                </Flex>
              </Flex>

              <Box
                overflowX="hidden"
                w={SCHEDULE_UI.tab.panels.scrollBox.w}
                pl={0}
              >
                <ScheduleControlTable
                  ref={tableRef}
                  tenantId={tenantId}
                  date={selectedDate}
                  variant={variant}
                  onScheduleDataChange={setScheduleData}
                  onSaveStateChange={setSaveState}
                />
              </Box>
            </VStack>
          </GridItem>
        </Grid>
      </Box>
    </Box>
  );
};

export default ScheduleTab;
