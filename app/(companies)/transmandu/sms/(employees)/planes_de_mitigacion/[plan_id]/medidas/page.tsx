"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";

import { Loader2 } from "lucide-react";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { useGetMitigationMeasure } from "@/hooks/sms/useGetMitigationMeasure";
import { useParams } from "next/navigation";

const MitigationMeasurePage = () => {
  const { plan_id } = useParams<{ plan_id: string }>();

  const {
    data: mitigationMeasure,
    isLoading,
    isError,
  } = useGetMitigationMeasure(plan_id);

  return (
    <ContentLayout title="Medidas de Mitigacion">
      <div className="flex flex-col gap-y-2">
        {isLoading && (
          <div className="flex w-full h-full justify-center items-center">
            <Loader2 className="size-24 animate-spin mt-48" />
          </div>
        )}
        {mitigationMeasure && (
          <DataTable columns={columns} data={mitigationMeasure} />
        )}
        {isError && (
          <p className="text-sm text-muted-foreground">
            Ha ocurrido un error al cargar los medidas de mitigacion...
          </p>
        )}
      </div>
    </ContentLayout>
  );
};

export default MitigationMeasurePage;
