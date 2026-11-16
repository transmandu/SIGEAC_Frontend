"use client";

import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import { ActionTriggerButton } from "@/components/misc/ActionTriggerButton";

import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import CreateManufacturerForm from "@/components/forms/general/CreateManufacturerForm";
import { Plus, Factory } from "lucide-react";

interface CreateManufacturerDialogProps {
  defaultType?:
    "AIRCRAFT" | "ENGINE" | "APU" | "PROPELLER" | "GENERAL" | "PART";
  onSuccess?: (manufacturer: any) => void;
  triggerButton?: React.ReactNode;
}

export function CreateManufacturerDialog({
  defaultType = "GENERAL",
  onSuccess,
  triggerButton,
}: CreateManufacturerDialogProps) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <ActionTriggerButton>
            <Plus className="h-4 w-4 mr-2" />
            Crear fabricante
          </ActionTriggerButton>
        )}
      </DialogTrigger>
      <FormDialogContent
        icon={Factory}
        title="Creación de Fabricante"
        description="Cree un fabricante rellenando la información necesaria."
        className="sm:max-w-lg"
      >
        <CreateManufacturerForm
          onClose={() => setOpen(false)}
          defaultType={defaultType}
          onSuccess={onSuccess}
        />
      </FormDialogContent>
    </Dialog>
  );
}
