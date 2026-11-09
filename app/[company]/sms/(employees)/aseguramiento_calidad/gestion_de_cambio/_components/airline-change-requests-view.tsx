"use client";

import { Loader2 } from "lucide-react";

import { useGetChangeRequests } from "@/hooks/sms/gestion_de_cambio/useGetChangeRequests";
import type { ChangeRequest } from "@/types";
import { columns } from "@/app/[company]/sms/(employees)/aseguramiento_calidad/gestion_de_cambio/columns";
import { DataTable } from "@/app/[company]/sms/(employees)/aseguramiento_calidad/gestion_de_cambio/data-table";

function getSearchText(changeRequest: ChangeRequest) {
  return [
    changeRequest.request_number,
    changeRequest.requested_by?.first_name,
    changeRequest.requested_by?.last_name,
    changeRequest.change_type,
    changeRequest.description,
    changeRequest.status,
  ]
    .filter(Boolean)
    .join(" ");
}

export function AirlineChangeRequestsView({ company }: { company?: string }) {
  const {
    data: changeRequests,
    isLoading,
    isError,
  } = useGetChangeRequests(company);

  if (isLoading) {
    return (
      <div className="flex w-full items-center justify-center py-24">
        <Loader2 className="size-10 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        Ha ocurrido un error al cargar las solicitudes de cambio.
      </p>
    );
  }

  return (
    <DataTable
      columns={columns}
      data={changeRequests ?? []}
      createHref={`/${company}/sms/aseguramiento_calidad/gestion_de_cambio/crear`}
      createLabel="Nueva solicitud"
      searchPlaceholder="Buscar por correlativo, solicitante o descripción..."
      getSearchText={getSearchText}
      emptyTitle="No se encontró ninguna solicitud de cambio"
      emptyDescription="Ajuste la búsqueda o cree una nueva solicitud con el botón de arriba."
    />
  );
}
