/**
 * Schematic Viewer Card within the Rayton operator UI (components_2/Pages/control/SchematicViewerCard.tsx).
 * Built with Chakra UI and shared theme tokens to stay consistent with dashboards, management, and control surfaces.
 * Primary contract: exported component props and functions below (see TypeScript types for required fields).
 */
import { Box, Flex, Heading, Text } from "@chakra-ui/react"
import type { KeyboardEvent } from "react"
import { useTranslation } from "react-i18next"
import { LuSearch } from "react-icons/lu"
import { plcControlUi } from "./controlUi"

const SCHEMATIC_PDF_SRC = plcControlUi.schematicCard.pdfSrc
const SCHEMATIC_PREVIEW_SRC = `${SCHEMATIC_PDF_SRC}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`
const SCHEMATIC_CARD_ASPECT_RATIO = plcControlUi.schematicCard.aspectRatio

const SchematicPdfPreview = ({
  title,
  fallback,
}: {
  title: string
  fallback: string
}) => (
  <object
    data={SCHEMATIC_PREVIEW_SRC}
    type="application/pdf"
    aria-label={title}
    tabIndex={-1}
    style={{
      width: "100%",
      height: "100%",
      minHeight: 0,
      border: 0,
      display: "block",
      pointerEvents: "none",
      transform: "translateZ(0)",
      backfaceVisibility: "hidden",
    }}
  >
    <Text
      as="span"
      color={plcControlUi.schematicCard.textColor}
      textAlign="center"
    >
      {fallback}
    </Text>
  </object>
)

export function SchematicViewerCard() {
  const { t } = useTranslation("control")

  const title = t("schematic.title")
  const openInNewTabLabel = t("schematic.openInNewTab")
  const openLabel = t("schematic.openLabel")
  const pdfFallback = t("schematic.pdfFallback")

  const openSchematicInNewTab = () => {
    window.open(SCHEMATIC_PDF_SRC, "_blank", "noopener,noreferrer")
  }

  const handleThumbnailKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      openSchematicInNewTab()
    }
  }

  return (
    <Box
      borderRadius={plcControlUi.schematicCard.radius}
      bg={plcControlUi.schematicCard.bg}
      boxShadow={plcControlUi.schematicCard.shadow}
      overflow="hidden"
    >
      <Flex
        align="center"
        px="24px"
        py={{ base: "16px", md: "24px" }}
        borderBottomWidth={`${plcControlUi.schematicCard.dividerThicknessPx}px`}
        borderBottomColor={plcControlUi.schematicCard.borderColor}
      >
        <Heading
          fontSize="18px"
          lineHeight="normal"
          fontWeight="bold"
          color={plcControlUi.schematicCard.textColor}
        >
          {title}
        </Heading>
      </Flex>

      <Box p={{ base: "16px", md: "24px" }}>
        <Box
          role="button"
          tabIndex={0}
          aria-label={openInNewTabLabel}
          position="relative"
          w="100%"
          h="0"
          pb={`${100 / SCHEMATIC_CARD_ASPECT_RATIO}%`}
          overflow="hidden"
          transform="translateZ(0)"
          willChange="width"
          cursor="pointer"
          onClick={openSchematicInNewTab}
          onKeyDown={handleThumbnailKeyDown}
          _hover={{
            "& .schematic-thumbnail-overlay": {
              opacity: 1,
            },
          }}
        >
          <Flex
            position="absolute"
            inset="0"
            align="center"
            justify="center"
            w="full"
            h="full"
            transform="translateZ(0)"
          >
            <SchematicPdfPreview title={title} fallback={pdfFallback} />
          </Flex>
          <Flex
            className="schematic-thumbnail-overlay"
            position="absolute"
            inset="0"
            align="center"
            justify="center"
            bg="ui.Badge.transparentBg"
            color="white"
            opacity={0}
            transition="opacity 0.2s ease"
            pointerEvents="none"
          >
            <Flex
              align="center"
              gap={2}
              px={4}
              py={2}
              borderRadius="full"
              bg="rgba(0, 0, 0, 0.7)"
              fontSize="14px"
              fontWeight="semibold"
            >
              <LuSearch />
              {openLabel}
            </Flex>
          </Flex>
        </Box>
      </Box>
    </Box>
  )
}
