"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, } from "@/components/ui/dialog";
import { useCompanyStore } from "@/stores/CompanyStore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import DateFilterUpdate from "@/components/forms/aerolinea/administracion/CreateFilterDatesUpdate";

export function CashMovementDialog() {
  const {selectedCompany} = useCompanyStore();
  const [openActionsIncome, setOpenActionsIncome] = useState(false);
  const [openActionsOutput, setOpenActionsOutput] = useState(false);

  const router = useRouter();

  const handleViewStatsIncome = () => {
    router.push(
      `/${selectedCompany?.slug}/administracion/gestion_cajas/movimientos/reporte_ingresos`
    );
  };

  const handleViewStatsOutput = () => {
    router.push(
      `/${selectedCompany?.slug}/administracion/gestion_cajas/movimientos/reporte_egresos`
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 items-center gap-4">
      <DateFilterUpdate />
      {/*Dialogo para registrar un movimiento de caja*/}
      <Link
        href={
          `/${selectedCompany?.slug}/administracion/gestion_cajas/movimientos/registrar_movimiento`
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
