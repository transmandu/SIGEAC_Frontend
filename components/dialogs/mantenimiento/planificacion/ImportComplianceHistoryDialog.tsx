"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ActionTriggerButton } from "@/components/misc/ActionTriggerButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, CheckCircle2, History, Loader2, Upload } from "lucide-react";
import { useCompanyStore } from "@/stores/CompanyStore";
import {
  ImportComplianceHistoryResult,
  useImportMaintenanceComplianceHistory,
} from "@/actions/mantenimiento/planificacion/cumplimientos/actions";
import { MaintenanceControlItem } from "@/types";

const FORMAT_COLUMNS = [
  { header: "Certificado o Servicio", hint: "Debe coincidir EXACTO con uno de los nombres de abajo." },
  { header: "Fecha", hint: "dd/mm/aaaa. Debe ser anterior a la primera aplicación del ítem." },
  { header: "Horas", hint: "Opcional si el ítem no se cuenta en horas." },
  { header: "Ciclos", hint: "Opcional si el ítem no se cuenta en ciclos." },
  { header: "Realizado Por", hint: "Opcional, texto libre." },
  { header: "Observaciones", hint: "Opcional." },
];

interface ImportComplianceHistoryDialogProps {
  controlId: string | number;
  items: MaintenanceControlItem[];
}

export function ImportComplianceHistoryDialog({ controlId, items }: ImportComplianceHistoryDialogProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ImportComplianceHistoryResult | null>(null);
  const { selectedCompany } = useCompanyStore();
  const { importComplianceHistory } = useImportMaintenanceComplianceHistory();

  const handleSubmit = async () => {
    if (!file) return;
    const data = await importComplianceHistory.mutateAsync({
      file,
      controlId,
      company: selectedCompany!.slug,
    });
    setResult(data);
    setFile(null);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (importComplianceHistory.isPending) return;
        setOpen(next);
        if (!next) {
          setFile(null);
          setResult(null);
        }
      }}
    >
      <DialogTrigger asChild>
        <ActionTriggerButton>
          <Upload className="mr-2 size-4" />
          Importar Histórico
        </ActionTriggerButton>
      </DialogTrigger>

      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="size-5" />
            Importar Histórico de Cumplimientos
          </DialogTitle>
          <DialogDescription>
            Carga cumplimientos de <strong>antes</strong> de usar este sistema, solo para tener con qué comparar en
            las estadísticas. No reemplazan ni afectan el cálculo de Aplicada/Próximo/Remanente vigente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border bg-muted/30 p-3">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Columnas del Excel (primera fila = encabezados)
            </p>
            <ul className="space-y-1">
              {FORMAT_COLUMNS.map((col) => (
                <li key={col.header} className="flex flex-col text-sm sm:flex-row sm:items-baseline sm:gap-2">
                  <span className="font-medium">{col.header}</span>
                  <span className="text-xs text-muted-foreground">{col.hint}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Nombres exactos disponibles en este control
            </p>
            <ScrollArea className="h-28 rounded-lg border p-2">
              <div className="flex flex-wrap gap-1.5">
                {items.map((item) => (
                  <Badge key={item.id} variant="outline" className="font-normal">
                    {item.name}
                  </Badge>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="space-y-2">
            <Label htmlFor="compliance-history-file">Archivo (.xlsx, .xls o .csv)</Label>
            <Input
              id="compliance-history-file"
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
          </div>

          {result && (
            <div className="space-y-2 rounded-lg border p-3">
              <p className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="size-4" />
                {result.imported} cumplimiento(s) importado(s).
              </p>
              {result.skipped.length > 0 && (
                <div className="space-y-1">
                  <p className="flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-400">
                    <AlertTriangle className="size-4" />
                    {result.skipped.length} fila(s) omitida(s):
                  </p>
                  <ScrollArea className="h-24">
                    <ul className="space-y-1 pl-1 text-xs text-muted-foreground">
                      {result.skipped.map((row, index) => (
                        <li key={index}>
                          Fila {row.row}: {row.reason}
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={importComplianceHistory.isPending}
          >
            Cerrar
          </Button>
          <Button onClick={handleSubmit} disabled={!file || importComplianceHistory.isPending}>
            {importComplianceHistory.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Importar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
