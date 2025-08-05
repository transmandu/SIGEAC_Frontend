"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";

import { Loader2 } from "lucide-react";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { useGetCoursesByDeparment } from "@/hooks/curso/useGetCoursesByDeparment";
import { useCompanyStore } from "@/stores/CompanyStore";

const CoursePage = () => {
  const { selectedCompany } = useCompanyStore();

  const {
    data: courseData,
    isLoading,
    isError,
  } = useGetCoursesByDeparment(selectedCompany?.slug);

  return (
    <ContentLayout title="Cursos">
      <div className="flex flex-col gap-y-2">
        {isLoading && (
          <div className="flex w-full h-full justify-center items-center">
            <Loader2 className="size-24 animate-spin mt-48" />
          </div>
        )}
        {courseData && <DataTable columns={columns} data={courseData} />}
        {isError && (
          <p className="text-sm text-muted-foreground">
            Ha ocurrido un error al cargar los cursos...
          </p>
        )}
      </div>
    </ContentLayout>
  );
};

export default CoursePage;
