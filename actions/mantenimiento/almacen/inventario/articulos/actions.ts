import axiosInstance from "@/lib/axios";
import { useCompanyStore } from "@/stores/CompanyStore";
import { ComponentArticle, ConsumableArticle, ToolArticle } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
interface UnitSelection {
  conversion_id: number;
}
interface ArticleData {
  serial?: string | string[];
  part_number: string;
  article_type: string;
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
  certificate_8130?: File | string;
  certificate_fabricant?: File | string;
  certificate_vendor?: File | string;
  image?: File | string;
  conversions?: UnitSelection[];
  primary_unit_id?: number;
  life_limit_part_calendar?: string;
  life_limit_part_hours?: string | number;
  life_limit_part_cycles?: string | number;
  inspector?: string;
  inspect_date?: string;
  hard_time_calendar?: string;
  hard_time_hours?: string | number;
  hard_time_cycles?: string | number;
  ata_code ?: string;
}

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
            formData.append(key, value.toString());
          }
        }
      });

      // 3. ENVIAMOS EL FORMDATA (Axios pondrá los headers automáticamente)
      return await axiosInstance.post(`/${company}/article`, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouse-articles"] });
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
            formData.append(key, value.toString());
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
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
    mutationFn: async ({ id, status }: { id: number; status?: string }) => {
      await axiosInstance.put(
        `/${selectedCompany?.slug}/update-article-status/${id}`,
        { status: status }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["in-transit-articles"] });
      queryClient.invalidateQueries({ queryKey: ["in-reception-articles"] });
      queryClient.invalidateQueries({ queryKey: ["checking-articles"] });
      queryClient.invalidateQueries({ queryKey: ["warehouse-articles"] });
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
  const {selectedCompany} = useCompanyStore();
  const queryClient = useQueryClient();
  const confirmIncomingArticleMutation = useMutation({
    mutationKey: ["articles"],
    mutationFn: async ({
      values,
    }: {
      values: {
        article_id: number;
        inspector: string,
        incoming_date: string;
      };
    }) => {
      await axiosInstance.patch(
        `/${selectedCompany?.slug}/${values.article_id}/confirm-incoming`,
        {
          ...values,
        },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouse-articles"] });
      queryClient.invalidateQueries({ queryKey: ["articles"] });
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
    confirmIncoming: confirmIncomingArticleMutation,
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
            formData.append(key, value.toString());
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["article"] });
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      queryClient.invalidateQueries({ queryKey: ["warehouse-articles"] });
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      queryClient.invalidateQueries({ queryKey: ["in-transit-articles"] });
      queryClient.invalidateQueries({ queryKey: ["in-reception-articles"] });
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
      data: ArticleData;
    }) => {
      const formData = new FormData();

      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (value instanceof File) {
            formData.append(key, value);
          } else if (Array.isArray(value)) {
            value.forEach((item) => formData.append(`${key}[]`, item));
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      return await axiosInstance.post(`/${company}/update-article/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouse-articles"] });
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      queryClient.invalidateQueries({ queryKey: ["search-batches"] });
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
    updateArticle: updateMutation,
  };
};

export const useLocateArticle = () => {
  const queryClient = useQueryClient();
  const {selectedCompany} = useCompanyStore();
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
