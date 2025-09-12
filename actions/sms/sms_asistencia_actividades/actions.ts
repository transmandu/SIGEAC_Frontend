import axiosInstance from "@/lib/axios";
import { useCompanyStore } from "@/stores/CompanyStore";
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

interface SMSActivityAttendaceData {
  activity_id: string;
  employees_list: {
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
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ["sms-activity-attendance"] });
      queryClient.invalidateQueries({ queryKey: ["enrollment-status"] });
      queryClient.invalidateQueries({
        queryKey: ["enrolled-employees"],
      });

      queryClient.invalidateQueries({
        queryKey: ["sms-activity", data.activity_id],
      });

      queryClient.invalidateQueries({
        queryKey: ["sms-activity-attendance-list"],
      });

      queryClient.invalidateQueries({
        queryKey: ["sms-activity-attendance-stats"],
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

export const useMarkSMSActivityAttendance = () => {
  const { selectedCompany } = useCompanyStore();
  const queryClient = useQueryClient();
  const markSMSActivityAttendanceMutation = useMutation({
    mutationFn: async ({
      activity_id,
      employees_list,
    }: SMSActivityAttendaceData) => {
      await axiosInstance.patch(
        `/${selectedCompany?.slug}/sms/mark-sms-activity-attendance/${activity_id}`,
        employees_list
      );
    },
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({
        queryKey: ["sms-activity", data.activity_id],
      });

      queryClient.invalidateQueries({
        queryKey: ["sms-activity-attendance-list"],
      });

      queryClient.invalidateQueries({
        queryKey: ["sms-activity-attendance-stats"],
      });
      queryClient.invalidateQueries({ queryKey: ["sms-activities"] });
      
      queryClient.invalidateQueries({
        queryKey: ["sms-activity-attendance-status", data.activity_id],
      });
      toast.success("¡Actualizado!", {
        description: `La asistancia ha sido actualizada correctamente.`,
      });
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: "No se pudo actualizar la asistencia...",
      });
      console.log(error);
    },
  });
  return {
    markSMSActivityAttendance: markSMSActivityAttendanceMutation,
  };
};
