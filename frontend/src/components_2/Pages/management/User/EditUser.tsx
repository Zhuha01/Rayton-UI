/**
 * Edit User within the Rayton operator UI (components_2/Pages/management/User/EditUser.tsx).
 * Built with Chakra UI and shared theme tokens to stay consistent with dashboards, management, and control surfaces.
 * Primary contract: exported component props and functions below (see TypeScript types for required fields).
 */
import {
  Box,
  Button as ChakraButton,
  createListCollection,
  Field,
  Flex,
  IconButton,
  Input,
  Select,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Eye, EyeOff } from 'lucide-react';
import { useMemo, useState, type ReactElement } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { FaExchangeAlt } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import {
  type TenantPublic,
  type UserPublic,
  UsersService,
  type UserUpdate,
} from '@/client';
import type { ApiError } from '@/client/core/ApiError';
import { InputGroup } from "@/components_2/ui/InputGroup"
import { CheckboxCustom } from '@/components_2/ui/CheckboxCustom';
import useCustomToast from '@/hooks/useCustomToast';
import { useTenants } from '@/hooks/useTenantQueries';
import { emailPattern, handleError } from '@/utils';
import { ManagementDialogActions } from '../ManagementDialogActions';
import { ManagementDialogShell } from '../ManagementDialogShell';
import {
  checkboxFigmaCss,
  darkFieldControlProps,
  darkSelectTriggerProps,
  fieldControlProps,
  labelProps,
  MUTED_TEXT,
  selectContentProps,
  selectItemProps,
} from '../sharedModalStyles';

interface EditUserProps {
  user: UserPublic;
  /** Optional trigger for DialogTrigger asChild (e.g. management card button). */
  trigger?: ReactElement;
}

interface UserUpdateForm extends Omit<UserUpdate, 'tenant_id'> {
  confirm_password?: string;
  tenant_id: string;
}

