import axiosInstance from "@/lib/axios";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ConfirmGeneralArticleIntakeResponse, NeedsUnitConversionResponse, RejectGeneralArticleIntakeResponse } from "@/types/purchase";

export function isNeedsUnitConversionResponse(data: unknown): data is NeedsUnitConversionResponse {
    return !!data && typeof data === "object" && (data as any).needs_conversion === true;
}

export interface IUpdateArticleData {
    id: number
    newQuantity: number;
}

interface ArticleData {
    article_type?: string;
    description?: string;
    brand_model: string;
    quantity: number;
    minimum_quantity?: number;
    variant_type: string;
    primary_unit_id: string;
    warehouse_id: string;
}


interface updateArticleData {
    article_type?: string;
    description?: string;
    brand_model?: string;
    variant_type?: string;
    primary_unit_id?: string;
    minimum_quantity?: number;
}
// PARA ACTULIZAR UN ARTICULO EXEPTO SU CANTIDAD.
export const useUpdateGeneralArticle = () => {
    const queryClient = useQueryClient();
    const { selectedCompany } = useCompanyStore();

    const updateGeneralArticle = useMutation({
        mutationKey: ["general-article-update", selectedCompany?.slug],
        mutationFn: async ({
            id,
            articleData
        }: {
            id: string | number; // Recibimos el id aquí
            articleData: updateArticleData;
        }) => {
            const { data } = await axiosInstance.patch(
                `/${selectedCompany?.slug}/general-articles/${id}`,
                { articleData }
            );
            return data;
        },
        onSuccess: () => {
            // Refrescamos la lista de artículos
            queryClient.invalidateQueries({
                queryKey: ["general-articles", selectedCompany?.slug]
            });
            // Refrescamos las alertas de stock bajo, ya que la cantidad mínima pudo haber cambiado
            queryClient.invalidateQueries({
                queryKey: ["low-stock-general-articles", selectedCompany?.slug]
            });

            toast.success("¡Actualizado!", {
                description: "Las cantidades han sido actualizadas correctamente."
            });
        },
        onError: (error: any) => {
            toast.error('Error', {
                description: `No se actualizó correctamente: ${error.message || error}`
            });
        },
    });

    return {
        updateGeneralArticle,
    };
};

export const useUpdateGeneralArticleQuantity = () => {
    const queryClient = useQueryClient();
    const { selectedCompany } = useCompanyStore();
    const updateGeneralArticleQuantity = useMutation({
        mutationKey: ["article-general-quantity"],
        mutationFn: async ({
            updates
        }: {
            updates: IUpdateArticleData[];
        }) => {
            await axiosInstance.patch(`/${selectedCompany?.slug}/article-general-quantity`, {
                updates,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["general-articles"] });
            queryClient.invalidateQueries({ queryKey: ["low-stock-general-articles", selectedCompany?.slug] });
            toast.success("¡Actualizado!", {
                description: "Las cantidades han sido actualizadas correctamente."
            });
        },
        onError: (error) => {
            toast('Hey', {
                description: `No se actualizó correctamente: ${error}`
            })
        },
    });

    return {
        updateGeneralArticleQuantity: updateGeneralArticleQuantity,
    };
};


// Confirma físicamente la llegada de una entrada PENDING (GeneralArticleIntake).
// Crea o incrementa el general_article correspondiente; el intake queda
// como historial permanente con quién/cuándo lo confirmó.
//
// Si el artículo coincide con uno existente en todo menos la unidad y no hay
// una Conversion registrada entre ambas, el backend responde 422 con
// needs_conversion=true (ver isNeedsUnitConversionResponse) en vez de crear
// un general_article duplicado. El caller debe entonces pedir la equivalencia
// y reintentar pasando newConversionEquivalence, que el backend usa para
// crear la Conversion y aplicarla en la misma operación.
export const useConfirmGeneralArticleIntake = () => {
    const queryClient = useQueryClient();
    const { selectedCompany } = useCompanyStore();

    const confirmGeneralArticleIntake = useMutation({
        mutationKey: ["confirm-general-article-intake", selectedCompany?.slug],
        mutationFn: async ({
            id,
            confirmedAt,
            newConversionEquivalence,
        }: {
            id: number;
            confirmedAt?: Date;
            newConversionEquivalence?: number;
        }) => {
            const { data } = await axiosInstance.patch<ConfirmGeneralArticleIntakeResponse>(
                `/${selectedCompany?.slug}/general-article-intakes/${id}/confirm`,
                {
                    ...(confirmedAt ? { confirmed_at: confirmedAt.toISOString() } : {}),
                    ...(newConversionEquivalence
                        ? { new_conversion: { equivalence: newConversionEquivalence } }
                        : {}),
                }
            );
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["general-article-intakes"], exact: false });
            queryClient.invalidateQueries({ queryKey: ["general-articles"], exact: false });
            queryClient.invalidateQueries({ queryKey: ["conversions-by-general-article"], exact: false });

            toast.success("¡Confirmado!", {
                description: "La entrada fue confirmada y el stock se actualizó correctamente."
            });
        },
        onError: (error: any) => {
            if (isNeedsUnitConversionResponse(error?.response?.data)) return;

            toast.error("Error", {
                description: error?.response?.data?.message || "No se pudo confirmar la entrada."
            });
        },
    });

    return {
        confirmGeneralArticleIntake,
    };
};

// Rechaza una entrada PENDING cuando la verificación física no coincide con
// lo registrado (artículo o cantidad distintos). El intake queda REJECTED con
// la justificación como historial permanente, nunca toca el stock, y el
// backend notifica al usuario que registró la entrega para que la revise y
// re-registre sobre la misma orden de compra cuando resuelva.
export const useRejectGeneralArticleIntake = () => {
    const queryClient = useQueryClient();
    const { selectedCompany } = useCompanyStore();

    const rejectGeneralArticleIntake = useMutation({
        mutationKey: ["reject-general-article-intake", selectedCompany?.slug],
        mutationFn: async ({ id, rejectionReason }: { id: number; rejectionReason: string }) => {
            const { data } = await axiosInstance.patch<RejectGeneralArticleIntakeResponse>(
                `/${selectedCompany?.slug}/general-article-intakes/${id}/reject`,
                { rejection_reason: rejectionReason }
            );
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["general-article-intakes"], exact: false });

            toast.success("Entrada rechazada", {
                description: "Se notificó al responsable de la entrega para que revise la discrepancia."
            });
        },
        onError: (error: any) => {
            toast.error("Error", {
                description: error?.response?.data?.message || "No se pudo rechazar la entrada."
            });
        },
    });

    return {
        rejectGeneralArticleIntake,
    };
};

export const useCreateGeneralArticle = () => {
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationKey: ["articles"],
        mutationFn: async ({
            data,
            company,
        }: {
            company: string;
            data: ArticleData;
        }) => {
            await axiosInstance.post(`/${company}/general-articles`, data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["general-articles"] });
            toast.success("¡Creado!", {
                description: `El articulo ha sido creado correctamente.`,
            });
        },
        onError: (error) => {
            toast.error("Oops!", {
                description: "No se pudo crear el articulo...",
            });
            console.log(error);
        },
    });
    return {
        createGeneralArticle: createMutation,
    };
};
