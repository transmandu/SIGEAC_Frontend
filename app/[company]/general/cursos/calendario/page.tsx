"use client";
import { ContentLayout } from "@/components/layout/ContentLayout";
import LoadingPage from "@/components/misc/LoadingPage";
import { useTheme } from "next-themes";
import { useEffect } from "react";
import { useGetCoursesForCalendar } from "@/hooks/curso/useGetCalendarCourses";
import { Calendar } from "./_components/calendar";

const CalendarServicesPage = () => {
  const { theme } = useTheme();

  const { data: events, isLoading, error } = useGetCoursesForCalendar();
  useEffect(() => {
    console.log("Eventos actualizados:", events);
  }, [events]);

  if (isLoading) return <LoadingPage  />; // Muestra un spinner

  if (error) return <div>Error al cargar eventos {error.message}</div>;
  
  return (
    <ContentLayout title="Cursos">
      <div className="flex flex-col text-center justify-center gap-2 mb-6">
        <h1 className="font-bold text-5xl">Calendario de Cursos</h1>
        <p className="text-muted-foreground italic text-sm">
          Aquí puede llevar un registro de los cursos
          registradas en el sistema. <br />
          Puede crear o editar los cursos de ser necesarios.
        </p>
      </div>
        <Calendar
          events={events || []}
          theme={theme === "dark" ? "dark" : "light"} // Pasa el tema dinámico
        />
    </ContentLayout>
  );
};

export default CalendarServicesPage;
