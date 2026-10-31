"use client";

import { useEngineeringReject } from "@/actions/mantenimiento/almacen/inventario/articulos/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Trash2 } from "lucide-react";
import { useState } from "react";

const MIN_REASON_LENGTH = 5;

interface RejectArticleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  articleId: number;
  partNumber: string;
}

/**
 * Eliminación de un artículo cuya información no tiene arreglo. El motivo es
 * obligatorio porque el artículo desaparece: es lo único que le explica a
 * almacén, y a quien lo registró, por qué.
 */
export function RejectArticleDialog({
  open,
  onOpenChange,
  articleId,
  partNumber,
}: RejectArticleDialogProps) {
  const [reason, setReason] = useState("");
  const { engineeringReject } = useEngineeringReject();

  const trimmed = reason.trim();
  const valid = trimmed.length >= MIN_REASON_LENGTH;

  const handleReject = async () => {
    if (!valid) return;

    try {
      await engineeringReject.mutateAsync({ id: articleId, reason: trimmed });
      setReason("");
      onOpenChange(false);
    } catch {
      // El toast de error lo emite la mutación; el motivo escrito se conserva.
    }
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!next && engineeringReject.isPending) return;
        onOpenChange(next);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="size-5 text-red-500" />
            Eliminar artículo
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>
                Se eliminará el artículo{" "}
                <span className="font-mono font-semibold text-foreground">
                  P/N: {partNumber}
                </span>{" "}
                y no se puede deshacer. Se avisará a almacén y a quien lo
                registró, junto con el motivo.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-1.5">
          <Label htmlFor="reject-reason" className="text-xs">
            Motivo (obligatorio)
          </Label>
          <Textarea
            id="reject-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={1000}
            placeholder="Ej.: el número de parte no corresponde a la descripción."
            className="min-h-20 resize-none"
          />
          {trimmed.length > 0 && !valid && (
            <p className="text-xs text-red-600">
              Describe el motivo con al menos {MIN_REASON_LENGTH} caracteres.
            </p>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={engineeringReject.isPending}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={!valid || engineeringReject.isPending}
            onClick={(e) => {
              e.preventDefault();
              handleReject();
            }}
            className="gap-1.5 bg-red-600 hover:bg-red-700"
          >
            {engineeringReject.isPending && (
              <Loader2 className="size-3.5 animate-spin" />
            )}
            Eliminar artículo
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
