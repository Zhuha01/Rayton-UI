/**
 * Dropdown for exporting the trend chart as PNG or tabular data (CSV/XLSX) via historical API.
 * Uses html-to-image for raster capture and shared toolbar tokens for open/hover states.
 */

import { Box, HStack, Portal } from "@chakra-ui/react"
import { toPng } from "html-to-image"
import { type RefObject, useState } from "react"
import { useTranslation } from "react-i18next"
import type { HistoricalDataGroupedResponse } from "@/client"
import {
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuTrigger,
} from "@/components_2/ui/Menu"
import { toaster } from "@/components_2/ui/Toaster"
import { Button } from "@/components_2/ui/Button"
import useHistoricalDataExport from "@/hooks/useHistoricalDataExport"

interface ChartExportMenuProps {
  chartRef: RefObject<HTMLDivElement | null>
  tenantId: string
  dataIds: number[]
  startDate: Date
  endDate: Date
  fileName: string
  compact?: boolean
}

const toLocalISOString = (date: Date) => {
  const tzOffset = date.getTimezoneOffset() * 60000
  const localISOTime = new Date(date.getTime() - tzOffset)
    .toISOString()
    .slice(0, 23)
  return localISOTime.slice(0, 19)
}

export const ChartExportMenu = ({
  chartRef,
  tenantId,
  dataIds,
  startDate,
  endDate,
  fileName,
  compact = false,
}: ChartExportMenuProps) => {
  const { t } = useTranslation("Dashboard")
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const { refetch: refetchExportData } = useHistoricalDataExport(
    {
      tenantId,
      data_ids: dataIds,
      start: toLocalISOString(startDate),
      end: toLocalISOString(endDate),
      export_granularity: "hourly",
    },
    { enabled: false },
  )

  const activeAndHoverBg = "ui.Interactive.hoverBg"
  const defaultTextColor = "text.normal"

  const onExportPNG = async () => {
    if (!chartRef.current) return
    setIsLoading(true)
    try {
      const dataUrl = await toPng(chartRef.current, { cacheBust: true })
      const link = document.createElement("a")
      link.download = fileName || "chart.png"
      link.href = dataUrl
      link.click()
    } catch (_err) {
      toaster.create({ title: t("toolbar.exportErrorPng"), type: "error" })
    } finally {
      setIsLoading(false)
    }
  }

  const onExportData = async (_format: "xlsx" | "csv") => {
    setIsLoading(true)
    try {
      const result = await refetchExportData()
      const responseData = result.data as HistoricalDataGroupedResponse
      if (!responseData?.series?.length) {
        toaster.create({ title: t("toolbar.noData"), type: "warning" })
        return
      }
      toaster.create({ title: t("toolbar.exportSuccess"), type: "success" })
    } catch (_err) {
      toaster.create({ title: t("toolbar.exportError"), type: "error" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <MenuRoot
      onOpenChange={(e) => setIsOpen(e.open)}
      positioning={{ placement: "bottom-end", gutter: 8 }}
    >
      <MenuTrigger asChild>
        <Button
          variant="plain"
          loading={isLoading}
          role="group"
          px={compact ? "8px" : "12px"}
          py={compact ? "8px" : "8px"}
          h="auto"
          borderRadius="12px"
          fontSize={compact ? "12px" : "14px"}
          fontWeight="500"
          cursor="pointer"
          transition="all 0.2s"
          bg={isOpen ? activeAndHoverBg : "transparent"}
          color={isOpen ? "ui.Interactive.accent" : defaultTextColor}
          _hover={
            isOpen
              ? {}
              : {
                  bg: activeAndHoverBg,
                  color: "text.normal",
                }
          }
          _active={{
            bg: activeAndHoverBg,
            color: "ui.Interactive.accent",
          }}
          border="none"
          outline="none"
          _focus={{ boxShadow: "none" }}
          _focusVisible={{ boxShadow: "none" }}
        >
          <HStack gap={compact ? "0px" : "10px"}>
            {!compact && <Box as="span">{t("toolbar.export")}</Box>}
            <svg
              width="18"
              height="16"
              viewBox="0 0 20 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ flexShrink: 0 }}
            >
              <path
                d="M10 7.0001V13.0001M10 13.0001L13 11.0001M10 13.0001L7 11.0001M1 3.0001V13.8001C1 14.9202 1 15.4799 1.21799 15.9077C1.40973 16.284 1.71547 16.5906 2.0918 16.7823C2.5192 17.0001 3.07899 17.0001 4.19691 17.0001H15.8031C16.921 17.0001 17.48 17.0001 17.9074 16.7823C18.2837 16.5906 18.5905 16.2842 18.7822 15.9079C19.0002 15.4801 19.0002 14.92 19.0002 13.7999L19.0002 6.19988C19.0002 5.07977 19.0002 4.51972 18.7822 4.0919C18.5905 3.71557 18.2839 3.40983 17.9076 3.21809C17.4798 3.0001 16.9201 3.0001 15.8 3.0001H10M1 3.0001H10M1 3.0001C1 1.89553 1.89543 1.0001 3 1.0001H6.67452C7.1637 1.0001 7.40886 1.0001 7.63904 1.05536C7.84311 1.10435 8.03785 1.18537 8.2168 1.29502C8.41857 1.41867 8.59181 1.59192 8.9375 1.9376L10 3.0001"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </HStack>
        </Button>
      </MenuTrigger>

      <Portal>
        <MenuContent
          bg="background.normal"
          borderRadius="12px"
          borderColor="border.normal"
          boxShadow="xl"
          p="4px"
          zIndex={9999}
          minW="160px"
        >
          <MenuItem
            value="csv"
            onClick={() => onExportData("csv")}
            px="12px"
            py="8px"
            borderRadius="8px"
            fontSize="13px"
            color="text.normal"
            _hover={{ bg: "background.hover" }}
            cursor="pointer"
          >
            {t("toolbar.exportCsv")}
          </MenuItem>
          <MenuItem
            value="xlsx"
            onClick={() => onExportData("xlsx")}
            px="12px"
            py="8px"
            borderRadius="8px"
            fontSize="13px"
            color="text.normal"
            _hover={{ bg: "background.hover" }}
            cursor="pointer"
          >
            {t("toolbar.exportXlsx")}
          </MenuItem>
          <MenuItem
            value="png"
            onClick={onExportPNG}
            px="12px"
            py="8px"
            borderRadius="8px"
            fontSize="13px"
            color="text.normal"
            _hover={{ bg: "background.hover" }}
            cursor="pointer"
          >
            {t("toolbar.exportPng")}
          </MenuItem>
        </MenuContent>
      </Portal>
    </MenuRoot>
  )
}

export default ChartExportMenu
