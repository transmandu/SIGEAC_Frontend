"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { useGetJobTitles } from "@/hooks/sistema/cargo/useGetJobTitles";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Loader2 } from "lucide-react";
import { columns } from "./columns";
import { DataTable } from "./data-table";

const JobTitlePage = () => {

  const { selectedCompany } = useCompanyStore();
  const {
    data: jobTitles,
    isLoading: loading,
    isError: error,
  } = useGetJobTitles(selectedCompany?.slug);

  return (
    <ContentLayout title="Cargos">
      <h1 className="font-bold text-4xl text-center">Gestión de Cargos</h1>
      <p className="text-muted-foreground text-sm italic text-center mb-2">
        Aquí puede ver el listado de los cargos registrados en el sistema.
      </p>
      {loading && (
        <div className="grid mt-72 place-content-center">
          <Loader2 className="w-12 h-12 animate-spin" />
        </div>
      )}
      {error && (
        <div className="grid mt-72 place-content-center">
          <p className="text-sm text-muted-foreground">
            Ha ocurrido un error al cargar los cargos...
          </p>
        </div>
      )}
       {jobTitles && <DataTable columns={columns} data={jobTitles} />}
    </ContentLayout>
  );
};

export default JobTitlePage;
