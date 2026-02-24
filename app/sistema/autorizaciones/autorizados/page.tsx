"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Loader2 } from "lucide-react";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { useGetAuthorizedEmployees } from "@/hooks/sistema/autorizados/useGetAuthorizedEmployees";

const AuthorizedEmployeesPage = () => {
  const { selectedCompany } = useCompanyStore();

  // 🔹 Empleados de otras empresas autorizados para operar en la actual
  const {
    data: authorizedEmployees,
    isPending: loading,
    isError: error,
  } = useGetAuthorizedEmployees(selectedCompany?.slug);

  return (
    <ContentLayout title="Empleados Autorizados">
      <h1 className="font-bold text-4xl text-center">
        Empleados Autorizados en Esta Empresa
      </h1>

      <p className="text-muted-foreground text-sm italic text-center mb-4">
        Aquí puede visualizar los empleados pertenecientes a otras empresas
        que han sido autorizados para operar en la empresa actual.
        Esta sección es únicamente informativa.
      </p>

      {loading && (
        <div className="grid mt-72 place-content-center">
          <Loader2 className="w-12 h-12 animate-spin" />
        </div>
      )}

      {error && (
        <div className="grid mt-72 place-content-center">
          <p className="text-sm text-muted-foreground">
            Ha ocurrido un error al cargar los empleados autorizados...
          </p>
        </div>
      )}

      {!loading && !error && (
        <DataTable
          columns={columns}
          data={authorizedEmployees ?? []}
        />
      )}
    </ContentLayout>
  );
};

export default AuthorizedEmployeesPage;