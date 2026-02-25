import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";

export const useCreateSMSCertificate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ company, data }: { company: string; data: FormData }) => {
      return await axiosInstance.post(`/${company}/sms/certificates`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      // Refrescamos la lista de certificados automáticamente
      queryClient.invalidateQueries({ queryKey: ["sms-certificates"] });
      toast.success("Certificado cargado con éxito");
    },
    onError: () => {
      toast.error("Error al subir el certificado");
    }
  });
};