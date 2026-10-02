import axiosInstance from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  CreateComplementaryQuoteData,
  CreateQuoteData,
  OpenQuoteDraftData,
  SaveQuoteDraftData,
  UpdateQuoteStatusData,
} from "@/types/purchase";

export const useCreateQuote = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async ({
      data,
      company,
    }: {
      data: CreateQuoteData;
      company?: string;
    }) => {
      await axiosInstance.post(`/${company}/quote`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      queryClient.invalidateQueries({ queryKey: ["quote"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["requisitions-orders"] });
      queryClient.invalidateQueries({
        queryKey: ["requisition-order"],
        exact: false,
      });
      toast.success("¡Creado!", {
        description: "La cotización ha sido creada correctamente.",
      });
    },
    onError: () => {
      toast.error("Oops!", {
        description: "No se pudo crear la cotización.",
      });
    },
  });

  return { createQuote: createMutation };
};

// Crea una cotización complementaria sobre una cotización general APROBADA,
// para documentar la diferencia entre lo realmente comprado y lo que la
// cadena original amparaba (p. ej. llegaron 24 unidades y solo se
// cotizaron/pagaron 6). Los documentos pagados no se tocan: la complementaria
// nace PENDING con justificación obligatoria y recorre el pipeline normal
// (aprobación → orden de compra → pago → entrega → intake).
export const useCreateComplementaryQuote = () => {
  const queryClient = useQueryClient();

  const createComplementaryMutation = useMutation({
    mutationFn: async ({
      quoteId,
      data,
      company,
    }: {
      quoteId: number;
      company: string;
      data: CreateComplementaryQuoteData;
    }) => {
      await axiosInstance.post(
        `/${company}/quote/${quoteId}/complementary`,
        data,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      queryClient.invalidateQueries({ queryKey: ["quote"], exact: false });
      toast.success("¡Creada!", {
        description:
          "La cotización complementaria fue creada y queda pendiente de aprobación.",
      });
    },
    onError: (error: any) => {
      toast.error("Oops!", {
        description:
          error?.response?.data?.message ||
          "No se pudo crear la cotización complementaria.",
      });
    },
  });

  return { createComplementaryQuote: createComplementaryMutation };
};

export const useUpdateQuoteStatus = () => {
  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      id,
      data,
      company,
    }: {
      id: number;
      company: string;
      data: UpdateQuoteStatusData;
    }) => {
      await axiosInstance.put(
        `/${company}/quote-order-update-status/${id}`,
        data,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      queryClient.invalidateQueries({ queryKey: ["quote"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["requisitions-orders"] });
      queryClient.invalidateQueries({
        queryKey: ["requisition-order"],
        exact: false,
      });
      toast.success("¡Confirmada!", {
        description: "La cotización ha sido actualizada correctamente.",
      });
    },
    onError: () => {
      toast.error("Oops!", {
        description: "Hubo un error al actualizar la cotización.",
      });
    },
  });

  return { updateStatusQuote: updateStatusMutation };
};

