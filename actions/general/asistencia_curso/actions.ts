import axiosInstance from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface EmployeeSelected {
  dni: string;
  first_name: string;
  last_name: string;
}

interface CourseAttendaceData {
  company: string | null;
  course_id: string;
  employees_list: {
    addedEmployees: EmployeeSelected[];
    removedEmployees: EmployeeSelected[];
  };
}

export const useCreateCourseAttendance = () => {
  const queryClient = useQueryClient();
  const createMutation = useMutation({
    mutationFn: async (data: CourseAttendaceData) => {
      await axiosInstance.post(
        `/general/${data.company}/create-attendance/${data.course_id}`,
        data.employees_list,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["department-courses"] });
      queryClient.invalidateQueries({ queryKey: ["enrollment-status"] });
      toast.success("Modificado!", {
        description: `La lista de personas ha sido modificada`,
      });
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: "No se pudo modificar...",
      });
      console.log(error);
    },
  });
  return {
    createCourseAttendance: createMutation,
  };
};

export const useMarkAttendance = () => {
  const queryClient = useQueryClient();
  const markAttendanceMutation = useMutation({
    mutationFn: async (data: CourseAttendaceData) => {
      await axiosInstance.patch(`/general/${data.company}/mark-attendance/${data.course_id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["department-courses"] });
      toast.success("¡Actualizado!", {
        description: `El analisis ha sido actualizada correctamente.`,
      });
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: "No se pudo actualizar el analisis...",
      });
      console.log(error);
    },
  });
  return {
    markAttendance: markAttendanceMutation,
  };
};
