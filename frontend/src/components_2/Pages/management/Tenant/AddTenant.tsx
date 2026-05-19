/**
 * Add Tenant within the Rayton operator UI (components_2/Pages/management/Tenant/AddTenant.tsx).
 * Built with Chakra UI and shared theme tokens to stay consistent with dashboards, management, and control surfaces.
 * Primary contract: exported component props and functions below (see TypeScript types for required fields).
 */
import { Text } from '@chakra-ui/react';
import { useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { ApiError, type TenantCreate } from '@/client';
import useCustomToast from '@/hooks/useCustomToast';
import { useCreateTenant } from '@/hooks/useTenantQueries';
import { handleError } from '@/utils';
import { SharedAddButton } from '../SharedAddButton';
import { ManagementDialogActions } from '../ManagementDialogActions';
import { ManagementDialogShell } from '../ManagementDialogShell';
import { MUTED_TEXT } from '../sharedModalStyles';
import { TenantFields, type TenantFormData } from './TenantFields';

const AddTenant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { showSuccessToast } = useCustomToast();
  const createTenantMutation = useCreateTenant();
  const { t } = useTranslation('management');

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<TenantFormData>({
    mode: 'onBlur',
    defaultValues: { name: '', description: '', plant_id: undefined },
  });

  const onSubmit: SubmitHandler<TenantFormData> = (data) => {
    const tenantData: TenantCreate = {
      name: data.name,
      description: data.description === '' ? null : data.description,
      plant_id: data.plant_id ? Number(data.plant_id) : null,
    };

    createTenantMutation.mutate(tenantData, {
      onSuccess: () => {
        showSuccessToast(t('toasts.tenant.created'));
        reset();
        setIsOpen(false);
      },
      onError: (err: ApiError) => {
        handleError(err);
      },
    });
  };

  const handleOpenChange = ({ open }: { open: boolean }) => {
    setIsOpen(open);
    if (!open) {
      reset({ name: '', description: '', plant_id: undefined });
    }
  };

  return (
    <ManagementDialogShell
      open={isOpen}
      onOpenChange={handleOpenChange}
      trigger={<SharedAddButton value="add-tenant" />}
      title={t('modals.tenant.add.title')}
      description={t('modals.tenant.add.description')}
      onSubmit={handleSubmit(onSubmit)}
      footer={
        <ManagementDialogActions
          onCancel={() => handleOpenChange({ open: false })}
          isSubmitting={isSubmitting}
          isSubmitDisabled={!isValid}
        />
      }
    >
      <TenantFields
        control={control}
        register={register}
        errors={errors}
        idPrefix="add"
      />

      {createTenantMutation.isError && (
        <Text color="ui.Form.errorText" fontSize="sm" mt={2}>
          {t('common.errors.errorPrefix')}
          {createTenantMutation.error instanceof ApiError &&
          typeof createTenantMutation.error.body === 'object' &&
          createTenantMutation.error.body !== null &&
          'detail' in createTenantMutation.error.body
            ? String(createTenantMutation.error.body.detail)
            : createTenantMutation.error?.message}
        </Text>
      )}
    </ManagementDialogShell>
  );
};

export default AddTenant;
