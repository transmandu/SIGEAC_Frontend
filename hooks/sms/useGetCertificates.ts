import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { SMSCertificate } from "@/types";

// Hook unificado para obtener certificados filtrados por empleado
export const useGetSMSCertificates = (company: string | undefined, employeeDni: string | undefined) => {
  return useQuery<SMSCertificate[]>({
    queryKey: ["sms-certificates", company, employeeDni], 
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/${company}/sms/certificates`, {
        params: { employee_dni: employeeDni }
      });
      return data;
    },
    enabled: !!company,
    // --- ESTO EVITA LA RECARGA AL CAMBIAR DE PESTAÑA ---
    refetchOnWindowFocus: false, 
    staleTime: 1000 * 60 * 5, // La data se considera "fresca" por 5 minutos
  });
};

// Hook para obtener los cursos (usado en el Select del formulario)
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

// Hook para obtener la lista de empleados (usado por jefes/admin)
export const useGetEmployeesList = (company: string | undefined) => {
  return useQuery({
    queryKey: ["sms-employees-list", company],
    queryFn: async () => {
      // Este endpoint debe retornar: id, first_name, last_name y DNI
      const { data } = await axiosInstance.get(`/${company}/sms/employees-list`);
      return data;
    },
    enabled: !!company,
  });
};