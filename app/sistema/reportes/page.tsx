"use client";

import { useState } from "react";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, FileText, Plus, Upload } from "lucide-react";
import { useGetErrorReports, ErrorReportFilters as Filters } from "@/hooks/sistema/reportes/useGetErrorReports";
import { useExportErrorReports } from "@/hooks/sistema/reportes/useExportErrorReports";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import ErrorReportFilters from "./_components/ErrorReportFilters";
import ImportHistoryDialog from "./_components/ImportHistoryDialog";
import ImportHistoryTable from "./_components/ImportHistoryTable";
import CreateErrorReportDialog from "@/components/dialogs/sistema/CreateErrorReportDialog";

const DEFAULT_PAGE_SIZE = 25;

export default function ReportesErrorPage() {
  const [filters, setFilters] = useState<Filters>({
    page: 1,
    per_page: DEFAULT_PAGE_SIZE,
  });
  const [createOpen, setCreateOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  const { data, isLoading } = useGetErrorReports(filters);
  const { exportErrorReports } = useExportErrorReports();

  const handleFiltersChange = (patch: Partial<Filters>) => {
    setFilters((prev) => ({ ...prev, ...patch, page: 1 }));
  };

  const handleReset = () => {
    setFilters({ page: 1, per_page: DEFAULT_PAGE_SIZE });
  };

  const handlePaginationChange = (pageIndex: number, pageSize: number) => {
    setFilters((prev) => ({ ...prev, page: pageIndex + 1, per_page: pageSize }));
  };

  const exportFilters = { ...filters };
  delete exportFilters.page;
  delete exportFilters.per_page;

  return (
    <ContentLayout title="Reportes de Error">
      <Tabs defaultValue="reportes" className="flex flex-col gap-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h1 className="text-2xl font-bold">Reportes de Error</h1>
          <TabsList>
            <TabsTrigger value="reportes">Reportes</TabsTrigger>
            <TabsTrigger value="importaciones">Historial de importaciones</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="reportes" className="flex flex-col gap-4 mt-0">
          <div className="flex items-center justify-end flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => exportErrorReports("excel", exportFilters)}>
              <Sheet className="mr-2 h-4 w-4" />
              Exportar Excel
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportErrorReports("pdf", exportFilters)}>
              <FileText className="mr-2 h-4 w-4" />
              Exportar PDF
            </Button>
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Crear reporte manual
            </Button>
          </div>

          <ErrorReportFilters filters={filters} onChange={handleFiltersChange} onReset={handleReset} />

          <DataTable
            columns={columns}
            data={data?.reports ?? []}
            loading={isLoading}
            pageIndex={(filters.page ?? 1) - 1}
            pageSize={filters.per_page ?? DEFAULT_PAGE_SIZE}
            pageCount={data?.pagination.last_page ?? 0}
            onPaginationChange={handlePaginationChange}
          />
        </TabsContent>

        <TabsContent value="importaciones" className="flex flex-col gap-4 mt-0">
          <div className="flex items-center justify-end">
            <Button size="sm" onClick={() => setImportOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Importar historico WhatsApp
            </Button>
          </div>
          <ImportHistoryTable />
        </TabsContent>
      </Tabs>

      <CreateErrorReportDialog open={createOpen} onOpenChange={setCreateOpen} showAdvancedFields />
      <ImportHistoryDialog open={importOpen} onOpenChange={setImportOpen} />
    </ContentLayout>
  );
}
