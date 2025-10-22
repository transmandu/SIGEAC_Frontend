import axiosInstance from "@/lib/axios";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface IDispatchRequestAction {
  justification: string;
  submission_date: string;
  created_by: string;
  requested_by: string;
  destination_place: string;
  category: string;
  articles: {
    article_id: number;
    quantity?: number;
    serial?: string | null;
  }[];
  user_id: number;
}

export const useCreateDispatchRequest = () => {
  const queryClient = useQueryClient();

  const router = useRouter();

  const { selectedStation } = useCompanyStore();

  const createMutation = useMutation({
    mutationKey: ["dispatch-request"],
    mutationFn: async ({
      data,
      company,
    }: {
      data: IDispatchRequestAction;
      company: string;
    }) => {
      await axiosInstance.post(`/${company}/dispatch-order`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onSuccess: (_, data) => {
      console.log("invalidando querys", data.company, selectedStation);
      queryClient.invalidateQueries({
        queryKey: ["dispatches-requests", data.company, selectedStation],
      });
      
      toast.success("¡Creado!", {
        description: `La solicitud ha sido creado correctamente.`,
      }),
        router.refresh();
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: "No se pudo crear la solicitud...",
      });
      console.log(error);
    },
  });
  return {
    createDispatchRequest: createMutation,
  };
};

export const useUpdateStatusDispatchRequest = () => {
  const queryClient = useQueryClient();
  const updateStatusMutation = useMutation({
    mutationKey: ["dispatch-request-approve"],
    mutationFn: async ({
      id,
      status,
      approved_by,
      delivered_by,
      company,
    }: {
      id: string | number;
      status: string;
      approved_by: string;
      delivered_by: string;
      company: string;
    }) => {
      await axiosInstance.put(`/${company}/update-status-dispatch/${id}`, {
        status: status,
        approved_by: approved_by,
        delivered_by: delivered_by,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["dispatches-requests-in-process"],
      }),
        queryClient.invalidateQueries({ queryKey: ["dispatched-articles"] }),
        toast.success("¡Actualizado!", {
          description: "¡La solicitud ha sido actualizada!",
        });
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: "No se pudo crear la solicitud...",
      });
      console.log(error);
    },
  });
  return {
    updateDispatchStatus: updateStatusMutation,
  };
};
