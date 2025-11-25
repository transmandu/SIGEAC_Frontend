"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import LoadingPage from "@/components/misc/LoadingPage";
import { useGetObligatoryReports } from "@/hooks/sms/useGetObligatoryReports";
import { columns } from "./obligatory-columns";
import { DataTable } from "./obligatory-data-table";
import { useCompanyStore } from "@/stores/CompanyStore";

interface ObligatoryReportsPageProps {
  title?: string;
  companySlug?: string;
  showHeader?: boolean;
  className?: string;
  customColumns?: any[];
}

export const ObligatoryReportsPage = ({
  title = "Reportes Obligatorios",
  companySlug,
  showHeader = true,
  className = "",
  customColumns,
}: ObligatoryReportsPageProps) => {
  const { selectedCompany } = useCompanyStore();

  const { data, isLoading, isError } = useGetObligatoryReports(
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
