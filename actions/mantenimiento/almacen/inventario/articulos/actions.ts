import axiosInstance from "@/lib/axios";
import { useCompanyStore } from "@/stores/CompanyStore";
import { ComponentArticle, ConsumableArticle, ToolArticle } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";

interface UnitSelection {
  conversion_id: number;
}
interface ArticleData {
    serial?: string | string[];
    part_number: string;
    lot_number?: string;
    alternative_part_number?: string[];
    description?: string;
    batch_name?: string;
    zone?: string;
    status?: string;
    calibration_date?: string;
    calibration_interval_days?: string;
    manufacturer_id?: number | string;
    condition_id?: number | string;
    batch_id: string;
    is_special?: boolean;
    expiration_date?: string;
    quantity?: string | number;
    fabrication_date?: string;
    calendar_date?: string;
    image?: File | string;
    conversions?: number[];
    primary_unit_id?: number;
    life_limit_part_calendar?: string;
    life_limit_part_hours?: string | number;
    life_limit_part_cycles?: string | number;
    inspector?: string;
    inspect_date?: string;
    reception_date?: string;
    hard_time_calendar?: string;
    hard_time_hours?: string | number;
    hard_time_cycles?: string | number;
    ata_code?: string;
}

interface SendToQuarantinePayload {
  article_id: number;
  reason: string;
  quarantine_entry_date: string
  quarantine_exit_date?: string;

}


type CheckResult = "PASS" | "FAIL" | "NA";

/**
 * Selección de documentación de un artículo: tipo de documento esperado
 * (crea el ArticleDocumentRequirement) y, opcionalmente, el archivo a
 * consignar y/o la constancia de recepción física (crea el ArticleDocument).
 */
export interface ArticleDocumentSelection {
    typeId: number;
    file?: File;
    isPhysical?: boolean;
}

/**
 * Extrae los ids de los artículos creados de la respuesta de POST /article.
 * El backend devuelve un array (o un objeto único para consumibles ya
 * existentes) con la forma { Article: { article: { id, ... }, ... }, ... }.
 */
export const extractCreatedArticleIds = (responseData: any): number[] => {
    const items = Array.isArray(responseData) ? responseData : [responseData];

    return items
        .map((item) => item?.Article?.article?.id)
        .filter((id): id is number => typeof id === "number");
};

const serializeFormValue = (value: unknown) => {
  if (value instanceof Date) {
    return format(value, "yyyy-MM-dd");
  }

  return value?.toString() ?? "";
};

export type IncomingCheck = {
  check_id: number;
  result: CheckResult;
  observation: string | null;
};

export type IncomingPayload = {
  warehouse_id: number;
  purchase_order_code: string;
  purchase_order_id: string | null;
  inspection_date: string;
  items: {
    article_id: number;
    serial: string;
    quantity: number;
    checks: IncomingCheck[];
  }[];
};

export const useCreateArticle = () => {
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
      // 1. CREAMOS EL FORMDATA REAL
      const formData = new FormData();

      // 2. MAPEAMOS LOS DATOS AL FORMDATA
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          // Si el valor es un array (como alternative_part_number), lo metemos uno a uno o como JSON
          if (Array.isArray(value)) {
            value.forEach((item) => formData.append(`${key}[]`, item));
          } else if (value instanceof File) {
            // Si es un archivo (imagen/certificado), se adjunta tal cual
            formData.append(key, value);
          } else {
            // Convertimos todo lo demás a string para el envío de formulario
            formData.append(key, serializeFormValue(value));
          }
        }
      });

      // 3. ENVIAMOS EL FORMDATA (Axios pondrá los headers automáticamente)
      return await axiosInstance.post(`/${company}/article`, formData);
    },
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ["warehouse-articles"] });
      queryClient.invalidateQueries({ queryKey: ['articles', data.company, data.data.status] });
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
    createArticle: createMutation,
  };
};

export const useCreateToReviewArticle = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationKey: ["articles"],
    mutationFn: async ({
      data,
      company,
    }: {
      company: string;
      data: ConsumableArticle | ComponentArticle | ToolArticle;
    }) => {
      // 1. Convertimos el objeto data a FormData real
      const formData = new FormData();

      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (value instanceof File) {
            formData.append(key, value);
          } else if (Array.isArray(value)) {
            value.forEach((item) => formData.append(`${key}[]`, item));
          } else {
            formData.append(key, serializeFormValue(value));
          }
        }
      });

      // 2. Enviamos el formData (Axios gestiona los límites automáticamente)
      await axiosInstance.post(`/${company}/article`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["in-review-articles"] });
      queryClient.invalidateQueries({ queryKey: ["warehouse-articles"] });
      toast.success("¡Registrado!", {
        description: `El articulo ha sido registrado correctamente.`,
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
        createArticle: createMutation,
    };
};

