"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";

import { Loader2 } from "lucide-react";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useGetMeetingMinutes } from "@/hooks/general/minuta_reunion/useGetMeetingMinutes";

const SMSTrainingPage = () => {
  const { selectedCompany, selectedStation } = useCompanyStore();
  const {
    data: meetingMinutes,
    isLoading,
    isError,
  } = useGetMeetingMinutes(selectedStation, selectedCompany?.slug);

  return (
    <ContentLayout title="Capacitacion de SMS">
      <div className="flex flex-col gap-y-2">
        {isLoading && (
          <div className="flex w-full h-full justify-center items-center">
            <Loader2 className="size-24 animate-spin mt-48" />
          </div>
        )}
        {meetingMinutes && (
          <DataTable columns={columns} data={meetingMinutes} />
        )}
        {isError && (
          <p className="text-sm text-muted-foreground">
            Ha ocurrido un error al cargar las minutas de reunion..
          </p>
        )}
      </div>
    </ContentLayout>
  );
};

export default SMSTrainingPage;
