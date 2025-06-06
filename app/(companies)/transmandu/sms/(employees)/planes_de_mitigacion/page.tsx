"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";

import { Loader2 } from "lucide-react";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { useGetMitigationTable } from "@/hooks/sms/useGetMitigationTable";

const MitigationPlanPage = () => {
  const { data: mitigationTable, isLoading, isError } = useGetMitigationTable();

  console.log(mitigationTable);

  return (
    <ContentLayout title="Planes de Mitigacion">
      <div className="flex flex-col gap-y-2">
        {isLoading && (
          <div className="flex w-full h-full justify-center items-center">
            <Loader2 className="size-24 animate-spin mt-48" />
          </div>
        )}
        {mitigationTable && (
          <DataTable
            columns={columns}
            data={mitigationTable.filter((row) => row.analysis !== null)}
          />
        )}
        {isError && (
          <p className="text-sm text-muted-foreground">
            Ha ocurrido un error al cargar los planes de mitigaction...
          </p>
        )}
      </div>
    </ContentLayout>
  );
};

export default MitigationPlanPage;
