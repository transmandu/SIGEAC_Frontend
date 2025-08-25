"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { useGetBanks } from "@/hooks/general/bancos/useGetBanks";
import { Loader2 } from "lucide-react";
import { columns } from "./columns";
import { DataTable } from "./data-table";

const BanksPage = () => {
  const { data: banks, isLoading, error } = useGetBanks();
  return (
    <ContentLayout title={"Almacenes"}>
      <h1 className="text-4xl font-bold text-center mb-2">Control de Bancos</h1>
      <p className="text-sm text-muted-foreground text-center">
        Lleve un control de los diferentes bancos que se han registrado.
      </p>
      {isLoading && (
        <div className="grid mt-72 place-content-center">
          <Loader2 className="w-12 h-12 animate-spin" />
        </div>
      )}
      {error && (
        <div className="grid mt-72 place-content-center">
          <p className="text-sm text-muted-foreground">
            Ha ocurrido un error al cargar los almacenes...
          </p>
        </div>
      )}
      {banks && <DataTable columns={columns} data={banks} />}
    </ContentLayout>
  );
};

export default BanksPage;
