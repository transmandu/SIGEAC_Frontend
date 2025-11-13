import axiosInstance from "@/lib/axios";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface createUnitSchema {
  value: string;
  label: string;
}

interface createSecondaryUnitSchema {
  primary_unit: number ;
  secondary_unit?: number ;
  equivalence: number;
}

export const useCreateUnit = () => {
  const { selectedCompany } = useCompanyStore();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data: createUnitSchema) => {
      await axiosInstance.post(`/${selectedCompany?.slug}/unit`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["units", selectedCompany?.slug],
      });
      toast("¡Creado!", {
        description: `¡La unidad se ha creado correctamente!`,
      });
    },
    onError: (error) => {
      toast("Hey", {
        description: `No se creo correctamente: ${error}`,
      });
    },
  });

  return {
    createUnit: createMutation,
  };
};

export const useCreateSecondaryUnit = () => {
  const { selectedCompany } = useCompanyStore();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data: createSecondaryUnitSchema) => {
      console.log("Datos enviados al backend:", data),
        await axiosInstance.post(`/${selectedCompany?.slug}/convertion`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["secondary-units", selectedCompany?.slug],
      });
      toast("¡Creado!", {
        description: `¡La unidad secundaria se ha creado correctamente!`,
      });
    },
    onError: (error) => {
      toast("Hey", {
        description: `No se creo correctamente: ${error}`,
      });
    },
  });

  return {
    createSecondaryUnit: createMutation,
  };
};

export const useDeleteUnit = () => {
  const { selectedCompany } = useCompanyStore();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (id: number | string) => {
      await axiosInstance.delete(`/${selectedCompany?.slug}/unit/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["units", selectedCompany?.slug],
      });
      queryClient.invalidateQueries({
        queryKey: ["secondary-units", selectedCompany?.slug],
      });
      toast.success("¡Eliminado!", {
        description: `¡La unidad ha sido eliminado correctamente!`,
      });
    },
    onError: (e) => {
      toast.error("Oops!", {
        description: "¡Hubo un error al eliminar la unidad!",
      });
    },
  });

  return {
    deleteUnit: deleteMutation,
  };
};

export const useDeleteSecondaryUnit = () => {
  const { selectedCompany } = useCompanyStore();

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (id: number | string) => {
      await axiosInstance.delete(`/${selectedCompany?.slug}/convertion/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["secondary-units", selectedCompany?.slug],
      });
      toast.success("¡Eliminado!", {
        description: `¡La unidad secundaria ha sido eliminado correctamente!`,
      });
    },
    onError: (e) => {
      toast.error("Oops!", {
        description: "¡Hubo un error al eliminar la unidad secundaria!",
      });
    },
  });

  return {
    deleteSecondaryUnit: deleteMutation,
  };
};
