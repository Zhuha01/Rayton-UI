/**
 * TanStack Router file route for the recover-password flow: email capture, API call, and branded auth layout.
 * Redirects authenticated users away; composes shared auth UI with i18n and react-hook-form validation.
 */

import { Box, Flex, Image, Text } from "@chakra-ui/react"
import { useMutation } from "@tanstack/react-query"
import {
  createFileRoute,
  Link as RouterLink,
  redirect,
} from "@tanstack/react-router"
import { Mail } from "lucide-react"
import { type SubmitHandler, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { ApiError, LoginService } from "@/client"
import { DarkMode } from "@/components_2/ui/ColorMode"
import { AuthCard } from "@/components_2/ui/AuthCard"
import { ButtonCustom } from "@/components_2/ui/ButtonCustom"
import { InputCustom } from "@/components_2/ui/InputCustom"
import { LanguageSwitcher } from "@/components_2/ui/LanguageSwitcher"

import { isLoggedIn } from "@/hooks/useAuth"
import useCustomToast from "@/hooks/useCustomToast"
import Picture from "/assets/images/background.png"
import Logo from "/assets/images/new-white-logo.png"

import { emailPattern } from "../../utils"

interface FormData {
  email: string
}

export const Route = createFileRoute("/_layout/recover-password")({
  component: RecoverPassword,
  beforeLoad: async () => {
    if (isLoggedIn()) {
      throw redirect({
        to: "/",
      })
    }
  },
})

function RecoverPassword() {
  const { t } = useTranslation("RecoverPassword")
  const { showSuccessToast } = useCustomToast()

  const {
    register,
    handleSubmit,
    reset,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      email: "",
    },
  })

  const recoverPassword = async (data: FormData) => {
    await LoginService.recoverPassword({
      email: data.email,
    })
  }

  const mutation = useMutation({
    mutationFn: recoverPassword,
    onSuccess: () => {
      showSuccessToast(t("successMessage"))
      reset()
    },
  })

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    if (isSubmitting) return
    mutation.mutate(data)
  }

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
              label={t("emailLabel")}
              icon={Mail}
              invalid={!!errors.email}
              errorText={errors.email?.message}
              register={register("email", {
                required: t("validation.emailRequired"),
                pattern: {
                  value: emailPattern.value,
                  message: t("validation.invalidEmail"),
                },
              })}
              placeholder={t("emailPlaceholder")}
              type="email"
              onInput={() => {
                clearErrors("email")
                mutation.reset()
              }}
            />

            <ButtonCustom type="submit" loading={isSubmitting}>
              {t("button")}
            </ButtonCustom>

            <Flex
              align="center"
              justify="center"
              fontWeight="normal"
              css={{
                "& .back-to-login-link": {
                  fontSize: "1rem",
                  fontWeight: "normal",
                  color: "rayton_orange.normal",
                  cursor: "pointer",
                  transition: "color 0.2s",
                },
                "& .back-to-login-link:hover": {
                  color: "rayton_orange.hover",
                },
              }}
            >
              <RouterLink to="/login" className="main-link back-to-login-link">
                {t("backToLogin")}
              </RouterLink>
            </Flex>
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

export default RecoverPassword
