import axios from "@/lib/axios";
import { useCompanyStore } from "@/stores/CompanyStore";
import type {
    ArticleDetail,
    ArticleTimeline,
    BulkEditRequest,
    DuplicateCandidateGroup,
    GeneralArticleMerge,
    MergePreview,
    MergeRequest,
    SupervisorCostHistoryEntry,
    SupervisorGeneralArticle,
    UpdateArticleRequest,
} from "@/types/supervisor";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

/**
 * Hooks del módulo SUPERVISOR (exclusivo de SUPERUSER).
 * Backend: routes/api/supervisor/routes.php.
 */

/**
 * Inventario COMPLETO de artículos generales de la estación seleccionada.
 * No viene filtrado por sospecha de duplicado: las sugerencias son una ayuda
 * de arranque, pero el supervisor debe poder agrupar y fusionar cualquier
 * conjunto de artículos a criterio propio.
 */
export const useGetSupervisorGeneralArticles = (enabled: boolean = true) => {
    const { selectedCompany, selectedStation } = useCompanyStore();

    return useQuery<SupervisorGeneralArticle[], Error>({
        queryKey: ["supervisor-general-articles", selectedCompany?.slug, selectedStation],
        queryFn: async () => {
            const { data } = await axios.get(
                `/${selectedCompany?.slug}/supervisor/${selectedStation}/general-articles`,
            );
            return data;
        },
        enabled: enabled && !!selectedCompany && !!selectedStation,
    });
};

/**
 * Grupos de artículos que el detector considera probablemente duplicados.
 * Solo ordena el trabajo poniendo primero los casos evidentes — no restringe
 * lo que se puede fusionar.
 */
export const useGetDuplicateCandidates = (enabled: boolean = true) => {
    const { selectedCompany, selectedStation } = useCompanyStore();

    return useQuery<DuplicateCandidateGroup[], Error>({
        queryKey: ["supervisor-duplicate-candidates", selectedCompany?.slug, selectedStation],
        queryFn: async () => {
            const { data } = await axios.get(
                `/${selectedCompany?.slug}/supervisor/${selectedStation}/general-articles/duplicate-candidates`,
            );
            return data;
        },
        enabled: enabled && !!selectedCompany && !!selectedStation,
    });
};

/**
 * Historial de costo combinado de un grupo, sin calcular la fusión. Permite
 * editar costos en el asistente desde que se abre, sin previsualizar primero.
 */
export const useCombinedCostHistory = (articleIds: number[], enabled: boolean = true) => {
    const { selectedCompany } = useCompanyStore()

    return useQuery<{ cost_history: SupervisorCostHistoryEntry[]; current_cost: number }, Error>({
        queryKey: ["supervisor-combined-cost-history", selectedCompany?.slug, articleIds],
        queryFn: async () => {
            const { data } = await axios.post(
                `/${selectedCompany?.slug}/supervisor/general-articles/combined-cost-history`,
                { article_ids: articleIds },
            )
            return data
        },
        enabled: enabled && !!selectedCompany && articleIds.length > 0,
    })
}

/**
 * Calcula el resultado de una fusión SIN escribir nada: cantidad final ya
 * convertida, historial de costo consolidado y filas hijas a reapuntar.
 * Es mutation y no query porque el payload es complejo y solo se dispara
 * cuando el supervisor arma explícitamente el grupo.
 */
export const useMergePreview = () => {
    const { selectedCompany } = useCompanyStore();

    const mergePreview = useMutation<MergePreview, any, MergeRequest>({
        mutationKey: ["supervisor-merge-preview", selectedCompany?.slug],
        mutationFn: async (payload: MergeRequest) => {
            const { data } = await axios.post(
                `/${selectedCompany?.slug}/supervisor/general-articles/merge-preview`,
                payload,
            );
            return data;
        },
        onError: (error: any) => {
            toast.error("Error", {
                description:
                    error?.response?.data?.message ||
                    "No se pudo calcular el resultado de la fusión.",
            });
        },
    });

    return { mergePreview };
};

/**
 * Ejecuta la fusión. Los artículos absorbidos no se borran: quedan marcados
 * con merged_into_id y soft-deleted, y la operación queda registrada para
 * poder deshacerla (ver useUndoMerge).
 */
export const useMergeGeneralArticles = () => {
    const queryClient = useQueryClient();
    const { selectedCompany } = useCompanyStore();

    const mergeGeneralArticles = useMutation({
        mutationKey: ["supervisor-merge", selectedCompany?.slug],
        mutationFn: async (payload: MergeRequest) => {
            const { data } = await axios.post(
                `/${selectedCompany?.slug}/supervisor/general-articles/merge`,
                payload,
            );
            return data;
        },
        onSuccess: () => {
            invalidateSupervisorQueries(queryClient);

            toast.success("¡Fusionado!", {
                description: "Los artículos fueron fusionados correctamente.",
            });
        },
        onError: (error: any) => {
            toast.error("Error", {
                description:
                    error?.response?.data?.message || "No se pudieron fusionar los artículos.",
            });
        },
    });

    return { mergeGeneralArticles };
};

/**
 * Edición individual. A diferencia del update de almacén, aquí también pueden
 * corregirse cantidad y unidad: el supervisor existe para arreglar lo que el
 * flujo operativo dejó mal.
 */
