"use client";

import { useState } from "react";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import LoadingPage from "@/components/misc/LoadingPage";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useGetMaintenanceCompliances } from "@/hooks/mantenimiento/planificacion/useGetMaintenanceCompliances";
import { MaintenanceComplianceStats } from "./_components/MaintenanceComplianceStats";
import { useGetMaintenanceAircrafts } from "@/hooks/mantenimiento/planificacion/useGetMaintenanceAircrafts";
import { useGetMaintenanceControls } from "@/hooks/mantenimiento/planificacion/useGetMaintenanceControls";
import { useCompanyStore } from "@/stores/CompanyStore";
import { fmtNumber } from "@/lib/maintenanceControlCalc";
import type { MaintenanceCompliance } from "@/types";
import {
  FormSection,
  labelClass,
  selectTriggerClass,
} from "@/components/forms/mantenimiento/planificacion/_theme";
import { Filter, History } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

/** "Manual — Rev. X — dd/MM/yyyy", armado con lo congelado al iniciar el cumplimiento. */
function manualLabel(compliance: MaintenanceCompliance) {
  return [
    compliance.catalog_manual?.name,
    compliance.manual_revision ? `Rev. ${compliance.manual_revision}` : null,
    compliance.manual_effective_date
      ? format(parseISO(compliance.manual_effective_date), "dd/MM/yyyy")
      : null,
  ]
    .filter(Boolean)
    .join(" — ");
}

/** Lectura al iniciar y, si el cumplimiento ya cerró, la de fin: "100 → 150". */
function readingRange(
  start?: number | string | null,
  end?: number | string | null,
) {
  if (start === null || start === undefined) return "—";
  const from = fmtNumber(Number(start));

  return end === null || end === undefined
    ? from
    : `${from} → ${fmtNumber(Number(end))}`;
}

function TruncatedText({ children }: { children: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="block max-w-55 truncate">{children}</span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs wrap-break-word">
        {children}
      </TooltipContent>
    </Tooltip>
  );
}

