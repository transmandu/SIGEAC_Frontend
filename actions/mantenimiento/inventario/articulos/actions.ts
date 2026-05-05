import axiosInstance from "@/lib/axios"
import { Article, ConsumableArticle } from "@/types"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"


export const useCreateArticle = () => {

    const queryClient = useQueryClient()

    const createMutation = useMutation({
        mutationFn: async ({ data, company }: { data: ConsumableArticle, company: string }) => {
            await axiosInstance.post(`/${company}/articles`, data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['articles'] })
            queryClient.invalidateQueries({ queryKey: ['warehouse-articles'] })
            toast.success("¡Creado!", {
                description: `El articulo ha sido creado correctamente.`
            })
        },
        onError: (error) => {
            toast.error('Oops!', {
                description: 'No se pudo crear el articulo...'
            })
            console.log(error)
        },
    }
    )
    return {
        createArticle: createMutation,
    }
}


export const useDeleteGeneralArticle = () => {
    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationKey: ["delete-gen-article1"],
        mutationFn: async ({
            company,
            id,
        }: {
            company: string | null;
            id: string | number;
        }) => {
            await axiosInstance.delete(`/${company}/general-articles/${id}`);
        },
        onSuccess: (_, data) => {
            queryClient.invalidateQueries({ queryKey: ["general-articles", data.company] });
            toast.success("¡Eliminado!", {
                description: `¡El reporte ha sido eliminada correctamente!`,
            });
        },
        onError: (e) => {
            toast.error("Oops!", {
                description: "¡Hubo un error al eliminar el reporte!",
            });
        },
    });

    return {
        deleteGeneralArticle: deleteMutation,
    };
};
