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
import { CreateAdministrationArticleForm } from "../forms/CreateAdministrationArticleForm";

export function AdministrationArticleDialog() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          onClick={() => setOpen(true)}
          variant={"outline"}
          className="flex items-center justify-center gap-2 h-8 border-dashed"
        >
          Registrar Artículo
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[480px]"
        onInteractOutside={(e) => {
          e.preventDefault(); 
        }}
      >
        <DialogHeader>
          <DialogTitle>Crear un Artículo</DialogTitle>
          <DialogDescription>Cree una nuevo artículo.</DialogDescription>
        </DialogHeader>
        <CreateAdministrationArticleForm onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
