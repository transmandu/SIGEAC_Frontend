import axiosInstance from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner";

interface CreatePlanificationEventData {
  title: string,
  start_date: string,
  end_date: string,
  description?: string,
  location_id: string,
}

export const useCreatePlanificationEvent = () => {

  const queryClient = useQueryClient()

  const createMutation = useMutation({
      mutationFn: async ({data, company }: {data: CreatePlanificationEventData, company: string}) => {
          await axiosInstance.post(`/${company}/planification-event`, data)
        },
      onSuccess: () => {
          queryClient.invalidateQueries({queryKey: ['planification-events']})
          toast.success("¡Creado!", {
              description: `El evento ha sido registrado correctamente.`
          })
        },
      onError: (error) => {
          toast.error('Oops!', {
            description: 'No se pudo registrar el evento...'
          })
          console.log(error)
        },
      }
  )
  return {
    createPlanificationEvent: createMutation,
  }
}


export const useUpdatePlanificationEvent = () => {

  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async ({ id, data, company }: { id: string; data: any, company: string }) => {
      await axiosInstance.put(`/${company}/planification-event/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planification-events'] });
      toast("¡Actualizado!", {
        description: "¡El evento se ha actualizado correctamente!",
      });
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: `Hubo un error al actualizar el evento: ${error}`,
      });
    },
  });

  return {
    updatePlanificationEvent: updateMutation,
  };
};
