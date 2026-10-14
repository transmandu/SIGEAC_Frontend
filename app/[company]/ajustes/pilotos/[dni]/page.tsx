"use client";

import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { useGetPilotByDni } from "@/hooks/ajustes/piloto/useGetPilotById";
import { useCompanyStore } from "@/stores/CompanyStore";

const Item = ({ label, value }: { label: string; value?: React.ReactNode }) => (
  <div className="flex flex-col gap-1 rounded-md border bg-muted/20 px-3 py-2">
    <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
      {label}
    </span>
    <span className="text-sm font-medium text-foreground">{value || "—"}</span>
  </div>
);

const ShowPilot = () => {
  const { dni } = useParams<{ dni: string }>();
  const { selectedCompany } = useCompanyStore();
  const {
    data: pilot,
    isLoading,
    isError,
  } = useGetPilotByDni(selectedCompany?.slug, dni);

  const employee = pilot?.employee;
  const fullName = employee
    ? `${employee.first_name} ${employee.last_name}`
    : undefined;

  return (
    <ContentLayout title="Detalles del Piloto">
      <div className="flex flex-col gap-6">
        <PageHeader currentLabel={fullName} />

        <div className="flex flex-col gap-2 border-b pb-4">
          <h1 className="text-3xl font-semibold tracking-tight">
            {fullName ?? "Información del Piloto"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Datos personales y de contacto del piloto.
          </p>
        </div>

        {isLoading && (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="size-10 animate-spin text-muted-foreground" />
          </div>
        )}

        {pilot && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Item label="Nombre" value={employee?.first_name} />
            <Item label="Apellido" value={employee?.last_name} />
            <Item label="Cédula" value={pilot.employee_dni} />
            <Item label="Nº de licencia" value={pilot.license_number} />
            <Item label="Teléfono" value={employee?.phone} />
            <Item label="Correo electrónico" value={employee?.email} />
          </div>
        )}

        {isError && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3">
            <p className="text-sm text-red-500">
              Ha ocurrido un error al cargar los datos del piloto.
            </p>
          </div>
        )}
      </div>
    </ContentLayout>
  );
};

export default ShowPilot;
