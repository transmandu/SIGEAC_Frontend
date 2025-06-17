"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { useGetEmployeesByCompany } from "@/hooks/administracion/useGetEmployees";

const DepartmentPage = () => {
  const {
    mutate,
    data: employees,
    isPending: loading,
    isError: error,
  } = useGetEmployeesByCompany();

  const { selectedCompany } = useCompanyStore();

  useEffect(() => {
    if (selectedCompany) {
        mutate(selectedCompany.split(" ").join("")); 
    }
  }, [selectedCompany, mutate]);

  return (
    <ContentLayout title="Departamentos">
      <h1 className="font-bold text-4xl text-center">Gestión de Departamentos</h1>
      <p className="text-muted-foreground text-sm italic text-center mb-2">
        Aquí puede ver el listado de los departamentos registrados y su información.
      </p>
      {loading && (
        <div className="grid mt-72 place-content-center">
          <Loader2 className="w-12 h-12 animate-spin" />
        </div>
      )}
      {error && (
        <div className="grid mt-72 place-content-center">
          <p className="text-sm text-muted-foreground">
            Ha ocurrido un error al cargar los departamentos...
          </p>
        </div>
      )}
      {/* {employees && <DataTable columns={columns} data={employees} />} */}
    </ContentLayout>
  );
};

export default DepartmentPage;