export const useUploadArticleDocuments = () => {
    const queryClient = useQueryClient();

    const uploadMutation = useMutation({
        mutationKey: ["article-documents"],
        mutationFn: async ({
            company,
            articleId,
            documents,
        }: {
            company: string;
            articleId: number;
            documents: ArticleDocumentSelection[];
        }) => {
            if (documents.length === 0) return;

            // 1. Registra los tipos de documento que se esperan del artículo
            const { data } = await axiosInstance.post(
                `/${company}/articles/${articleId}/document-requirements`,
                { document_type_ids: documents.map((doc) => doc.typeId) }
            );

            const requirements: { id: number; article_document_type_id: number }[] =
                data?.Requirements ?? [];

            // 2. Consigna cada requerimiento que tenga archivo o constancia física
            for (const doc of documents) {
                if (!doc.file && !doc.isPhysical) continue;

                const requirement = requirements.find(
                    (req) => req.article_document_type_id === doc.typeId
                );

                if (!requirement) continue;

                const formData = new FormData();
                if (doc.file) {
                    formData.append("file", doc.file);
                }
                formData.append("is_physical", doc.isPhysical ? "1" : "0");

                await axiosInstance.post(
                    `/${company}/article-document-requirements/${requirement.id}/documents`,
                    formData
                );
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["articles"] });
            queryClient.invalidateQueries({ queryKey: ["warehouse-articles"] });
        },
        onError: (error) => {
            toast.error("Oops!", {
                description: "No se pudo guardar la documentación del artículo...",
            });
            console.log(error);
        },
    });

    return {
        uploadArticleDocuments: uploadMutation,
    };
};

/**
 * Consignación de un requerimiento documental ya existente
 * (ArticleDocumentRequirement): archivo y/o constancia de recepción física.
 */
export interface RequirementConsignment {
    requirementId: number;
    file?: File;
    isPhysical?: boolean;
}

export const useConsignRequirementDocuments = () => {
    const queryClient = useQueryClient();

    const consignMutation = useMutation({
        mutationKey: ["article-documents"],
        mutationFn: async ({
            company,
            consignments,
        }: {
            company: string;
            consignments: RequirementConsignment[];
        }) => {
            for (const consignment of consignments) {
                if (!consignment.file && !consignment.isPhysical) continue;

                const formData = new FormData();
                if (consignment.file) {
                    formData.append("file", consignment.file);
                }
                formData.append("is_physical", consignment.isPhysical ? "1" : "0");

                await axiosInstance.post(
                    `/${company}/article-document-requirements/${consignment.requirementId}/documents`,
                    formData
                );
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["articles"] });
            queryClient.invalidateQueries({ queryKey: ["warehouse-articles"] });
        },
        onError: (error) => {
            toast.error("Oops!", {
                description: "No se pudo consignar la documentación del artículo...",
            });
            console.log(error);
        },
    });

    return {
        consignRequirementDocuments: consignMutation,
    };
};

export const useDeleteArticle = () => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async ({
      id,
      company,
    }: {
      id: number | string;
      company: string;
    }) => {
      await axiosInstance.delete(`/${company}/article/${id}`);
    },
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      queryClient.invalidateQueries({ queryKey: ["warehouse-articles", data.company] });
      // queryClient.invalidateQueries({queryKey: ['warehouse-articles']})
      toast.success("¡Eliminado!", {
        description: `¡El articulo ha sido eliminado correctamente!`,
      });
    },
    onError: (e) => {
      toast.error("Oops!", {
        description: "¡Hubo un error al eliminar el articulo!",
      });
    },
  });

  return {
    deleteArticle: deleteMutation,
  };
};

