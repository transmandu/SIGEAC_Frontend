"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";

import { Loader2 } from "lucide-react";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { useParams } from "next/navigation";
import { useGetMeasureFollowUpControl } from "@/hooks/sms/useGetMeasureFollowUpControl";
import { useCompanyStore } from "@/stores/CompanyStore";

type Params = {
  plan_id: string;
  medida_id: string;
};

const FollowUpControlPage = () => {
  const { plan_id, medida_id } = useParams<Params>();
  const { selectedCompany } = useCompanyStore();
  const value = {
    company: selectedCompany,
    measure_id: medida_id,
  };
  const {
    data: measureFollowUpControls,
    isLoading,
    isError,
  } = useGetMeasureFollowUpControl(value);

  return (
    <ContentLayout title="Controles de seguimiento">
      <div className="flex flex-col gap-y-2">
        {isLoading && (
          <div className="flex w-full h-full justify-center items-center">
            <Loader2 className="size-24 animate-spin mt-48" />
          </div>
        )}
        {measureFollowUpControls && (
          <DataTable columns={columns} data={measureFollowUpControls} />
        )}
        {isError && (
          <p className="text-sm text-muted-foreground">
            Ha ocurrido un error al cargar los controles de seguimiento...
          </p>
        )}
      </div>
    </ContentLayout>
  );
};

export default FollowUpControlPage;
