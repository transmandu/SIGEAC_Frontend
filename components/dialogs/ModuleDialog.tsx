"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CreateModuleForm } from "../forms/ajustes/CreateModuleForm";

export function ModuleDialog() {
  const [open, setOpen] = useState(false);
  return (
    <>
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
