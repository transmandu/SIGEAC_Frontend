"use client";

import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import LoadingPage from "@/components/misc/LoadingPage";
import { CreateAeronauticalActivityForm } from "@/components/forms/sms/aeronautical/activities/CreateAeronauticalActivityForm";
import { useGetAeronauticalActivityByNumber } from "@/hooks/sms/aeronautical/useGetAeronauticalActivityByNumber";
import { useCompanyStore } from "@/stores/CompanyStore";

export function AeronauticalEditActivity() {
  const { selectedCompany } = useCompanyStore();
  const router = useRouter();
  const { activity_number } = useParams<{ activity_number: string }>();
  const company = selectedCompany?.slug ?? "";

  const {
    data: activity,
    isLoading,
    isError,
  } = useGetAeronauticalActivityByNumber({
    company,
    activityNumber: activity_number,
  });

  const goToDetail = () =>
    router.push(`/${company}/sms/promocion/actividades/${activity_number}`);

  return (
    <ContentLayout title="Editar Actividad SMS">
      <PageHeader className="mb-6" />

      {isLoading && <LoadingPage />}

      {isError && (
        <div className="flex min-h-40 items-center justify-center rounded-lg border border-border/60 p-6 text-sm text-muted-foreground">
          No fue posible cargar la actividad para edición.
        </div>
      )}

      {activity && (
        <div className="rounded-lg border border-border/60 p-4 sm:p-6">
          <CreateAeronauticalActivityForm
            company={company}
            initialData={activity}
            isEditing
            onSuccess={goToDetail}
            onCancel={goToDetail}
          />
        </div>
      )}

      {!isLoading && !isError && !activity && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      )}
    </ContentLayout>
  );
}
