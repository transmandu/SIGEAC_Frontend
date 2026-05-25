"use client";

import { useMemo, useState } from "react";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { Loader2 } from "lucide-react";
import { columns, SMSActivityTableRow } from "./columns";
import { DataTable } from "./data-table";
import { useGetSMSActivities } from "@/hooks/sms/useGetSMSActivities";
import { useCompanyStore } from "@/stores/CompanyStore";
import { SMSActivity } from "@/types";

type SMSActivityWithRuntimeDate = SMSActivity & {
  start_date: string | Date;
};

const getActivityYear = (activity: SMSActivityWithRuntimeDate) => {
  if (typeof activity.start_date === "string") {
    const year = activity.start_date.match(/^\d{4}/)?.[0];
    if (year) return Number(year);
  }

  const date = new Date(activity.start_date);
  if (!Number.isNaN(date.getTime())) return date.getFullYear();

  const numberYear = activity.activity_number?.match(/-(\d{4})$/)?.[1];
  return numberYear ? Number(numberYear) : null;
};

const getActivityTime = (activity: SMSActivityWithRuntimeDate) => {
  const date = new Date(activity.start_date);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
};

const addYearlyDisplayNumbers = (
  activities: SMSActivity[],
): SMSActivityTableRow[] => {
  const countersByYear = new Map<number, number>();
  const activitiesWithRuntimeDates = activities as SMSActivityWithRuntimeDate[];

  return [...activitiesWithRuntimeDates]
    .sort((a, b) => {
      const yearA = getActivityYear(a) ?? 0;
      const yearB = getActivityYear(b) ?? 0;

      if (yearA !== yearB) return yearB - yearA;

      const dateDifference = getActivityTime(a) - getActivityTime(b);
      if (dateDifference !== 0) return dateDifference;

      return a.id - b.id;
    })
    .map((activity) => {
      const year = getActivityYear(activity);

      if (!year) {
        return {
          ...activity,
          display_activity_number: activity.activity_number,
        };
      }

      const nextCounter = (countersByYear.get(year) ?? 0) + 1;
      countersByYear.set(year, nextCounter);

      return {
        ...activity,
        display_activity_number: `${String(nextCounter).padStart(3, "0")}-${year}`,
      };
    });
};

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

  const numberedActivities = useMemo(
    () => (activities ? addYearlyDisplayNumbers(activities) : []),
    [activities],
  );

  return (
    <ContentLayout title="Actividades de SMS">
      <div className="flex flex-col gap-y-4">
        
        <div className="flex flex-col gap-y-2">
          {isLoading && (
            <div className="flex w-full h-full justify-center items-center py-20">
              <Loader2 className="size-24 animate-spin text-muted-foreground" />
            </div>
          )}
          
          {activities && (
            <DataTable columns={columns} data={numberedActivities} />
          )}
          
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
