"use client";

import {
  useEngineeringApprove,
  type EngineeringApproveDestination,
} from "@/actions/mantenimiento/almacen/inventario/articulos/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import type { CheckingScope } from "@/hooks/mantenimiento/almacen/inventario/useCheckingArticles";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useState } from "react";

// Lo que cambia entre las dos colas es qué significa "RECEPTION": para lo que
// viene de CHECKING es mandarlo a recepción; para lo que ya estaba allí es
// dejarlo donde está, aprobado.
const OPTIONS: Record<
  CheckingScope,
  { value: EngineeringApproveDestination; title: string; hint: string }[]
> = {
  checking: [
    {
      value: "RECEPTION",
      title: "Enviar a recepción",
      hint: "Almacén recibe el aviso y decide si lo pasa a incoming o al inventario.",
    },
    {
      value: "STORED",
      title: "Pasar directo al inventario",
      hint: "Queda almacenado sin la inspección de incoming; consta que lo aprobó ingeniería.",
    },
  ],
  all: [
    {
      value: "RECEPTION",
      title: "Aprobar y dejar en recepción",
      hint: "Lo que venía de chequeo pasa a recepción y lo ya recibido sigue allí; almacén decide cómo continuar.",
    },
    {
      value: "STORED",
      title: "Aprobar y pasar al inventario",
      hint: "Queda almacenado sin la inspección de incoming; consta que lo aprobó ingeniería.",
    },
  ],
  reception: [
    {
      value: "RECEPTION",
      title: "Aprobar y dejar en recepción",
      hint: "Queda constancia de la aprobación de ingeniería y almacén decide cómo continuar.",
    },
    {
      value: "STORED",
      title: "Aprobar y pasar al inventario",
      hint: "Queda almacenado sin la inspección de incoming; consta que lo aprobó ingeniería.",
    },
  ],
};

interface ApproveArticlesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ids: number[];
  scope: CheckingScope;
  title?: string;
  description?: string;
  cancelLabel?: string;
  onApproved?: () => void;
}

/**
 * Visto bueno de ingeniería sobre uno o varios artículos. Sirve a la fila, a la
 * aprobación masiva y a la pantalla de edición, que solo cambian el texto.
 */
export function ApproveArticlesDialog({
  open,
  onOpenChange,
  ids,
  scope,
  title,
  description,
  cancelLabel = "Cancelar",
  onApproved,
}: ApproveArticlesDialogProps) {
  const [destination, setDestination] =
    useState<EngineeringApproveDestination>("RECEPTION");
  const [notes, setNotes] = useState("");
  const { engineeringApprove } = useEngineeringApprove();

  // Cada apertura parte de cero: un destino "al inventario" elegido y cancelado
  // antes no debe quedar preseleccionado la próxima vez.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setDestination("RECEPTION");
      setNotes("");
    }
  }

  const many = ids.length > 1;

  const handleApprove = async () => {
    try {
      await engineeringApprove.mutateAsync({ ids, destination, notes });
      onApproved?.();
      onOpenChange(false);
    } catch {
      // El toast de error lo emite la mutación; el diálogo queda abierto.
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && engineeringApprove.isPending) return;
        onOpenChange(next);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center">
            {title ??
              (many
                ? `Aprobar ${ids.length} artículos`
                : "Aprobar información del artículo")}
          </DialogTitle>
          <DialogDescription className="text-center">
            {description ??
              "Confirma que la información del artículo es correcta. Elige a dónde continúa."}
          </DialogDescription>
        </DialogHeader>

        <RadioGroup
          value={destination}
          onValueChange={(value) =>
            setDestination(value as EngineeringApproveDestination)
          }
          className="gap-2"
        >
          {OPTIONS[scope].map((option) => (
            <Label
              key={option.value}
              htmlFor={`approve-${option.value}`}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-md border p-3 font-normal transition-colors",
                destination === option.value
                  ? "border-primary bg-primary/5"
                  : "hover:bg-muted/50",
              )}
            >
              <RadioGroupItem
                id={`approve-${option.value}`}
                value={option.value}
                className="mt-0.5"
              />
              <span className="space-y-0.5">
                <span className="block text-sm font-medium">
                  {option.title}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {option.hint}
                </span>
              </span>
            </Label>
          ))}
        </RadioGroup>

        <div className="space-y-1.5">
          <Label htmlFor="approve-notes" className="text-xs">
            Observaciones (opcional)
          </Label>
          <Textarea
            id="approve-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={1000}
            placeholder="Se incluyen en el aviso a almacén."
            className="min-h-16 resize-none"
          />
        </div>

        <DialogFooter className="flex flex-col gap-2 md:gap-0">
          <Button
            variant="outline"
            disabled={engineeringApprove.isPending}
            onClick={() => onOpenChange(false)}
          >
            {cancelLabel}
          </Button>
          <Button
            disabled={engineeringApprove.isPending}
            onClick={handleApprove}
            className="min-w-40"
          >
            {engineeringApprove.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              "Aprobar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
