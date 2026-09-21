"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";

import { Loader2 } from "lucide-react";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useGetCoursesByDeparment } from "@/hooks/curso/useGetCoursesByDeparment";
import { PageHeader } from "@/components/layout/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PorExpirarTab } from "./_components/PorExpirarTab";
import { useSearchParams } from "next/navigation";

const CoursePage = () => {
  const { selectedCompany } = useCompanyStore();
  const searchParams = useSearchParams();

  const {
    data: courses,
    isLoading,
    isError,
  } = useGetCoursesByDeparment(selectedCompany?.slug);

  const defaultTab =
    searchParams.get("tab") === "por-expirar" ? "por-expirar" : "cursos";

  return (
    <ContentLayout title="Cursos">
      <PageHeader className="mb-6" />

      <Tabs defaultValue={defaultTab}>
        <TabsList>
          <TabsTrigger value="cursos" className="text-base">
            Cursos
          </TabsTrigger>
          <TabsTrigger value="por-expirar" className="text-base">
            Por expirar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cursos">
          <div className="flex flex-col gap-y-2">
            {isLoading && (
              <div className="flex w-full h-full justify-center items-center">
                <Loader2 className="size-24 animate-spin mt-48" />
              </div>
            )}
            {courses && <DataTable columns={columns} data={courses} />}
            {isError && (
              <p className="text-sm text-muted-foreground">
                Ha ocurrido un error al cargar los cursos...
              </p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="por-expirar">
          <PorExpirarTab />
        </TabsContent>
      </Tabs>
    </ContentLayout>
  );
};

export default CoursePage;
