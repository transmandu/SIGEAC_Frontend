"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { useGetAdministrationArticle } from "@/hooks/administracion/useGetAdministrationArticle";
import LoadingPage from "@/components/misc/LoadingPage";

const AdministrationArticlePage = () => {
  const { data, isLoading, isError } = useGetAdministrationArticle();

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <ContentLayout title="Artículos">
      {" "}
      <h1 className="text-5xl font-bold text-center mt-2">Control de Artículos</h1>
      <p className="text-sm text-muted-foreground text-center italic mt-2">
        Aquí puede llevar el control de los articulos registrados.
      </p>
      {data && <DataTable columns={columns} data={data} />}
      {isError && (
        <p className="text-muted-foreground text-sm italic text-center">
          Ha ocurrido un error al cargar los artículos...
        </p>
      )}
    </ContentLayout>
  );
};

export default AdministrationArticlePage;