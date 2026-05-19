/**
 * TanStack Router file route for setting a new password from a reset token: form, API mutation, and auth shell.
 * Guards against logged-in sessions and reuses the same visual layout as other unauthenticated flows.
 */

import { Box, Flex, Image, Text } from "@chakra-ui/react"
import { useMutation } from "@tanstack/react-query"
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router"
import { Lock } from "lucide-react"
import { type SubmitHandler, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { ApiError, LoginService, type NewPassword } from "@/client"
import { DarkMode } from "@/components_2/ui/ColorMode"
import { AuthCard } from "@/components_2/ui/AuthCard"
import { ButtonCustom } from "@/components_2/ui/ButtonCustom"
import { InputCustom } from "@/components_2/ui/InputCustom"
import { LanguageSwitcher } from "@/components_2/ui/LanguageSwitcher"

import { isLoggedIn } from "@/hooks/useAuth"
import useCustomToast from "@/hooks/useCustomToast"
import Picture from "/assets/images/background.png"
import Logo from "/assets/images/new-white-logo.png"

import { confirmPasswordRules, passwordRules } from "../../utils"

interface NewPasswordForm extends NewPassword {
  confirm_password: string
}

export const Route = createFileRoute("/_layout/reset-password")({
  component: ResetPassword,
  beforeLoad: async () => {
    if (isLoggedIn()) {
      throw redirect({
        to: "/",
      })
    }
  },
})

function ResetPassword() {
  const { t } = useTranslation("ResetPassword")
  const { showSuccessToast } = useCustomToast()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    getValues,
    reset,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<NewPasswordForm>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      new_password: "",
      confirm_password: "",
    },
  })

  const resetPassword = async (data: NewPasswordForm) => {
    const token = new URLSearchParams(window.location.search).get("token")
    if (!token) return
    await LoginService.resetPassword({
      requestBody: { new_password: data.new_password, token: token },
    })
  }

  const mutation = useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      showSuccessToast(t("successMessage"))
      reset()
      navigate({ to: "/login" })
    },
  })

  const onSubmit: SubmitHandler<NewPasswordForm> = async (data) => {
    if (isSubmitting) return
    mutation.mutate(data)
  }

  const passwordValidationRules = passwordRules()
  const passwordMinLengthRule = passwordValidationRules.minLength as
    | { value: number; message: string }
    | undefined

  const errorMessage = mutation.error
    ? mutation.error instanceof ApiError &&
      typeof mutation.error.body === "object" &&
      mutation.error.body !== null &&
      "detail" in mutation.error.body
      ? String(mutation.error.body.detail)
      : mutation.error.message || t("errors.generic")
    : undefined

  return (
    <DarkMode>
      <Flex
        minH="100dvh"
        w="100%"
        direction="column"
        position="relative"
        overflowX="hidden"
        overflow="auto"
        backgroundImage={`url(${Picture})`}
        backgroundSize="cover"
        backgroundPosition="center"
        px={{ base: "16px", md: "24px" }}
        pt={{ base: "16px", md: "24px" }}
        pb={{ base: "16px", md: "24px" }}
        gap="24px"
      >
        <Box position="absolute" />

        <Flex
          position="relative"
          zIndex={1}
          w="full"
          align="flex-start"
          justify="center"
        >
          <Image
            src={Logo}
            alt="Rayton logo"
            h="42px"
            w="156px"
            objectFit="contain"
            userSelect="none"
            pointerEvents="none"
            draggable={false}
          />
          <LanguageSwitcher position="absolute" right="0" />
        </Flex>

        <Flex
          flex="1"
          w="full"
          position="relative"
          zIndex={1}
          align="center"
          justify="center"
        >
          <AuthCard
            titlePrefix={t("titlePrefix")}
            titleHighlight={t("titleHighlight")}
            subtitle={t("subtitle")}
            onSubmit={handleSubmit(onSubmit)}
            errorMessage={errorMessage}
          >
            <InputCustom
              label={t("newPasswordLabel")}
              icon={Lock}
              type="password"
              invalid={!!errors.new_password}
              errorText={errors.new_password?.message}
              register={register("new_password", {
                ...passwordValidationRules,
                required: t("validation.passwordRequired"),
                minLength: {
                  value: passwordMinLengthRule?.value ?? 8,
                  message: t("validation.passwordMinLength"),
                },
              })}
              placeholder={t("newPasswordPlaceholder")}
              onInput={() => {
                clearErrors("new_password")
                mutation.reset()
              }}
            />

            <InputCustom
              label={t("confirmPasswordLabel")}
              icon={Lock}
              type="password"
              invalid={!!errors.confirm_password}
              errorText={errors.confirm_password?.message}
              register={register("confirm_password", {
                ...confirmPasswordRules(getValues),
                required: t("validation.confirmRequired"),
                validate: (value: string) =>
                  value === getValues().new_password
                    ? true
                    : t("validation.passwordsDontMatch"),
              })}
              placeholder={t("confirmPasswordPlaceholder")}
              onInput={() => {
                clearErrors("confirm_password")
                mutation.reset()
              }}
            />

            <ButtonCustom type="submit" loading={isSubmitting}>
              {t("button")}
            </ButtonCustom>
          </AuthCard>
        </Flex>

        <Box position="relative" zIndex={1} w="full">
          <Text
            color="#AAAAAA"
            textAlign="center"
            fontWeight="normal"
            fontSize="0.625rem"
            maxW="690px"
            mx="auto"
            cursor="default"
          >
            {t("footer", { ns: "translation" })}
          </Text>
        </Box>
      </Flex>
    </DarkMode>
  )
}

export default ResetPassword
