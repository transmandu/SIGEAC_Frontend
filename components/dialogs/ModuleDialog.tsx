"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { useState } from "react";
import { useRouter } from "next/navigation";
import DateFilterUpdate from "../forms/CreateFilterDatesUpdate";
import { CreateCreditForm } from "../forms/CreateCreditForm";
import { CreateModuleForm } from "../forms/CreateModuleForm";

export function ModuleDialog({ id }: { id?: string }) {
  const [openActions, setOpenActions] = useState(false);
  const [open, setOpen] = useState(false);

  const router = useRouter();

  const handleViewStats = () => {
    router.push(
      "/modules"
    );
  };

  return (
    <>

      {/*Dialogo para crear un credito de cuentas por pagar*/}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            onClick={() => setOpen(true)}
            variant={"outline"}
            className="flex items-center justify-center gap-2 h-8 border-dashed"
          >
            Registrar Modulo
          </Button>
        </DialogTrigger>
        <DialogContent
          className="sm:max-w-[480px]"
          onInteractOutside={(e) => {
            e.preventDefault(); 
          }}
        >
          <DialogHeader>
            <DialogTitle>Crear un modulo</DialogTitle>
            <DialogDescription>Cree un nuevo modulo.</DialogDescription>
          </DialogHeader>
          <CreateModuleForm onClose={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}