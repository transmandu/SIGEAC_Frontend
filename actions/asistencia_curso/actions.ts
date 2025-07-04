import axiosInstance from "@/lib/axios";
import { Analysis } from "@/types";
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
      queryClient.invalidateQueries({ queryKey: ["employees-by-department"] });
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

export const useDeleteCourse = () => {
  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: async ({
      id,
      company,
    }: {
      id: string;
      company: string | null;
    }) => {
      await axiosInstance.delete(`/general/${company}/delete-course/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["department-courses"] });
      queryClient.invalidateQueries({ queryKey: ["enrollment-status"] });
      toast.success("¡Eliminado!", {
        description: `¡El curso ha sido eliminado correctamente!`,
      });
    },
    onError: (e) => {
      toast.error("Oops!", {
        description: "¡Hubo un error al eliminar un curso!",
      });
    },
  });

  return {
    deleteCourse: deleteMutation,
  };
};

export const useUpdateAnalyses = () => {
  const queryClient = useQueryClient();
  const updateAnalysesMutation = useMutation({
    mutationKey: ["analysis"],
    mutationFn: async (data: Analysis) => {
      await axiosInstance.put(`/transmandu/sms/analysis/${data.id}`, data);
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
    updateAnalyses: updateAnalysesMutation,
  };
};
