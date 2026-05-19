/**
 * Settings Form within the Rayton operator UI (components_2/Pages/UserSettings/SettingsForm.tsx).
 * Built with Chakra UI and shared theme tokens to stay consistent with dashboards, management, and control surfaces.
 * Primary contract: exported component props and functions below (see TypeScript types for required fields).
 */
import { Box, Flex, Heading, Spinner, Stack, Text } from "@chakra-ui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Building2, Key, KeyRound, Lock, Mail, User } from "lucide-react"
import { type ReactNode } from "react"
import { type SubmitHandler, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"

import {
  type ApiError,
  type UpdatePassword,
  type UserPublic,
  UsersService,
} from "@/client"
import {
  settingsFormInputProps,
  userSettingsUi,
} from "@/components_2/Pages/UserSettings/userSettingsUi"
import { ButtonCustom } from "@/components_2/ui/ButtonCustom"
import { InputCustom } from "@/components_2/ui/InputCustom"
import useAuth from "@/hooks/useAuth"
import useCustomToast from "@/hooks/useCustomToast"
import { useTenant } from "@/hooks/useTenantQueries"
import { emailPattern, handleError } from "@/utils"

interface SettingsFormValues {
  full_name: string
  email: string
  current_password: string
  new_password: string
  confirm_password: string
}

const LABEL_WIDTH = { base: "100%", md: "135px" }
const FIELD_WIDTH = { base: "100%", md: "348px" }
const CARD_WIDTH = { base: "100%", md: "552px" }

/** Mobile-friendly label: ellipsis on small screens; inner `span` keeps truncation stable inside buttons. */
const SettingsActionLabel = ({ children }: { children: ReactNode }) => (
  <Box
    as="span"
    display="block"
    w="100%"
    minW={0}
    overflow={{ base: "hidden", md: "visible" }}
    textOverflow={{ base: "ellipsis", md: "clip" }}
    whiteSpace="nowrap"
  >
    {children}
  </Box>
)

const SectionHeading = ({ children }: { children: React.ReactNode }) => (
  <Heading
    fontSize={{ base: "16px", md: "18px" }}
    fontWeight="bold"
    color={userSettingsUi.mutedLabel.color}
  >
    {children}
  </Heading>
)

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <Text
    fontSize="14px"
    fontWeight="bold"
    color={userSettingsUi.mutedLabel.color}
    w={LABEL_WIDTH}
    flexShrink={0}
  >
    {children}
  </Text>
)

// Section divider: border-top only (no 1px background) to avoid blur between stacked sections.
const Divider = () => (
  <Box
    role="separator"
    aria-hidden
    w="full"
    flexShrink={0}
    borderTopWidth="1px"
    borderTopStyle="solid"
    borderTopColor={userSettingsUi.divider.bg}
    opacity={userSettingsUi.divider.opacity}
    my={{ base: "10px", md: "12px" }}
  />
)

