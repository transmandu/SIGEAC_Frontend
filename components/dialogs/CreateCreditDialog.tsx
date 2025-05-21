"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { useState } from "react";
import { useRouter } from "next/navigation";
import DateFilterUpdate from "../forms/CreateFilterDatesUpdate";
import { CreateCreditForm } from "../forms/CreateCreditForm";

export function CreditDialog({ id }: { id?: string }) {
  const [openActions, setOpenActions] = useState(false);
  const [open, setOpen] = useState(false);

  const router = useRouter();

  const handleViewStats = () => {
    router.push(
      "/transmandu/administracion/creditos/cuentas_por_pagar/resumen_credito"
    );
  };

  return (
    <>
      <DateFilterUpdate />

      {/*Dialogo para crear un credito de cuentas por pagar*/}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            onClick={() => setOpen(true)}
            variant={"outline"}
            className="flex items-center justify-center gap-2 h-8 border-dashed"
          >
            Registrar Crédito
          </Button>
        </DialogTrigger>
        <DialogContent
          className="sm:max-w-[480px]"
          onInteractOutside={(e) => {
            e.preventDefault(); 
          }}
        >
          <DialogHeader>
            <DialogTitle>Crear un crédito</DialogTitle>
            <DialogDescription>Cree un nuevo crédito.</DialogDescription>
          </DialogHeader>
          <CreateCreditForm onClose={() => setOpen(false)} />
        </DialogContent>
      </Dialog>

      {/*Dialogo para ver el resumen de cuentas por pagar*/}
      <Dialog open={openActions} onOpenChange={setOpenActions}>
        <DialogTrigger asChild>
          <Button
            onClick={handleViewStats}
            variant={"outline"}
            className="flex items-center justify-center gap-2 h-8 border-dashed"
          >
            Resumen de Crédito
          </Button>
        </DialogTrigger>
      </Dialog> 
    </>
  );
}
