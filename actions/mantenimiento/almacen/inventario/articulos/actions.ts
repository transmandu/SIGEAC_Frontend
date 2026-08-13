import axiosInstance from "@/lib/axios";
import { useCompanyStore } from "@/stores/CompanyStore";
import { ArticleDocumentRequirementSummary, ComponentArticle, ConsumableArticle, ToolArticle } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";

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
    /** Equivalencias del artículo: { unit_id, direction, value }. */
    conversions?: { unit_id: number; direction: string; value: number }[];
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
  /** Username del inspector que retiene; el backend lo exige y lo valida contra master. */
  inspector: string;
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
    /**
     * Id del requerimiento ya existente al que pertenece esta selección
     * (modo edición: el tipo ya estaba consignado o pendiente). Si no viene,
     * se asume que el requerimiento aún no existe y hay que crearlo.
     */
    requirementId?: number;
    /**
     * Id del documento consignado que debe eliminarse antes de subir el
     * nuevo archivo (reemplazo explícito de un documento ya existente).
     */
    replaceDocumentId?: number;
}

/**
 * Invalida todo lo que depende de la documentación de un artículo: los
 * listados, el detalle que precarga el formulario de edición (`article`) y el
 * checklist que carga el diálogo de documentación.
 */
const invalidateArticleDocuments = (queryClient: ReturnType<typeof useQueryClient>) => {
    queryClient.invalidateQueries({ queryKey: ["articles"] });
    queryClient.invalidateQueries({ queryKey: ["warehouse-articles"] });
    queryClient.invalidateQueries({ queryKey: ["article"] });
    queryClient.invalidateQueries({ queryKey: ["article-document-requirements"] });
};

/**
 * Precarga la selección documental a partir de los requerimientos ya
 * registrados del artículo (modo edición). Los que tienen documento consignado
 * llevan su requirementId, que es lo que permite al selector mostrar el estado
 * real (preview + reemplazar) en vez de un input vacío.
 */
export const buildDocumentSelectionFromArticle = (
    article?: { document_requirements?: ArticleDocumentRequirementSummary[] }
): ArticleDocumentSelection[] =>
    (article?.document_requirements ?? [])
        .filter((req) => typeof req.document_type?.id === "number")
        .map((req) => ({
            typeId: req.document_type!.id,
            requirementId: req.documents.length > 0 ? req.id : undefined,
        }));

/**
 * ¿La selección documental cambió respecto a lo que el artículo ya tenía?
 * Los documentos viven fuera de react-hook-form, así que `formState.isDirty`
 * no los ve: sin esto, adjuntar un archivo no habilita el botón de guardar.
 */
export const isDocumentSelectionDirty = (
    current: ArticleDocumentSelection[],
    initial: ArticleDocumentSelection[]
): boolean => {
    if (current.some((doc) => doc.file || doc.isPhysical || doc.replaceDocumentId)) {
        return true;
    }

    if (current.length !== initial.length) return true;

    const initialTypeIds = new Set(initial.map((doc) => doc.typeId));

    return current.some((doc) => !initialTypeIds.has(doc.typeId));
};

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
      // Va en multipart por la imagen: los arrays se aplanan con [] y las
      // fechas se normalizan, porque FormData solo transporta strings y File.
      const formData = new FormData();

      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach((item) => formData.append(`${key}[]`, item));
          } else if (value instanceof File) {
            formData.append(key, value);
          } else {
            formData.append(key, serializeFormValue(value));
          }
        }
      });

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

/**
 * Sincroniza los requerimientos del artículo con la selección del formulario:
 * elimina de la BD los tipos que el usuario quitó (o todos, si desmarcó la
 * casilla de documentación). Sin esto el requerimiento sobrevive y al reabrir
 * el formulario la casilla vuelve a marcarse sola.
 */
export const useSyncArticleDocumentRequirements = () => {
    const queryClient = useQueryClient();

    const syncMutation = useMutation({
        mutationKey: ["article-documents"],
        mutationFn: async ({
            company,
            keptTypeIds,
            existingRequirements,
        }: {
            company: string;
            /** Tipos que deben permanecer; el resto se elimina. */
            keptTypeIds: number[];
            existingRequirements: ArticleDocumentRequirementSummary[];
        }) => {
            const kept = new Set(keptTypeIds);

            const removable = existingRequirements.filter(
                (req) =>
                    typeof req.document_type?.id === "number" &&
                    !kept.has(req.document_type.id)
            );

            for (const requirement of removable) {
                await axiosInstance.delete(
                    `/${company}/article-document-requirements/${requirement.id}`
                );
            }
        },
        onSuccess: () => {
            invalidateArticleDocuments(queryClient);
        },
        onError: (error) => {
            toast.error("Oops!", {
                description: "No se pudo actualizar la documentación esperada...",
            });
            console.log(error);
        },
    });

    return {
        syncArticleDocumentRequirements: syncMutation,
    };
};

