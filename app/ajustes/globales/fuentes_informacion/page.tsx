"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import LoadingPage from "@/components/misc/LoadingPage";
import { useGetInformationSources } from "@/hooks/sms/useGetInformationSource";
import { columns } from "./columns";
import { DataTable } from "./data-table";

const InformationSourcePage = () => {
  const { data, isLoading, isError } = useGetInformationSources();

  if (isLoading) {
    return <LoadingPage />;
  }
  return (
    <ContentLayout title="Fuentes de informacion">
      <div className="flex flex-col gap-y-2">
        {data && <DataTable columns={columns} data={data} />}
        {isError && (
          <p className="text-sm text-muted-foreground">
            Ha ocurrido un error al cargar las fuentes...
          </p>
        )}
      </div>
    </ContentLayout>
  );
};

export default InformationSourcePage;
