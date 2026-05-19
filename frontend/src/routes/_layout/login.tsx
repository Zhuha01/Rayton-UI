/**
 * Login route: credential form, remember-me, language switcher, and redirect when a session already exists.
 * Talks to the generated auth client and wires Chakra-based auth chrome consistent with other public routes.
 */

import { Box, Flex, Image, Text } from "@chakra-ui/react"
import {
  createFileRoute,
  Link as RouterLink,
  redirect,
} from "@tanstack/react-router"
import { Lock, Mail } from "lucide-react"
import { type SubmitHandler, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"

import {
  type Body_login_login_access_token as AccessToken,
  ApiError,
} from "@/client"
import { DarkMode } from "@/components_2/ui/ColorMode"
import { AuthCard } from "@/components_2/ui/AuthCard"
import { ButtonCustom } from "@/components_2/ui/ButtonCustom"
import { CheckboxCustom } from "@/components_2/ui/CheckboxCustom"
import { InputCustom } from "@/components_2/ui/InputCustom"
import { LanguageSwitcher } from "@/components_2/ui/LanguageSwitcher"

import useAuth, { isLoggedIn } from "@/hooks/useAuth"
import Picture from "/assets/images/background.png"
import Logo from "/assets/images/new-white-logo.png"

import { emailPattern, passwordRules } from "../../utils"

export const Route = createFileRoute("/_layout/login")({
  component: Login,
  beforeLoad: async () => {
    if (isLoggedIn()) {
      throw redirect({
        to: "/",
      })
    }
  },
})

function Login() {
  const { loginMutation } = useAuth()
  const { t } = useTranslation()
  const {
    register,
    handleSubmit,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<AccessToken>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      username: "",
      password: "",
    },
  })

  const onSubmit: SubmitHandler<AccessToken> = async (data) => {
    if (isSubmitting) return

    try {
      await loginMutation.mutateAsync(data)
    } catch (e) {
      console.error("Error during login:", e)
    }
  }

  const passwordValidationRules = passwordRules()
  const passwordMinLengthRule = passwordValidationRules.minLength as
    | { value: number; message: string }
    | undefined
  const errorMessage = loginMutation.error
    ? loginMutation.error instanceof ApiError &&
      typeof loginMutation.error.body === "object" &&
      loginMutation.error.body !== null &&
      "detail" in loginMutation.error.body
      ? String(loginMutation.error.body.detail)
      : loginMutation.error.message || t("errors.generic")
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
              invalid={!!errors.username}
              errorText={errors.username?.message}
              register={register("username", {
                required: t("validation.usernameRequired"),
                pattern: {
                  value: emailPattern.value,
                  message: t("validation.invalidEmail"),
                },
              })}
              placeholder={t("emailPlaceholder")}
              type="email"
              onInput={() => {
                clearErrors("username")
                loginMutation.reset()
              }}
            />

            <InputCustom
              label={t("passwordLabel")}
              icon={Lock}
              type="password"
              invalid={!!errors.password}
              errorText={errors.password?.message}
              register={register("password", {
                ...passwordValidationRules,
                required: t("validation.passwordRequired"),
                minLength: {
                  value: passwordMinLengthRule?.value ?? 8,
                  message: t("validation.passwordMinLength"),
                },
              })}
              placeholder={t("passwordPlaceholder")}
              onInput={() => {
                clearErrors("password")
                loginMutation.reset()
              }}
            />

            <Flex
              align="center"
              justify="space-between"
              fontWeight={"normal"}
              css={{
                "& .forgot-password-link": {
                  fontSize: "1rem",
                  fontWeight: "normal",
                  color: "rayton_orange.normal",
                  cursor: "pointer",
                  transition: "color 0.2s",
                },
                "& .forgot-password-link:hover": {
                  color: "rayton_orange.hover",
                },
              }}
            >
              <CheckboxCustom>{t("rememberMe")}</CheckboxCustom>

              <RouterLink
                to="/recover-password"
                className="main-link forgot-password-link"
              >
                {t("forgotPassword")}
              </RouterLink>
            </Flex>

            <ButtonCustom type="submit" loading={isSubmitting}>
              {t("loginButton")}
            </ButtonCustom>
          </AuthCard>
        </Flex>

        <Box position="relative" zIndex={1} w="full">
          <Text
            color="#AAAAAA"
            textAlign="center"
            fontWeight={"normal"}
            fontSize="0.625rem"
            maxW="690px"
            mx="auto"
            cursor="default"
          >
            {t("footer")}
          </Text>
        </Box>
      </Flex>
    </DarkMode>
  )
}

export default Login
