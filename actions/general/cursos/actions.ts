import axiosInstance from "@/lib/axios";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface CourseData {
  company: string;
  location_id: string;
  course: {
    name: string;
    description: string;
    start_date: Date;
    end_date: Date;
    start_time: string;
    end_time: string;
    course_type: string;
    instructor?: string;
  };
}

interface updateCourseData {
  company: string;
  id: string;
  data: {
    name: string;
    description: string;
    instructor?: string;
    course_type: string;
    start_date: Date;
    end_date: Date;
    start_time: string;
    end_time: string;
  };
}

export const useCreateCourse = () => {
  const queryClient = useQueryClient();
  const createMutation = useMutation({
    mutationFn: async ({ company, location_id, course }: CourseData) => {
      await axiosInstance.post(
        `/general/${company}/${location_id}/create-course`,
        course,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["department-courses"] });
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
    mutationFn: async ({ company, id }: { company: string; id: string }) => {
      await axiosInstance.patch(`/general/${company}/finish-course/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finish-course"] });
      queryClient.invalidateQueries({ queryKey: ["department-courses"] });
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

export const useReopenCourse = () => {
  const queryClient = useQueryClient();
  const reopenMutation = useMutation({
    mutationFn: async ({ company, id }: { company: string; id: string }) => {
      await axiosInstance.patch(`/general/${company}/reopen-course/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["department-courses"] });
      toast.success("¡Reabierto!", {
        description: `¡El curso ha sido reabierto correctamente!`,
      });
    },
    onError: () => {
      toast.error("Oops!", {
        description: "¡Hubo un error al reabrir el curso!",
      });
    },
  });

  return {
    reopenCourse: reopenMutation,
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
        description: ` El curso ha sido actulizado correctamente`,
      });
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: "No se pudo actualizar el curso...",
      });
      console.log(error);
    },
  });
  return {
    updateCourse: updateMutation,
  };
};

export const useUpdateCourseCalendar = () => {
  const { selectedCompany } = useCompanyStore();
  const queryClient = useQueryClient();

  const updateCourseMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      if (data.status === "CERRADO") {
        throw new Error(
          "No se puede actualizar el calendario de un curso con estatus CERRADO."
        );
      }
      const response = await axiosInstance.patch(
        `/general/${selectedCompany?.slug}/update-course-calendar/${id}`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-calendar"] });
      toast.success("¡Actualizado!", {
        description: `El curso se ha sido actualizada correctamente.`,
      });
    },
    onError: (error) => {
      // ✅ Mostramos el mensaje de error personalizado
      const errorMessage = error.message || "No se pudo actualizar el curso...";
      toast.error("Oops!", {
        description: errorMessage,
      });
      console.log(error);
    },
  });

  return {
    updateCourseCalendar: updateCourseMutation,
  };
};

export const useCreateCourseExam = () => {
  const queryClient = useQueryClient();
  const createMutation = useMutation({
    mutationFn: async ({
      company,
      course_id,
      data,
    }: {
      company: string;
      course_id: string;
      data: { name: string; description: string; exam_date: Date };
    }) => {
      await axiosInstance.post(`/general/${company}/course/${course_id}/create-exam`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-exams"] });
      toast.success("¡Examen Creado!", {
        description: `El examen ha sido creado correctamente.`,
      });
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: "No se pudo crear el examen...",
      });
      console.log(error);
    },
  });
  return {
    createCourseExam: createMutation,
  };
};

export const useUpdateCourseExamResult = () => {
  const queryClient = useQueryClient();
  const updateMutation = useMutation({
    mutationFn: async ({
      company,
      id,
      exam_id,
      employee_dni,
      data,
    }: {
      company: string;
      id?: string;
      exam_id: string;
      employee_dni: string;
      data: FormData;
    }) => {
      let attendanceId = id;

      if (!attendanceId) {
        const registerData = new FormData();
        registerData.append("employees[]", employee_dni);

        await axiosInstance.post(
          `/general/${company}/course-exam/${exam_id}/register-attendance`,
          registerData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        const { data: attendanceList } = await axiosInstance.get(
          `/general/${company}/course-exam/${exam_id}/attendance`
        );

        const createdAttendance = attendanceList.find(
          (attendance: { employee_dni: string }) =>
            attendance.employee_dni === employee_dni
        );

        if (!createdAttendance?.id) {
          throw new Error("No se pudo registrar el participante en el examen.");
        }

        attendanceId = createdAttendance.id.toString();
      }

      await axiosInstance.post(
        `/general/${company}/course-exam-attendance/${attendanceId}/result`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-exam-attendance"] });
      queryClient.invalidateQueries({ queryKey: ["sms-course-attendance-list"] });
      toast.success("¡Guardado!", {
        description: `El resultado se ha guardado correctamente.`,
      });
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: "No se pudo guardar el resultado...",
      });
      console.log(error);
    },
  });
  return {
    updateCourseExamResult: updateMutation,
  };
};
