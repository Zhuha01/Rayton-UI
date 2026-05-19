/**
 * Delete User within the Rayton operator UI (components_2/Pages/management/User/DeleteUser.tsx).
 * Built with Chakra UI and shared theme tokens to stay consistent with dashboards, management, and control surfaces.
 * Primary contract: exported component props and functions below (see TypeScript types for required fields).
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { UsersService } from '@/client';
import { ConfirmDeleteDialog } from '@/components_2/Pages/management/ConfirmDeleteDialog';
import useCustomToast from '@/hooks/useCustomToast';
import { DeleteTriggerButton } from '../DeleteTriggerButton';

interface DeleteUserProps {
  id: string;
  trigger?: ReactNode;
}

const DeleteUser = ({ id, trigger }: DeleteUserProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useCustomToast();
  const { t } = useTranslation('management');
  const {
    handleSubmit,
    formState: { isSubmitting },
  } = useForm();

  const deleteUser = async (id: string) => {
    await UsersService.deleteUser({ userId: id });
  };

  const mutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      showSuccessToast(t('toasts.user.deleted'));
      setIsOpen(false);
    },
    onError: () => {
      showErrorToast(t('toasts.user.deleteError'));
    },
    onSettled: () => {
      queryClient.invalidateQueries();
    },
  });

  const onSubmit = async () => {
    mutation.mutate(id);
  };

  return (
    <ConfirmDeleteDialog
      open={isOpen}
      onOpenChange={({ open }) => setIsOpen(open)}
      trigger={
        trigger ?? (
          <DeleteTriggerButton>
            {t('modals.user.delete.trigger')}
          </DeleteTriggerButton>
        )
      }
      title={t('modals.user.delete.title')}
      description={
        <>
          {t('modals.user.delete.description.beforeStrong')}
          <strong>{t('modals.user.delete.description.strong')}</strong>
          {t('modals.user.delete.description.afterStrong')}
        </>
      }
      isLoading={isSubmitting}
      onConfirm={handleSubmit(onSubmit)}
    />
  );
};

export default DeleteUser;
