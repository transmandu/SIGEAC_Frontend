"use client";
import { PlanificationEvent } from "@/types";
import {
  createViewDay,
  createViewMonthGrid,
  createViewWeek,
} from "@schedule-x/calendar";
import { ScheduleXCalendar, useNextCalendarApp } from "@schedule-x/react";
import "@schedule-x/theme-default/dist/index.css";
import { useEffect } from "react";

type CalendarProps = {
  events: any;
  theme?: "dark" | "light"; // Opcional: si no usa el tema de NextUI
};

export const Calendar = ({ events, theme = "light" }: CalendarProps) => {
  const calendar = useNextCalendarApp({
    views: [createViewMonthGrid(), createViewWeek()],
    events: events,
    locale: "es-ES",
    defaultView: "month",
    isResponsive: true,
    dayBoundaries: {
      start: '06:00',
      end: '18:00',
    },
  });

  // Sincroniza el tema si es dinámico
  useEffect(() => {
    if (calendar) calendar.setTheme(theme);
  }, [theme, calendar]);

  return <div className="flex justify-center">
    <ScheduleXCalendar calendarApp={calendar} />
  </div>;
};
