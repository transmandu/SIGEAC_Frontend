import axiosInstance from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface ImportErrorReportHistoryData {
  file: File;
  from?: string;
  dry_run?: boolean;
  delay?: number;
}

export const useImportErrorReportHistory = () => {
  const queryClient = useQueryClient();

  const importMutation = useMutation({
    mutationFn: async ({ file, from, dry_run, delay }: ImportErrorReportHistoryData) => {
      const formData = new FormData();
      formData.append("file", file);
      if (from) formData.append("from", from);
      if (dry_run !== undefined) formData.append("dry_run", String(dry_run));
      if (delay !== undefined) formData.append("delay", String(delay));

      const response = await axiosInstance.post("/error-reports/import-history", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["error-report-imports"] });
      toast.success("¡Importacion encolada!", {
        description: "La importacion del historico se esta procesando.",
      });
    },
    onError: () => {
      toast.error("Oops!", {
        description: "No se pudo iniciar la importacion...",
      });
    },
  });

  return { importErrorReportHistory: importMutation };
};
