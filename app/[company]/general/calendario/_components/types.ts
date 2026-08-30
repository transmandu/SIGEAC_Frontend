import { CalendarEventDisplay } from "@/types";

// Forma que usa el calendario en memoria, mapeada desde CalendarEventDto
// (GET /calendar-events, ya filtrado por visibilidad en el backend).
// `editable` distingue eventos manuales (id "manual:{id}") de los
// automáticos: solo los manuales se pueden arrastrar/editar/borrar.
export interface LocalCalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  sourceKey?: string | null;
  editable?: boolean;
  display?: CalendarEventDisplay;
  color?: string | null;
  url?: string | null;
  allDay?: boolean;
}
