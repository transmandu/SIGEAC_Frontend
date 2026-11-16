"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { CreateMeetingMinuteForm } from "@/components/forms/general/CreateMeetingMinuteForm";
import { CreateAeronauticalMeetingMinuteForm } from "@/components/forms/sms/aeronautical/minutas_reunion/CreateAeronauticalMeetingMinuteForm";
import { useIsOmac } from "@/hooks/sistema/useIsOmac";
import { useCompanyStore } from "@/stores/CompanyStore";

export default function CreateMeetingMinutePage() {
  const router = useRouter();
  const { selectedCompany } = useCompanyStore();
  const { data: isOMAC, isLoading } = useIsOmac(selectedCompany?.slug);

  const handleClose = () =>
    router.push(`/${selectedCompany?.slug}/sms/promocion/minutas_reunion`);

  return (
    <ContentLayout title="Nueva Minuta de Reunión">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 pb-10">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Nueva Minuta de Reunión
            </h1>
            <p className="text-sm text-muted-foreground">
              Completa la información, los participantes y los acuerdos.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm sm:p-6 lg:p-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : isOMAC ? (
            <CreateAeronauticalMeetingMinuteForm onClose={handleClose} />
          ) : (
            <CreateMeetingMinuteForm onClose={handleClose} />
          )}
        </div>
      </div>
    </ContentLayout>
  );
}
