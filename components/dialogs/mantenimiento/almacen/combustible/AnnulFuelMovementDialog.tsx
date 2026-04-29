"use client";

import { useAnnulFuelMovement } from "@/actions/mantenimiento/almacen/combustible/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getFuelMovementLabel } from "@/lib/fuel";
import { FuelMovement } from "@/types";
import { Loader2, Undo2 } from "lucide-react";
import { useState } from "react";

export function AnnulFuelMovementDialog({
  company,
  movement,
}: {
  company?: string;
  movement: FuelMovement;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const annulFuelMovement = useAnnulFuelMovement(company);

  const isBlocked =
    movement.status === "annulled" || movement.type === "annulment";

  const handleAnnul = async () => {
    await annulFuelMovement.mutateAsync({
      id: movement.id,
      data: { reason: reason.trim() || null },
    });
    setReason("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-2 text-destructive hover:text-destructive"
          disabled={isBlocked}
        >
          <Undo2 className="h-4 w-4" />
          Anular
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>Anular movimiento</DialogTitle>
          <DialogDescription>
            Se creara un reverso auditable para{" "}
            {getFuelMovementLabel(movement.type)} por {movement.liters} L.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor={`annul-reason-${movement.id}`}>Razon</Label>
          <Textarea
            id={`annul-reason-${movement.id}`}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Opcional"
            className="min-h-24 resize-none"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleAnnul}
            disabled={annulFuelMovement.isPending || !company}
          >
            {annulFuelMovement.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Anular movimiento"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
