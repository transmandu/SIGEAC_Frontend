"use client";

import { useState } from "react";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useGetErrorReports } from "@/hooks/sistema/reportes/useGetErrorReports";
import { DataTable } from "@/app/sistema/reportes/data-table";
import CreateErrorReportDialog from "@/components/dialogs/sistema/CreateErrorReportDialog";
import { columns } from "./columns";
import { PageHeader } from "@/components/layout/PageHeader";

const DEFAULT_PAGE_SIZE = 25;

// El index del backend ya filtra por reported_by_user_id salvo para SUPERUSER,
// así que esta pantalla no manda filtro de autor.
export default function MisReportesPage() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [createOpen, setCreateOpen] = useState(false);

  const { data, isLoading } = useGetErrorReports({ page, per_page: perPage });

  const handlePaginationChange = (pageIndex: number, pageSize: number) => {
    setPage(pageIndex + 1);
    setPerPage(pageSize);
  };

  return (
    <ContentLayout title="Mis Reportes">
      <PageHeader />

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-2xl font-bold">Mis Reportes</h1>
            <p className="text-sm text-muted-foreground">
              Reporta un problema y sigue el estado de su resolución.
            </p>
          </div>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Reportar un problema
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={data?.reports ?? []}
          loading={isLoading}
          pageIndex={page - 1}
          pageSize={perPage}
          pageCount={data?.pagination.last_page ?? 0}
          onPaginationChange={handlePaginationChange}
        />
      </div>

      <CreateErrorReportDialog open={createOpen} onOpenChange={setCreateOpen} />
    </ContentLayout>
  );
}
