import axiosInstance from "@/lib/axios";
import { Analysis } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface CourseData {
  company: string | null;
  course: {
    name: string;
    description: string;
    duration: string;
    time: string;
    start_date: Date;
    end_date: Date;
    instructor?: string;
  };
}

export const useCreateCourse = () => {
  const queryClient = useQueryClient();
  const createMutation = useMutation({
    mutationFn: async (data: CourseData) => {
      await axiosInstance.post(
        `/general/${data.company}/create-course`,
        data.course,
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

      toast.success("¡Creado!", {
        description: ` El Curso ha sido creado correctamente.`,
      });
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: "No se pudo crear el curso...",
      });
      console.log(error);
    },
  });
  return {
    createCourse: createMutation,
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
      queryClient.invalidateQueries({ queryKey: ["analysis"] });
      queryClient.invalidateQueries({ queryKey: ["danger-identifications"] });
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
