"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import LoadingPage from "@/components/misc/LoadingPage";
import { useGetUnits } from "@/hooks/general/unidades/useGetPrimaryUnits";
import { useGetSecondaryUnits } from "@/hooks/general/unidades/useGetSecondaryUnits";
import { columns } from "./columns";
import { PrimaryDataTable } from "./primary-data-table";
import { secondary_columns } from "./secondary-columns";
import { SecondaryDataTable } from "./secondary-data-table";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const UnitsPage = () => {
  const { selectedCompany } = useCompanyStore();
  const [activeTab, setActiveTab] = useState("primary");

  const {
    data: primaryUnits,
    isLoading: primaryLoading,
    isError: primaryError,
  } = useGetUnits(selectedCompany?.slug);

  const {
    data: secondaryUnits,
    isLoading: secondaryLoading,
    isError: secondaryError,
  } = useGetSecondaryUnits(selectedCompany?.slug);

  console.log("data from console log", secondaryUnits);

  if (primaryLoading || secondaryLoading) {
    return <LoadingPage />;
  }

  return (
    <ContentLayout title="Unidades">
      <h1 className="text-5xl font-bold text-center mt-2">
        Control de Unidades
      </h1>
      <p className="text-sm text-muted-foreground text-center italic mt-2">
        Aquí puede llevar el control de las unidades primarias y secundarias
        para las diferentes conversiones necesarias.
      </p>

      <div className="flex justify-center items-center mt-6">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full max-w-6xl"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="primary">Unidades Primarias</TabsTrigger>
            <TabsTrigger value="secondary">Unidades Secundarias</TabsTrigger>
          </TabsList>

          <TabsContent value="primary" className="mt-4">
            <div className="bg-card rounded-lg border p-4">
              <h2 className="text-2xl font-semibold mb-4">
                Unidades Primarias
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Gestione las unidades primarias para las conversiones
                necesarias.
              </p>
              {primaryUnits && (
                <PrimaryDataTable columns={columns} data={primaryUnits} />
              )}
            </div>
          </TabsContent>

          <TabsContent value="secondary" className="mt-4">
            <div className="bg-card rounded-lg border p-4">
              <h2 className="text-2xl font-semibold mb-4">
                Unidades Secundarias
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Gestione las unidades secundarias y sus conversiones.
              </p>
              {secondaryUnits && (
                <SecondaryDataTable
                  columns={secondary_columns}
                  data={secondaryUnits}
                />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ContentLayout>
  );
};

export default UnitsPage;
