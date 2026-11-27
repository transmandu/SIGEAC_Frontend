"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import LoadingPage from "@/components/misc/LoadingPage";
import { useGetDangerIdentifications } from "@/hooks/sms/useGetDangerIdentification";
import { useCompanyStore } from "@/stores/CompanyStore";
import { PageHeader } from "@/components/layout/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMemo } from "react";
import { useTabParam } from "@/hooks/helpers/use-tab-param";

const DANGER_TABS = ["ros", "rvp"] as const;

const DangerIdentificationsPage = () => {
  const { selectedCompany } = useCompanyStore();
  const [tab, setTab] = useTabParam(DANGER_TABS, "ros");
  const { data, isLoading, isError } = useGetDangerIdentifications(
    selectedCompany?.slug
  );

  const rvpData = useMemo(
    () => data?.filter((d) => d.voluntary_report) ?? [],
    [data]
  );

  const rosData = useMemo(
    () => data?.filter((d) => d.obligatory_report) ?? [],
    [data]
  );

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <ContentLayout title="Peligros Identificados">
      <PageHeader className="mb-6" />

      <Tabs
        value={tab}
        onValueChange={(value) => setTab(value as (typeof DANGER_TABS)[number])}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="ros" className="flex items-center gap-2">
            Reportes Obligatorios (ROS)
          </TabsTrigger>
          <TabsTrigger value="rvp" className="flex items-center gap-2">
            Reportes Voluntarios (RVP)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ros" className="space-y-4">
          <div className="flex flex-col gap-y-2">
            {data && <DataTable columns={columns} data={rosData} />}
            {isError && (
              <p className="text-sm text-muted-foreground">
                Ha ocurrido un error al cargar los peligros identificados...
              </p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="rvp" className="space-y-4">
          <div className="flex flex-col gap-y-2">
            {data && <DataTable columns={columns} data={rvpData} />}
            {isError && (
              <p className="text-sm text-muted-foreground">
                Ha ocurrido un error al cargar los peligros identificados...
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </ContentLayout>
  );
};

export default DangerIdentificationsPage;
