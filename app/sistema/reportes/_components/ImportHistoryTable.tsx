"use client";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetImportHistoryList } from "@/hooks/sistema/reportes/useGetImportHistoryList";
import { useGetImportHistoryStatus } from "@/hooks/sistema/reportes/useGetImportHistoryStatus";
import { ErrorReportImport, ImportHistoryStatus } from "@/types";
import { format } from "date-fns";
import { AlertTriangle } from "lucide-react";

const STATUS_LABEL: Record<ImportHistoryStatus, string> = {
  queued: "En cola",
  running: "Procesando",
  completed: "Completado",
  paused_quota: "Pausado por cuota de IA",
};

const STATUS_VARIANT: Record<ImportHistoryStatus, "default" | "secondary" | "warning"> = {
  queued: "secondary",
  running: "warning",
  completed: "default",
  paused_quota: "warning",
};

function ImportHistoryRow({ importItem }: { importItem: ErrorReportImport }) {
  const isActive = importItem.status === "queued" || importItem.status === "running";
  const { data } = useGetImportHistoryStatus(importItem.id, isActive);
  const current = data ?? importItem;

  return (
    <TableRow>
      <TableCell>{current.id}</TableCell>
      <TableCell>
        <Badge variant={STATUS_VARIANT[current.status]}>{STATUS_LABEL[current.status]}</Badge>
      </TableCell>
      <TableCell>
        {current.stats
          ? Object.entries(current.stats)
              .map(([key, value]) => `${key}: ${value}`)
              .join(", ")
          : "—"}
      </TableCell>
      <TableCell>
        {current.error ? (
          <span className="flex items-center gap-1 text-destructive">
            <AlertTriangle className="h-4 w-4" />
            {current.error}
          </span>
        ) : (
          "—"
        )}
      </TableCell>
      <TableCell className="whitespace-nowrap">
        {format(new Date(current.created_at), "dd/MM/yyyy HH:mm")}
      </TableCell>
    </TableRow>
  );
}

export default function ImportHistoryTable() {
  const { data: imports, isLoading } = useGetImportHistoryList();

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Estatus</TableHead>
            <TableHead>Estadísticas</TableHead>
            <TableHead>Error</TableHead>
            <TableHead>Fecha</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                Cargando historial...
              </TableCell>
            </TableRow>
          ) : imports?.length ? (
            imports.map((importItem) => (
              <ImportHistoryRow key={importItem.id} importItem={importItem} />
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                No se han realizado importaciones aún...
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
