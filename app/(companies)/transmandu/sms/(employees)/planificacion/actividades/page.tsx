"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";

import { Loader2 } from "lucide-react";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { useGetSMSActivities } from "@/hooks/sms/useGetSMSActivities";

const SMSActivitiesPage = () => {
  const { data: activities, isLoading, isError } = useGetSMSActivities();

  return (
    <ContentLayout title="Actividades de SMS">
      <div className="flex flex-col gap-y-2">
        {isLoading && (
          <div className="flex w-full h-full justify-center items-center">
            <Loader2 className="size-24 animate-spin mt-48" />
          </div>
        )}
        {activities && (
          <DataTable
            columns={columns}
            data={activities}
          />
        )}
        {isError && (
          <p className="text-sm text-muted-foreground">
            Ha ocurrido un error al cargar las actividades...
          </p>
        )}
      </div>
    </ContentLayout>
  );
};

export default SMSActivitiesPage;