export const useUpdateArticleStatus = () => {
  const { selectedCompany } = useCompanyStore();
  const queryClient = useQueryClient();
  const updateArticleStatusMutation = useMutation({
    mutationKey: ["articles"],
    mutationFn: async ({
      id,
      ids,
      status,
    }: {
      id?: number;
      ids?: number[];
      status?: string;
    }) => {
      if (ids && ids.length > 0) {
        await axiosInstance.put(
          `/${selectedCompany?.slug}/update-article-status`,
          { status, ids }
        );
        return;
      }

      if (id === undefined) {
        throw new Error("Debe proporcionar un id o una lista de ids");
      }

      await axiosInstance.put(
        `/${selectedCompany?.slug}/update-article-status/${id}`,
        { status }
      );
    },
    onSuccess: () => {
      const company = selectedCompany?.slug;

      queryClient.invalidateQueries({ queryKey: ["in-transit-articles"] });
      queryClient.invalidateQueries({ queryKey: ["in-reception-articles"] });
      queryClient.invalidateQueries({ queryKey: ["checking-articles"] });
      queryClient.invalidateQueries({ queryKey: ["warehouse-articles"] });
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      if (company) {
        queryClient.invalidateQueries({ queryKey: ["articles", company, "TRANSIT"] });
        queryClient.invalidateQueries({ queryKey: ["articles", company, "RECEPTION"] });
        queryClient.invalidateQueries({ queryKey: ["articles", company, "INCOMING"] });
        queryClient.invalidateQueries({ queryKey: ["articles", company, "WAITING_FOR_FORMAT"] });
        queryClient.invalidateQueries({ queryKey: ["articles", company, "WAITING_TO_LOCATE"] });
        queryClient.invalidateQueries({ queryKey: ["articles", company, "QUARANTINE"] });
        queryClient.invalidateQueries({ queryKey: ["articles", company, "TO_DETERMINATE"] });
        queryClient.invalidateQueries({ queryKey: ["articles", company, "STORED"] });
      }
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      toast.success("¡Actualizado!", {
        description: `El articulo ha sido actualizado correctamente.`,
      });
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: "No se pudo actualizar el articulo...",
      });
      console.log(error);
    },
  });
  return {
    updateArticleStatus: updateArticleStatusMutation,
  };
};

export const useConfirmIncomingArticle = () => {
  const { selectedCompany } = useCompanyStore();
  const queryClient = useQueryClient();

  const mutation = useMutation<void, Error, IncomingPayload>({
    mutationKey: ["incoming-inspections"],

    mutationFn: async (payload) => {
      if (!selectedCompany?.slug) {
        throw new Error("Company no seleccionada");
      }

      await axiosInstance.post(
        `/${selectedCompany.slug}/incoming-inspections`,
        payload,
      );
    },

    onSuccess: () => {
      const company = selectedCompany?.slug;

      queryClient.invalidateQueries({ queryKey: ["warehouse-articles"] });
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      if (company) {
        queryClient.invalidateQueries({ queryKey: ["articles", company, "INCOMING"] });
        queryClient.invalidateQueries({ queryKey: ["articles", company, "WAITING_FOR_FORMAT"] });
      }
      queryClient.invalidateQueries({ queryKey: ["incoming-inspections"] });

      toast.success("¡Inspección creada!", {
        description: "El artículo fue enviado correctamente.",
      });
    },

    onError: (error) => {
      toast.error("Oops!", {
        description: "No se pudo registrar la inspección...",
      });

      console.error(error);
    },
  });

  return {
    confirmIncoming: mutation,
  };
};

