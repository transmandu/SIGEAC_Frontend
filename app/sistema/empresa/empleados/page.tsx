"use client";

import { useState } from "react";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { useGetEmployeesByCompany } from "@/hooks/sistema/empleados/useGetEmployees";
import { useGetInactiveEmployeesByCompany } from "@/hooks/sistema/empleados/useGetInactiveEmployees";
import { useCompanyStore } from "@/stores/CompanyStore";

import { getEmployeeColumns } from "./columns";
import { DataTable } from "./data-table";
import { EmployeeExpandedRow } from "./_components/EmployeeExpandedRow";

import LoadingPage from "@/components/misc/LoadingPage";
import BackButton from "@/components/misc/BackButton";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const EmployeePage = () => {
  const { selectedCompany } = useCompanyStore();

  const [expandedRowId, setExpandedRowId] = useState<string | false>(false);

  const companySlug = selectedCompany?.slug;

  const {
    data: activeEmployees,
    isPending: loadingActive,
    isError: errorActive,
  } = useGetEmployeesByCompany(companySlug);

  const {
    data: inactiveEmployees,
    isPending: loadingInactive,
    isError: errorInactive,
  } = useGetInactiveEmployeesByCompany(companySlug);

  const loading =
    !companySlug ||
    loadingActive ||
    loadingInactive;

  if (loading) return <LoadingPage />;

  return (
    <ContentLayout title="Empleados">
      <div className="flex flex-col gap-y-2">

        {/* HEADER */}
        <div className="flex items-center gap-2">
          <BackButton iconOnly tooltip="Volver" variant="secondary" />

          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href={`/${selectedCompany?.slug ?? ""}/dashboard`}>
                  Inicio
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink>Empleados</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Listado</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="flex items-baseline justify-between">
          <h1 className="text-2xl font-bold">Gestión de Empleados</h1>
        </div>

        <p className="text-xs text-muted-foreground">
          Aquí puede ver el listado de los empleados registrados y su información.
        </p>

        {(errorActive || errorInactive) && (
          <p className="text-sm text-muted-foreground italic">
            Ha ocurrido un error al cargar los empleados...
          </p>
        )}

        <Tabs defaultValue="active" className="w-full">

          <TabsList className="grid grid-cols-2 w-[320px]">
            <TabsTrigger value="active">
              Activos ({activeEmployees?.length ?? 0})
            </TabsTrigger>

            <TabsTrigger value="inactive">
              Inactivos ({inactiveEmployees?.length ?? 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-4">
            {activeEmployees && (
              <DataTable
                columns={getEmployeeColumns("active",  expandedRowId,  setExpandedRowId)}
                data={activeEmployees}
                renderSubComponent={({ row }) => (
                  <EmployeeExpandedRow employee={row.original} />
                )}
              />
            )}
          </TabsContent>

          {/* INACTIVOS */}
          <TabsContent value="inactive" className="mt-4">
            {inactiveEmployees && (
              <DataTable
                columns={getEmployeeColumns("inactive", expandedRowId, setExpandedRowId)}
                data={inactiveEmployees}
                renderSubComponent={({ row }) => (
                  <EmployeeExpandedRow employee={row.original} />
                )}
              />
            )}
          </TabsContent>

        </Tabs>

      </div>
    </ContentLayout>
  );
};

export default EmployeePage;