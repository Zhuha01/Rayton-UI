/**
 * Delete Tenant within the Rayton operator UI (components_2/Pages/management/Tenant/DeleteTenant.tsx).
 * Built with Chakra UI and shared theme tokens to stay consistent with dashboards, management, and control surfaces.
 * Primary contract: exported component props and functions below (see TypeScript types for required fields).
 */
import { useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import type { ApiError, TenantPublic } from '@/client';
import { ConfirmDeleteDialog } from '@/components_2/Pages/management/ConfirmDeleteDialog';
import useCustomToast from '@/hooks/useCustomToast';
import { useDeleteTenant } from '@/hooks/useTenantQueries';
import { DeleteTriggerButton } from '../DeleteTriggerButton';

interface DeleteTenantProps {
  tenant: TenantPublic;
  trigger?: ReactNode;
}

const DeleteTenant = ({ tenant, trigger }: DeleteTenantProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { showSuccessToast, showErrorToast } = useCustomToast();
  const { t } = useTranslation('management');
  const {
    handleSubmit,
    formState: { isSubmitting },
  } = useForm();

  const deleteTenantMutation = useDeleteTenant();

  const onSubmit = async () => {
    deleteTenantMutation.mutate(tenant.id, {
      onSuccess: () => {
        showSuccessToast(t('toasts.tenant.deletedWithName', { name: tenant.name }));
        setIsOpen(false);
      },
      onError: (_err: ApiError) => {
        showErrorToast(t('toasts.tenant.deleteError'));
      },
    });
  };

  const isLoading = deleteTenantMutation.isPending;

  return (
    <ConfirmDeleteDialog
      open={isOpen}
      onOpenChange={({ open }) => setIsOpen(open)}
      trigger={
        trigger ?? (
          <DeleteTriggerButton>
            {t('modals.tenant.delete.trigger')}
          </DeleteTriggerButton>
        )
      }
      title={t('modals.tenant.delete.title')}
      description={
        <>
          {t('modals.tenant.delete.description.beforeName')}
          <strong>{tenant.name}</strong>
          {t('modals.tenant.delete.description.afterName')}
          <strong>{t('modals.tenant.delete.description.strong')}</strong>
          {t('modals.tenant.delete.description.afterStrong')}
        </>
      }
      isLoading={isLoading || isSubmitting}
      onConfirm={handleSubmit(onSubmit)}
    />
  );
};

export default DeleteTenant;
