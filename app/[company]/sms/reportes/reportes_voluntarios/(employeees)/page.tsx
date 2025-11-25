"use client";

import LoadingPage from "@/components/misc/LoadingPage";
import { useGetVoluntaryReports } from "@/hooks/sms/useGetVoluntaryReports";
import { useCompanyStore } from "@/stores/CompanyStore";
import { columns } from "./columns";
import { DataTable } from "./data-table";

interface VoluntaryReportsPageProps {
  title?: string;
  companySlug?: string;
  showHeader?: boolean;
  className?: string;
  customColumns?: any[];
}

export const VoluntaryReportsPage = ({
  title = "Reportes Voluntarios",
  companySlug,
  showHeader = true,
  className = "",
  customColumns,
}: VoluntaryReportsPageProps) => {
  const { selectedCompany } = useCompanyStore();

  const { data, isLoading, isError } = useGetVoluntaryReports(
    companySlug || selectedCompany?.slug
  );

  if (isLoading) {
    return <LoadingPage />;
  }

  const tableColumns = customColumns || columns;

  const content = (
    <div className={`flex flex-col gap-y-2 ${className}`}>
      {data && <DataTable columns={tableColumns} data={data} />}
      {isError && (
        <p className="text-sm text-muted-foreground">
          Ha ocurrido un error al cargar los reportes...
        </p>
      )}
      {!isError && !data && (
        <p className="text-sm text-muted-foreground">
          No hay reportes para mostrar.
        </p>
      )}
    </div>
  );

  if (!showHeader) {
    return content;
  }

  return <>{content}</>;
};
