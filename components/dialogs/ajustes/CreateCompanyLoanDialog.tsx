"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import CreateCompanyLoanForm from "@/components/forms/ajustes/CreateCompanyLoanForm";
import { ActionTriggerButton } from "@/components/misc/ActionTriggerButton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCompanyStore } from "@/stores/CompanyStore";

export function CreateCompanyLoanDialog() {
  const { selectedCompany } = useCompanyStore();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <ActionTriggerButton>
          <Plus className="h-4 w-4 mr-2" />
          Habilitar empresa
        </ActionTriggerButton>
      </DialogTrigger>
      <DialogContent
        className="flex max-h-[90vh] flex-col overflow-hidden sm:max-w-lg"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Habilitar empresa</DialogTitle>
          <DialogDescription>
            Elija la empresa y qué podrá hacer en {selectedCompany?.name}.
          </DialogDescription>
        </DialogHeader>
        {open && <CreateCompanyLoanForm onClose={() => setOpen(false)} />}
      </DialogContent>
    </Dialog>
  );
}
