"use client";
import { Calendar } from "@/components/calendar/Calendar";
import { ContentLayout } from "@/components/layout/ContentLayout";
import LoadingPage from "@/components/misc/LoadingPage";
import { useGetPlanificationEvents } from "@/hooks/mantenimiento/planificacion/useGetPlanificationEvents";
import { useTheme } from "next-themes";

const CalendarServicesPage = () => {
  const { theme } = useTheme();

  // const { data: events, isLoading, error } = useGetPlanificationEvents("tu-company-id");

  // if (isLoading) return <LoadingPage />; // Muestra un spinner

  // if (error) return <div>Error al cargar eventos</div>;

  return (
    <ContentLayout title="Planificación de Servicios">
      <div className='flex flex-col text-center justify-center gap-2 mb-6'>
        <h1 className='font-bold text-5xl'>Calendario de Servicios / OT</h1>
        <p className='text-muted-foreground italic text-sm'>Aquí puede llevar un registro de todas las aeronaves registradas en el sistema. <br />Puede crear o editar las aeronaves de ser necesarios.</p>
      </div>
      <Calendar
      events={[]}
      theme={theme === "dark" ? "dark" : "light"} // Pasa el tema dinámico
      />

    </ContentLayout>
  );
};

export default CalendarServicesPage;
