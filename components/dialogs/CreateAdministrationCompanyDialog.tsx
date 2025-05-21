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
import { CreateAdministrationCompanyForm } from "../forms/CreateAdministrationCompanyForm";

export function AdministrationCompanyDialog() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          onClick={() => setOpen(true)}
          variant={"outline"}
          className="flex items-center justify-center gap-2 h-8 border-dashed"
        >
          Registrar Empresa
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[480px]"
        onInteractOutside={(e) => {
          e.preventDefault(); 
        }}
      >
        <DialogHeader>
          <DialogTitle>Crear una Empresa</DialogTitle>
          <DialogDescription>Cree una nueva empresa.</DialogDescription>
        </DialogHeader>
        <CreateAdministrationCompanyForm onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
