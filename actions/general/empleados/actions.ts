import axiosInstance from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

interface ManufacturerSchema {
    name: string,
    description: string,
    type: "AIRCRAFT" | "PART",
}

export const useCreateManufacturer = () => {

    const queryClient = useQueryClient()

    const createMutation = useMutation({
        mutationFn: async ({company, data}: {
          company: string | undefined, data: ManufacturerSchema
        }) => {
            await axiosInstance.post(`/${company}/manufacturers`, data)
          },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['manufacturers']})
            toast("¡Creado!", {
                description: `¡El fabricante se ha creado correctamente!`
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
      createManufacturer: createMutation,
    }
}
