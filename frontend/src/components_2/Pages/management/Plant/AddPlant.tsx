/**
 * Add Plant within the Rayton operator UI (components_2/Pages/management/Plant/AddPlant.tsx).
 * Built with Chakra UI and shared theme tokens to stay consistent with dashboards, management, and control surfaces.
 * Primary contract: exported component props and functions below (see TypeScript types for required fields).
 */
import { Text } from '@chakra-ui/react';
import { type FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useCustomToast from '@/hooks/useCustomToast';
import { type PlantPublic, useCreatePlant } from '@/hooks/usePlantQueries';
import { SharedAddButton } from '../SharedAddButton';
import { ManagementDialogActions } from '../ManagementDialogActions';
import { ManagementDialogShell } from '../ManagementDialogShell';
import { PlantFields, type PlantFormShape } from './PlantFields';

export default function AddPlant() {
  const [isOpen, setIsOpen] = useState(false);
  const { mutate: createPlant, isPending, isError, error } = useCreatePlant();
  const { showSuccessToast, showErrorToast } = useCustomToast();
  const { t } = useTranslation('management');

  const [formData, setFormData] = useState<PlantFormShape>({
    PLANT_ID: undefined,
    latitude: null,
    longitude: null,
    timezone: 'Europe/Kyiv',
    TEXT_L1: '',
    TEXT_L2: '',
    tab_config: '',
  });

  const trimmedTimezone = String(formData.timezone ?? '').trim();
  const canSubmit = Boolean(formData.PLANT_ID) && Boolean(trimmedTimezone);

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

    if (!formData.PLANT_ID || !trimmedTimezone) {
      showErrorToast(t('modals.plant.add.requiredFieldsError'));
      return;
    }

    createPlant(
      {
        ...formData,
        timezone: trimmedTimezone,
      } as Omit<PlantPublic, 'ID' | 'created_at' | 'updated_at'>,
      {
        onSuccess: () => {
          showSuccessToast(t('toasts.plant.created'));
          setIsOpen(false);
          setFormData({
            PLANT_ID: undefined,
            latitude: null,
            longitude: null,
            timezone: 'Europe/Kyiv',
            TEXT_L1: '',
            TEXT_L2: '',
            tab_config: '',
          });
        },
      }
    );
  };

  const handleOpenChange = ({ open }: { open: boolean }) => {
    setIsOpen(open);
    if (!open) {
      setFormData({
        PLANT_ID: undefined,
        latitude: null,
        longitude: null,
        timezone: 'Europe/Kyiv',
        TEXT_L1: '',
        TEXT_L2: '',
        tab_config: '',
      });
    }
  };

  return (
    <ManagementDialogShell
      open={isOpen}
      onOpenChange={handleOpenChange}
      trigger={<SharedAddButton />}
      title={t('modals.plant.add.title')}
      description={t('modals.plant.add.description')}
      onSubmit={handleSubmit}
      footer={
        <ManagementDialogActions
          onCancel={() => handleOpenChange({ open: false })}
          isSubmitting={isPending}
          isSubmitDisabled={!canSubmit}
        />
      }
    >
      <PlantFields value={formData} onChange={handleChange} />

      {isError && (
        <Text color="ui.Form.errorText" fontSize="sm" mt={2}>
          {t('common.errors.errorPrefix')}{' '}
          {error instanceof Error
            ? error.message
            : t('modals.plant.add.createErrorFallback')}
        </Text>
      )}
    </ManagementDialogShell>
  );
}
