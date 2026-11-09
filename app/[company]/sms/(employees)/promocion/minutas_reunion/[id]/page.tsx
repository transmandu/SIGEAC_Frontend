"use client";

import { Loader2 } from "lucide-react";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { useIsOmac } from "@/hooks/sistema/useIsOmac";
import { useCompanyStore } from "@/stores/CompanyStore";
import AirlineMeetingMinuteDetail from "./_components/airline-meeting-minute-detail";
import AeronauticalMeetingMinuteDetail from "./_components/aeronautical-meeting-minute-detail";

export default function MeetingMinuteDetailPage() {
  const { selectedCompany } = useCompanyStore();
  const { data: isOMAC, isLoading } = useIsOmac(selectedCompany?.slug);

  if (isLoading) {
    return (
      <ContentLayout title="Minuta de Reunión">
        <div className="flex h-52 w-full items-center justify-center rounded-lg border border-border/60">
          <Loader2 className="size-10 animate-spin" />
        </div>
      </ContentLayout>
    );
  }

  return isOMAC ? (
    <AeronauticalMeetingMinuteDetail />
  ) : (
    <AirlineMeetingMinuteDetail />
  );
}
