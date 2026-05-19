/**
 * Plant Fields within the Rayton operator UI (components_2/Pages/management/Plant/PlantFields.tsx).
 * Built with Chakra UI and shared theme tokens to stay consistent with dashboards, management, and control surfaces.
 * Primary contract: exported component props and functions below (see TypeScript types for required fields).
 */
import { Box, Field, Input, NumberInput, Textarea, VStack } from '@chakra-ui/react';
import type { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

import type { PlantPublic } from '@/hooks/usePlantQueries';
import {
  darkFieldControlProps,
  darkNumberInputStyles,
  fieldControlProps,
  labelProps,
  numberInputStyles,
} from '../sharedModalStyles';

export interface PlantFormShape {
  PLANT_ID?: number;
  latitude?: number | null;
  longitude?: number | null;
  timezone?: string;
  TEXT_L1?: string;
  TEXT_L2?: string;
  tab_config?: string;
}

export interface PlantFieldsProps {
  value: PlantFormShape;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  plantIdDisabled?: boolean;
  maxW?: string;
}

function toInputValue(v: unknown) {
  if (v == null) return '';
  return String(v);
}

export function PlantFields({
  value,
  onChange,
  plantIdDisabled = false,
  maxW = '452px',
}: PlantFieldsProps) {
  const { t } = useTranslation('management');

  const emitChange = (name: string, nextValue: string) => {
    onChange({ target: { name, value: nextValue } } as any);
  };

  return (
    <VStack gap={4} align="stretch" maxW={maxW}>
      <Field.Root id="plant-id" required>
        <Field.Label {...labelProps}>{t('common.labels.plantObjectId')}</Field.Label>
        <NumberInput.Root
          id="PLANT_ID"
          name="PLANT_ID"
          min={0}
          value={toInputValue(value.PLANT_ID)}
          onValueChange={(details) => emitChange('PLANT_ID', details.value)}
          disabled={plantIdDisabled}
          {...darkNumberInputStyles.rootProps}
        >
          <NumberInput.Input
            as={Input}
            type="text"
            inputMode="numeric"
            placeholder={
              plantIdDisabled
                ? t('common.labels.plantObjectId')
                : t('common.placeholders.examplePlantIdNumber')
            }
            {...darkFieldControlProps}
            {...darkNumberInputStyles.inputProps}
          />

          <NumberInput.Control {...darkNumberInputStyles.controlProps}>
            <NumberInput.IncrementTrigger
              aria-label={t('common.a11y.increment')}
              {...darkNumberInputStyles.triggerBaseProps}
              {...darkNumberInputStyles.incrementTriggerProps}
            >
              <Box
                {...darkNumberInputStyles.iconBoxProps}
                transform="rotate(-90deg)"
              />
            </NumberInput.IncrementTrigger>
            <NumberInput.DecrementTrigger
              aria-label={t('common.a11y.decrement')}
              {...darkNumberInputStyles.triggerBaseProps}
              {...darkNumberInputStyles.decrementTriggerProps}
            >
              <Box
                {...darkNumberInputStyles.iconBoxProps}
                transform="rotate(90deg)"
              />
            </NumberInput.DecrementTrigger>
          </NumberInput.Control>
        </NumberInput.Root>
      </Field.Root>

      <Field.Root id="latitude">
        <Field.Label {...labelProps}>{t('fields.plant.labels.latitude')}</Field.Label>
        <NumberInput.Root
          id="latitude"
          name="latitude"
          step={0.000001}
          value={toInputValue(value.latitude)}
          onValueChange={(details) => emitChange('latitude', details.value)}
          {...numberInputStyles.rootProps}
        >
          <NumberInput.Input
            as={Input}
            type="text"
            inputMode="decimal"
            placeholder={t('common.placeholders.latitude')}
            {...fieldControlProps}
            {...numberInputStyles.inputProps}
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
      </Field.Root>

      <Field.Root id="longitude">
        <Field.Label {...labelProps}>{t('fields.plant.labels.longitude')}</Field.Label>
        <NumberInput.Root
          id="longitude"
          name="longitude"
          step={0.000001}
          value={toInputValue(value.longitude)}
          onValueChange={(details) => emitChange('longitude', details.value)}
          {...numberInputStyles.rootProps}
        >
          <NumberInput.Input
            as={Input}
            type="text"
            inputMode="decimal"
            placeholder={t('common.placeholders.longitude')}
            {...fieldControlProps}
            {...numberInputStyles.inputProps}
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
      </Field.Root>

      <Field.Root id="timezone" required>
        <Field.Label {...labelProps}>{t('common.labels.timezone')}</Field.Label>
        <Input
          id="timezone"
          name="timezone"
          value={toInputValue(value.timezone)}
          onChange={onChange}
          {...darkFieldControlProps}
          placeholder={t('common.placeholders.timezoneExample')}
        />
      </Field.Root>

      <Field.Root id="text-l1">
        <Field.Label {...labelProps}>
          {t('fields.plant.labels.textLine1')}
        </Field.Label>
        <Input
          id="TEXT_L1"
          name="TEXT_L1"
          value={toInputValue(value.TEXT_L1)}
          onChange={onChange}
          {...fieldControlProps}
          placeholder={t('common.placeholders.textLine1')}
        />
      </Field.Root>

      <Field.Root id="text-l2">
        <Field.Label {...labelProps}>
          {t('fields.plant.labels.textLine2')}
        </Field.Label>
        <Input
          id="TEXT_L2"
          name="TEXT_L2"
          value={toInputValue(value.TEXT_L2)}
          onChange={onChange}
          {...fieldControlProps}
          placeholder={t('common.placeholders.textLine2')}
        />
      </Field.Root>

      <Field.Root id="tab-config">
        <Field.Label {...labelProps}>{t('fields.plant.labels.tabConfig')}</Field.Label>
        <Textarea
          value={toInputValue(value.tab_config)}
          onChange={(e) => emitChange('tab_config', e.target.value)}
          bg="ui.Modal.fieldBg"
          borderRadius="8px"
          px="16px"
          fontSize="15px"
          color="ui.Modal.fieldText"
          borderWidth="1px"
          borderColor="transparent"
          _placeholder={{ color: 'ui.Modal.fieldPlaceholder' }}
          _hover={{ borderColor: 'ui.Modal.fieldBorderHover' }}
          _focus={{
            borderColor: 'ui.Modal.fieldBorderHover',
            outline: 'none',
            color: 'ui.Modal.fieldText',
          }}
          _focusVisible={{
            borderColor: 'ui.Modal.fieldBorderHover',
            outline: 'none',
            color: 'ui.Modal.fieldText',
          }}
          h="auto"
          minH="100px"
          py="10px"
          placeholder={t('common.placeholders.tabConfigJsonOptional')}
        />
      </Field.Root>
    </VStack>
  );
}

export function plantFormFromPlant(plant: PlantPublic): PlantFormShape {
  return {
    PLANT_ID: plant.PLANT_ID,
    latitude: plant.latitude,
    longitude: plant.longitude,
    timezone: plant.timezone ?? '',
    TEXT_L1: plant.TEXT_L1 ?? '',
    TEXT_L2: plant.TEXT_L2 ?? '',
    tab_config: plant.tab_config ?? '',
  };
}


