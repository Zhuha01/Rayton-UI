// 1. Спочатку перевір імпорт. У v3 це часто:
import { useTheme } from "next-themes"
// Або, якщо ти використовуєш генерацію через CLI (Snippet):
// import { useColorMode } from "@/components_2/ui/ColorMode"

export const THUMB_POS = {
  dark: "4px",
  light: "44px",
}

export const ICON_POS = {
  left: "5px",
  right: "45px",
}

export function useThemeLogic() {
  // Використовуємо хук від next-themes (який Chakra v3 використовує під капотом)
  const { theme, setTheme } = useTheme()

  const isDark = theme === "dark"

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark")
  }

  return {
    isDark,
    toggleTheme,
    thumbPosition: isDark ? THUMB_POS.dark : THUMB_POS.light,
    sunOpacity: isDark ? 1 : 0.3,
    moonOpacity: isDark ? 0.3 : 1,
  }
}