export const useEditArticle = () => {
  const queryClient = useQueryClient();

  const editArticleMutation = useMutation({
    mutationKey: ["articles"],
    mutationFn: async ({
      data,
      company,
    }: {
      company: string;
      data: any; // Usamos any para facilitar el mapeo de los diversos tipos
    }) => {
      const formData = new FormData();

      // Mapeo dinámico de campos al FormData
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (value instanceof File) {
            formData.append(key, value);
          } else if (Array.isArray(value)) {
            value.forEach((item) => formData.append(`${key}[]`, item));
          } else {
            formData.append(key, serializeFormValue(value));
          }
        }
      });

      return await axiosInstance.post(
        `/${company}/update-article-warehouse/${data.id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
    },
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ["article"] });
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      queryClient.invalidateQueries({ queryKey: ["warehouse-articles"] });
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      queryClient.invalidateQueries({ queryKey: ["in-transit-articles"] });
      queryClient.invalidateQueries({ queryKey: ["in-reception-articles"] });
      queryClient.invalidateQueries({ queryKey: ['articles', data.company, data.data.status] });
      toast.success("¡Actualizado!", {
        description: `El articulo ha sido actualizado correctamente.`,
      });
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: "No se pudo actualizar el articulo...",
      });
      console.log(error);
    },
  });
  return {
    editArticle: editArticleMutation,
  };
};

export const useUpdateArticle = () => {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationKey: ["articles"],

    mutationFn: async ({
      id,
      data,
      company,
    }: {
      id: number | string;
      company: string;
      data: Record<string, any>;
    }) => {
      const formData = new FormData();

      Object.entries(data).forEach(([key, value]) => {
        if (value === undefined || value === null) return;

        // Files
        if (value instanceof File) {
          formData.append(key, value);
          return;
        }

        // Arrays
        if (Array.isArray(value)) {
          value.forEach((item) => {
            formData.append(`${key}[]`, item);
          });
          return;
        }

        // Objects (ej: unit, nested data)
        if (typeof value === "object") {
          formData.append(key, JSON.stringify(value));
          return;
        }

        // Primitives
        formData.append(key, serializeFormValue(value));
      });

      return await axiosInstance.post(
        `/${company}/update-article/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouse-articles"] });
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      queryClient.invalidateQueries({ queryKey: ["search-batches"] });

      toast.success("¡Actualizado!", {
        description: "El articulo ha sido actualizado correctamente.",
      });
    },

    onError: (error) => {
      toast.error("Oops!", {
        description: "No se pudo actualizar el articulo...",
      });

      console.log(error);
    },
  });

  return {
    updateArticle: updateMutation,
  };
};

export const useLocateArticle = () => {
  const queryClient = useQueryClient();
  const { selectedCompany } = useCompanyStore();
  const locateArticleMutation = useMutation({
    mutationKey: ["articles"],
    mutationFn: async ({
      id,
      zone,
    }: {
      id: number | string;
      zone: string;
    }) => {
      await axiosInstance.patch(`/${selectedCompany?.slug}/${id}/locate-article`, { zone });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      queryClient.invalidateQueries({ queryKey: ["warehouse-articles"] });
      toast.success("¡Ubicado!", {
        description: `El articulo ha sido ubicado correctamente.`,
      });
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: "No se pudo ubicar el articulo...",
      });
      console.log(error);
    },
  });
  return {
    locateArticle: locateArticleMutation,
  }
}

export const useSendToQuarantine = () => {
  const { selectedCompany } = useCompanyStore();
  const queryClient = useQueryClient();

  const mutation = useMutation<void, Error, SendToQuarantinePayload>({
    mutationKey: ["quarantine-articles"],

    mutationFn: async (payload) => {
      if (!selectedCompany?.slug) {
        throw new Error("Company no seleccionada");
      }

      await axiosInstance.post(
        `/${selectedCompany.slug}/quarantine-articles`,
        payload,
      );
    },

    onSuccess: () => {
      const company = selectedCompany?.slug;

      queryClient.invalidateQueries({ queryKey: ["warehouse-articles"] });
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      if (company) {
        queryClient.invalidateQueries({ queryKey: ["articles", company, "INCOMING"] });
        queryClient.invalidateQueries({ queryKey: ["articles", company, "QUARANTINE"] });
      }
      queryClient.invalidateQueries({ queryKey: ["incoming-articles"] });
      queryClient.invalidateQueries({ queryKey: ["quarantine-articles"] });

      toast.warning("¡Enviado a cuarentena!", {
        description: "El artículo fue enviado a cuarentena correctamente.",
      });
    },

    onError: (error) => {
      toast.error("Oops!", {
        description: "No se pudo registrar el artículo en cuarentena...",
      });

      console.error(error);
    },
  });

  return {
    sendToQuarantine: mutation,
  };
};

export const useUpdateToolArticleStatus = () => {
  const { selectedCompany } = useCompanyStore();

  const queryClient = useQueryClient();

  const updateToolArticleStatusMutation = useMutation({
    mutationKey: ['calibrated-tools'],
    mutationFn: async ({ id, status, calibration_date }: { id: number; status: string; calibration_date?: string }) => {
      await axiosInstance.patch(`/${selectedCompany?.slug}/update-tool/${id}`, {
        status: status,
        calibration_date: calibration_date || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouse-articles'] });
      toast.success('¡Actualizado!', {
        description: `El Material ha sido actualizado correctamente.`,
      });
    },
    onError: (error) => {
      toast.error('Oops!', {
        description: 'No se pudo actualizar el articulo...',
      });
      console.log(error);
    },
  });
  return {
    updateToolArticleStatus: updateToolArticleStatusMutation,
  };
};
