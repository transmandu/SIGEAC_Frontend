import axiosInstance from "@/lib/axios"
import { MaintenanceCountingMethod } from "@/types"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner";

interface MaintenanceItemData {
  id?: number,
  name: string,
  counting_method: MaintenanceCountingMethod,
  limit_value: number,
  first_applied_date: string,
  first_applied_value?: number,
  extra_days?: number,
  maintenance_provider_id?: string,
}

interface MaintenanceControlPartData {
  aircraft_part_id: string,
  services: MaintenanceItemData[],
}

export interface CreateMaintenanceControlData {
  aircraft_id: string,
  title: string,
  description?: string,
  has_reference_manual: boolean,
  reference_manual?: string,
  remaining_percentage: number,
  certificates: MaintenanceItemData[],
  services: MaintenanceItemData[],
  parts: MaintenanceControlPartData[],
}

export const useCreateMaintenanceControl = () => {

  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: async ({ data, company }: { data: CreateMaintenanceControlData, company: string }) => {
      await axiosInstance.post(`/${company}/maintenance-controls`, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-controls'] })
      toast.success("¡Creado!", {
        description: `El control de mantenimiento ha sido registrado correctamente.`
      })
    },
    onError: (error: any) => {
      const backendMessage = error?.response?.data?.errors?.aircraft_id?.[0]
      toast.error('Oops!', {
        description: backendMessage || 'No se pudo registrar el control de mantenimiento...'
      })
      console.log(error)
    },
  })

  return {
    createMaintenanceControl: createMutation,
  }
}

export const useUpdateMaintenanceControl = () => {

  const queryClient = useQueryClient()

  const updateMutation = useMutation({
    mutationFn: async ({ id, data, company }: { id: string | number, data: CreateMaintenanceControlData, company: string }) => {
      await axiosInstance.put(`/${company}/maintenance-controls/${id}`, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-controls'] })
      toast.success("¡Actualizado!", {
        description: `El control de mantenimiento ha sido actualizado correctamente.`
      })
    },
    onError: (error: any) => {
      const backendMessage = error?.response?.data?.errors?.aircraft_id?.[0]
      toast.error('Oops!', {
        description: backendMessage || 'No se pudo actualizar el control de mantenimiento...'
      })
      console.log(error)
    },
  })

  return {
    updateMaintenanceControl: updateMutation,
  }
}

export const useLinkPendingWorkOrder = () => {
  const queryClient = useQueryClient();

  const linkMutation = useMutation({
    mutationFn: async ({
      company,
      itemId,
      workOrderId,
    }: {
      company: string;
      itemId: string | number;
      workOrderId: string | number;
    }) => {
      await axiosInstance.patch(`/${company}/maintenance-control-items/${itemId}/pending-work-order`, {
        work_order_id: workOrderId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance-controls"], exact: false });
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: "No se pudo asociar la Orden de Trabajo al ítem...",
      });
      console.log(error);
    },
  });

  return {
    linkPendingWorkOrder: linkMutation,
  };
};

export const useDeleteMaintenanceControl = () => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationKey: ["maintenance-controls"],
    mutationFn: async ({
      company,
      id,
    }: {
      company: string | null;
      id: string | number;
    }) => {
      await axiosInstance.delete(`/${company}/maintenance-controls/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance-controls"] });
      toast.success("¡Eliminado!", {
        description: `¡El control de mantenimiento ha sido eliminado correctamente!`,
      });
    },
    onError: () => {
      toast.error("Oops!", {
        description: "¡Hubo un error al eliminar el control de mantenimiento!",
      });
    },
  });

  return {
    deleteMaintenanceControl: deleteMutation,
  };
};
