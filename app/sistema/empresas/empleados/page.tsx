"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { useGetEmployeesByCompany } from "@/hooks/sistema/empleados/useGetEmployees";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Loader2 } from "lucide-react";
import { columns } from "./columns";
import { DataTable } from "./data-table";

const EmployeePage = () => {
  const { selectedCompany } = useCompanyStore();

  const {
    data: employees,
    isPending: loading,
    isError: error,
  } = useGetEmployeesByCompany(selectedCompany?.slug);


  return (
    <ContentLayout title="Empleados">
      <h1 className="font-bold text-4xl text-center">Gestión de Empleados</h1>
      <p className="text-muted-foreground text-sm italic text-center mb-2">
        Aquí puede ver el listado de los empleados registrados y su información.
      </p>
      {loading && (
        <div className="grid mt-72 place-content-center">
          <Loader2 className="w-12 h-12 animate-spin" />
        </div>
      )}
      {error && (
        <div className="grid mt-72 place-content-center">
          <p className="text-sm text-muted-foreground">
            Ha ocurrido un error al cargar los empleados...
          </p>
        </div>
      )}
      {employees && <DataTable columns={columns} data={employees} />}
    </ContentLayout>
  );
};

export default EmployeePage;
