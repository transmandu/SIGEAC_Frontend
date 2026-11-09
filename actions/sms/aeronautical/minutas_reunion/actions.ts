import axiosInstance from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { notifyError } from "@/lib/notify-error";

interface MinuteMutationData {
  company: string;
  id?: number;
  data: FormData;
}

const invalidate = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: ["aeronautical-meeting-minutes"] });
  queryClient.invalidateQueries({
    queryKey: ["aeronautical-meeting-minute-department"],
  });
};

export const useCreateAeronauticalMeetingMinute = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ company, data }: MinuteMutationData) => {
      await axiosInstance.post(`/${company}/aeronautical/meetings`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      invalidate(queryClient);
      toast.success("¡Creada!", {
        description: "La minuta de reunión se ha creado correctamente.",
      });
    },
    onError: (error) => {
      notifyError(error, { action: "crear la minuta de reunión" });
      console.error(error);
    },
  });

  return { createMeetingMinute: mutation };
};

export const useUpdateAeronauticalMeetingMinute = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ company, id, data }: MinuteMutationData) => {
      await axiosInstance.post(`/${company}/aeronautical/meetings/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      invalidate(queryClient);
      toast.success("¡Actualizada!", {
        description: "La minuta de reunión se ha actualizado correctamente.",
      });
    },
    onError: (error) => {
      notifyError(error, { action: "actualizar la minuta de reunión" });
      console.error(error);
    },
  });

  return { updateMeetingMinute: mutation };
};

export const useDeleteAeronauticalMeetingMinute = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ company, id }: { company: string; id: number }) => {
      await axiosInstance.delete(`/${company}/aeronautical/meetings/${id}`);
    },
    onSuccess: () => {
      invalidate(queryClient);
      toast.success("¡Eliminada!", {
        description: "La minuta de reunión se ha eliminado correctamente.",
      });
    },
    onError: (error) => {
      notifyError(error, { action: "eliminar la minuta de reunión" });
      console.error(error);
    },
  });

  return { deleteMeetingMinute: mutation };
};

export const useDownloadAeronauticalMeetingMinutePdf = () => {
  const mutation = useMutation({
    mutationFn: async ({ company, id }: { company: string; id: number }) => {
      const { data } = await axiosInstance.get(
        `/${company}/aeronautical/meetings/${id}/download-pdf`,
        { responseType: "blob" },
      );
      return data as Blob;
    },
  });

  return { downloadMeetingMinutePdf: mutation };
};
