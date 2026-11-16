"use client";

import { Loader2 } from "lucide-react";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useGetMeetingMinutes } from "@/hooks/general/minuta_reunion/useGetMeetingMinutes";
import { columns } from "@/app/[company]/sms/(employees)/promocion/minutas_reunion/columns";
import { DataTable } from "@/app/[company]/sms/(employees)/promocion/minutas_reunion/data-table";

export function AirlineMeetingMinutesView({ company }: { company?: string }) {
  const { selectedStation } = useCompanyStore();
  const {
    data: meetingMinutes,
    isLoading,
    isError,
  } = useGetMeetingMinutes(selectedStation, company);

  return (
    <div className="flex flex-col gap-y-2">
      {isLoading && (
        <div className="flex w-full h-full justify-center items-center">
          <Loader2 className="size-24 animate-spin mt-48" />
        </div>
      )}
      {meetingMinutes && <DataTable columns={columns} data={meetingMinutes} />}
      {isError && (
        <p className="text-sm text-muted-foreground">
          Ha ocurrido un error al cargar las minutas de reunión.
        </p>
      )}
    </div>
  );
}
