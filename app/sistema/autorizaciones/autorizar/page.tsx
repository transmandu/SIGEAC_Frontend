"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Loader2 } from "lucide-react";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { useGetAuthorizedEmployeesFromCompany } from "@/hooks/sistema/autorizados/useGetAuthorizedEmployeesFromCompany";

const AuthorizeEmployeesPage = () => {
  const { selectedCompany } = useCompanyStore();

  // Obtenemos los empleados que esta empresa ha autorizado a otras empresas
  const {
    data: authorizedEmployees,
    isPending: loading,
    isError: error,
  } = useGetAuthorizedEmployeesFromCompany(selectedCompany?.slug);

  return (
    <ContentLayout title="Autorizar Empleados">
      <h1 className="font-bold text-4xl text-center">
        Gestión de Autorizaciones
      </h1>

      <p className="text-muted-foreground text-sm italic text-center mb-4">
        Aquí puede visualizar los empleados que su empresa ha autorizado para operar en otras empresas y organizaciones.
        Desde esta sección también puede registrar nuevas autorizaciones cuando sea necesario.
      </p>

      {loading && (
        <div className="grid mt-72 place-content-center">
          <Loader2 className="w-12 h-12 animate-spin" />
        </div>
      )}

      {error && (
        <div className="grid mt-72 place-content-center">
          <p className="text-sm text-muted-foreground">
            Ha ocurrido un error al cargar las autorizaciones de empleados...
          </p>
        </div>
      )}

      {authorizedEmployees && authorizedEmployees.length > 0 ? (
        <DataTable columns={columns} data={authorizedEmployees} />
      ) : (
        !loading && (
          <p className="text-center text-muted-foreground mt-24">
            No hay empleados autorizados por esta empresa.
          </p>
        )
      )}
    </ContentLayout>
  );
};

export default AuthorizeEmployeesPage;