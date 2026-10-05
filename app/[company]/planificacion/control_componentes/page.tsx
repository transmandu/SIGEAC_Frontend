"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import LoadingPage from "@/components/misc/LoadingPage";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useGetComponentControls } from "@/hooks/mantenimiento/planificacion/useGetComponentControls";
import { useCompanyStore } from "@/stores/CompanyStore";
import { AlertTriangle } from "lucide-react";
import {
  ControlListView,
  ControlListViewToggle,
} from "@/components/planificacion/controles/ControlListView";
import { useMemo, useState } from "react";
import { getColumns } from "./columns";
import { DataTable } from "./data-table";

const ComponentControlPage = () => {
  const { selectedCompany } = useCompanyStore();
  const companySlug = selectedCompany?.slug ?? "";
  const [view, setView] = useState<ControlListView>("active");

  const {
    data: componentControls,
    isLoading,
    isError,
  } = useGetComponentControls(companySlug, view === "retired");

  const columns = useMemo(() => getColumns(companySlug), [companySlug]);

  const rows = useMemo(
    () =>
      (componentControls ?? []).filter(
        (control) => (view === "retired") === !!control.retired_at,
      ),
    [componentControls, view],
  );

  if (isLoading) return <LoadingPage />;

  return (
    <ContentLayout title="Control de Componentes">
      <div className="flex flex-col gap-6">
        <PageHeader />

        <div className="flex flex-col gap-2 border-b pb-4">
          <div className="flex items-end justify-between">
            <div className="flex flex-col">
              <h1 className="text-3xl font-semibold tracking-tight">
                Control de Componentes
              </h1>
              <p className="text-sm text-muted-foreground">
                Consulte y administre el control de componentes de cada
                aeronave, con el estado de vencimiento de cada componente.
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

export default ComponentControlPage;