const FieldRow = ({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) => (
  <Flex
    align={{ base: "flex-start", md: "center" }}
    direction={{ base: "column", md: "row" }}
    gap={{ base: "6px", md: "16px" }}
  >
    <FieldLabel>{label}</FieldLabel>
    <Box w={FIELD_WIDTH}>{children}</Box>
  </Flex>
)

const SettingsForm = () => {
  const { t } = useTranslation("userSettings")
  const queryClient = useQueryClient()
  const { showSuccessToast } = useCustomToast()
  const { user: currentUser } = useAuth()

  const { data: tenantData, isLoading: isLoadingTenant } = useTenant(
    currentUser?.tenant_id ?? null,
  )

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isSubmitting, isDirty, dirtyFields },
  } = useForm<SettingsFormValues>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      full_name: currentUser?.full_name ?? "",
      email: currentUser?.email ?? "",
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
    values: currentUser
      ? {
          full_name: currentUser.full_name ?? "",
          email: currentUser.email ?? "",
          current_password: "",
          new_password: "",
          confirm_password: "",
        }
      : undefined,
  })

  const profileMutation = useMutation({
    mutationFn: (data: { full_name: string; email: string }) =>
      UsersService.updateUserMe({ requestBody: data }),
    onSuccess: (updatedUser: UserPublic) => {
      queryClient.setQueryData(["currentUser"], updatedUser)
    },
  })

  const passwordMutation = useMutation({
    mutationFn: (data: UpdatePassword) =>
      UsersService.updatePasswordMe({ requestBody: data }),
  })

  const onSubmit: SubmitHandler<SettingsFormValues> = async (data) => {
    const profileChanged = !!dirtyFields.full_name || !!dirtyFields.email
    const passwordsFilled =
      !!data.current_password &&
      !!data.new_password &&
      !!data.confirm_password

    const tasks: Promise<unknown>[] = []
    if (profileChanged) {
      tasks.push(
        profileMutation.mutateAsync({
          full_name: data.full_name,
          email: data.email,
        }),
      )
    }
    if (passwordsFilled) {
      tasks.push(
        passwordMutation.mutateAsync({
          current_password: data.current_password,
          new_password: data.new_password,
        }),
      )
    }

    if (tasks.length === 0) return

    try {
      await Promise.all(tasks)
      showSuccessToast(t("toast.settingsSaved"))
      reset({
        full_name: data.full_name,
        email: data.email,
        current_password: "",
        new_password: "",
        confirm_password: "",
      })
    } catch (err) {
      handleError(err as ApiError)
    }
  }

  const onCancel = () => {
    reset()
  }

  if (!currentUser) {
    return (
      <Flex justify="center" py={6}>
        <Spinner />
      </Flex>
    )
  }

  /** Dynamic validation: password fields are required only when any of the three fields are non-empty. */
  const passwordOptionalRules = (fieldName: keyof SettingsFormValues) => ({
    validate: (value: string | undefined) => {
      const all = getValues([
        "current_password",
        "new_password",
        "confirm_password",
      ])
      const anyFilled = all.some((v) => !!v && v.length > 0)
      if (!anyFilled) return true
      if (!value) return t("validation.passwordFieldsRequired")
      if (value.length < 8) return t("validation.passwordMinLength")
      if (
        fieldName === "confirm_password" &&
        value !== getValues("new_password")
      ) {
        return t("validation.passwordMismatch")
      }
      return true
    },
  })

  return (
    <Box
      as="form"
      onSubmit={handleSubmit(onSubmit)}
      bg={userSettingsUi.card.bg}
      borderRadius={userSettingsUi.card.borderRadius}
      p={{ base: "16px", md: "20px" }}
      w={CARD_WIDTH}
    >
      <Heading
        fontSize={{ base: "16px", md: "18px" }}
        fontWeight="bold"
        color={userSettingsUi.title.color}
        mb={{ base: "8px", md: "12px" }}
      >
        {t("pageTitle")}
      </Heading>

      <Divider />

      <Stack gap={{ base: "10px", md: "12px" }} align="stretch">
        <SectionHeading>{t("sections.personal")}</SectionHeading>

        <FieldRow label={t("fields.fullName")}>
          <InputCustom
            {...settingsFormInputProps}
            icon={User}
            placeholder={t("placeholders.fullName")}
            invalid={!!errors.full_name}
            errorText={errors.full_name?.message}
            register={register("full_name", { maxLength: 255 })}
          />
        </FieldRow>

        <FieldRow label={t("fields.email")}>
          <InputCustom
            {...settingsFormInputProps}
            icon={Mail}
            type="email"
            placeholder={t("placeholders.email")}
            invalid={!!errors.email}
            errorText={errors.email?.message}
            register={register("email", {
              required: t("validation.emailRequired"),
              pattern: emailPattern,
              maxLength: 255,
            })}
          />
        </FieldRow>

        <FieldRow label={t("fields.organization")}>
          <InputCustom
            {...settingsFormInputProps}
            icon={Building2}
            placeholder={
              isLoadingTenant
                ? t("placeholders.tenantLoading")
                : t("placeholders.tenantUndefined")
            }
            value={tenantData?.name ?? ""}
            readOnly
            tabIndex={-1}
          />
        </FieldRow>
      </Stack>

      <Divider />

      <Stack gap={{ base: "10px", md: "12px" }} align="stretch">
        <SectionHeading>{t("sections.security")}</SectionHeading>

        <FieldRow label={t("fields.currentPassword")}>
          <InputCustom
            {...settingsFormInputProps}
            icon={Lock}
            type="password"
            placeholder={t("placeholders.currentPassword")}
            invalid={!!errors.current_password}
            errorText={errors.current_password?.message}
            register={register(
              "current_password",
              passwordOptionalRules("current_password"),
            )}
          />
        </FieldRow>

        <FieldRow label={t("fields.newPassword")}>
          <InputCustom
            {...settingsFormInputProps}
            icon={Key}
            type="password"
            placeholder={t("placeholders.newPassword")}
            invalid={!!errors.new_password}
            errorText={errors.new_password?.message}
            register={register(
              "new_password",
              passwordOptionalRules("new_password"),
            )}
          />
        </FieldRow>

        <FieldRow label={t("fields.confirmPassword")}>
          <InputCustom
            {...settingsFormInputProps}
            icon={KeyRound}
            type="password"
            placeholder={t("placeholders.confirmPassword")}
            invalid={!!errors.confirm_password}
            errorText={errors.confirm_password?.message}
            register={register(
              "confirm_password",
              passwordOptionalRules("confirm_password"),
            )}
          />
        </FieldRow>
      </Stack>

      <Divider />

      <Flex
        direction="row"
        flexWrap="nowrap"
        justify="center"
        gap={{ base: "8px", md: "12px" }}
        w="full"
      >
        <ButtonCustom
          type="button"
          onClick={onCancel}
          disabled={!isDirty || isSubmitting}
          bg={userSettingsUi.actions.cancel.bg}
          color={userSettingsUi.actions.cancel.color}
          _hover={{ bg: userSettingsUi.actions.cancel.hoverBg }}
          _disabled={{ opacity: 0.6, cursor: "not-allowed" }}
          fontSize={{ base: "14px", md: "16px" }}
          fontWeight="bold"
          fontFamily="Inter"
          h={{ base: "44px", md: "40px" }}
          px={{ base: "12px", md: "16px" }}
          borderRadius="8px"
          flex={{ base: "1 1 0", md: "initial" }}
          minW={0}
          overflow={{ base: "hidden", md: "visible" }}
        >
          <SettingsActionLabel>{t("actions.cancel")}</SettingsActionLabel>
        </ButtonCustom>
        <ButtonCustom
          type="submit"
          loading={isSubmitting}
          disabled={!isDirty}
          bg={userSettingsUi.actions.submit.bg}
          color={userSettingsUi.actions.submit.color}
          _hover={{ bg: userSettingsUi.actions.submit.hoverBg }}
          _disabled={{ opacity: 0.6, cursor: "not-allowed" }}
          fontSize={{ base: "15px", md: "16px" }}
          fontWeight="bold"
          fontFamily="Inter"
          h={{ base: "44px", md: "40px" }}
          px={{ base: "14px", md: "16px" }}
          borderRadius="8px"
          flex={{ base: "2 1 0", md: "initial" }}
          minW={0}
          overflow={{ base: "hidden", md: "visible" }}
        >
          <SettingsActionLabel>{t("actions.saveSettings")}</SettingsActionLabel>
        </ButtonCustom>
      </Flex>
    </Box>
  )
}

export default SettingsForm
