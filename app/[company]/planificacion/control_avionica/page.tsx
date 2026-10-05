"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import LoadingPage from "@/components/misc/LoadingPage";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useGetAvionicsControls } from "@/hooks/mantenimiento/planificacion/useGetAvionicsControls";
import { useCompanyStore } from "@/stores/CompanyStore";
import { AlertTriangle } from "lucide-react";
import {
  ControlListView,
  ControlListViewToggle,
} from "@/components/planificacion/controles/ControlListView";
import { useMemo, useState } from "react";
import { getColumns } from "./columns";
import { DataTable } from "./data-table";

const AvionicsControlPage = () => {
  const { selectedCompany } = useCompanyStore();
  const companySlug = selectedCompany?.slug ?? "";
  const [view, setView] = useState<ControlListView>("active");

  const {
    data: avionicsControls,
    isLoading,
    isError,
  } = useGetAvionicsControls(companySlug, view === "retired");

  const columns = useMemo(() => getColumns(companySlug), [companySlug]);

  const rows = useMemo(
    () =>
      (avionicsControls ?? []).filter(
        (control) => (view === "retired") === !!control.retired_at,
      ),
    [avionicsControls, view],
  );

  if (isLoading) return <LoadingPage />;

  return (
    <ContentLayout title="Control de Aviónica">
      <div className="flex flex-col gap-6">
        <PageHeader />

        <div className="flex flex-col gap-2 border-b pb-4">
          <div className="flex items-end justify-between">
            <div className="flex flex-col">
              <h1 className="text-3xl font-semibold tracking-tight">
                Control de Aviónica
              </h1>
              <p className="text-sm text-muted-foreground">
                Consulte y administre el control de aviónica de cada aeronave,
                con el estado de vencimiento de los equipos instalados.
              </p>
            </div>
            <ControlListViewToggle value={view} onChange={setView} />
          </div>
        </div>

        {isError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Ha ocurrido un problema al cargar los datos.
            </AlertDescription>
          </Alert>
        )}

        <DataTable columns={columns} data={rows} />
      </div>
    </ContentLayout>
  );
};

export default AvionicsControlPage;
