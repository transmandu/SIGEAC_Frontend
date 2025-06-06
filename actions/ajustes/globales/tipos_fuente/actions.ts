import axiosInstance from "@/lib/axios";
import {
  ComponentArticle,
  ConsumableArticle,
  DispatchRequest,
  Request,
} from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface InformationSourceData {
  name: string;
  type: string;
}

interface UpdateInformationSourceData {
  id:   string;
  name: string;
  type: string;
}


export const useCreateInformationSource = () => {
  const queryClient = useQueryClient();
  const createMutation = useMutation({
    mutationKey: ["information-sources"],
    mutationFn: async (data: InformationSourceData) => {
      await axiosInstance.post("/transmandu/information-sources", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["information-sources"] });
      toast.success("¡Creado!", {
        description: ` La fuente de informacion ha sido creado correctamente.`,
      });
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: "No se pudo crear la fuente...",
      });
      console.log(error);
    },
  });
  return {
    createInformationSource: createMutation,
  };
};


export const useDeleteInformationSource = () => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (id: number | string) => {
      await axiosInstance.delete(`/transmandu/information-sources/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["information-sources"] });
      toast.success("¡Eliminado!", {
        description: `¡La fuente ha sido eliminada correctamente!`,
      });
    },
    onError: (e) => {
      toast.error("Oops!", {
        description: "¡Hubo un error al eliminar la fuente!",
      });
    },
  });

  return {
    deleteInformationSource: deleteMutation,
  };
};


export const useUpdateInformationSource = () => {

  const queryClient = useQueryClient()

  const updateInformationSourceMutation = useMutation({
      mutationKey: ["information-sources"],
      mutationFn: async (data: UpdateInformationSourceData) => {
          await axiosInstance.put(`/transmandu/information-sources/${data.id}`, data)
        },
      onSuccess: () => {
          queryClient.invalidateQueries({queryKey: ['information-sources']})
          toast.success("¡Actualizado!", {
              description: `La fuente ha sido actualizada correctamente.`
          })
        },
      onError: (error) => {
          toast.error('Oops!', {
            description: 'No se pudo actualizar la fuente...'
          })
          console.log(error)
        },
      }
  )
  return {
    updateInformationSource: updateInformationSourceMutation,
  }
}