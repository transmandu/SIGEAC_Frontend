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
import { FlightForm } from "../forms/CreateFlightForm";
import DateFilterUpdate from "../forms/CreateFilterDatesUpdate";

export function CreateFlightDialog() {
  const [openFlightDialog, setOpenFlightDialog] = useState(false);
  return (
    <>
      <DateFilterUpdate />

      <Dialog open={openFlightDialog} onOpenChange={setOpenFlightDialog}>
        <DialogTrigger asChild>
          <Button
            onClick={() => setOpenFlightDialog(true)}
            variant={"outline"}
            className="flex items-center justify-center gap-2 h-8 border-dashed"
          >
            Registrar Vuelo
          </Button>
        </DialogTrigger>
        <DialogContent
          className="sm:max-w-[480px]"
          onInteractOutside={(e) => {
            e.preventDefault(); // Evita que el diálogo se cierre al hacer clic fuera
          }}
        >
          <DialogHeader>
            <DialogTitle>Crear Vuelo</DialogTitle>
            <DialogDescription>Cree un nuevo vuelo.</DialogDescription>
          </DialogHeader>
          <FlightForm onClose={() => setOpenFlightDialog(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
