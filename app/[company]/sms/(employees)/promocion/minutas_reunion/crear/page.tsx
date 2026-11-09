"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { CreateMeetingMinuteForm } from "@/components/forms/general/CreateMeetingMinuteForm";
import { CreateAeronauticalMeetingMinuteForm } from "@/components/forms/sms/aeronautical/minutas_reunion/CreateAeronauticalMeetingMinuteForm";
import { useIsOmac } from "@/hooks/sistema/useIsOmac";
import { useCompanyStore } from "@/stores/CompanyStore";

export default function CreateMeetingMinutePage() {
  const router = useRouter();
  const { selectedCompany } = useCompanyStore();
  const { data: isOMAC, isLoading } = useIsOmac(selectedCompany?.slug);

  return (
    <div className="w-full max-w-4xl mx-auto bg-card text-card-foreground rounded-lg shadow-md p-4 sm:p-8">
      <h1 className="text-2xl font-bold text-center text-foreground mb-6">
        Minuta de Reunión
      </h1>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : isOMAC ? (
        <CreateAeronauticalMeetingMinuteForm
          onClose={() =>
            router.push(
              `/${selectedCompany?.slug}/sms/promocion/minutas_reunion`,
            )
          }
        />
      ) : (
        <CreateMeetingMinuteForm
          onClose={() =>
            router.push(
              `/${selectedCompany?.slug}/sms/promocion/minutas_reunion`,
            )
          }
        />
      )}
    </div>
  );
}
