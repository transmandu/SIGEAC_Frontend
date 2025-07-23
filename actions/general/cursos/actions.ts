import axiosInstance from "@/lib/axios";
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
    course_type: string;
    instructor?: string;
  };
}

interface updateCourseData {
  company: string | null;
  id: string;
  data: {
    name: string;
    description: string;
    duration: string;
    time: string;
    instructor?: string;
    course_type: string;
    start_date: Date;
    end_date: Date;
  };
}

export const useCreateCourse = () => {
  const queryClient = useQueryClient();
  const createMutation = useMutation({
    mutationFn: async (data: CourseData) => {
      console.log("data from create course", data.course);
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
      company,
      id,
    }: {
      company: string | null;
      id: string;
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

export const useFinishCourse = () => {
  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: async ({
      company,
      id,
    }: {
      company: string | null;
      id: string;
    }) => {
      await axiosInstance.patch(`/general/${company}/finish-course/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finish-course"] });
      toast.success("Finalizado!", {
        description: `¡El curso ha sido finalizado correctamente!`,
      });
    },
    onError: (e) => {
      toast.error("Oops!", {
        description: "¡Hubo un error al finalizar un curso!",
      });
    },
  });

  return {
    finishCourse: deleteMutation,
  };
};

export const useUpdateCourse = () => {
  const queryClient = useQueryClient();
  const updateMutation = useMutation({
    mutationFn: async ({ data, company, id }: updateCourseData) => {
      console.log(data);
      const response = await axiosInstance.patch(
        `/general/${company}/update-course/${id}`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["department-courses"] });
      toast.success("¡Creado!", {
        description: ` La identificacion de peligro ha sido creado correctamente.`,
      });
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: "No se pudo crear la identificacion de peligro...",
      });
      console.log(error);
    },
  });
  return {
    updateCourse: updateMutation,
  };
};
