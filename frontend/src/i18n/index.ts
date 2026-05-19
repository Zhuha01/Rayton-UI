/**
 * Configures i18next with lazy-loaded JSON namespaces per locale, React bindings, and browser-backed language persistence.
 * Supported languages and namespaces are enumerated here so the bundler can code-split translations on demand.
 */

import i18n from "i18next"
import resourcesToBackend from "i18next-resources-to-backend"
import { initReactI18next } from "react-i18next"

const supportedLanguages = ["uk", "en", "pl", "de"] as const
type SupportedLanguage = (typeof supportedLanguages)[number]

const translationNamespaces = [
  "translation",
  "Dashboard",
  "Interactive",
  "Navbar",
  "RecoverPassword",
  "ResetPassword",
  "Schedule",
  "SES",
  "Sidebar",
  "Uze",
  "control",
  "management",
  "not-found",
  "plant-setting",
  "userSettings",
] as const

const normalizeLanguage = (
  language: string | null | undefined,
): SupportedLanguage => {
  const languageCode = language?.split("-")[0]?.toLowerCase()
  return (
    supportedLanguages.find((supported) => supported === languageCode) ?? "uk"
  )
}

const getInitialLanguage = (): SupportedLanguage => {
  if (typeof window === "undefined") {
    return "uk"
  }

  const storedLanguage = window.localStorage.getItem("app-language")
  if (storedLanguage) {
    return normalizeLanguage(storedLanguage)
  }

  return normalizeLanguage(window.navigator.language)
}

void i18n
  .use(
    resourcesToBackend((language: string, namespace: string) =>
      import(`./locales/${language}/${namespace}.json`),
    ),
  )
  .use(initReactI18next)
  .init({
    ns: [...translationNamespaces],
    defaultNS: "translation",
    lng: getInitialLanguage(),
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: true,
    },
  })

i18n.on("languageChanged", (language) => {
  if (typeof window !== "undefined") {
    window.localStorage.setItem("app-language", normalizeLanguage(language))
  }
})

export default i18n
