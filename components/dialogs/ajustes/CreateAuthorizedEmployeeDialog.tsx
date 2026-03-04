"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AuthorizedEmployeeForm } from "@/components/forms/ajustes/CreateAuthorizedEmployeed";

export function CreateAuthorizedEmployeeDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center justify-center h-8 border-dashed">
          <Plus className="mr-2 h-3 w-3" />
          Crear
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Autorizar empleado</DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <AuthorizedEmployeeForm onSuccess={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}