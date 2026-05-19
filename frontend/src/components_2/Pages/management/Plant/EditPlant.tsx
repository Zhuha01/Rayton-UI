/**
 * Edit Plant within the Rayton operator UI (components_2/Pages/management/Plant/EditPlant.tsx).
 * Built with Chakra UI and shared theme tokens to stay consistent with dashboards, management, and control surfaces.
 * Primary contract: exported component props and functions below (see TypeScript types for required fields).
 */
import { Text } from '@chakra-ui/react';
import { type FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useCustomToast from '@/hooks/useCustomToast';
import { type PlantPublic, useUpdatePlant } from '@/hooks/usePlantQueries';
import { ManagementDialogActions } from '../ManagementDialogActions';
import { ManagementDialogShell } from '../ManagementDialogShell';
import {
  PlantFields,
  plantFormFromPlant,
  type PlantFormShape,
} from './PlantFields';

export interface EditPlantProps {
  plant: PlantPublic;
  isOpen: boolean;
  onClose: () => void;
}

const EditPlant = ({ plant, isOpen, onClose }: EditPlantProps) => {
  const [formData, setFormData] = useState<PlantFormShape>(() =>
    plantFormFromPlant(plant)
  );

  const updatePlantMutation = useUpdatePlant();
  const { showSuccessToast } = useCustomToast();
  const { t } = useTranslation('management');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    let processedValue: string | number | null | undefined = value;

    if (name === 'PLANT_ID') {
      processedValue = value === '' ? undefined : Number(value);
    } else if (name === 'latitude' || name === 'longitude') {
      processedValue = value === '' ? null : Number(value);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    updatePlantMutation.mutate(
      { plantId: plant.PLANT_ID, plantData: formData },
      {
        onSuccess: () => {
          showSuccessToast(t('toasts.plant.updated'));
          onClose();
        },
      }
    );
  };

  const handleOpenChange = ({ open }: { open: boolean }) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <ManagementDialogShell
      open={isOpen}
      onOpenChange={handleOpenChange}
      title={t('modals.plant.edit.title')}
      description={t('modals.plant.edit.description')}
      onSubmit={handleSubmit}
      footer={
        <ManagementDialogActions
          onCancel={onClose}
          isSubmitting={updatePlantMutation.isPending}
          submitText={t('common.actions.saveChanges')}
        />
      }
    >
      <PlantFields value={formData} onChange={handleChange} plantIdDisabled />

      {updatePlantMutation.isError && (
        <Text color="ui.Form.errorText" fontSize="sm" mt={2}>
          {t('common.errors.errorPrefix')}{' '}
          {updatePlantMutation.error instanceof Error
            ? updatePlantMutation.error.message
            : t('modals.plant.edit.updateErrorFallback')}
        </Text>
      )}
    </ManagementDialogShell>
  );
};

export default EditPlant;
