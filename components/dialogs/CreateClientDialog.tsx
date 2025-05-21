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
import { CreateClientForm } from "../forms/CreateClientForm";

export function CreateClientDialog() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          onClick={() => setOpen(true)}
          variant={"outline"}
          className="flex items-center justify-center gap-2 h-8 border-dashed"
        >
          Registrar Cliente
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[480px]"
        onInteractOutside={(e) => {
          e.preventDefault(); // Evita que el diálogo se cierre al hacer clic fuera
        }}
      >
        <DialogHeader>
          <DialogTitle>Crear Cliente</DialogTitle>
          <DialogDescription>Cree un nuevo cliente.</DialogDescription>
        </DialogHeader>
        <CreateClientForm onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
