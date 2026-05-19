/**
 * Add User within the Rayton operator UI (components_2/Pages/management/User/AddUser.tsx).
 * Built with Chakra UI and shared theme tokens to stay consistent with dashboards, management, and control surfaces.
 * Primary contract: exported component props and functions below (see TypeScript types for required fields).
 */
import {
  Box,
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
import { useMemo, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { type TenantPublic, type UserCreate, UsersService } from '@/client';
import type { ApiError } from '@/client/core/ApiError';
import { InputGroup } from "@/components_2/ui/InputGroup"
import { CheckboxCustom } from '@/components_2/ui/CheckboxCustom';
import useCustomToast from '@/hooks/useCustomToast';
import { useTenants } from '@/hooks/useTenantQueries';
import { emailPattern, handleError } from '@/utils';
import { SharedAddButton } from '../SharedAddButton';
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

interface UserCreateForm extends Omit<UserCreate, 'tenant_id'> {
  confirm_password: string;
  tenant_id: string;
}

const AddUser = () => {
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
  } = useForm<UserCreateForm>({
    mode: 'onBlur',
    criteriaMode: 'all',
    defaultValues: {
      email: '',
      full_name: '',
      password: '',
      confirm_password: '',
      is_superuser: false,
      is_active: true,
      tenant_id: '',
    },
  });

  const mutation = useMutation({
    mutationFn: (data: UserCreate) =>
      UsersService.createUser({ requestBody: data }),
    onSuccess: () => {
      showSuccessToast(t('toasts.user.created'));
      reset();
      setIsOpen(false);
    },
    onError: (err: ApiError) => {
      handleError(err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const onSubmit: SubmitHandler<UserCreateForm> = (data) => {
    const userCreateData: UserCreate = {
      email: data.email,
      password: data.password,
      full_name: data.full_name || null,
      is_active: data.is_active,
      is_superuser: data.is_superuser,
      tenant_id: data.tenant_id,
    };
    mutation.mutate(userCreateData);
  };

  const handleOpenChange = ({ open }: { open: boolean }) => {
    setIsOpen(open);
    if (!open) {
      reset();
    }
  };

  return (
    <ManagementDialogShell
      open={isOpen}
      onOpenChange={handleOpenChange}
      trigger={<SharedAddButton />}
      title={t('modals.user.add.title')}
      description={t('modals.user.add.description')}
      onSubmit={handleSubmit(onSubmit)}
      footer={
        <ManagementDialogActions
          onCancel={() => handleOpenChange({ open: false })}
          isSubmitting={isSubmitting}
          isSubmitDisabled={!isValid || isLoadingTenants || !tenantsData}
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

        <Field.Root id="password-field" required invalid={!!errors.password}>
          <Field.Label {...labelProps}>{t('fields.user.labels.password')}</Field.Label>
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
                required: t('validation.required.password'),
                minLength: {
                  value: 8,
                  message: t('validation.minLength.password8'),
                },
              })}
              {...darkFieldControlProps}
              placeholder={t('common.placeholders.password')}
              type={showPassword ? 'text' : 'password'}
            />
          </InputGroup>
          <Field.ErrorText>{errors.password?.message}</Field.ErrorText>
        </Field.Root>

        <Field.Root
          id="confirm-password-field"
          required
          invalid={!!errors.confirm_password}
        >
          <Field.Label {...labelProps}>
            {t('fields.user.labels.confirmPassword')}
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
                required: t('validation.required.confirmPassword'),
                validate: (value) =>
                  value === getValues().password ||
                  t('validation.mismatch.passwords'),
              })}
              {...darkFieldControlProps}
              placeholder={t('common.placeholders.repeatPassword')}
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
            <Field.Root id="is_superuser-field" disabled={field.disabled}>
              <CheckboxCustom
                css={checkboxFigmaCss}
                checked={field.value}
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
            <Field.Root id="is_active-field" disabled={field.disabled}>
              <CheckboxCustom
                css={checkboxFigmaCss}
                checked={field.value}
                onCheckedChange={({ checked }) => field.onChange(checked)}
              >
                {t('fields.user.labels.activeWithDefaultYes')}
              </CheckboxCustom>
            </Field.Root>
          )}
        />
      </Flex>
    </ManagementDialogShell>
  );
};

export default AddUser;
