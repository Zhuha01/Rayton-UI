/**
 * Edit Tenant within the Rayton operator UI (components_2/Pages/management/Tenant/EditTenant.tsx).
 * Built with Chakra UI and shared theme tokens to stay consistent with dashboards, management, and control surfaces.
 * Primary contract: exported component props and functions below (see TypeScript types for required fields).
 */
import { Button as ChakraButton, Text } from '@chakra-ui/react';
import { useState, type ReactElement } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { FaExchangeAlt } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

import { ApiError, type TenantPublic, type TenantUpdate } from '@/client';
import useCustomToast from '@/hooks/useCustomToast';
import { useUpdateTenant } from '@/hooks/useTenantQueries';
import { handleError } from '@/utils';
import { ManagementDialogActions } from '../ManagementDialogActions';
import { ManagementDialogShell } from '../ManagementDialogShell';
import { TenantFields, type TenantFormData } from './TenantFields';

interface EditTenantProps {
  tenant: TenantPublic;
  /** Optional trigger for DialogTrigger asChild (e.g. management card button). */
  trigger?: ReactElement;
}

const EditTenant = ({ tenant, trigger }: EditTenantProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { showSuccessToast } = useCustomToast();
  const updateTenantMutation = useUpdateTenant();
  const { t } = useTranslation('management');

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<TenantFormData>({
    mode: 'onBlur',
    defaultValues: {
      name: tenant.name,
      description: tenant.description,
      plant_id: tenant.plant_id,
    },
  });

  const onSubmit: SubmitHandler<TenantFormData> = (data) => {
    const tenantUpdateData: TenantUpdate = {
      name: data.name,
      description: data.description === '' ? null : data.description,
      plant_id: data.plant_id ? Number(data.plant_id) : null,
    };

    updateTenantMutation.mutate(
      { tenantId: tenant.id, tenantData: tenantUpdateData },
      {
        onSuccess: () => {
          showSuccessToast(t('toasts.tenant.updated'));
          setIsOpen(false);
        },
        onError: (err: ApiError) => {
          handleError(err);
        },
      }
    );
  };

  const handleOpenChange = ({ open }: { open: boolean }) => {
    setIsOpen(open);
    if (open) {
      reset({
        name: tenant.name,
        description: tenant.description,
        plant_id: tenant.plant_id,
      });
    }
  };

  return (
    <ManagementDialogShell
      open={isOpen}
      onOpenChange={handleOpenChange}
      trigger={
        trigger ?? (
          <ChakraButton variant="ghost" size="sm">
            <FaExchangeAlt fontSize="16px" />
            {t('modals.tenant.edit.trigger')}
          </ChakraButton>
        )
      }
      title={t('modals.tenant.edit.title')}
      description={t('modals.tenant.edit.description')}
      onSubmit={handleSubmit(onSubmit)}
      footer={
        <ManagementDialogActions
          onCancel={() => handleOpenChange({ open: false })}
          isSubmitting={isSubmitting}
          isSubmitDisabled={!isValid}
          submitText={t('common.actions.saveChanges')}
        />
      }
    >
      <TenantFields
        control={control}
        register={register}
        errors={errors}
        idPrefix="edit"
      />

      {updateTenantMutation.isError && (
        <Text color="ui.Form.errorText" fontSize="sm" mt={2}>
          {t('common.errors.errorPrefix')}
          {updateTenantMutation.error instanceof ApiError &&
          typeof updateTenantMutation.error.body === 'object' &&
          updateTenantMutation.error.body !== null &&
          'detail' in updateTenantMutation.error.body
            ? String(updateTenantMutation.error.body.detail)
            : updateTenantMutation.error?.message}
        </Text>
      )}
    </ManagementDialogShell>
  );
};

export default EditTenant;
