"use client";

import { FuelMovementForm } from "@/components/forms/mantenimiento/almacen/combustible/FuelMovementForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getFuelMovementLabel } from "@/lib/fuel";
import { FuelMovementType, FuelSummary, FuelVehicle } from "@/types";
import { LucideIcon } from "lucide-react";
import { useState } from "react";

export function FuelMovementDialog({
  company,
  type,
  summary,
  vehicles,
  icon: Icon,
  variant = "outline",
}: {
  company?: string;
  type: FuelMovementType;
  summary?: FuelSummary;
  vehicles: FuelVehicle[];
  icon: LucideIcon;
  variant?: "default" | "outline" | "secondary";
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} className="justify-start gap-2">
          <Icon className="h-4 w-4" />
          {getFuelMovementLabel(type)}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>{getFuelMovementLabel(type)}</DialogTitle>
          <DialogDescription>
            Registra el movimiento. El backend validara saldos y capacidad.
          </DialogDescription>
        </DialogHeader>
        <FuelMovementForm
          company={company}
          type={type}
          summary={summary}
          vehicles={vehicles}
          onClose={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
