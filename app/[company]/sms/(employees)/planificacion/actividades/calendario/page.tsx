"use client";
import { ContentLayout } from "@/components/layout/ContentLayout";
import LoadingPage from "@/components/misc/LoadingPage";
import { useTheme } from "next-themes";
import { Calendar } from "./_components/calendar";
import { useEffect } from "react";
import { useGetSMSActivitiesForCalendar } from "@/hooks/sms/useGetSMSActivitiesForCalendar";

const CalendarServicesPage = () => {
  const { theme } = useTheme();

  const { data: events, isLoading, error } = useGetSMSActivitiesForCalendar();
  useEffect(() => {
    console.log("Eventos actualizados:", events);
  }, [events]);

  if (isLoading) return <LoadingPage  />; // Muestra un spinner

  if (error) return <div>Error al cargar eventos {error.message}</div>;
  
  return (
    <ContentLayout title="Planificación de Actividades SMS">
      <div className="flex flex-col text-center justify-center gap-2 mb-6">
        <h1 className="font-bold text-5xl">Calendario de Actividades SMS</h1>
        <p className="text-muted-foreground italic text-sm">
          Aquí puede llevar un registro de todas las actividades de SMS
          registradas en el sistema. <br />
          Puede crear o editar las actividades de ser necesarios.
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
