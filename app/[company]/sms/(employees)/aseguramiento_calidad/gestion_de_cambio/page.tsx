"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { Loader2 } from "lucide-react";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useGetChangeRequests } from "@/hooks/sms/gestion_de_cambio/useGetChangeRequests";

const GestionDeCambioPage = () => {
  const { selectedCompany } = useCompanyStore();
  const {
    data: changeRequests,
    isLoading,
    isError,
  } = useGetChangeRequests(selectedCompany?.slug);

  return (
    <ContentLayout title="Gestión de Cambios">
      <div className="flex flex-col gap-y-2">
        {isLoading && (
          <div className="flex w-full h-full justify-center items-center">
            <Loader2 className="size-24 animate-spin mt-48" />
          </div>
        )}
        {changeRequests && (
          <DataTable columns={columns} data={changeRequests} />
        )}
        {isError && (
          <p className="text-sm text-muted-foreground">
            Ha ocurrido un error al cargar las solicitudes de cambio...
          </p>
        )}
      </div>
    </ContentLayout>
  );
};

export default GestionDeCambioPage;
