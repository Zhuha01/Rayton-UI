// frontend/src/hooks/usePlantQueries.ts

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { ApiError } from "@/client"
import { PlantsService } from "@/client"

// Define the Plant type based on your PlantList model
export interface PlantPublic {
  ID: number
  PLANT_ID: number
  latitude: number | null
  longitude: number | null
  timezone: string
  TEXT_L1: string | null
  TEXT_L2: string | null
  tab_config: string | null // JSON string for tab configurations
  created_at: string
  updated_at: string
}

// Response type for paginated plants
export interface PlantsResponse {
  data: PlantPublic[]
  count: number
}

const plantKeys = {
  all: ["plants"] as const,
  accessibleFirst: () => [...plantKeys.all, "accessibleFirst"] as const,
}

async function fetchAccessiblePlantsFirst(): Promise<PlantsResponse> {
  // Backend: superusers get all plants; regular users get only accessible plants.
  const res = (await PlantsService.readAllPlants({
    skip: 0,
    limit: 1,
  })) as unknown as PlantsResponse
  return res
}

export function useAccessiblePlantsFirst(options?: { enabled?: boolean }) {
  return useQuery<PlantsResponse, ApiError>({
    queryKey: plantKeys.accessibleFirst(),
    queryFn: fetchAccessiblePlantsFirst,
    enabled: options?.enabled ?? true,
    staleTime: 60 * 60 * 1000,
  })
}

// Hook to get plant by ID
export const usePlant = (plantId: number | null) => {
  return useQuery<PlantPublic, ApiError>({
    queryKey: ["plant", plantId],
    queryFn: async () => {
      const response = await fetch(`/api/v1/plants/${plantId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      })
      if (!response.ok) {
        throw new Error("Failed to fetch plant")
      }
      return response.json()
    },
    enabled: !!plantId,
    staleTime: 60 * 60 * 1000,
  })
}

// Hook to get all plants (for superuser tenant list)
export const useAllPlants = (page: number = 1, limit: number = 10) => {
  const skip = (page - 1) * limit
  return useQuery<PlantsResponse, ApiError>({
    queryKey: ["plants", "all", { page, limit }],
    queryFn: async () => {
      const response = await fetch(
        `/api/v1/plants/?skip=${skip}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        },
      )
      if (!response.ok) {
        throw new Error("Failed to fetch plants")
      }
      return response.json()
    },
    staleTime: 60 * 60 * 1000,
  })
}

// Hook to create a plant
export const useCreatePlant = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      plantData: Omit<PlantPublic, "ID" | "created_at" | "updated_at">,
    ) => {
      const response = await fetch("/api/v1/plants/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify(plantData),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to create plant")
      }
      return response.json()
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["plants", "all"] })
    },
  })
}

// Hook to update a plant
export const useUpdatePlant = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      plantId,
      plantData,
    }: {
      plantId: number
      plantData: Partial<Omit<PlantPublic, "ID" | "created_at" | "updated_at">>
    }) => {
      const response = await fetch(`/api/v1/plants/${plantId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify(plantData),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to update plant")
      }
      return response.json()
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["plants", "all"] })
      queryClient.invalidateQueries({ queryKey: ["plant"] }) // Invalidate specific plant queries too
    },
  })
}

// Hook to delete a plant
export const useDeletePlant = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (plantId: number) => {
      const response = await fetch(`/api/v1/plants/${plantId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to delete plant")
      }
      return response.json()
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["plants", "all"] })
    },
  })
}
