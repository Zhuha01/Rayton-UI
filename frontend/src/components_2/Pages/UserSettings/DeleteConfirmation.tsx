/**
 * Delete Confirmation within the Rayton operator UI (components_2/Pages/UserSettings/DeleteConfirmation.tsx).
 * Built with Chakra UI and shared theme tokens to stay consistent with dashboards, management, and control surfaces.
 * Primary contract: exported component props and functions below (see TypeScript types for required fields).
 */
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { type ApiError, UsersService } from "@/client"
import { ConfirmDeleteDialog } from "@/components_2/Pages/management/ConfirmDeleteDialog"
import { ButtonCustom } from "@/components_2/ui/ButtonCustom"
import useAuth from "@/hooks/useAuth"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"

const DeleteConfirmation = () => {
  const { t } = useTranslation("userSettings")
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()
  const { showSuccessToast } = useCustomToast()
  const {
    handleSubmit,
    formState: { isSubmitting },
  } = useForm()
  const { logout } = useAuth()

  const mutation = useMutation({
    mutationFn: () => UsersService.deleteUserMe(),
    onSuccess: () => {
      showSuccessToast(t("toast.accountDeleted"))
      setIsOpen(false)
      logout()
    },
    onError: (err: ApiError) => {
      handleError(err)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] })
    },
  })

  const onSubmit = async () => {
    mutation.mutate()
  }

  return (
    <ConfirmDeleteDialog
      open={isOpen}
      onOpenChange={({ open }) => setIsOpen(open)}
      trigger={
        <ButtonCustom
          type="button"
          bg="ui.ManagementCardAction.deleteHoverBg"
          _hover={{ bg: "ui.PlcControl.stopHoverBg" }}
          h={{ base: "44px", md: "40px" }}
          px={{ base: "14px", md: "16px" }}
          fontSize={{ base: "15px", md: "16px" }}
          fontWeight="bold"
          fontFamily="Inter"
        >
          {t("deleteAccount.buttonDelete")}
        </ButtonCustom>
      }
      title={t("deleteAccount.dialogTitle")}
      description={t("deleteAccount.dialogBody")}
      confirmText={t("deleteAccount.dialogConfirm")}
      cancelText={t("deleteAccount.dialogCancel")}
      isLoading={isSubmitting}
      onConfirm={handleSubmit(onSubmit)}
    />
  )
}

export default DeleteConfirmation
