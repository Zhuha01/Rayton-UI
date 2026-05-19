/**
 * Primary "add" control for management pages; defaults label to the translated `common.actions.add`.
 * Accepts optional `children` to override the label while keeping shared padding and icon.
 */

import { Plus } from "lucide-react"
import { type ButtonHTMLAttributes, forwardRef, type ReactNode } from "react"
import { useTranslation } from "react-i18next"

import { ButtonCustom } from "@/components_2/ui/ButtonCustom"

interface SharedAddButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode
}

export const SharedAddButton = forwardRef<
  HTMLButtonElement,
  SharedAddButtonProps
>(({ children, ...props }, ref) => {
  const { t } = useTranslation("management")
  const effectiveChildren = children ?? t("common.actions.add")
  return (
    <ButtonCustom
      ref={ref}
      px="16px"
      py={0}
      iconLeft={<Plus size={12} />}
      {...props}
    >
      {effectiveChildren}
    </ButtonCustom>
  )
})

SharedAddButton.displayName = "SharedAddButton"
