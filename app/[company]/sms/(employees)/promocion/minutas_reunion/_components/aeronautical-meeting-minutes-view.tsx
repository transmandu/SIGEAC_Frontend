"use client";

import { Loader2 } from "lucide-react";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useGetAeronauticalMeetingMinutes } from "@/hooks/sms/aeronautical/minutas_reunion/useGetAeronauticalMeetingMinutes";
import { aeronauticalColumns } from "./aeronautical-columns";
import { DataTable } from "@/app/[company]/sms/(employees)/promocion/minutas_reunion/data-table";

export function AeronauticalMeetingMinutesView({
  company,
}: {
  company?: string;
}) {
  const { selectedStation } = useCompanyStore();
  const {
    data: meetingMinutes,
    isLoading,
    isError,
  } = useGetAeronauticalMeetingMinutes(selectedStation, company);

  return (
    <div className="flex flex-col gap-y-2">
      {isLoading && (
        <div className="flex w-full h-full justify-center items-center">
          <Loader2 className="size-24 animate-spin mt-48" />
        </div>
      )}
      {meetingMinutes && (
        <DataTable columns={aeronauticalColumns} data={meetingMinutes} />
      )}
      {isError && (
        <p className="text-sm text-muted-foreground">
          Ha ocurrido un error al cargar las minutas de reunión.
        </p>
      )}
    </div>
  );
}
