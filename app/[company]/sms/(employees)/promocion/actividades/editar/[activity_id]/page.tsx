"use client";

import CreateSMSActivityForm from "@/components/forms/aerolinea/sms/CreateSMSActivityForm";
import { ContentLayout } from "@/components/layout/ContentLayout";
import LoadingPage from "@/components/misc/LoadingPage";
import { useGetSMSActivityById } from "@/hooks/sms/useGetSMSActivityById";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useParams, useRouter } from "next/navigation";

const EditSMSActivityPage = () => {
  const { selectedCompany } = useCompanyStore();
  const router = useRouter();
  const { activity_id } = useParams<{ activity_id: string }>();

  const {
    data: activity,
    isLoading,
    isError,
  } = useGetSMSActivityById({
    company: selectedCompany?.slug,
    id: activity_id,
  });

  return (
    <ContentLayout title="Editar Actividad SMS">
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
                `/${selectedCompany?.slug}/sms/promocion/actividades/${activity_id}`,
              )
            }
          />
        </div>
      )}
    </ContentLayout>
  );
};

export default EditSMSActivityPage;