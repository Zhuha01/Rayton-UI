/**
 * Plant row card: location, plant id, timezone accent, and edit/delete controls.
 * Opens inline edit dialog state when the user taps edit from the card footer.
 */

import { Flex, SimpleGrid, Text } from "@chakra-ui/react"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import DeletePlant from "@/components_2/Pages/management/Plant/DeletePlant"
import EditPlant from "@/components_2/Pages/management/Plant/EditPlant"
import type { PlantPublic } from "@/hooks/usePlantQueries"
import { ManagementCardActionButton } from "../ManagementCardActionButton"
import {
  ManagementCardDetailRow,
  ManagementCardShell,
  managementCardLabelProps,
} from "../cards/ManagementCardShell"
import { ManagementCardSolarPanelIcon } from "../cards/ManagementCardSvgs"

export interface PlantManagementCardProps {
  plant: PlantPublic
}

function plantDisplayName(plant: PlantPublic) {
  const line = plant.TEXT_L1?.trim() || plant.TEXT_L2?.trim()
  if (line) return line
  return String(plant.PLANT_ID)
}

export function PlantManagementCard({ plant }: PlantManagementCardProps) {
  const { t } = useTranslation("management")
  const [isEditOpen, setIsEditOpen] = useState(false)
  const deleteTrigger = (
    <ManagementCardActionButton intent="delete">
      {t("common.actions.delete")}
    </ManagementCardActionButton>
  )

  const locationValue =
    plant.latitude != null && plant.longitude != null
      ? `${plant.latitude}, ${plant.longitude}`
      : t("common.status.na")

  return (
    <ManagementCardShell
      leading={<ManagementCardSolarPanelIcon />}
      title={plantDisplayName(plant)}
    >
      <Flex py="8px" direction="column" gap="16px">
        <SimpleGrid columns={{ base: 1, md: 2 }} gap="16px" w="full">
          <ManagementCardDetailRow
            label={t("common.labels.location")}
            value={locationValue}
          />
          <ManagementCardDetailRow
            label={t("common.labels.plantObjectId")}
            value={String(plant.PLANT_ID)}
          />
        </SimpleGrid>

        <Flex direction="column" gap="4px" align="flex-start">
          <Text {...managementCardLabelProps()}>
            {t("common.labels.timezone")}
          </Text>
          <Text
            fontSize="16px"
            fontWeight="bold"
            color="ui.PlantManagementCard.timezoneAccent"
          >
            {plant.timezone || t("common.status.na")}
          </Text>
        </Flex>

        <Flex justify="flex-end" gap="10px" flexWrap="wrap">
          {isEditOpen ? (
            <EditPlant
              key={plant.PLANT_ID}
              plant={plant}
              isOpen={isEditOpen}
              onClose={() => setIsEditOpen(false)}
            />
          ) : null}

          <ManagementCardActionButton
            intent="edit"
            onClick={() => setIsEditOpen(true)}
          >
            {t("common.actions.edit")}
          </ManagementCardActionButton>

          <DeletePlant plant={plant} trigger={deleteTrigger} />
        </Flex>
      </Flex>
    </ManagementCardShell>
  )
}