/**
 * El 422 de Laravel trae el motivo real (tipo de archivo no permitido, pesa
 * más de 10 MB...). Sin esto el usuario solo veía "no se pudo guardar" y no
 * había forma de saber por qué el archivo fue rechazado.
 */
const describeDocumentUploadError = (error: any): string => {
    const response = error?.response;

    if (response?.status === 413) {
        return "El archivo es demasiado grande. El máximo permitido es 10 MB.";
    }

    const validationErrors = response?.data?.errors;

    if (validationErrors && typeof validationErrors === "object") {
        const first = Object.values(validationErrors).flat()[0];
        if (typeof first === "string") return first;
    }

    const message = response?.data?.message;
    if (typeof message === "string" && message.length > 0) return message;

    return "No se pudo guardar la documentación del artículo...";
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

            // Dos pasos obligados: primero se declaran los tipos esperados y de
            // ahí salen los requirements, contra los que se sube cada archivo.
            // Un tipo sin archivo queda como pendiente, que es lo que se audita.
            const { data } = await axiosInstance.post(
                `/${company}/articles/${articleId}/document-requirements`,
                { document_type_ids: documents.map((doc) => doc.typeId) }
            );

            const requirements: { id: number; article_document_type_id: number }[] =
                data?.Requirements ?? [];

            for (const doc of documents) {
                if (!doc.file && !doc.isPhysical) continue;

                const requirement = requirements.find(
                    (req) => req.article_document_type_id === doc.typeId
                );

                if (!requirement) continue;

                // Reemplazo explícito: elimina el documento anterior antes de
                // consignar el nuevo, para no dejar dos documentos activos.
                if (doc.replaceDocumentId) {
                    await axiosInstance.delete(
                        `/${company}/article-documents/${doc.replaceDocumentId}`
                    );
                }

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
            invalidateArticleDocuments(queryClient);
        },
        onError: (error) => {
            toast.error("Oops!", {
                description: describeDocumentUploadError(error),
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
            invalidateArticleDocuments(queryClient);
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

/**
 * Elimina un documento ya consignado (ArticleDocument), p. ej. antes de
 * reemplazarlo por uno nuevo.
 */
export const useDeleteArticleDocument = () => {
    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationKey: ["article-documents"],
        mutationFn: async ({
            company,
            documentId,
        }: {
            company: string;
            documentId: number;
        }) => {
            await axiosInstance.delete(`/${company}/article-documents/${documentId}`);
        },
        onSuccess: () => {
            invalidateArticleDocuments(queryClient);
        },
        onError: (error) => {
            toast.error("Oops!", {
                description: "No se pudo eliminar el documento consignado...",
            });
            console.log(error);
        },
    });

    return {
        deleteArticleDocument: deleteMutation,
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
      // El cambio de estado deja un movimiento nuevo: la cronología ya no vale.
      queryClient.invalidateQueries({ queryKey: ["article-status-history"] });
      if (company) {
        queryClient.invalidateQueries({ queryKey: ["articles", company, "TRANSIT"] });
        queryClient.invalidateQueries({ queryKey: ["articles", company, "RECEPTION"] });
        queryClient.invalidateQueries({ queryKey: ["articles", company, "INCOMING"] });
        queryClient.invalidateQueries({ queryKey: ["articles", company, "WAITING_FOR_FORMAT"] });
        queryClient.invalidateQueries({ queryKey: ["articles", company, "WAITING_TO_LOCATE"] });
        queryClient.invalidateQueries({ queryKey: ["articles", company, "QUARANTINE"] });
        queryClient.invalidateQueries({ queryKey: ["articles", company, "PENDING_REINSPECTION"] });
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
        // Una re-inspección entra por aquí: aprobar cierra la retención y
        // rechazar la reabre, así que ambos lados del ciclo quedan obsoletos.
        queryClient.invalidateQueries({ queryKey: ["articles", company, "QUARANTINE"] });
        queryClient.invalidateQueries({ queryKey: ["articles", company, "PENDING_REINSPECTION"] });
      }
      queryClient.invalidateQueries({ queryKey: ["incoming-inspections"] });
      queryClient.invalidateQueries({ queryKey: ["quarantine-articles"] });

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
        `/${company}/update-article/${data.id}`,
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
      // El paso a cuarentena deja un movimiento nuevo en la cronología.
      queryClient.invalidateQueries({ queryKey: ["article-status-history"] });

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
      queryClient.invalidateQueries({ queryKey: ['article-status-history'] });
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
