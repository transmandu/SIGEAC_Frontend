import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { SMSCertificate } from "@/types";

// 1. Hook unificado para obtener certificados filtrados por empleado
export const useGetSMSCertificates = (company: string | undefined, employeeId: number | undefined) => {
  return useQuery<SMSCertificate[]>({
    queryKey: ["sms-certificates", company, employeeId],
    queryFn: async () => {
      // Enviamos el employee_id como query param: /transmandu/sms/certificates?employee_id=68
      const { data } = await axiosInstance.get(`/${company}/sms/certificates`, {
        params: { employee_id: employeeId }
      });
      return data;
    },
    // Solo se ejecuta si tenemos la empresa Y el ID del empleado
    enabled: !!company && !!employeeId, 
  });
};

// 2. Hook para obtener los cursos (usado en el Select del formulario)
export const useGetSMSCoursesList = (company: string | undefined) => {
  return useQuery({
    queryKey: ["sms-courses-list", company],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/${company}/sms/courses-list`);
      return data;
    },
    enabled: !!company,
  });
};