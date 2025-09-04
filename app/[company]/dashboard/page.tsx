"use client";
import { ContentLayout } from "@/components/layout/ContentLayout";
import DashboardTabs from "@/components/misc/DashboardTabs";
import { useCompanyStore } from "@/stores/CompanyStore";

const DashboardPage = () => {
  const { selectedCompany } = useCompanyStore();
  return (
    <ContentLayout title={`Dashboard / ${selectedCompany?.slug || ""}`}>
      <DashboardTabs />
    </ContentLayout>
  );
};

export default DashboardPage;
