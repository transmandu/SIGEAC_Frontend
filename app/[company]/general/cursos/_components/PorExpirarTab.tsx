"use client";

import { useGetSMSTrainingExpiring } from "@/hooks/sms/useGetSMSTrainingExpiring";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Loader2 } from "lucide-react";
import { columns } from "./por-expirar-columns";
import { PorExpirarDataTable } from "./por-expirar-data-table";

/**
 * Pestaña "Por expirar" del módulo de Cursos.
 *
 * Muestra la misma lista que dispara la notificación "Capacitaciones por
 * expirar" (EmployeeTrainingReminderService::dueRecords), para que se vea lo
 * mismo que se le avisó al usuario.
 */
export function PorExpirarTab() {
  const { selectedCompany } = useCompanyStore();

  const {
    data: expiring,
    isLoading,
    isError,
  } = useGetSMSTrainingExpiring(selectedCompany?.slug);

  if (isLoading) {
    return (
      <div className="flex w-full h-full justify-center items-center py-20">
        <Loader2 className="size-12 animate-spin text-amber-500" />
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-muted-foreground py-10 text-center">
        Ha ocurrido un error al cargar las capacitaciones por expirar...
      </p>
    );
  }

  return <PorExpirarDataTable columns={columns} data={expiring ?? []} />;
}
