import axiosInstance from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

interface CreateEmployeeFormSchema {
  first_name: string;
  last_name: string;
  dni: string;
  job_title_id: string,
  department_id: string,
  location_id: string,
  company: string;
}
export const useCreateEmployee = () => {

    const queryClient = useQueryClient()

    const createMutation = useMutation({
        mutationFn: async (data: CreateEmployeeFormSchema) => {
            await axiosInstance.post(`/employees`, data)
          },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['employees']})
            toast("¡Creado!", {
                description: `¡El empleado se ha creado correctamente!`
            })
          },
        onError: (error) => {
            toast('Hey', {
              description: `No se creo correctamente: ${error}`
            })
          },
        }
    )

    return {
      createEmployee: createMutation,
    }
}
