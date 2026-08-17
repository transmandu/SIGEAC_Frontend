import axiosInstance from "@/lib/axios";
import { useCompanyStore } from "@/stores/CompanyStore";
import type { QuarantineRecord } from "@/types/quarantine";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type SendToReinspectionPayload = {
  id: number;
  resolution_notes: string;
};

type RejectReinspectionPayload = {
  id: number;
  reason: string;
};

/**
 * Invalidar el listado no basta: el estado del artículo cambia junto con el del
 * registro, y las vistas de calidad leen por estado del artículo.
 */
const useQuarantineInvalidation = () => {
  const queryClient = useQueryClient();
  const { selectedCompany } = useCompanyStore();

  return () => {
    const company = selectedCompany?.slug;

    queryClient.invalidateQueries({ queryKey: ["quarantine-articles"] });
    queryClient.invalidateQueries({ queryKey: ["articles"] });
    queryClient.invalidateQueries({ queryKey: ["warehouse-articles"] });
    // La transición deja un movimiento nuevo: la cronología ya no vale.
    queryClient.invalidateQueries({ queryKey: ["article-status-history"] });

    if (company) {
      queryClient.invalidateQueries({ queryKey: ["articles", company, "QUARANTINE"] });
      queryClient.invalidateQueries({ queryKey: ["articles", company, "PENDING_REINSPECTION"] });
    }
  };
};

/**
 * ¿El registro admite el pase antes de tocar el artículo? Lo usa el camino que
 * aún guarda por separado (el formulario embebido); `useResolveQuarantine` no lo
 * necesita porque hace todo en una transacción.
 */
export const assertCanSendToReinspection = async (company: string, id: number) => {
  await axiosInstance.get(`/${company}/quarantine-articles/${id}/can-send-to-reinspection`);
};

export type ResolveQuarantineDocument = {
  requirementId?: number;
  documentTypeId?: number;
  replaceDocumentId?: number;
  file?: File;
  isPhysical?: boolean;
};

type ResolveQuarantinePayload = {
  id: number;
  resolutionNotes: string;
  /** Campos del artículo que cambiaron; se omite lo que no se tocó. */
  articleFields?: Record<string, string | number | undefined>;
  documents?: ResolveQuarantineDocument[];
};

/**
 * Corrección completa en un solo request: datos del artículo, documentos y pase
 * a re-inspección entran en la misma transacción del backend. Evita la cadena
 * guardar → sincronizar → subir → avanzar, donde un fallo a mitad dejaba el
 * artículo corregido y el ciclo sin avanzar.
 *
 * Todavía sin consumidor: el diálogo de cuarentena embebe RegisterArticleForm,
 * que guarda con sus propios hooks. Adoptarlo exige desacoplar ese formulario;
 * hasta entonces el diálogo cubre el fallo parcial verificando antes de guardar
 * y permitiendo reintentar solo el pase.
 */
export const useResolveQuarantine = () => {
  const { selectedCompany } = useCompanyStore();
  const invalidate = useQuarantineInvalidation();

  const mutation = useMutation<QuarantineRecord, Error, ResolveQuarantinePayload>({
    mutationKey: ["quarantine-resolve"],

    mutationFn: async ({ id, resolutionNotes, articleFields, documents }) => {
      if (!selectedCompany?.slug) {
        throw new Error("Company no seleccionada");
      }

      // multipart porque lleva archivos; PHP no puebla $_FILES en PATCH, de ahí
      // que la ruta sea POST.
      const formData = new FormData();
      formData.append("resolution_notes", resolutionNotes);

      Object.entries(articleFields ?? {}).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          formData.append(key, String(value));
        }
      });

      (documents ?? []).forEach((doc, index) => {
        if (!doc.file && !doc.isPhysical) return;

        if (doc.requirementId) {
          formData.append(`documents[${index}][requirement_id]`, String(doc.requirementId));
        }
        if (doc.documentTypeId) {
          formData.append(`documents[${index}][document_type_id]`, String(doc.documentTypeId));
        }
        if (doc.replaceDocumentId) {
          formData.append(`documents[${index}][replace_document_id]`, String(doc.replaceDocumentId));
        }
        formData.append(`documents[${index}][is_physical]`, doc.isPhysical ? "1" : "0");
        if (doc.file) {
          formData.append(`documents[${index}][file]`, doc.file);
        }
      });

      const { data } = await axiosInstance.post(
        `/${selectedCompany.slug}/quarantine-articles/${id}/resolve`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      return data;
    },

    onSuccess: () => {
      invalidate();

      toast.success("¡Enviado a re-inspección!", {
        description: "Control de Calidad podrá verificar la corrección.",
      });
    },

    onError: (error) => {
      const message = (error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;

      toast.error("Oops!", {
        description: message ?? "No se pudo resolver el artículo en cuarentena...",
      });
    },
  });

  return { resolveQuarantine: mutation };
};

/**
 * Compras declara que corrigió lo que motivó la retención. La nota es lo que el
 * inspector va a verificar, por eso el backend la exige.
 */
export const useSendToReinspection = () => {
  const { selectedCompany } = useCompanyStore();
  const invalidate = useQuarantineInvalidation();

  const mutation = useMutation<QuarantineRecord, Error, SendToReinspectionPayload>({
    mutationKey: ["quarantine-send-to-reinspection"],

    mutationFn: async ({ id, resolution_notes }) => {
      if (!selectedCompany?.slug) {
        throw new Error("Company no seleccionada");
      }

      const { data } = await axiosInstance.patch(
        `/${selectedCompany.slug}/quarantine-articles/${id}/send-to-reinspection`,
        { resolution_notes },
      );

      return data;
    },

    onSuccess: () => {
      invalidate();

      toast.success("¡Enviado a re-inspección!", {
        description: "Control de Calidad podrá verificar la corrección.",
      });
    },

    onError: (error) => {
      const message = (error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;

      toast.error("Oops!", {
        description: message ?? "No se pudo enviar el artículo a re-inspección...",
      });
    },
  });

  return { sendToReinspection: mutation };
};

/**
 * El inspector re-inspeccionó y sigue sin cumplir: vuelve a cuarentena con un
 * motivo nuevo, sobre el mismo registro (el plazo legal no se reinicia).
 */
export const useRejectReinspection = () => {
  const { selectedCompany } = useCompanyStore();
  const invalidate = useQuarantineInvalidation();

  const mutation = useMutation<QuarantineRecord, Error, RejectReinspectionPayload>({
    mutationKey: ["quarantine-reject"],

    mutationFn: async ({ id, reason }) => {
      if (!selectedCompany?.slug) {
        throw new Error("Company no seleccionada");
      }

      const { data } = await axiosInstance.patch(
        `/${selectedCompany.slug}/quarantine-articles/${id}/reject`,
        { reason },
      );

      return data;
    },

    onSuccess: () => {
      invalidate();

      toast.warning("Devuelto a cuarentena", {
        description: "Compras deberá corregir el nuevo hallazgo.",
      });
    },

    onError: (error) => {
      const message = (error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;

      toast.error("Oops!", {
        description: message ?? "No se pudo devolver el artículo a cuarentena...",
      });
    },
  });

  return { rejectReinspection: mutation };
};
