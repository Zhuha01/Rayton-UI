/**
 * Delete Plant within the Rayton operator UI (components_2/Pages/management/Plant/DeletePlant.tsx).
 * Built with Chakra UI and shared theme tokens to stay consistent with dashboards, management, and control surfaces.
 * Primary contract: exported component props and functions below (see TypeScript types for required fields).
 */
import { Kbd, Text } from '@chakra-ui/react';
import { useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import type { PlantPublic } from '@/hooks/usePlantQueries';
import { useDeletePlant } from '@/hooks/usePlantQueries';
import { ConfirmDeleteDialog } from '@/components_2/Pages/management/ConfirmDeleteDialog';
import useCustomToast from '@/hooks/useCustomToast';
import { DeleteTriggerButton } from '../DeleteTriggerButton';

interface DeletePlantProps {
  plant: PlantPublic;
  trigger?: ReactNode;
}

const DeletePlant = ({ plant, trigger }: DeletePlantProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { showSuccessToast, showErrorToast } = useCustomToast();
  const { t } = useTranslation('management');
  const {
    handleSubmit,
    formState: { isSubmitting },
  } = useForm();

  const deletePlantMutation = useDeletePlant();

  const onSubmit = async () => {
    deletePlantMutation.mutate(plant.PLANT_ID, {
      onSuccess: () => {
        showSuccessToast(t('toasts.plant.deleted'));
        setIsOpen(false);
      },
      onError: (err) => {
        showErrorToast(
          err instanceof Error
            ? err.message
            : t('modals.plant.delete.deleteErrorFallback')
        );
      },
    });
  };

  const isLoading = deletePlantMutation.isPending;

  return (
    <ConfirmDeleteDialog
      open={isOpen}
      onOpenChange={({ open }) => setIsOpen(open)}
      trigger={
        trigger ?? (
          <DeleteTriggerButton>
            {t('modals.plant.delete.trigger')}
          </DeleteTriggerButton>
        )
      }
      title={t('modals.plant.delete.title')}
      description={
        <>
          {t('modals.plant.delete.description.beforePlantId')}
          <Kbd>{plant.PLANT_ID}</Kbd>
          {t('modals.plant.delete.description.afterPlantId')}
        </>
      }
      belowDescription={
        deletePlantMutation.isError ? (
          <Text color="ui.Form.errorText" fontSize="sm">
            {t('common.errors.errorPrefix')}{' '}
            {deletePlantMutation.error instanceof Error
              ? deletePlantMutation.error.message
              : t('modals.plant.delete.deleteErrorFallback')}
          </Text>
        ) : null
      }
      isLoading={isLoading || isSubmitting}
      onConfirm={handleSubmit(onSubmit)}
    />
  );
};

export default DeletePlant;