const HistorialCumplimientosPage = () => {
  const { selectedCompany } = useCompanyStore();
  const [acronym, setAcronym] = useState<string>("all");

  const { data: aircrafts } = useGetMaintenanceAircrafts(selectedCompany?.slug);
  const { data: maintenanceControls } = useGetMaintenanceControls(
    selectedCompany?.slug,
  );
  const { data: compliances, isLoading } = useGetMaintenanceCompliances(
    selectedCompany?.slug,
    acronym === "all" ? undefined : acronym,
  );

  // Solo tiene sentido filtrar por una aeronave que de verdad tenga un
  // control de mantenimiento — el resto nunca va a tener cumplimientos que
  // mostrar. Mismo criterio que ya excluye del selector de creación a las
  // aeronaves que ya tienen uno.
  const aircraftIdsWithControl = new Set(
    (maintenanceControls ?? []).map((control) => String(control.aircraft_id)),
  );
  const filterableAircrafts = aircrafts?.filter((aircraft) =>
    aircraftIdsWithControl.has(String(aircraft.id)),
  );

  return (
    <ContentLayout title="Historial de Cumplimientos">
      <div className="flex flex-col gap-6">
        <PageHeader />

        <div className="flex flex-col gap-2 border-b pb-4">
          <div className="flex items-end justify-between">
            <div className="flex flex-col">
              <h1 className="text-3xl font-semibold tracking-tight">
                Historial de Cumplimientos
              </h1>
              <p className="text-sm text-muted-foreground">
                Todos los cumplimientos registrados de certificados y servicios,
                por aeronave.
              </p>
            </div>
          </div>
        </div>

        <FormSection
          icon={Filter}
          title="Filtrar por aeronave"
          className="pb-5"
        >
          <Select value={acronym} onValueChange={setAcronym}>
            <SelectTrigger className={cn(selectTriggerClass, "w-full sm:w-64")}>
              <SelectValue placeholder="Todas las aeronaves" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las aeronaves</SelectItem>
              {filterableAircrafts?.map((aircraft) => (
                <SelectItem key={aircraft.id} value={aircraft.acronym}>
                  {aircraft.acronym}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormSection>

        {!isLoading && compliances && (
          <MaintenanceComplianceStats compliances={compliances} />
        )}

        <FormSection icon={History} title="Cumplimientos">
          {isLoading ? (
            <LoadingPage />
          ) : !compliances?.length ? (
            <p className="text-sm italic text-muted-foreground">
              No hay cumplimientos registrados.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-400/40 dark:border-slate-600/40">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="bg-muted/40 font-semibold">
                      Aeronave
                    </TableHead>
                    <TableHead className="bg-muted/40 font-semibold">
                      Certificado / Servicio
                    </TableHead>
                    <TableHead className="bg-muted/40 font-semibold">
                      Parte
                    </TableHead>
                    <TableHead className="bg-muted/40 font-semibold">
                      Estado
                    </TableHead>
                    <TableHead className="bg-muted/40 font-semibold">
                      Inicio
                    </TableHead>
                    <TableHead className="bg-muted/40 font-semibold">
                      Fin
                    </TableHead>
                    <TableHead className="bg-muted/40 font-semibold">
                      Manual / Rev.
                    </TableHead>
                    <TableHead className="bg-muted/40 font-semibold">
                      Horas
                    </TableHead>
                    <TableHead className="bg-muted/40 font-semibold">
                      Ciclos
                    </TableHead>
                    <TableHead className="bg-muted/40 font-semibold">
                      Realizado Por
                    </TableHead>
                    <TableHead className="bg-muted/40 font-semibold">
                      N° OT
                    </TableHead>
                    <TableHead className="bg-muted/40 font-semibold">
                      Observaciones
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {compliances.map((compliance) => {
                    const item = compliance.maintenance_control_item;
                    const part = item?.aircraft_part;
                    return (
                      <TableRow
                        key={compliance.id}
                        className="transition-colors hover:bg-primary/3"
                      >
                        <TableCell className="font-medium">
                          {item?.maintenance_control?.aircraft?.acronym ?? "—"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <TruncatedText>{item?.description ?? "—"}</TruncatedText>
                          </div>
                        </TableCell>
                        <TableCell>
                          {part ? (
                            <Badge variant="outline">
                              {part.part_name || part.part_number}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">
                              Aeronave
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              compliance.status === "CURRENT"
                                ? "border-emerald-500/40 text-emerald-700 dark:text-emerald-400"
                                : "text-muted-foreground"
                            }
                          >
                            {compliance.status === "CURRENT"
                              ? "Vigente"
                              : "Cumplido"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {format(parseISO(compliance.applied_date), "dd/MM/yyyy", {
                            locale: es,
                          })}
                        </TableCell>
                        <TableCell>
                          {compliance.completed_date ? (
                            format(
                              parseISO(compliance.completed_date),
                              "dd/MM/yyyy",
                              { locale: es },
                            )
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {manualLabel(compliance) ? (
                            <TruncatedText>{manualLabel(compliance)}</TruncatedText>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {readingRange(
                            compliance.applied_hours,
                            compliance.completed_hours,
                          )}
                        </TableCell>
                        <TableCell>
                          {readingRange(
                            compliance.applied_cycles,
                            compliance.completed_cycles,
                          )}
                        </TableCell>
                        <TableCell>
                          <TruncatedText>
                            {compliance.maintenance_provider?.name ?? "—"}
                          </TruncatedText>
                        </TableCell>
                        <TableCell>
                          {compliance.work_order?.order_number || "—"}
                        </TableCell>
                        <TableCell>
                          <TruncatedText>
                            {compliance.notes || "—"}
                          </TruncatedText>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </FormSection>
      </div>
    </ContentLayout>
  );
};

export default HistorialCumplimientosPage;
