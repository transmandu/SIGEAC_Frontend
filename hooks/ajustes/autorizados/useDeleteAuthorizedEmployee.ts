import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { toast } from "sonner";

export const useDeleteAuthorizedEmployee = (companySlug?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await axios.delete(`/${companySlug}/authorized-employees/${id}`);
    },

    onSuccess: async () => {
      toast.success("Autorización eliminada correctamente.");
      await queryClient.invalidateQueries({
        queryKey: ["authorized-employees-from-company", companySlug],
      });
    },

    onError: (error: any) => {
      if (error.response?.status === 403) {
        toast.error("Solo la empresa de origen puede eliminar esta autorización.");
        return;
      }
      toast.error("Ha ocurrido un error al eliminar la autorización.");
    },
  });
};
