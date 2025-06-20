import axiosInstance from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

interface CreateEmployeeFormSchema {
  first_name: string;
  last_name: string;
  dni: string;
  company: string;
  job_title_id: string,
  department_id: string,
  location_id: string,
}
export const useCreateManufacturer = () => {

    const queryClient = useQueryClient()

    const createMutation = useMutation({
        mutationFn: async ({company, data}: {data: CreateEmployeeFormSchema, company: string}) => {
            await axiosInstance.post(`/${company}/employees`, data)
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
