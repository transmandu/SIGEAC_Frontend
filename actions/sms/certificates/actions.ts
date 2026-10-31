import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosProgressEvent } from "axios";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";
import { notifyError } from "@/lib/notify-error";
import type { SMSCertificateImport } from "@/types";

// --- CREAR ---
export const useCreateSMSCertificate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      company,
      data,
    }: {
      company: string;
      data: FormData;
    }) => {
      return await axiosInstance.post(`/${company}/sms/certificates`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sms-certificates"] });
      toast.success("Certificado cargado con éxito");
    },
    onError: (error) => {
      notifyError(error, { action: "subir el certificado" });
    },
  });
};

// --- CARGAR LOTE ---
// Sube varios PDF y devuelve el balance de la importación. El backend procesa
// el lote en la misma petición, así que la respuesta suele traer `completed`;
// el hook de estado solo se consulta si la respuesta llegara en curso.
export const useBulkCreateSMSCertificates = () => {
  return useMutation({
    mutationFn: async ({
      company,
      data,
      onUploadProgress,
    }: {
      company: string;
      data: FormData;
      onUploadProgress?: (event: AxiosProgressEvent) => void;
    }) => {
      const response = await axiosInstance.post<{ data: SMSCertificateImport }>(
        `/${company}/sms/certificates/bulk`,
        data,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress,
        },
      );

      return response.data.data;
    },
    onError: (error) => {
      notifyError(error, { action: "subir el lote de certificados" });
    },
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
      notifyError(error, { action: "eliminar el certificado" });
    },
  });
};

export const useUpdateSMSCertificate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      company,
      id,
      data,
    }: {
      company: string;
      id: number;
      data: FormData;
    }) => {
      // multipart no admite PUT real: se envía POST y Laravel lo reinterpreta con _method.
      data.append("_method", "PUT");

      return await axiosInstance.post(
        `/${company}/sms/certificates/${id}`,
        data,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sms-certificates"] });
      toast.success("Certificado actualizado con éxito");
    },
    onError: (error: any) => {
      notifyError(error, { action: "actualizar el certificado" });
    },
  });
};
