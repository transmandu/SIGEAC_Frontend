"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { useImportErrorReportHistory } from "@/hooks/sistema/reportes/useImportErrorReportHistory";

interface ImportHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ImportHistoryDialog({ open, onOpenChange }: ImportHistoryDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [from, setFrom] = useState("");
  const [dryRun, setDryRun] = useState(false);
  const { importErrorReportHistory } = useImportErrorReportHistory();

  const handleSubmit = async () => {
    if (!file) return;
    await importErrorReportHistory.mutateAsync({ file, from: from || undefined, dry_run: dryRun });
    setFile(null);
    setFrom("");
    setDryRun(false);
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!importErrorReportHistory.isPending) onOpenChange(next);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importar histórico de WhatsApp</DialogTitle>
          <DialogDescription>
            Sube el archivo de chat exportado de WhatsApp (chat.txt) para importar los reportes históricos.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="chat-file">Archivo de chat (.txt)</Label>
            <Input
              id="chat-file"
              type="file"
              accept=".txt"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="from-date">Importar desde (opcional)</Label>
            <Input
              id="from-date"
              type="date"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch id="dry-run" checked={dryRun} onCheckedChange={setDryRun} />
            <Label htmlFor="dry-run">Simular sin guardar (dry run)</Label>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={importErrorReportHistory.isPending}
          >
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!file || importErrorReportHistory.isPending}>
            {importErrorReportHistory.isPending ? (
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
