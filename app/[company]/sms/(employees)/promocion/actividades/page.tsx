"use client";

import { useState } from "react";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { Loader2 } from "lucide-react";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { useGetSMSActivities } from "@/hooks/sms/useGetSMSActivities";
import { useCompanyStore } from "@/stores/CompanyStore";

const SMSActivitiesPage = () => {
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
    <ContentLayout title="Actividades de SMS">
      <div className="flex flex-col gap-y-4">
        
        <div className="flex flex-col gap-y-2">
          {isLoading && (
            <div className="flex w-full h-full justify-center items-center py-20">
              <Loader2 className="size-24 animate-spin text-muted-foreground" />
            </div>
          )}
          
          {activities && <DataTable columns={columns} data={activities} />}
          
          {isError && (
            <p className="text-sm text-muted-foreground text-center py-10">
              Ha ocurrido un error al cargar las actividades...
            </p>
          )}
        </div>
      </div>
    </ContentLayout>
  );
};

export default SMSActivitiesPage;