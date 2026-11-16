"use client";

import { useState } from "react";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { Loader2 } from "lucide-react";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { useGetSMSActivities } from "@/hooks/sms/useGetSMSActivities";
import { useIsOmac } from "@/hooks/sistema/useIsOmac";
import { useCompanyStore } from "@/stores/CompanyStore";
import { PageHeader } from "@/components/layout/PageHeader";
import { AeronauticalActivitiesView } from "./_components/aeronautical-activities-view";

const AirlineActivitiesView = () => {
  const { selectedCompany } = useCompanyStore();

  // Mantenemos los estados por si el hook los necesita,
  // pero ya no renderizamos los inputs en esta vista.
  const [fromDate] = useState<string>("");
  const [toDate] = useState<string>("");

  const {
    data: activities,
    isLoading,
    isError,
  } = useGetSMSActivities(selectedCompany?.slug, fromDate, toDate);

  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex flex-col gap-y-2">
        {isLoading && (
          <div className="flex h-full w-full items-center justify-center py-20">
            <Loader2 className="size-24 animate-spin text-muted-foreground" />
          </div>
        )}

        {activities && <DataTable columns={columns} data={activities} />}

        {isError && (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Ha ocurrido un error al cargar las actividades...
          </p>
        )}
      </div>
    </div>
  );
};

const SMSActivitiesPage = () => {
  const { selectedCompany } = useCompanyStore();
  const { data: isOMAC, isLoading } = useIsOmac(selectedCompany?.slug);

  return (
    <ContentLayout title="Actividades de SMS">
      <PageHeader className="mb-6" />

      {isLoading ? (
        <div className="flex w-full items-center justify-center py-20">
          <Loader2 className="size-10 animate-spin text-muted-foreground" />
        </div>
      ) : isOMAC ? (
        <AeronauticalActivitiesView />
      ) : (
        <AirlineActivitiesView />
      )}
    </ContentLayout>
  );
};

export default SMSActivitiesPage;
