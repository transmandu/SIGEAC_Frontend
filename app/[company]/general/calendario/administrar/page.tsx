"use client";

import { useState } from "react";
import { CalendarPlus, Palette, Radio } from "lucide-react";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import { EventTypesPanel } from "./_components/EventTypesPanel";
import { SourceAccessPanel } from "./_components/SourceAccessPanel";
import { ManualEventsPanel } from "./_components/ManualEventsPanel";

const SECTIONS = [
  {
    id: "accesos",
    label: "Accesos por Fuente",
    description: "Quién ve cada fuente automática del calendario.",
    icon: Radio,
  },
  {
    id: "tipos",
    label: "Tipos de Evento",
    description: "Nombre, color e ícono de cada categoría.",
    icon: Palette,
  },
  {
    id: "manuales",
    label: "Eventos Manuales",
    description: "Eventos puntuales creados a mano, con su propia visibilidad.",
    icon: CalendarPlus,
  },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

/**
 * Administración del Calendario de Eventos — exclusivo de SUPERUSER (el
 * backend ya rechaza estas rutas para cualquier otro rol; acá solo se evita
 * ofrecer una pantalla que terminaría en 403).
 */
const CalendarAdminPage = () => {
  const { selectedCompany } = useCompanyStore();
  const company = selectedCompany?.slug;
  const [activeSection, setActiveSection] = useState<SectionId>("accesos");

  if (!company) return null;

  const active = SECTIONS.find((section) => section.id === activeSection) ?? SECTIONS[0];
  const ActiveIcon = active.icon;

  return (
    <ContentLayout title="Administrar Calendario de Eventos">
      <div className="flex flex-col gap-6">
        <PageHeader />

        <div className="flex flex-col gap-2 border-b pb-4">
          <h1 className="text-3xl font-semibold tracking-tight">Administrar Calendario de Eventos</h1>
          <p className="text-sm text-muted-foreground">
            Quién ve qué, tipos de evento y eventos manuales — sin tocar código.
          </p>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-start">
          <nav className="flex shrink-0 flex-row gap-1.5 overflow-x-auto pb-1 md:w-64 md:flex-col md:overflow-visible md:pb-0">
            {SECTIONS.map((section) => {
              const Icon = section.icon;
              const isActive = section.id === activeSection;

              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "flex shrink-0 items-start gap-3 rounded-xl border px-3.5 py-3 text-left transition-all duration-200",
                    "backdrop-blur-md",
                    isActive
                      ? "border-blue-400/40 bg-gradient-to-br from-primary/15 to-blue-500/10 shadow-sm shadow-blue-500/10"
                      : "border-slate-400/30 bg-background/40 hover:border-slate-400/50 hover:bg-background/60 dark:border-slate-600/30 dark:hover:border-slate-600/50",
                  )}
                >
                  <Icon className={cn("mt-0.5 size-4 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
                  <span className="flex min-w-0 flex-col">
                    <span className={cn("whitespace-nowrap text-sm font-medium md:whitespace-normal", isActive && "text-primary")}>
                      {section.label}
                    </span>
                    <span className="hidden text-xs text-muted-foreground md:block">{section.description}</span>
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="min-w-0 flex-1 rounded-2xl border border-slate-400/40 bg-gradient-to-br from-background/60 to-background/30 p-5 backdrop-blur-sm dark:border-slate-600/40">
            <div className="mb-5 flex items-center gap-2.5 border-b border-slate-400/20 pb-4 dark:border-slate-600/20">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ActiveIcon className="size-4" />
              </span>
              <div className="min-w-0">
                <h2 className="text-base font-semibold leading-none">{active.label}</h2>
                <p className="mt-1 text-xs text-muted-foreground">{active.description}</p>
              </div>
            </div>

            {activeSection === "accesos" && <SourceAccessPanel company={company} />}
            {activeSection === "tipos" && <EventTypesPanel company={company} />}
            {activeSection === "manuales" && <ManualEventsPanel company={company} />}
          </div>
        </div>
      </div>
    </ContentLayout>
  );
};

export default CalendarAdminPage;
