/**
 * Tenant Fields within the Rayton operator UI (components_2/Pages/management/Tenant/TenantFields.tsx).
 * Built with Chakra UI and shared theme tokens to stay consistent with dashboards, management, and control surfaces.
 * Primary contract: exported component props and functions below (see TypeScript types for required fields).
 */
import { Box, Field, Input, NumberInput, Textarea, VStack } from '@chakra-ui/react';
import {
  Controller,
  type Control,
  type FieldErrors,
  type UseFormRegister,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import {
  numberInputStyles,
  darkFieldControlProps,
  fieldControlProps,
  labelProps,
  textareaFieldProps,
} from '../sharedModalStyles';

export type TenantFormData = {
  name: string;
  description?: string | null;
  plant_id?: number | null;
};

export interface TenantFieldsProps {
  control: Control<TenantFormData>;
  register: UseFormRegister<TenantFormData>;
  errors: FieldErrors<TenantFormData>;
  idPrefix: string;
  maxW?: string;
}

export function TenantFields({
  control,
  register,
  errors,
  idPrefix,
  maxW = '452px',
}: TenantFieldsProps) {
  const { t } = useTranslation('management');
  return (
    <VStack gap={4} align="stretch" maxW={maxW}>
      <Field.Root
        id={`${idPrefix}-tenant-name`}
        required
        invalid={Boolean(errors.name)}
      >
        <Field.Label {...labelProps}>{t('fields.tenant.labels.name')}</Field.Label>
        <Input
          id="name"
          {...register('name', {
            required: t('validation.required.tenantName'),
            maxLength: {
              value: 255,
              message: t('validation.maxLength.tenantName255'),
            },
          })}
          {...darkFieldControlProps}
          placeholder={t('fields.tenant.placeholders.name')}
        />
        <Field.ErrorText>{errors.name?.message}</Field.ErrorText>
      </Field.Root>

      <Field.Root
        id={`${idPrefix}-tenant-desc`}
        invalid={Boolean(errors.description)}
      >
        <Field.Label {...labelProps}>
          {t('fields.tenant.labels.description')}
        </Field.Label>
        <Textarea
          id="description"
          {...register('description', {
            maxLength: {
              value: 1024,
              message: t('validation.maxLength.tenantDescription1024'),
            },
          })}
          {...textareaFieldProps}
          placeholder={t('fields.tenant.placeholders.description')}
        />
        <Field.ErrorText>{errors.description?.message}</Field.ErrorText>
      </Field.Root>

      <Field.Root
        id={`${idPrefix}-plant-id`}
        invalid={Boolean(errors.plant_id)}
      >
        <Field.Label {...labelProps}>{t('common.labels.plantObjectId')}</Field.Label>
        <Controller
          name="plant_id"
          control={control}
          rules={{
            validate: (v) =>
              v == null ||
              Number.isNaN(v) ||
              v >= 1 ||
              t('validation.number.positive'),
          }}
          render={({ field }) => (
            <NumberInput.Root
              id="plant_id"
              name={field.name}
              min={1}
              value={
                field.value == null || Number.isNaN(field.value)
                  ? ''
                  : String(field.value)
              }
              onValueChange={(details) => {
                if (!details.value) {
                  field.onChange(null);
                  return;
                }
                const n = Number(details.value);
                field.onChange(Number.isFinite(n) ? n : null);
              }}
              {...numberInputStyles.rootProps}
            >
              <NumberInput.Input
                as={Input}
                placeholder={t('common.placeholders.examplePlantIdNumber')}
                inputMode="numeric"
                {...fieldControlProps}
                {...numberInputStyles.inputProps}
                onBlur={field.onBlur}
              />

              <NumberInput.Control {...numberInputStyles.controlProps}>
                <NumberInput.IncrementTrigger
                  aria-label={t('common.a11y.increment')}
                  {...numberInputStyles.triggerBaseProps}
                  {...numberInputStyles.incrementTriggerProps}
                >
                  <Box
                    {...numberInputStyles.iconBoxProps}
                    transform="rotate(-90deg)"
                  />
                </NumberInput.IncrementTrigger>
                <NumberInput.DecrementTrigger
                  aria-label={t('common.a11y.decrement')}
                  {...numberInputStyles.triggerBaseProps}
                  {...numberInputStyles.decrementTriggerProps}
                >
                  <Box
                    {...numberInputStyles.iconBoxProps}
                    transform="rotate(90deg)"
                  />
                </NumberInput.DecrementTrigger>
              </NumberInput.Control>
            </NumberInput.Root>
          )}
        />
        <Field.ErrorText>{errors.plant_id?.message}</Field.ErrorText>
      </Field.Root>
    </VStack>
  );
}
