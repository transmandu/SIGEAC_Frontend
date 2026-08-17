"use client";

import { useMemo, useState } from "react";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useGetErrorReports } from "@/hooks/sistema/reportes/useGetErrorReports";
import { DataTable } from "@/app/sistema/reportes/data-table";
import CreateErrorReportDialog from "@/components/dialogs/sistema/CreateErrorReportDialog";
import { getColumns } from "./columns";
import MyReportDetailDialog from "./_components/MyReportDetailDialog";
import { PageHeader } from "@/components/layout/PageHeader";
import type { ErrorReport } from "@/types";

const DEFAULT_PAGE_SIZE = 25;

// El index del backend ya filtra por reported_by_user_id salvo para SUPERUSER,
// así que esta pantalla no manda filtro de autor.
export default function MisReportesPage() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [createOpen, setCreateOpen] = useState(false);
  const [detailReport, setDetailReport] = useState<ErrorReport | null>(null);

  const { data, isLoading } = useGetErrorReports({ page, per_page: perPage });

  const columns = useMemo(() => getColumns(setDetailReport), []);

  const handlePaginationChange = (pageIndex: number, pageSize: number) => {
    setPage(pageIndex + 1);
    setPerPage(pageSize);
  };

  return (
    <ContentLayout title="Mis Reportes">
      <div className="flex flex-col gap-y-6">
        <PageHeader />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight">Mis Reportes</h1>
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

      <MyReportDetailDialog
        report={detailReport}
        open={!!detailReport}
        onOpenChange={(open) => !open && setDetailReport(null)}
      />
    </ContentLayout>
  );
}
