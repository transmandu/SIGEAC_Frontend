"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { useGetDepartments } from "@/hooks/sistema/departamento/useGetDepartment";
import { useIsOmac } from "@/hooks/sistema/useIsOmac";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Department } from "@/types";
import { Loader2 } from "lucide-react";
import { columns } from "./columns";
import { DataTable } from "./data-table";

const getDepartmentList = (departments: Department[], flatten: boolean): Department[] => {
  if (!flatten) return departments;
  return departments.flatMap((dept) => [dept, ...getDepartmentList(dept.descendants ?? [], true)]);
};

const DepartmentPage = () => {
  const {selectedCompany} = useCompanyStore();
  const { data: isOmac } = useIsOmac(selectedCompany?.slug);
  const {
    data: departments,
    isPending: loading,
    isError: error,
  } = useGetDepartments(selectedCompany?.slug);

  const shouldFlatten = selectedCompany?.slug === "transmandu" || !isOmac;
  const tableData = departments ? getDepartmentList(departments, shouldFlatten) : [];

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
      {departments && <DataTable columns={columns} data={tableData} />}
    </ContentLayout>
  );
};

export default DepartmentPage;
