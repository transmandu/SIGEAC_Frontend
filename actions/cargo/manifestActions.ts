import axiosInstance from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface ManifestItemPayload {
  shipment_id: number;
  shipment_item_id: number;
  weight_in_manifest: number;
  units_in_manifest: number;
}

export interface ManifestItemUpdatePayload {
  shipment_id: number;
  shipment_item_id: number;
  weight_in_manifest: number;
  units_in_manifest: number;
}

// ─── Invalidaciones comunes ───────────────────────────────────────────────────

const invalidateAll = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: ["cargo-manifests"] });
  queryClient.invalidateQueries({
    queryKey: ["available-shipments-for-manifest"],
  });
  queryClient.invalidateQueries({ queryKey: ["cargo-shipments-by-aircraft"] });
  queryClient.invalidateQueries({
    queryKey: ["cargo-shipments-by-external-aircraft"],
  });
};

// ─── Crear ────────────────────────────────────────────────────────────────────

export const useCreateCargoManifest = (company: string) => {
  const queryClient = useQueryClient();
  const createMutation = useMutation({
    mutationFn: async (data: {
      month: number;
      year: number;
      items: ManifestItemPayload[];
    }) => {
      const response = await axiosInstance.post(
        `/${company}/cargo-manifests`,
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      invalidateAll(queryClient);
      toast.success("Creado", {
        description: "Manifiesto de carga creado correctamente.",
      });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        "Ha ocurrido un error al crear el manifiesto.";
      toast.error("Error", { description: message });
    },
  });
  return { createCargoManifest: createMutation };
};

// ─── Actualizar ───────────────────────────────────────────────────────────────

export const useUpdateCargoManifest = (company: string) => {
  const queryClient = useQueryClient();
  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: { items: ManifestItemUpdatePayload[] };
    }) => {
      const response = await axiosInstance.put(
        `/${company}/cargo-manifests/${id}`,
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      invalidateAll(queryClient);
      toast.success("Actualizado", {
        description: "Manifiesto de carga actualizado correctamente.",
      });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        "Ha ocurrido un error al actualizar el manifiesto.";
      toast.error("Error", { description: message });
    },
  });
  return { updateCargoManifest: updateMutation };
};

// ─── Eliminar ─────────────────────────────────────────────────────────────────

export const useDeleteCargoManifest = (company: string) => {
  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: async (id: number | string) => {
      await axiosInstance.delete(`/${company}/cargo-manifests/${id}`);
    },
    onSuccess: () => {
      invalidateAll(queryClient);
      toast.success("Eliminado", {
        description: "Manifiesto de carga eliminado correctamente.",
      });
    },
    onError: () => {
      toast.error("Error", {
        description:
          "Ha ocurrido un problema al intentar eliminar el manifiesto.",
      });
    },
  });
  return { deleteCargoManifest: deleteMutation };
};

// ─── Reimprimir ───────────────────────────────────────────────────────────────

export const useReprintCargoManifest = (company: string) => {
  const queryClient = useQueryClient();
  const reprintMutation = useMutation({
    mutationFn: async (id: number | string) => {
      await axiosInstance.put(`/${company}/cargo-manifests/${id}/reprint`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cargo-manifests"] });
      toast.success("Reimpresión", {
        description: "Manifiesto de carga marcado para reimpresión.",
      });
    },
    onError: () => {
      toast.error("Error", {
        description:
          "Ha ocurrido un error al intentar reimprimir el manifiesto.",
      });
    },
  });
  return { reprintCargoManifest: reprintMutation };
};

// ─── Descargar PDF ────────────────────────────────────────────────────────────

export const downloadManifestPdf = async (company: string, id: number) => {
  try {
    const response = await axiosInstance.get(
      `/${company}/cargo-manifests/${id}/pdf`,
      { responseType: "blob" },
    );

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `MANIFIESTO_${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error al descargar el PDF", error);
    toast.error("Error", {
      description: "No se pudo descargar el PDF del manifiesto.",
    });
  }
};
