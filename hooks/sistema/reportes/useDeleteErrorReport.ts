import axiosInstance from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const getDeleteErrorReportMessage = (error: unknown) => {
  const maybeAxiosError = error as {
    response?: { data?: { message?: string } };
  };
  return (
    maybeAxiosError.response?.data?.message ||
    "No se pudo eliminar el reporte..."
  );
};

export const useDeleteErrorReport = () => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await axiosInstance.delete(`/error-reports/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["error-reports"] });
      toast.success("¡Eliminado!", {
        description: "El reporte fue eliminado.",
      });
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: getDeleteErrorReportMessage(error),
      });
    },
  });

  return { deleteErrorReport: deleteMutation };
};