const EditUser = ({ user, trigger }: EditUserProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tenantSelectOpen, setTenantSelectOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const queryClient = useQueryClient();
  const { showSuccessToast } = useCustomToast();
  const { data: tenantsData, isLoading: isLoadingTenants } = useTenants();
  const { t } = useTranslation('management');

  const tenantCollection = useMemo(
    () =>
      createListCollection({
        items: (tenantsData?.data ?? []).map((tenant: TenantPublic) => ({
          label: tenant.name,
          value: tenant.id,
        })),
      }),
    [tenantsData]
  );

  const {
    control,
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isValid, isSubmitting },
  } = useForm<UserUpdateForm>({
    mode: 'onBlur',
    criteriaMode: 'all',
    defaultValues: {
      email: user.email,
      full_name: user.full_name ?? '',
      is_active: user.is_active,
      is_superuser: user.is_superuser,
      tenant_id: user.tenant_id ?? '',
      password: '',
      confirm_password: '',
    },
  });

  const mutation = useMutation({
    mutationFn: (data: UserUpdate) =>
      UsersService.updateUser({ userId: user.id, requestBody: data }),
    onSuccess: (updatedUser) => {
      showSuccessToast(t('toasts.user.updated'));
      queryClient.setQueryData(['users', { id: user.id }], updatedUser);
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsOpen(false);
    },
    onError: (err: ApiError) => {
      handleError(err);
    },
  });

  const onSubmit: SubmitHandler<UserUpdateForm> = (data) => {
    const payload: UserUpdate = {
      email: data.email,
      full_name: data.full_name || null,
      is_active: data.is_active,
      is_superuser: data.is_superuser,
      password: data.password ? data.password : null,
      tenant_id: data.tenant_id,
    };
    mutation.mutate(payload);
  };

  const handleOpenChange = ({ open }: { open: boolean }) => {
    setIsOpen(open);
    if (open) {
      reset({
        email: user.email,
        full_name: user.full_name ?? '',
        is_active: user.is_active,
        is_superuser: user.is_superuser,
        tenant_id: user.tenant_id ?? '',
        password: '',
        confirm_password: '',
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
            {t('modals.user.edit.trigger')}
          </ChakraButton>
        )
      }
      title={t('modals.user.edit.title')}
      description={t('modals.user.edit.description')}
      onSubmit={handleSubmit(onSubmit)}
      footer={
        <ManagementDialogActions
          onCancel={() => handleOpenChange({ open: false })}
          isSubmitting={isSubmitting}
          isSubmitDisabled={!isValid || isLoadingTenants || !tenantsData}
          submitText={t('common.actions.saveChanges')}
        />
      }
    >
      <VStack gap={4} align="stretch" maxW="452px">
        <Field.Root
          id="tenant-field"
          required
          invalid={!!errors.tenant_id}
          disabled={isLoadingTenants || !tenantsData}
        >
          <Field.Label {...labelProps}>{t('common.labels.company')}</Field.Label>
          <Controller
            name="tenant_id"
            control={control}
            rules={{ required: t('validation.required.selectCompany') }}
            render={({ field }) => (
              <Select.Root
                collection={tenantCollection}
                w="full"
                name={field.name}
                value={field.value ? [field.value] : []}
                onValueChange={(details) => {
                  field.onChange(details.value[0] ?? '');
                }}
                onOpenChange={(e) => setTenantSelectOpen(e.open)}
                onInteractOutside={() => field.onBlur()}
                disabled={isLoadingTenants || !tenantsData}
                invalid={!!errors.tenant_id}
                positioning={{
                  strategy: 'fixed',
                  hideWhenDetached: true,
                }}
              >
                <Select.HiddenSelect />
                <Select.Control>
                  <Select.Trigger {...darkSelectTriggerProps}>
                    <Select.ValueText
                      placeholder={
                        isLoadingTenants
                          ? t('common.placeholders.selectCompanyLoading')
                          : t('common.placeholders.selectCompany')
                      }
                      color={field.value ? 'ui.Modal.fieldText' : MUTED_TEXT}
                    />
                  </Select.Trigger>
                  <Select.IndicatorGroup>
                    <Select.Indicator
                      display="inline-flex"
                      transition="transform 0.2s ease, color 0.2s ease"
                      color={
                        tenantSelectOpen ? 'ui.Modal.fieldText' : MUTED_TEXT
                      }
                      transform={
                        tenantSelectOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                      }
                    />
                  </Select.IndicatorGroup>
                </Select.Control>
                <Select.Positioner>
                  <Select.Content {...selectContentProps}>
                    {tenantCollection.items.map((item) => (
                      <Select.Item
                        key={item.value}
                        item={item}
                        {...selectItemProps}
                      >
                        <Select.ItemText>{item.label}</Select.ItemText>
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Positioner>
              </Select.Root>
            )}
          />
          <Field.ErrorText>{errors.tenant_id?.message}</Field.ErrorText>
          {!isLoadingTenants && !tenantsData && (
            <Text color="ui.Form.errorText" fontSize="sm">
              {t('fields.user.errors.failedToLoadCompanies')}
            </Text>
          )}
        </Field.Root>

        <Field.Root id="email-field" required invalid={!!errors.email}>
          <Field.Label {...labelProps}>{t('common.labels.email')}</Field.Label>
          <Input
            id="email"
            {...register('email', {
              required: t('validation.required.email'),
              pattern: {
                value: emailPattern.value,
                message: t('validation.invalid.email'),
              },
            })}
            {...darkFieldControlProps}
            placeholder={t('common.placeholders.emailExample')}
            type="email"
          />
          <Field.ErrorText>{errors.email?.message}</Field.ErrorText>
        </Field.Root>

        <Field.Root id="fullname-field" invalid={!!errors.full_name}>
          <Field.Label {...labelProps}>{t('common.labels.fullName')}</Field.Label>
          <Input
            id="full_name"
            {...register('full_name')}
            {...fieldControlProps}
            placeholder={t('common.placeholders.fullName')}
            type="text"
          />
          <Field.ErrorText>{errors.full_name?.message}</Field.ErrorText>
        </Field.Root>

        <Field.Root id="password-field" invalid={!!errors.password}>
          <Field.Label {...labelProps}>
            {t('fields.user.labels.newPassword')}
          </Field.Label>
          <InputGroup
            w="100%"
            _focusWithin={{ '& svg': { color: 'ui.Modal.fieldText' } }}
            endElementProps={{ color: MUTED_TEXT }}
            endElement={
              <IconButton
                aria-label={
                  showPassword
                    ? t('common.a11y.hidePassword')
                    : t('common.a11y.showPassword')
                }
                variant="ghost"
                minW="auto"
                h="auto"
                type="button"
                color={MUTED_TEXT}
                _hover={{ color: MUTED_TEXT, bg: 'transparent' }}
                _focusVisible={{ boxShadow: 'none !important' }}
                onClick={() => setShowPassword((prev) => !prev)}
              >
                <Box
                  as={showPassword ? Eye : EyeOff}
                  boxSize="18px"
                  color="currentColor"
                />
              </IconButton>
            }
          >
            <Input
              id="password"
              {...register('password', {
                minLength: {
                  value: 8,
                  message: t('validation.minLength.password8'),
                },
              })}
              {...fieldControlProps}
              placeholder={t('common.placeholders.leaveEmptyToKeep')}
              type={showPassword ? 'text' : 'password'}
            />
          </InputGroup>
          <Field.ErrorText>{errors.password?.message}</Field.ErrorText>
        </Field.Root>

        <Field.Root
          id="confirm-password-field"
          invalid={!!errors.confirm_password}
        >
          <Field.Label {...labelProps}>
            {t('fields.user.labels.confirmNewPassword')}
          </Field.Label>
          <InputGroup
            w="100%"
            _focusWithin={{ '& svg': { color: 'ui.Modal.fieldText' } }}
            endElementProps={{ color: MUTED_TEXT }}
            endElement={
              <IconButton
                aria-label={
                  showConfirmPassword
                    ? t('common.a11y.hidePassword')
                    : t('common.a11y.showPassword')
                }
                variant="ghost"
                minW="auto"
                h="auto"
                type="button"
                color={MUTED_TEXT}
                _hover={{ color: MUTED_TEXT, bg: 'transparent' }}
                _focusVisible={{ boxShadow: 'none !important' }}
                onClick={() => setShowConfirmPassword((prev) => !prev)}
              >
                <Box
                  as={showConfirmPassword ? Eye : EyeOff}
                  boxSize="18px"
                  color="currentColor"
                />
              </IconButton>
            }
          >
            <Input
              id="confirm_password"
              {...register('confirm_password', {
                validate: (value) =>
                  !getValues().password ||
                  value === getValues().password ||
                  t('validation.mismatch.passwords'),
              })}
              {...fieldControlProps}
              placeholder={t('common.placeholders.repeatNewPassword')}
              type={showConfirmPassword ? 'text' : 'password'}
            />
          </InputGroup>
          <Field.ErrorText>{errors.confirm_password?.message}</Field.ErrorText>
        </Field.Root>
      </VStack>

      <Flex mt={4} direction="column" gap={4} maxW="452px">
        <Controller
          control={control}
          name="is_superuser"
          render={({ field }) => (
            <Field.Root id={`superuser-${user.id}`} disabled={field.disabled}>
              <CheckboxCustom
                css={checkboxFigmaCss}
                checked={Boolean(field.value)}
                onCheckedChange={({ checked }) => field.onChange(checked)}
              >
                {t('fields.user.labels.superUser')}
              </CheckboxCustom>
            </Field.Root>
          )}
        />
        <Controller
          control={control}
          name="is_active"
          render={({ field }) => (
            <Field.Root id={`active-${user.id}`} disabled={field.disabled}>
              <CheckboxCustom
                css={checkboxFigmaCss}
                checked={Boolean(field.value)}
                onCheckedChange={({ checked }) => field.onChange(checked)}
              >
                {t('fields.user.labels.active')}
              </CheckboxCustom>
            </Field.Root>
          )}
        />
      </Flex>
    </ManagementDialogShell>
  );
};

export default EditUser;
