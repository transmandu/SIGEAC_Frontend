"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";

import { useGetSMSTraining } from "@/hooks/sms/useGetSMSTraining";
import { Loader2 } from "lucide-react";
import { columns } from "./columns";
import { DataTable } from "./data-table";

const SMSTrainingPage = () => {
  const { data: employeeTraining, isLoading, isError } = useGetSMSTraining();

  return (
    <ContentLayout title="Capacitacion de SMS">
      <div className="flex flex-col gap-y-2">
        {isLoading && (
          <div className="flex w-full h-full justify-center items-center">
            <Loader2 className="size-24 animate-spin mt-48" />
          </div>
        )}
        {employeeTraining && (
          <DataTable columns={columns} data={employeeTraining} />
        )}
        {isError && (
          <p className="text-sm text-muted-foreground">
            Ha ocurrido un error al cargar la capacitacion de empleados...
          </p>
        )}
      </div>
    </ContentLayout>
  );
};

export default SMSTrainingPage;
