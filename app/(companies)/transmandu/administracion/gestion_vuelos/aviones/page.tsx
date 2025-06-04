"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { useGetAircrafts } from "@/hooks/aerolinea/aeronaves/useGetAircrafts";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import LoadingPage from "@/components/misc/LoadingPage";
import { useCompanyStore } from "@/stores/CompanyStore";

const AircraftPage = () => {
  const {selectedCompany} = useCompanyStore();
  const { data, isLoading, isError } = useGetAircrafts(selectedCompany?.split(" ").join(""));

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <ContentLayout title="Aeronaves">
      {" "}
      <h1 className="text-5xl font-bold text-center mt-2">
        Control de Aeronaves
      </h1>
      <p className="text-sm text-muted-foreground text-center italic mt-2">
        Aqui puede llevar el control de las aeronaves
      </p>
      {data && <DataTable columns={columns} data={data} />}
      {isError && (
        <p className="text-muted-foreground text-sm italic text-center">
          Ha ocurrido un error al cargar las aeronaves...
        </p>
      )}
    </ContentLayout>
  );
};

export default AircraftPage;
