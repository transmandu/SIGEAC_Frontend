import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

// Ajustamos la petición para incluir la compañía y el ID, basándonos en tu estructura de URLs
const deleteActivityImageRequest = async ({
  company,
  activityId,
}: {
  company: string;
  activityId: string;
}) => {
  const response = await axiosInstance.delete(
    `/${company}/sms/activities/${activityId}/image`
  );
  return response.data;
};

export const useDeleteActivityImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteActivityImageRequest,
    onSuccess: (_, variables) => {
      // Invalidamos la key exacta que usa useGetSMSActivityById
      queryClient.invalidateQueries({
        queryKey: ["sms-activity", variables.activityId],
      });
    },
    onError: (error: any) => {
      console.log("No se pudo eliminar la imagen: ", error);
    },
  });
};