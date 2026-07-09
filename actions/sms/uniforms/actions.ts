import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";

interface CreateItemPayload {
  company: string;
  data: {
    uniform_article_type_id: number;
    uniform_brand_id: number;
    size: string;
    company: string;
    gender: string;
    min_stock?: number;
    initial_quantity?: number;
  };
}

interface CreateArticleTypePayload {
  company: string;
  data: { name: string; sizes: string[]; active?: boolean };
}

interface UpdateArticleTypePayload {
  company: string;
  id: number;
  data: { name?: string; sizes?: string[]; active?: boolean };
}

interface CreateBrandPayload {
  company: string;
  data: { name: string; active?: boolean };
}

interface UpdateBrandPayload {
  company: string;
  id: number;
  data: { name?: string; active?: boolean };
}

interface UpdateItemPayload {
  company: string;
  id: number;
  data: { min_stock?: number; active?: boolean };
}

interface CreateMovementPayload {
  company: string;
  data: {
    uniform_item_id: number;
    movement_type: string;
    quantity: number;
    date: string;
    recipient_name?: string;
    direction?: "increase" | "decrease";
    notes?: string;
  };
}

const invalidate = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: ["uniform-items"] });
  queryClient.invalidateQueries({ queryKey: ["uniform-movements"] });
};

const invalidateTypes = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: ["uniform-article-types"] });
  queryClient.invalidateQueries({ queryKey: ["uniform-options"] });
  // SKUs render their type name, so refresh them too.
  queryClient.invalidateQueries({ queryKey: ["uniform-items"] });
};

const invalidateBrands = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: ["uniform-brands"] });
  queryClient.invalidateQueries({ queryKey: ["uniform-options"] });
  // SKUs render their brand name, so refresh them too.
  queryClient.invalidateQueries({ queryKey: ["uniform-items"] });
};

// --- CREAR ARTÍCULO (SKU) ---
export const useCreateUniformItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ company, data }: CreateItemPayload) => {
      return await axiosInstance.post(`/${company}/sms/uniforms/items`, data);
    },
    onSuccess: () => {
      invalidate(queryClient);
      toast.success("Artículo creado con éxito");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message?.size?.[0] ||
          error.response?.data?.message ||
          "Error al crear el artículo"
      );
    },
  });
};

// --- ACTUALIZAR ARTÍCULO (min_stock / activo) ---
export const useUpdateUniformItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ company, id, data }: UpdateItemPayload) => {
      return await axiosInstance.patch(
        `/${company}/sms/uniforms/items/${id}`,
        data
      );
    },
    onSuccess: () => {
      invalidate(queryClient);
      toast.success("Artículo actualizado");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Error al actualizar");
    },
  });
};

// --- ELIMINAR ARTÍCULO (sólo si no tiene movimientos) ---
export const useDeleteUniformItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ company, id }: { company: string; id: number }) => {
      return await axiosInstance.delete(
        `/${company}/sms/uniforms/items/${id}`
      );
    },
    onSuccess: () => {
      invalidate(queryClient);
      toast.success("Artículo eliminado");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          "No se pudo eliminar el artículo"
      );
    },
  });
};

// --- CRUD TIPOS DE ARTÍCULO ---
export const useCreateUniformArticleType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ company, data }: CreateArticleTypePayload) => {
      return await axiosInstance.post(
        `/${company}/sms/uniforms/article-types`,
        data
      );
    },
    onSuccess: () => {
      invalidateTypes(queryClient);
      toast.success("Tipo de artículo creado");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message?.name?.[0] ||
          error.response?.data?.message ||
          "Error al crear el tipo de artículo"
      );
    },
  });
};

export const useUpdateUniformArticleType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ company, id, data }: UpdateArticleTypePayload) => {
      return await axiosInstance.patch(
        `/${company}/sms/uniforms/article-types/${id}`,
        data
      );
    },
    onSuccess: () => {
      invalidateTypes(queryClient);
      toast.success("Tipo de artículo actualizado");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message?.name?.[0] ||
          error.response?.data?.message ||
          "Error al actualizar el tipo"
      );
    },
  });
};

export const useDeleteUniformArticleType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ company, id }: { company: string; id: number }) => {
      return await axiosInstance.delete(
        `/${company}/sms/uniforms/article-types/${id}`
      );
    },
    onSuccess: () => {
      invalidateTypes(queryClient);
      toast.success("Tipo de artículo eliminado");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          "No se pudo eliminar el tipo de artículo"
      );
    },
  });
};

// --- CRUD MARCAS ---
export const useCreateUniformBrand = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ company, data }: CreateBrandPayload) => {
      return await axiosInstance.post(
        `/${company}/sms/uniforms/brands`,
        data
      );
    },
    onSuccess: () => {
      invalidateBrands(queryClient);
      toast.success("Marca creada");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message?.name?.[0] ||
          error.response?.data?.message ||
          "Error al crear la marca"
      );
    },
  });
};

export const useUpdateUniformBrand = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ company, id, data }: UpdateBrandPayload) => {
      return await axiosInstance.patch(
        `/${company}/sms/uniforms/brands/${id}`,
        data
      );
    },
    onSuccess: () => {
      invalidateBrands(queryClient);
      toast.success("Marca actualizada");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message?.name?.[0] ||
          error.response?.data?.message ||
          "Error al actualizar la marca"
      );
    },
  });
};

export const useDeleteUniformBrand = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ company, id }: { company: string; id: number }) => {
      return await axiosInstance.delete(
        `/${company}/sms/uniforms/brands/${id}`
      );
    },
    onSuccess: () => {
      invalidateBrands(queryClient);
      toast.success("Marca eliminada");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          "No se pudo eliminar la marca"
      );
    },
  });
};

// --- REGISTRAR MOVIMIENTO (entrada / entrega / ajuste) ---
export const useCreateUniformMovement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ company, data }: CreateMovementPayload) => {
      return await axiosInstance.post(
        `/${company}/sms/uniforms/movements`,
        data
      );
    },
    onSuccess: () => {
      invalidate(queryClient);
      toast.success("Movimiento registrado");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          "Error al registrar el movimiento"
      );
    },
  });
};
