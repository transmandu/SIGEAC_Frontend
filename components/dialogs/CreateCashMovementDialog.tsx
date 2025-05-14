"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { CreateCashMovementForm } from "../forms/CreateCashMovementForm";
import { useRouter } from "next/navigation";
import DateFilterUpdate from "../forms/CreateFilterDatesUpdate";
import Link from "next/link";

export function CashMovementDialog({ id }: { id?: string }) {
  const [openMovementDialog, setOpenMovementDialog] = useState(false);
  const [openActionsIncome, setOpenActionsIncome] = useState(false);
  const [openActionsOutput, setOpenActionsOutput] = useState(false);

  const router = useRouter();

  const handleViewStatsIncome = () => {
    router.push(
      "/transmandu/administracion/gestion_cajas/movimientos/reporte_ingresos"
    );
  };

  const handleViewStatsOutput = () => {
    router.push(
      "/transmandu/administracion/gestion_cajas/movimientos/reporte_egresos"
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 items-center gap-4">
      <DateFilterUpdate />
      {/*Dialogo para registrar un movimiento de caja*/}
      <Link
        href={
          "/transmandu/administracion/gestion_cajas/movimientos/registrar_movimiento"
        }
      >
        <Button
          variant={"outline"}
          className="flex items-center justify-center gap-2 h-8 border-dashed"
        >
          Registrar Movimiento de Caja
        </Button>
      </Link>

      {/*Dialogo para ver el resumen de ingresos*/}
      <Dialog open={openActionsIncome} onOpenChange={setOpenActionsIncome}>
        <DialogTrigger asChild>
          <Button
            onClick={handleViewStatsIncome}
            variant={"outline"}
            className="flex items-center justify-center gap-2 h-8 border-dashed"
          >
            Resumen de Ingresos
          </Button>
        </DialogTrigger>
      </Dialog>

      {/*Dialogo para ver el resumen de egresos*/}
      <Dialog open={openActionsOutput} onOpenChange={setOpenActionsOutput}>
        <DialogTrigger asChild>
          <Button
            onClick={handleViewStatsOutput}
            variant={"outline"}
            className="flex items-center justify-center gap-2 h-8 border-dashed"
          >
            Resumen de Egresos
          </Button>
        </DialogTrigger>
      </Dialog>
    </div>
  );
}
