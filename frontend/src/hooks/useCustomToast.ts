"use client"

import { toaster } from "@/components_2/ui/Toaster"

const useCustomToast = () => {
  const showSuccessToast = (description: string) => {
    toaster.create({
      title: "Success!",
      description,
      type: "success",
    })
  }

  const showErrorToast = (description: string) => {
    toaster.create({
      title: "Something went wrong!",
      description,
      type: "error",
    })
  }

  return { showSuccessToast, showErrorToast }
}

export default useCustomToast
