import axiosInstance from "@/lib/axios"
import { Route } from "@/types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export const useCreateRoute = () => {

  const queryRoute = useQueryClient()
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      await axiosInstance.post('/transmandu/route', data)
    },
    onSuccess: () => {
      queryRoute.invalidateQueries({queryKey: ['routes']})
          toast("¡Creado!", {
            description: `¡La ruta se ha creado correctamente!`
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
    createRoute: createMutation,
  }
}

export const useGetRoute = (id: string | null) => {
  const routesQuery = useQuery({
    queryKey: ["route"],
    queryFn: async () => {
      const {data} = await axiosInstance.get(`/transmandu/route/${id}`); 
      return data as Route;
    },
    enabled: !!id
  });
  return {
    data: routesQuery.data,
    loading: routesQuery.isLoading,
    error: routesQuery.isError 
  };
};

export const useUpdateRoute = () => {

  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (values: {
      id: string
      from:string,
      to: string,
      layovers?: string
    }) => {
      await axiosInstance.patch(`/transmandu/route/${values.id}`, {
        from: values.from,
        to: values.to,
        layovers: values.layovers ?? null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routes"] });
      toast.success("¡Actualizado!", {
        description: "¡La ruta ha sido creada correctamente!",
      });
    },
    onError: (error: Error) => {
      toast.error("Oops!", {
        description: `¡Hubo un error al actualizar la ruta!: ${error}`,
      });
    },
  });

  return {
    updateRoute: updateMutation, 
  };
};

export const useDeleteRoute = () => {

  const queryRoute = useQueryClient()

  const deleteMutation = useMutation({
      mutationFn: async (id: number | string) => {
          await axiosInstance.delete(`/transmandu/route/${id}`)
        },
      onSuccess: () => {

          queryRoute.invalidateQueries({queryKey: ['routes']})
          toast.success("¡Eliminado!", {
              description: `¡La ruta ha sido eliminado correctamente!`
          })
        },
      onError: (e) => {
          toast.error("Oops!", {
            description: "¡Hubo un error al eliminar la ruta!"
        })
        },
      }
  )

  return {
    deleteRoute: deleteMutation,
  }
}
