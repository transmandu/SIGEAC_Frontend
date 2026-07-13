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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useResolveErrorReport } from "@/hooks/sistema/reportes/useResolveErrorReport";

interface ResolveErrorReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportId: number;
}

export default function ResolveErrorReportDialog({
  open,
  onOpenChange,
  reportId,
}: ResolveErrorReportDialogProps) {
  const [resolution, setResolution] = useState("");
  const { resolveErrorReport } = useResolveErrorReport();

  const handleSubmit = async () => {
    if (!resolution.trim()) return;
    await resolveErrorReport.mutateAsync({ id: reportId, resolution });
    setResolution("");
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!resolveErrorReport.isPending) {
          onOpenChange(next);
          if (!next) setResolution("");
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Resolver reporte</DialogTitle>
          <DialogDescription>
            Describe la solución aplicada. El reporte pasará a estatus &quot;Resuelto&quot;.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="resolution">Solución</Label>
          <Textarea
            id="resolution"
            className="min-h-28"
            value={resolution}
            onChange={(event) => setResolution(event.target.value)}
            placeholder="Describe cómo se resolvió el reporte..."
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={resolveErrorReport.isPending}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!resolution.trim() || resolveErrorReport.isPending}
          >
            {resolveErrorReport.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Resolver"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
