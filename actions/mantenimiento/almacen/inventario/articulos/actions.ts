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


type CheckResult = "PASS" | "FAIL";

export type IncomingCheck = {
  check_id: number;
  result: CheckResult;
  observation: string | null;
};

export type IncomingPayload = {
  warehouse_id: number;
  purchase_order_code: string;
  purchase_order_id: number | null;
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
      await axiosInstance.post(`/${company}/article`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
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
      await axiosInstance.post(`/${company}/article`, data, {
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
      queryClient.invalidateQueries({ queryKey: ["warehouse-articles"] });
      queryClient.invalidateQueries({ queryKey: ["articles"] });
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
      data: {
        id: number;
        part_number: string;
        alternative_part_number?: string[];
        description: string;
        zone: string;
        manufacturer_id?: number | string;
        condition_id?: number | string;
        batches_id: string | number;
        is_special?: boolean;
        expiration_datete?: string;
        fabrication_date?: string;
        quantity?: number;
        calendar_date?: string;
        certificate_8130?: File | string;
        certificate_fabricant?: File | string;
        certificate_vendor?: File | string;
        image?: File | string;
        serial?: string;
        hour_date?: string;
        cycle_date?: string;
        convertion_id?: number;
      };
    }) => {
      await axiosInstance.post(
        `/${company}/update-article-warehouse/${data.id}`,
        data,
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
      console.log(error)
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
      await axiosInstance.post(`/${company}/update-article/${id}`, data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
    },
    onSuccess: () => {
      // Invalidar todas las queries relacionadas con artículos y batches
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
