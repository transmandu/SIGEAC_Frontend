import axiosInstance from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface EmployeeSelected {
  dni: string;
  first_name: string;
  last_name: string;
}

interface SMSActivityAttendanceData {
  company: string | null;
  activity_id: string;
  data: {
    addedEmployees: EmployeeSelected[];
    removedEmployees: EmployeeSelected[];
  };
}

export const useCreateSMSActivityAttendance = () => {
  const queryClient = useQueryClient();
  const createMutation = useMutation({
    mutationFn: async ({
      company,
      data,
      activity_id,
    }: SMSActivityAttendanceData) => {
      const response = await axiosInstance.post(
        `/${company}/sms/activities/${activity_id}/enrollements`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sms-activity-attendance"] });
      queryClient.invalidateQueries({ queryKey: ["enrollment-status"] });
      queryClient.invalidateQueries({
        queryKey: ["enrolled-employees"],
      });
      toast.success("Actualizado!", {
        description: `Actualizacion de personas en la actividad`,
      });
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: "No se pudo actualizar los inscritos en la actividad...",
      });
      console.log(error);
    },
  });
  return {
    createSMSActivityAttendance: createMutation,
  };
};
