"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import LoadingPage from "@/components/misc/LoadingPage";
import { useGetDangerIdentifications } from "@/hooks/sms/useGetDangerIdentification";

const DangerIdentificationsPage = () => {
  const { data, isLoading, isError } = useGetDangerIdentifications();

  console.log("identification data aaaa aaa ",data);
  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <ContentLayout title="Peligros Identificados">
      <div className="flex flex-col gap-y-2">
        {data && <DataTable columns={columns} data={data} />}
        {isError && (
          <p className="text-sm text-muted-foreground">
            Ha ocurrido un error al cargar los peligros identificados...
          </p>
        )}
      </div>
    </ContentLayout>
  );
};

export default DangerIdentificationsPage;
