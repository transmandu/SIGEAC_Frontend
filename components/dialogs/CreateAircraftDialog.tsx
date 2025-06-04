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
import { CreateAircraftForm } from "../forms/CreateAircraftForm";
import { ScrollArea } from "../ui/scroll-area";

export function CreateAircraftDialog() {
  const [open, setOpen] = useState<boolean>(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          onClick={() => setOpen(true)}
          variant={"outline"}
          className="flex items-center justify-center gap-2 h-8 border-dashed"
        >
          Registrar Aeronave
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[520px]"
        onInteractOutside={(e) => {
          e.preventDefault(); // Evita que el diálogo se cierre al hacer clic fuera
        }}
      >
        <DialogHeader>
          <DialogTitle>Crear Aeronave</DialogTitle>
          <DialogDescription>Cree una nueva aeronave.</DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[580px]">
          <CreateAircraftForm onClose={() => setOpen(false)} />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
