"use client";

import Link from "next/link";
import { Settings } from "lucide-react";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import { EventCalendar } from "./_components/EventCalendar";

// Mismo lenguaje "glass" del selector de empresa y los formularios de
// almacén (bg-gradient + backdrop-blur + borde slate) — no un botón outline
// genérico de shadcn.
const glassButtonClass = cn(
  "bg-gradient-to-br from-background/70 to-background/40",
  "backdrop-blur-md",
  "border border-slate-400/60 dark:border-slate-600/60",
  "shadow-sm text-slate-700 dark:text-slate-200",
  "hover:border-blue-400/30 hover:shadow-md hover:shadow-blue-500/10",
  "transition-all duration-200 active:scale-[0.99]",
);

const EventCalendarPage = () => {
  const { user } = useAuth();
  const { selectedCompany } = useCompanyStore();
  const isSuperuser = (user?.roles ?? []).some((role) => role.name === "SUPERUSER");

  return (
    <ContentLayout title="Calendario de Eventos">
      <div className="flex flex-col gap-6">
        <PageHeader />

        <div className="flex flex-col gap-2 border-b pb-4">
          <div className="flex items-end justify-between">
            <div className="flex flex-col">
              <h1 className="text-3xl font-semibold tracking-tight">Calendario de Eventos</h1>
              <p className="text-sm text-muted-foreground">
                Vista compartida de eventos de todo el sistema, según lo que corresponde ver a tu usuario.
              </p>
            </div>

            {isSuperuser && (
              <Button asChild variant="outline" className={glassButtonClass}>
                <Link href={`/${selectedCompany?.slug}/general/calendario/administrar`}>
                  <Settings className="mr-2 size-4" />
                  Administrar
                </Link>
              </Button>
            )}
          </div>
        </div>

        <EventCalendar />
      </div>
    </ContentLayout>
  );
};

export default EventCalendarPage;
