import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";

// --- CREAR ---
export const useCreateSMSCertificate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ company, data }: { company: string; data: FormData }) => {
      return await axiosInstance.post(`/${company}/sms/certificates`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sms-certificates"] });
      toast.success("Certificado cargado con éxito");
    },
    onError: () => {
      toast.error("Error al subir el certificado");
    }
  });
};

// --- ELIMINAR ---
export const useDeleteSMSCertificate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, company }: { id: number; company: string }) => {
      // Usamos el ID y el slug de la empresa para la ruta de Laravel
      return await axiosInstance.delete(`/${company}/sms/certificates/${id}`);
    },
    onSuccess: () => {
      // Invalidamos la misma llave para que la tabla se refresque
      queryClient.invalidateQueries({ queryKey: ["sms-certificates"] });
      toast.success("Certificado eliminado correctamente");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Error al eliminar el certificado";
      toast.error(message);
    }
  });
};

export const useUpdateSMSCertificate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ company, id, data }: { company: string; id: number; data: FormData }) => {
      // Importante: Laravel requiere _method para procesar archivos en PUT/PATCH vía FormData
      data.append("_method", "PUT");
      
      return await axiosInstance.post(`/${company}/sms/certificates/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sms-certificates"] });
      toast.success("Certificado actualizado con éxito");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Error al actualizar el certificado");
    }
  });
};