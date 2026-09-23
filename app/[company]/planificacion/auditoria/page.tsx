"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import ProtectedLayout from "@/components/layout/ProtectedLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AuditTypeFilter } from "@/types/planification/audit";
import { useMemo, useState } from "react";
import { AuditLogList } from "./_components/AuditLogList";
import { AuditStats } from "./_components/AuditStats";
import { Segmented } from "./_components/Segmented";
import { PERIODS, PeriodKey, periodRange } from "./_components/ui";

const ALLOWED_ROLES = ["SUPERUSER", "JEFE_CONTROL_CALIDAD", "JEFE_MANTENIMIENTO"];

type TypeKey = AuditTypeFilter | "ALL";

const TYPE_OPTIONS: { key: TypeKey; label: string }[] = [
  { key: "ALL", label: "Todo" },
  { key: "flight", label: "Vuelos" },
  { key: "work_order", label: "Órdenes" },
];

/**
 * AUDITORÍA DE PLANIFICACIÓN — SUPERUSER, JEFE_CONTROL_CALIDAD, JEFE_MANTENIMIENTO.
 *
 * Mide cuánto se corrige lo que Planificación carga. Solo cuentan como error
 * las correcciones marcadas "Error de captura"; el flujo normal (cerrar,
 * asignar técnico, subir documento) se registra pero no entra en la tasa.
 */
const PlanificationAuditPage = () => {
  const [period, setPeriod] = useState<PeriodKey>("6m");
  const [type, setType] = useState<TypeKey>("ALL");

  const filters = useMemo(
    () => ({ ...periodRange(period), type: type === "ALL" ? undefined : type }),
    [period, type],
  );

  return (
    <ProtectedLayout roles={ALLOWED_ROLES}>
      <ContentLayout title="Auditoría de Planificación">
        <div className="flex flex-col gap-6">
          <PageHeader />

          <div className="flex flex-col gap-4 border-b border-border/60 pb-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex min-w-0 flex-col gap-1">
              <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Auditoría de Planificación</h1>
              <p className="max-w-2xl text-sm text-muted-foreground">
                Ediciones de vuelos y órdenes de trabajo · la tasa de error cuenta solo las correcciones
                marcadas como error de captura.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Segmented ariaLabel="Registro" value={type} options={TYPE_OPTIONS} onChange={setType} />
              <Segmented ariaLabel="Período" value={period} options={PERIODS} onChange={setPeriod} />
            </div>
          </div>

          <Tabs defaultValue="stats" className="flex flex-col gap-4">
            <TabsList className="w-fit">
              <TabsTrigger value="stats" className="text-xs">
                Estadísticas
              </TabsTrigger>
              <TabsTrigger value="log" className="text-xs">
                Registro de ediciones
              </TabsTrigger>
            </TabsList>

            <TabsContent value="stats" className="mt-0">
              <AuditStats {...filters} />
            </TabsContent>
            <TabsContent value="log" className="mt-0">
              <AuditLogList {...filters} />
            </TabsContent>
          </Tabs>
        </div>
      </ContentLayout>
    </ProtectedLayout>
  );
};

export default PlanificationAuditPage;
