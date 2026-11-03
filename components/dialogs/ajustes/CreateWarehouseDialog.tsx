"use client";

import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import { ActionTriggerButton } from "@/components/misc/ActionTriggerButton";

import { useState } from "react";
import { Plus, Warehouse } from "lucide-react";
import CreateWarehouseForm from "@/components/forms/ajustes/CreateWarehouseForm";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

const CreateWarehouseDialog = () => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <ActionTriggerButton>
          <Plus className="h-4 w-4 mr-2" />
          Crear almacén
        </ActionTriggerButton>
      </DialogTrigger>
      <FormDialogContent
        icon={Warehouse}
        title="Creación de Almacén"
        description="Cree un almacén rellenando los datos necesarios."
        className="sm:max-w-105"
      >
        <CreateWarehouseForm onClose={() => setOpen(false)} />
      </FormDialogContent>
    </Dialog>
  );
};

export default CreateWarehouseDialog;