export const useUpdateSupervisorArticle = () => {
    const queryClient = useQueryClient()
    const { selectedCompany } = useCompanyStore()

    const updateArticle = useMutation({
        mutationKey: ["supervisor-update-article", selectedCompany?.slug],
        mutationFn: async ({ id, data }: { id: number; data: UpdateArticleRequest }) => {
            const { data: response } = await axios.patch(
                `/${selectedCompany?.slug}/supervisor/general-articles/${id}`,
                data,
            )
            return response
        },
        onSuccess: () => {
            invalidateSupervisorQueries(queryClient)

            toast.success("¡Actualizado!", {
                description: "El artículo fue actualizado correctamente.",
            })
        },
        onError: (error: any) => {
            toast.error("Error", {
                description:
                    error?.response?.data?.message || "No se pudo actualizar el artículo.",
            })
        },
    })

    return { updateArticle }
}

/**
 * Todo lo editable de un artículo: datos, conversiones (con cuántos artículos
 * comparten cada una) e historial de costo. Una sola petición en vez de tres.
 */
export const useGetArticleDetail = (articleId: number | null) => {
    const { selectedCompany } = useCompanyStore()

    return useQuery<ArticleDetail, Error>({
        queryKey: ["supervisor-article-detail", selectedCompany?.slug, articleId],
        queryFn: async () => {
            const { data } = await axios.get(
                `/${selectedCompany?.slug}/supervisor/general-articles/${articleId}/detail`,
            )
            return data
        },
        enabled: !!selectedCompany && !!articleId,
    })
}

/**
 * Guarda la edición masiva. Recibe los valores finales de cada artículo, ya
 * revisados fila por fila en la tabla — no una regla que el backend interprete.
 */
export const useBulkEditArticles = () => {
    const queryClient = useQueryClient()
    const { selectedCompany } = useCompanyStore()

    const bulkEditArticles = useMutation({
        mutationKey: ["supervisor-bulk-edit", selectedCompany?.slug],
        mutationFn: async (payload: BulkEditRequest) => {
            const { data } = await axios.post(
                `/${selectedCompany?.slug}/supervisor/general-articles/bulk-edit`,
                payload,
            )
            return data
        },
        onSuccess: (data: { updated_count?: number }) => {
            invalidateSupervisorQueries(queryClient)

            toast.success("¡Actualizado!", {
                description: `Se actualizaron ${data?.updated_count ?? 0} artículo(s) correctamente.`,
            })
        },
        onError: (error: any) => {
            toast.error("Error", {
                description:
                    error?.response?.data?.message || "No se pudieron actualizar los artículos.",
            })
        },
    })

    return { bulkEditArticles }
}

/**
 * Recorrido completo de un artículo: auditoría, compras, costos, despachos y
 * fusiones unificados por el backend en una sola línea de tiempo.
 */
export const useGetArticleTimeline = (articleId: number | null) => {
    const { selectedCompany } = useCompanyStore()

    return useQuery<ArticleTimeline, Error>({
        queryKey: ["supervisor-article-timeline", selectedCompany?.slug, articleId],
        queryFn: async () => {
            const { data } = await axios.get(
                `/${selectedCompany?.slug}/supervisor/general-articles/${articleId}/timeline`,
            )
            return data
        },
        enabled: !!selectedCompany && !!articleId,
    })
}

/** Historial de fusiones, para auditar y revertir. */
export const useGetMergeHistory = (enabled: boolean = true) => {
    const { selectedCompany } = useCompanyStore();

    return useQuery<GeneralArticleMerge[], Error>({
        queryKey: ["supervisor-merge-history", selectedCompany?.slug],
        queryFn: async () => {
            const { data } = await axios.get(
                `/${selectedCompany?.slug}/supervisor/general-articles/merges`,
            );
            return data;
        },
        enabled: enabled && !!selectedCompany,
    });
};

/**
 * Revierte una fusión desde su snapshot: restaura los artículos absorbidos y
 * devuelve cada fila hija a su artículo original.
 */
export const useUndoMerge = () => {
    const queryClient = useQueryClient();
    const { selectedCompany } = useCompanyStore();

    const undoMerge = useMutation({
        mutationKey: ["supervisor-undo-merge", selectedCompany?.slug],
        mutationFn: async ({ id }: { id: number }) => {
            const { data } = await axios.post(
                `/${selectedCompany?.slug}/supervisor/general-articles/merges/${id}/undo`,
            );
            return data;
        },
        onSuccess: () => {
            invalidateSupervisorQueries(queryClient);

            toast.success("Fusión deshecha", {
                description: "Los artículos fueron restaurados a su estado anterior.",
            });
        },
        onError: (error: any) => {
            toast.error("Error", {
                description:
                    error?.response?.data?.message || "No se pudo deshacer la fusión.",
            });
        },
    });

    return { undoMerge };
};

/**
 * Una fusión mueve stock, conversiones e historial de costo entre artículos,
 * así que invalida tanto las vistas del supervisor como las del almacén y las
 * alertas de stock bajo.
 */
function invalidateSupervisorQueries(queryClient: ReturnType<typeof useQueryClient>) {
    [
        "supervisor-general-articles",
        "supervisor-duplicate-candidates",
        "supervisor-merge-history",
        "supervisor-article-timeline",
        "supervisor-article-detail",
        "general-articles",
        "low-stock-general-articles",
        "conversions-by-general-article",
    ].forEach((key) => queryClient.invalidateQueries({ queryKey: [key], exact: false }));
}
