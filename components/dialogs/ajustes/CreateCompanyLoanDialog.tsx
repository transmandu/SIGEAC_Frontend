"use client";

import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import { useState } from "react";
import { Plus, Handshake } from "lucide-react";

import CreateCompanyLoanForm from "@/components/forms/ajustes/CreateCompanyLoanForm";
import { ActionTriggerButton } from "@/components/misc/ActionTriggerButton";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
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
      <FormDialogContent
        icon={Handshake}
        title="Habilitar empresa"
        description={
          <>Elija la empresa y qué podrá hacer en {selectedCompany?.name}.</>
        }
        fill
        className="sm:max-w-lg"
      >
        {open && <CreateCompanyLoanForm onClose={() => setOpen(false)} />}
      </FormDialogContent>
    </Dialog>
  );
}
