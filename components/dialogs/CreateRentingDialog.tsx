"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { useState } from "react";
import { CreateRentingForm } from "../forms/CreateRentingForm";
import DateFilterUpdate from "../forms/CreateFilterDatesUpdate";

export function RentingDialog() {
  const [open, setOpen] = useState(false);
  return (
    <>
    <DateFilterUpdate /> 

    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          onClick={() => setOpen(true)}
          variant={"outline"}
          className="flex items-center justify-center gap-2 h-8 border-dashed"
        >
          Registrar Arrendamiento
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[480px]"
        onInteractOutside={(e) => {
          e.preventDefault(); 
        }}
      >
        <DialogHeader>
          <DialogTitle>Crear un arrendamiento</DialogTitle>
          <DialogDescription>Cree un nuevo arrendamiento.</DialogDescription>
        </DialogHeader>
        <CreateRentingForm onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
    
    </>
  );
}
