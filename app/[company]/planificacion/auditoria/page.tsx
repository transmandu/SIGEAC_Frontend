"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import ProtectedLayout from "@/components/layout/ProtectedLayout";
import { MODULE_META } from "@/components/planificacion/auditoria/labels";
import { Segmented } from "@/components/planificacion/auditoria/Segmented";
import {
  PERIODS,
  PeriodKey,
  periodRange,
} from "@/components/planificacion/auditoria/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PLANIFICATION_AUDIT_ROLES } from "@/hooks/mantenimiento/planificacion/useCanViewPlanificationAudit";
import type { AuditModule } from "@/types/planification/audit";
import { useMemo, useState } from "react";
import { AuditLog } from "./_components/AuditLog";
import { AuditStats } from "./_components/AuditStats";
import { ExportExcelButton, IntegrityCheck } from "./_components/AuditToolbar";

type ModuleKey = AuditModule | "ALL";

/**
 * AUDITORÍA DE PLANIFICACIÓN: todo lo que se crea, corrige, da de baja,
 * elimina o emite en Planificación, sellado en una cadena de hash. La tasa de
 * error cuenta solo las correcciones marcadas "Error de captura".
 */
const PlanificationAuditPage = () => {
  const [period, setPeriod] = useState<PeriodKey>("6m");
  const [module, setModule] = useState<ModuleKey>("ALL");

  const filters = useMemo(
    () => ({
      ...periodRange(period),
      module: module === "ALL" ? undefined : module,
    }),
    [period, module],
  );

  return (
    <ProtectedLayout roles={PLANIFICATION_AUDIT_ROLES}>
      <ContentLayout title="Auditoría de Planificación">
        <div className="flex flex-col gap-6">
          <PageHeader />

          <div className="flex flex-col gap-4 border-b border-border/60 pb-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="flex min-w-0 flex-col gap-1">
              <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
                Auditoría de Planificación
              </h1>
              <p className="max-w-2xl text-sm text-muted-foreground">
                Altas, correcciones, bajas, eliminaciones y documentos emitidos
                de todo Planificación, con su motivo y sellados en una cadena
                verificable.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={module}
                onValueChange={(value) => setModule(value as ModuleKey)}
              >
                <SelectTrigger className="h-9 w-56 border-border/60 bg-background/70 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos los módulos</SelectItem>
                  {(Object.keys(MODULE_META) as AuditModule[]).map((key) => (
                    <SelectItem key={key} value={key}>
                      {MODULE_META[key].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Segmented
                ariaLabel="Período"
                value={period}
                options={PERIODS}
                onChange={setPeriod}
              />
              <IntegrityCheck />
              <ExportExcelButton filters={filters} />
            </div>
          </div>

          <Tabs defaultValue="stats" className="flex flex-col gap-4">
            <TabsList className="w-fit">
              <TabsTrigger value="stats" className="text-xs">
                Estadísticas
              </TabsTrigger>
              <TabsTrigger value="log" className="text-xs">
                Registro
              </TabsTrigger>
            </TabsList>

            <TabsContent value="stats" className="mt-0">
              <AuditStats {...filters} />
            </TabsContent>
            <TabsContent value="log" className="mt-0">
              <AuditLog baseFilters={filters} />
            </TabsContent>
          </Tabs>
        </div>
      </ContentLayout>
    </ProtectedLayout>
  );
};

export default PlanificationAuditPage;
