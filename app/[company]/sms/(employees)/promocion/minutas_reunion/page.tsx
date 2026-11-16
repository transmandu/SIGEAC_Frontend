"use client";

import { Loader2 } from "lucide-react";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { useIsOmac } from "@/hooks/sistema/useIsOmac";
import { useCompanyStore } from "@/stores/CompanyStore";
import { AirlineMeetingMinutesView } from "./_components/airline-meeting-minutes-view";
import { AeronauticalMeetingMinutesView } from "./_components/aeronautical-meeting-minutes-view";

const MeetingMinutesPage = () => {
  const { selectedCompany } = useCompanyStore();
  const company = selectedCompany?.slug;
  const { data: isOMAC, isLoading } = useIsOmac(company);

  return (
    <ContentLayout title="Minutas de Reunión">
      {isLoading ? (
        <div className="flex w-full items-center justify-center py-24">
          <Loader2 className="size-10 animate-spin text-muted-foreground" />
        </div>
      ) : isOMAC ? (
        <AeronauticalMeetingMinutesView company={company} />
      ) : (
        <AirlineMeetingMinutesView company={company} />
      )}
    </ContentLayout>
  );
};

export default MeetingMinutesPage;
