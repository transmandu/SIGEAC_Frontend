import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

const deleteActivityDocumentRequest = async ({
  company,
  activityId,
}: {
  company: string;
  activityId: string;
}) => {
  const response = await axiosInstance.delete(
    `/${company}/sms/activities/${activityId}/document`
  );
  return response.data;
};

export const useDeleteActivityDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteActivityDocumentRequest,
    onSuccess: (_, variables) => {
      // Invalida la misma key que usa useGetSMSActivityById
      queryClient.invalidateQueries({
        queryKey: ["sms-activity", variables.activityId],
      });
    },
    onError: (error: any) => {
      console.log("No se pudo eliminar el documento: ", error);
    },
  });
};
