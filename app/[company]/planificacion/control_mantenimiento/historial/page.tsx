"use client";

import { useState } from "react";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import LoadingPage from "@/components/misc/LoadingPage";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useGetMaintenanceCompliances } from "@/hooks/mantenimiento/planificacion/useGetMaintenanceCompliances";
import { MaintenanceComplianceStats } from "./_components/MaintenanceComplianceStats";
import { useGetMaintenanceAircrafts } from "@/hooks/mantenimiento/planificacion/useGetMaintenanceAircrafts";
import { useCompanyStore } from "@/stores/CompanyStore";
import { fmtNumber } from "@/lib/maintenanceControlCalc";
import { History } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

function TruncatedText({ children }: { children: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="block max-w-[220px] truncate">{children}</span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs break-words">
        {children}
      </TooltipContent>
    </Tooltip>
  );
}

const HistorialCumplimientosPage = () => {
  const { selectedCompany } = useCompanyStore();
  const [acronym, setAcronym] = useState<string>("all");

  const { data: aircrafts } = useGetMaintenanceAircrafts(selectedCompany?.slug);
  const { data: compliances, isLoading } = useGetMaintenanceCompliances(
    selectedCompany?.slug,
    acronym === "all" ? undefined : acronym,
  );

  return (
    <ContentLayout title="Historial de Cumplimientos">
      <PageHeader className="mb-6" />

      <div className="mx-auto w-full max-w-7xl space-y-6">
        <div className="flex items-center gap-4">
          <div className="rounded-lg bg-primary/10 p-3">
            <History className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Historial de Cumplimientos</h1>
            <p className="text-sm text-muted-foreground">
              Todos los cumplimientos registrados de certificados y servicios, por aeronave.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <p className="text-sm font-medium text-muted-foreground">Aeronave</p>
          </CardHeader>
          <CardContent>
            <Select value={acronym} onValueChange={setAcronym}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder="Todas las aeronaves" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las aeronaves</SelectItem>
                {aircrafts?.map((aircraft) => (
                  <SelectItem key={aircraft.id} value={aircraft.acronym}>
                    {aircraft.acronym}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {!isLoading && compliances && <MaintenanceComplianceStats compliances={compliances} />}

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Cumplimientos</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <LoadingPage />
            ) : !compliances?.length ? (
              <p className="text-sm text-muted-foreground">No hay cumplimientos registrados.</p>
            ) : (
              <div className="overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Aeronave</TableHead>
                      <TableHead>Certificado / Servicio</TableHead>
                      <TableHead>Parte</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Horas</TableHead>
                      <TableHead>Ciclos</TableHead>
                      <TableHead>Realizado Por</TableHead>
                      <TableHead>N° OT</TableHead>
                      <TableHead>Observaciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {compliances.map((compliance) => {
                      const item = compliance.maintenance_control_item;
                      const part = item?.maintenance_control_part?.aircraft_part;
                      return (
                        <TableRow key={compliance.id}>
                          <TableCell className="font-medium">
                            {item?.maintenance_control?.aircraft?.acronym ?? "—"}
                          </TableCell>
                          <TableCell>
                            <TruncatedText>{item?.name ?? "—"}</TruncatedText>
                          </TableCell>
                          <TableCell>
                            {part ? (
                              <Badge variant="outline">{part.part_name || part.part_number}</Badge>
                            ) : (
                              <span className="text-muted-foreground">Aeronave</span>
                            )}
                          </TableCell>
                          <TableCell>{format(parseISO(compliance.compliance_date), "dd/MM/yyyy", { locale: es })}</TableCell>
                          <TableCell>{fmtNumber(Number(compliance.hours_reading))}</TableCell>
                          <TableCell>{fmtNumber(Number(compliance.cycles_reading))}</TableCell>
                          <TableCell>
                            <TruncatedText>{compliance.maintenance_provider?.name ?? "—"}</TruncatedText>
                          </TableCell>
                          <TableCell>{compliance.work_order?.order_number || "—"}</TableCell>
                          <TableCell>
                            <TruncatedText>{compliance.notes || "—"}</TruncatedText>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ContentLayout>
  );
};

export default HistorialCumplimientosPage;
