import axiosInstance from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

/* =========================
   TYPES
========================= */

export interface CreateEmployeeSchema {
  first_name: string
  middle_name?: string
  last_name?: string
  second_last_name?: string
  dni: string
  dni_type: string
  blood_type: string
  gender: "MALE" | "FEMALE"
  job_title_id: string
  department_id: string
  location_id: string
  user_id?: string
  company: string
  profile_photo?: File
}
export interface UpdateEmployeePayload {
  company: string
  id: number
  data: FormData
}

/* =========================
   CREATE
========================= */

export const useCreateEmployee = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateEmployeeSchema) => {
      const formData = new FormData()

      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value as any)
        }
      })

      const { data: response } = await axiosInstance.post(
        `/${data.company}/employees`,
        formData
      )

      return response
    },

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["employees", variables.company]
      })

      toast.success("Empleado creado correctamente")
    },

    onError: (error: any) => {
      toast.error(error?.message ?? "Error al crear empleado")
    }
  })
}

/* =========================
   UPDATE
========================= */

  export const useUpdateEmployee = () => {
    const queryClient = useQueryClient()

    return useMutation({
      mutationFn: async ({ id, company, data }: UpdateEmployeePayload) => {

        // 🔒 VALIDACIÓN CRÍTICA
        if (typeof id !== "number" || Number.isNaN(id)) {
          throw new Error(`Invalid employee id: ${id}`)
        }

        if (!company || typeof company !== "string") {
          throw new Error(`Invalid company: ${company}`)
        }

        const url = `/${encodeURIComponent(company)}/employees/${id}`

        const { data: response } = await axiosInstance.post(url, data, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            params: {
              _method: "PATCH",
            },
          });

        return response
      },

      onSuccess: (response, variables) => {
        queryClient.invalidateQueries({
          queryKey: ["employees", variables.company],
        })

        queryClient.invalidateQueries({
          queryKey: ["employee", variables.company, variables.id],
        })

        toast.success(response?.message ?? "Empleado actualizado correctamente")
      },

      onError: (error: any) => {
        console.error("Update Employee Error:", error?.response?.data)

        toast.error(
          error?.response?.data?.message ??
          "Error al actualizar empleado"
        )
      },
    })
  }

/* =========================
   DELETE
========================= */

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      company
    }: {
      id: number
      company: string
    }) => {
      const { data } = await axiosInstance.delete(
        `/${company}/employees/${id}`
      )
      return data
    },

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["employees", variables.company]
      })

      toast.success("Empleado eliminado correctamente")
    },

    onError: (error: any) => {
      toast.error(error?.message ?? "Error al eliminar")
    }
  })
}