import axiosInstance from "@/lib/axios";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { formatQuantity } from "@/lib/utils";
import { toast } from "sonner";
import type { ConfirmGeneralArticleIntakeResponse, NeedsUnitConversionResponse, RejectGeneralArticleIntakeResponse, UpdateGeneralArticleIntakePayload, UpdateGeneralArticleIntakeResponse } from "@/types/purchase";

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
    maximum_quantity?: number;
    variant_type: string;
    primary_unit_id: string;
    warehouse_id: string;
    image?: File | null;
    conversions?: ArticleConversionInput[];
}


interface updateArticleData {
    article_type?: string;
    description?: string;
    brand_model?: string;
    variant_type?: string;
    primary_unit_id?: string;
    minimum_quantity?: number;
    maximum_quantity?: number;
}

/** Equivalencia declarada para el artículo: 1 unit_id = value <unidad base>. */
interface ArticleConversionInput {
    unit_id: number;
    direction: string;
    value: number;
}
export const useUpdateGeneralArticle = () => {
    const queryClient = useQueryClient();
    const { selectedCompany } = useCompanyStore();

    const updateGeneralArticle = useMutation({
        mutationKey: ["general-article-update", selectedCompany?.slug],
        mutationFn: async ({
            id,
            articleData,
            image,
            conversions,
        }: {
            id: string | number;
            articleData: updateArticleData;
            image?: File | null;
            conversions?: ArticleConversionInput[];
        }) => {
            if (!image) {
                const { data } = await axiosInstance.patch(
                    `/${selectedCompany?.slug}/general-articles/${id}`,
                    { articleData, ...(conversions ? { conversions } : {}) }
                );
                return data;
            }

            // multipart no admite PATCH real: se hace POST y Laravel lo reinterpreta con _method.
            const formData = new FormData();
            formData.append("_method", "PATCH");
            formData.append("image", image);

            Object.entries(articleData).forEach(([key, value]) => {
                if (value === undefined || value === null) return;
                formData.append(`articleData[${key}]`, String(value));
            });

            // multipart no anida objetos: cada conversión viaja con índice.
            conversions?.forEach((row, index) => {
                formData.append(`conversions[${index}][unit_id]`, String(row.unit_id));
                formData.append(`conversions[${index}][direction]`, row.direction);
                formData.append(`conversions[${index}][value]`, String(row.value));
            });

            const { data } = await axiosInstance.post(
                `/${selectedCompany?.slug}/general-articles/${id}`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["general-articles", selectedCompany?.slug]
            });
            // La cantidad mínima pudo cambiar, y es la que dispara la alerta.
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

export interface IAddQuantityGeneralArticle {
    id: number;
    quantity: number;
}

// Suma sobre la existencia actual; no la fija. Para corregir el total se usa
// useUpdateGeneralArticleQuantity, que reemplaza el valor.
export const useAddQuantityGeneralArticle = () => {
    const queryClient = useQueryClient();
    const { selectedCompany } = useCompanyStore();

    const mutation = useMutation({
        mutationKey: ["add-quantity-general-article"],
        mutationFn: async ({ id, quantity }: IAddQuantityGeneralArticle) => {
            if (!selectedCompany?.slug) throw new Error("No hay compañía seleccionada");
            await axiosInstance.patch(
                `/${selectedCompany.slug}/add-quantity-general-article/${id}`,
                { quantity }
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["general-articles"] });
            toast.success("¡Cantidad actualizada!", {
                description: "La cantidad del artículo se actualizó correctamente.",
            });
        },
        onError: (error: any) => {
            toast.error("Error", {
                description:
                    error?.response?.data?.message ||
                    "No se pudo actualizar la cantidad del artículo.",
            });
            console.error(error);
        },
    });

    return { addQuantityGeneralArticle: mutation };
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


// Es lo que mueve el stock: hasta aquí el intake era solo papel.
//
// Si el artículo ya existe pero en otra unidad y falta la Conversion, el backend
// responde 422 con needs_conversion en vez de duplicarlo. El caller pide entonces
// la equivalencia y reintenta con newConversionEquivalence.
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
                        ? {
                            new_conversion: {
                                // Fijo: el almacenista declara desde la unidad comprada
                                // hacia la que ya maneja el inventario, nunca al revés.
                                direction: 'base_per_unit',
                                value: newConversionEquivalence,
                            },
                        }
                        : {}),
                }
            );
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["general-article-intakes"], exact: false });
            queryClient.invalidateQueries({ queryKey: ["general-articles"], exact: false });
            queryClient.invalidateQueries({ queryKey: ["conversions-by-general-article"], exact: false });

            const entry = data?.stock_entry;

            toast.success("¡Confirmado!", {
                description: entry
                    ? `Se realizó correctamente el ingreso de ${formatQuantity(entry.quantity)} ${entry.unit_label ?? ""} del artículo ${entry.description}, por favor verifique.`.replace(/\s+/g, " ")
                    : "La entrada fue confirmada y el stock se actualizó correctamente."
            });
        },
        onError: (error: any) => {
            // No es un fallo: el caller abre el diálogo para pedir la equivalencia.
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

// Para cuando lo que llegó físicamente no es lo registrado. Nunca toca el stock:
// el intake queda REJECTED como historial y el backend avisa a quien registró la
// entrega para que la re-registre sobre la misma orden de compra.
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

// Corrección de una recepción ya registrada (típicamente fechas mal cargadas).
// Si el intake ya estaba confirmado, el backend reajusta el stock en la misma
// operación: de ahí que la respuesta traiga stock_adjustment.
export const useUpdateGeneralArticleIntake = () => {
    const queryClient = useQueryClient();
    const { selectedCompany } = useCompanyStore();

    const updateGeneralArticleIntake = useMutation({
        mutationKey: ["update-general-article-intake", selectedCompany?.slug],
        mutationFn: async ({ id, payload }: { id: number; payload: UpdateGeneralArticleIntakePayload }) => {
            const { data } = await axiosInstance.patch<UpdateGeneralArticleIntakeResponse>(
                `/${selectedCompany?.slug}/general-article-intakes/${id}`,
                payload
            );
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["general-article-intakes"], exact: false });
            queryClient.invalidateQueries({ queryKey: ["general-articles"], exact: false });

            const adjustment = data?.stock_adjustment;

            toast.success("Recepción corregida", {
                description: adjustment
                    ? `El stock del artículo se reajustó a ${formatQuantity(adjustment.resulting_quantity)}, por favor verifique.`
                    : "Los cambios se guardaron correctamente."
            });
        },
        onError: (error: any) => {
            toast.error("Error", {
                description: error?.response?.data?.message || "No se pudo corregir la recepción."
            });
        },
    });

    return {
        updateGeneralArticleIntake,
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
            const formData = new FormData();

            Object.entries(data).forEach(([key, value]) => {
                if (value === undefined || value === null) return;

                // multipart no anida objetos: las conversiones van con índice.
                if (key === "conversions") {
                    (value as ArticleConversionInput[]).forEach((row, index) => {
                        formData.append(`conversions[${index}][unit_id]`, String(row.unit_id));
                        formData.append(`conversions[${index}][direction]`, row.direction);
                        formData.append(`conversions[${index}][value]`, String(row.value));
                    });
                    return;
                }

                formData.append(key, value instanceof File ? value : String(value));
            });

            await axiosInstance.post(`/${company}/general-articles`, formData, {
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
