/**
 * Plc Indicators Filter within the Rayton operator UI (components_2/ui/PlcIndicatorsFilter.tsx).
 * Built with Chakra UI and shared theme tokens to stay consistent with dashboards, management, and control surfaces.
 * Primary contract: exported component props and functions below (see TypeScript types for required fields).
 */
import { Box, Button, HStack } from "@chakra-ui/react"

export type PlcIndicatorFilterValue = "all" | "active" | "inactive"

export function PlcIndicatorsFilter({
  value,
  onChange,
  labels,
  selectedSegmentBg = "background.hover",
  hoverSegmentBg = "background.hover",
}: {
  value: PlcIndicatorFilterValue
  onChange: (next: PlcIndicatorFilterValue) => void
  labels: { all: string; active: string; inactive: string }
  /** Background token for the selected segment on the diagnostic filter (distinct from generic hover tokens). */
  selectedSegmentBg?: string
  /** Hover background for inactive segments. */
  hoverSegmentBg?: string
}) {
  const segments: { id: PlcIndicatorFilterValue; label: string }[] = [
    { id: "all", label: labels.all },
    { id: "active", label: labels.active },
    { id: "inactive", label: labels.inactive },
  ]

  return (
    <Box
      bg={{ base: "ui.PlcControl.selectSurfaceBg", md: "transparent" }}
      p={{ base: "4px", md: 0 }}
      borderRadius={{ base: "8px", md: 0 }}
      w={{ base: "100%", md: "auto" }}
    >
      <HStack
        gap={{ base: 0, md: "8px" }}
        role="tablist"
        flexShrink={0}
        align="center"
        w="100%"
      >
        {segments.map((seg) => {
          const selected = value === seg.id
          return (
            <Button
              key={seg.id}
              type="button"
              role="tab"
              aria-selected={selected}
              variant="ghost"
              size="sm"
              flex={{ base: 1, md: "unset" }}
              flexGrow={{ base: 1, md: 0 }}
              minW={0}
              h="auto"
              minH={{ base: "40px", md: "32px" }}
              px={{ base: 2, md: 3 }}
              py={{ base: 2, md: 1.5 }}
              borderRadius="md"
              fontWeight={{ base: "normal", md: "semibold" }}
              fontSize={{ base: "14px", md: "sm" }}
              color={
                selected
                  ? "ui.PlcControl.diagnosticFilterSegmentFillText"
                  : "text.normal"
              }
              bg={
                selected
                  ? {
                      base: "ui.PlcControl.secondaryButtonBg",
                      md: selectedSegmentBg,
                    }
                  : "transparent"
              }
              _hover={{
                color: "ui.PlcControl.diagnosticFilterSegmentFillText",
                bg: selected
                  ? {
                      base: "ui.PlcControl.secondaryButtonBg",
                      md: selectedSegmentBg,
                    }
                  : {
                      base: "ui.PlcControl.secondaryButtonHoverBg",
                      md: hoverSegmentBg,
                    },
              }}
              onClick={() => onChange(seg.id)}
            >
              {seg.label}
            </Button>
          )
        })}
      </HStack>
    </Box>
  )
}
