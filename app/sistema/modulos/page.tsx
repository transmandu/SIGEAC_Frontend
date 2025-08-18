"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { Loader2 } from "lucide-react";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { useGetModules } from "@/hooks/sistema/useGetModules";

const ModulePage = () => {
  const { data: modules, isLoading, error } = useGetModules();
  return (
    <ContentLayout title="Modulos">
      <h1 className="font-bold text-4xl text-center">Gestión de Modulos</h1>
      <p className="text-muted-foreground text-sm italic text-center mb-2">
        Aquí puede ver el listado de los modulos del sistema.
      </p>
      {
        isLoading && (
          <div className='grid mt-72 place-content-center'>
            <Loader2 className='w-12 h-12 animate-spin' />
          </div>
        )
      }
      {
        error && (
          <div className='grid mt-72 place-content-center'>
            <p className='text-sm text-muted-foreground'>Ha ocurrido un error al cargar las empresas...</p>
          </div>
        )
      }
      {
        modules && (
          <DataTable columns={columns} data={modules} />
        )
      }
    </ContentLayout>
  );
};

export default ModulePage;
