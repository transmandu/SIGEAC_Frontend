"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import LoadingPage from "@/components/misc/LoadingPage";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { useGetCategory } from "@/hooks/administracion/useGetCategory";

const Category = () => {
  const { data, isLoading, isError } = useGetCategory();
  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <ContentLayout title="Categoría">
      {" "}
      <h1 className="text-5xl font-bold text-center mt-2">
        Control de Categorías
      </h1>
      <p className="text-sm text-muted-foreground text-center italic mt-2">
        Aquí puede llevar el control de las categorías.
      </p>
      {data && <DataTable columns={columns} data={data} />}
      {isError && (
        <p className="text-muted-foreground text-sm italic text-center">
          Ha ocurrido un error al cargar las categorias...
        </p>
      )}
    </ContentLayout>
  );
};

export default Category;