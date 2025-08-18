"use client";

import { Calendar, dayjsLocalizer, View } from "react-big-calendar";
import dayjs from "dayjs";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useState } from "react";

// Configura dayjs en español
import "dayjs/locale/es";
import { useTheme } from "next-themes";

dayjs.locale("es");

const localizer = dayjsLocalizer(dayjs);

interface Event {
  start: Date;
  end: Date;
  title: string;
}

const myEvents: Event[] = [
  {
    start: dayjs("2025-01-10T10:00").toDate(), // 10 de enero de 2025, 10:00 AM
    end: dayjs("2025-01-10T12:00"). toDate(), // 10 de enero de 2025, 12:00 PM
    title: "Reunión de equipo",
  },
  {
    start: new Date(2025, 6, 2, 15, 0),
    end: new Date(2025, 6, 2, 16, 30),
    title: "Presentación para el cliente",
  },
  {
    start: new Date(2025, 6, 24, 15, 0),
    end: new Date(2025, 6, 24, 16, 30),
    title: "Parte de la agenda",
  },
  {
    start: new Date(2025, 6, 30, 15, 0),
    end: new Date(2025, 6, 30, 16, 30),
    title: "Parte de la agenda2",
  },
  {
    start: new Date(2025, 7, 10, 15, 0),
    end: new Date(2025, 7, 10, 16, 30),
    title: "Parte de la agenda3",
  },
];

// Textos en español para los botones y cabeceras
const messages = {
  today: "Hoy",
  previous: "Atrás",
  next: "Siguiente",
  month: "Mes",
  week: "Semana",
  day: "Día",
  agenda: "Agenda",
};

const BigCalendar = () => {
  const { theme } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date()); // Estado para la fecha actual
  const [currentView, setCurrentView] = useState<View>("month"); // Estado para la vista
  console.log(theme);
  return (
    <div style={{ height: "85vh", width: "60vw" }}>
      <Calendar
        localizer={localizer}
        events={myEvents}
        startAccessor="start"
        endAccessor="end"
        date={currentDate} // Fecha controlada por estado
        onNavigate={setCurrentDate} // Actualiza la fecha al navegar
        view={currentView} // Vista controlada por estado
        onView={setCurrentView} // Cambia la vista al hacer clic
        views={["month", "week", "day", "agenda"]}
        messages={messages} // Traducción al español
        culture="es" // Configuración regional
        className={theme === "light" ? "text-black" : "text-white"}
      />
    </div>
  );
};

export default BigCalendar;
