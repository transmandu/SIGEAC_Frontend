"use client";

import CreateSMSActivityForm from "@/components/forms/aerolinea/sms/CreateSMSActivityForm";
import { ContentLayout } from "@/components/layout/ContentLayout";
import LoadingPage from "@/components/misc/LoadingPage";
import { useGetSMSActivityByNumber } from "@/hooks/sms/useGetSMSActivityByNumber";
import { useIsOmac } from "@/hooks/sistema/useIsOmac";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Loader2 } from "lucide-react";
import { AeronauticalEditActivity } from "@/app/[company]/sms/(employees)/promocion/actividades/_components/aeronautical-edit-activity";

const AirlineEditSMSActivityPage = () => {
  const { selectedCompany } = useCompanyStore();
  const router = useRouter();
  const { activity_number } = useParams<{ activity_number: string }>();

  const {
    data: activity,
    isLoading,
    isError,
  } = useGetSMSActivityByNumber({
    company: selectedCompany?.slug,
    activityNumber: activity_number,
  });

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
          <CreateSMSActivityForm
            initialData={activity}
            isEditing
            onClose={() =>
              router.push(
                `/${selectedCompany?.slug}/sms/promocion/actividades/${activity_number}`,
              )
            }
          />
        </div>
      )}
    </ContentLayout>
  );
};

const EditSMSActivityPage = () => {
  const { selectedCompany } = useCompanyStore();
  const { data: isOMAC, isLoading } = useIsOmac(selectedCompany?.slug);

  if (isLoading) {
    return (
      <ContentLayout title="Editar Actividad SMS">
        <PageHeader className="mb-6" />
        <div className="flex w-full items-center justify-center py-20">
          <Loader2 className="size-10 animate-spin text-muted-foreground" />
        </div>
      </ContentLayout>
    );
  }

  return isOMAC ? <AeronauticalEditActivity /> : <AirlineEditSMSActivityPage />;
};

export default EditSMSActivityPage;