// Solo SUPERUSER. Arrastra complementarias y las órdenes de compra nacidas de
// cualquiera de ellas, revirtiendo el inventario ya afectado.
export const useCascadeDeleteQuote = () => {
  const queryClient = useQueryClient();

  const cascadeDeleteMutation = useMutation({
    mutationFn: async ({ id, company }: { id: number; company: string }) => {
      await axiosInstance.delete(`/${company}/quote/${id}/cascade`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      queryClient.invalidateQueries({ queryKey: ["quote"], exact: false });
      // Un SUPERUSER puede usar esta vía sobre un borrador atascado, así que el
      // contador de "Borradores" también queda obsoleto.
      queryClient.invalidateQueries({ queryKey: ["quote-drafts"] });
      queryClient.invalidateQueries({ queryKey: ["requisitions-orders"] });
      queryClient.invalidateQueries({
        queryKey: ["requisition-order"],
        exact: false,
      });
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      queryClient.invalidateQueries({
        queryKey: ["purchase-order"],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ["general-article-intakes"],
        exact: false,
      });
      toast.success("¡Eliminada en cascada!", {
        description:
          "La cotización y toda su cadena (complementarias, órdenes de compra e inventario asociado) fue eliminada.",
      });
    },
    onError: (error: any) => {
      toast.error("Oops!", {
        description:
          error?.response?.data?.message ||
          "Hubo un error al eliminar en cascada la cotización.",
      });
    },
  });

  return { cascadeDeleteQuote: cascadeDeleteMutation };
};

export const useDeleteQuote = () => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async ({ id, company }: { id: number; company: string }) => {
      await axiosInstance.delete(`/${company}/delete-quote/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      queryClient.invalidateQueries({ queryKey: ["quote"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["requisitions-orders"] });
      queryClient.invalidateQueries({
        queryKey: ["requisition-order"],
        exact: false,
      });
      toast.success("¡Eliminado!", {
        description: "La cotización ha sido eliminada correctamente.",
      });
    },
    onError: () => {
      toast.error("Oops!", {
        description: "Hubo un error al eliminar la cotización.",
      });
    },
  });

  return { deleteQuote: deleteMutation };
};

// ── Borradores de cotización ───────────────────────────────────────────────
// El personal de compras recibe los precios por partes (pregunta artículo por
// artículo), así que una cotización de varios ítems rara vez se registra de una
// sentada. El borrador acumula esas respuestas sin ser todavía una cotización:
// no tiene correlativo, no se compara, no notifica y no genera orden de compra.

/**
 * Abre el borrador de una requisición, o devuelve el que el usuario ya tenga
 * abierto para ella (el backend es idempotente: responde 200 en vez de fallar).
 */
export const useOpenQuoteDraft = () => {
  const queryClient = useQueryClient();

  const openDraftMutation = useMutation({
    mutationFn: async ({
      data,
      company,
    }: {
      data: OpenQuoteDraftData;
      company: string;
    }) => {
      const response = await axiosInstance.post(
        `/${company}/quote/draft`,
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quote-drafts"] });
      // Al abrirlo nace el badge de la fila, así que el listado queda obsoleto.
      queryClient.invalidateQueries({ queryKey: ["requisitions-orders"] });
      queryClient.invalidateQueries({
        queryKey: ["requisition-order"],
        exact: false,
      });
    },
    onError: (error: any) => {
      toast.error("Oops!", {
        description:
          error?.response?.data?.message || "No se pudo abrir el borrador.",
      });
    },
  });

  return { openQuoteDraft: openDraftMutation };
};

/**
 * Guarda avance del borrador. No muestra toast de éxito: se llama también en
 * autoguardado y un toast por cada guardado sería ruido.
 */
export const useSaveQuoteDraft = () => {
  const queryClient = useQueryClient();

  const saveDraftMutation = useMutation({
    mutationFn: async ({
      id,
      data,
      company,
    }: {
      id: number;
      data: SaveQuoteDraftData;
      company: string;
    }) => {
      const response = await axiosInstance.put(
        `/${company}/quote/draft/${id}`,
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quote-drafts"] });
      // El badge de la fila muestra el avance (3 de 5 con precio), así que el
      // listado de requisiciones también queda obsoleto al guardar.
      queryClient.invalidateQueries({ queryKey: ["requisitions-orders"] });
      queryClient.invalidateQueries({
        queryKey: ["requisition-order"],
        exact: false,
      });
    },
    onError: (error: any) => {
      toast.error("No se guardó el borrador", {
        description:
          error?.response?.data?.message ||
          "Revisa tu conexión: los últimos cambios no se guardaron.",
      });
    },
  });

  return { saveQuoteDraft: saveDraftMutation };
};

/**
 * Emite el borrador como cotización. Exige que cada artículo tenga una decisión
 * explícita (precio, o no cotizado con justificación) y NO tiene vuelta atrás.
 */
export const useIssueQuoteDraft = () => {
  const queryClient = useQueryClient();

  const issueDraftMutation = useMutation({
    mutationFn: async ({ id, company }: { id: number; company: string }) => {
      const response = await axiosInstance.post(
        `/${company}/quote/draft/${id}/issue`,
      );
      return response.data;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["quote-drafts"] });
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      queryClient.invalidateQueries({ queryKey: ["quote"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["requisitions-orders"] });
      queryClient.invalidateQueries({
        queryKey: ["requisition-order"],
        exact: false,
      });
      toast.success("¡Emitida!", {
        description:
          data?.message ||
          "La cotización fue emitida y queda pendiente de aprobación.",
      });
    },
    onError: (error: any) => {
      toast.error("No se pudo emitir", {
        description:
          error?.response?.data?.message ||
          "Quedan artículos sin precio y sin marcar como no cotizados.",
      });
    },
  });

  return { issueQuoteDraft: issueDraftMutation };
};

export const useDeleteQuoteDraft = () => {
  const queryClient = useQueryClient();

  const deleteDraftMutation = useMutation({
    mutationFn: async ({ id, company }: { id: number; company: string }) => {
      await axiosInstance.delete(`/${company}/quote/draft/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quote-drafts"] });
      queryClient.invalidateQueries({ queryKey: ["requisitions-orders"] });
      queryClient.invalidateQueries({
        queryKey: ["requisition-order"],
        exact: false,
      });
      toast.success("Borrador descartado", {
        description:
          "No se emitió ninguna cotización: la requisición queda como estaba.",
      });
    },
    onError: (error: any) => {
      toast.error("Oops!", {
        description:
          error?.response?.data?.message || "No se pudo descartar el borrador.",
      });
    },
  });

  return { deleteQuoteDraft: deleteDraftMutation };
};
