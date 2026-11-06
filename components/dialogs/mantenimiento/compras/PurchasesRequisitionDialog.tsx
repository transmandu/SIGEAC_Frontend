"use client";

import { useState } from "react";

import { ActionTriggerButton } from "@/components/misc/ActionTriggerButton";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";

import {
  SegmentedTabs,
  SegmentedTabsContent,
  SegmentedTabsList,
  SegmentedTabsTrigger,
} from "@/components/misc/SegmentedTabs";

import { Boxes, Package, Plane, FilePlus2, Plus } from "lucide-react";

import { CreateAeronauticalRequisitionForm } from "@/components/forms/mantenimiento/compras/CreateAeronauticalRequisitionForm";
import { CreateWarehouseRequisitionForm } from "@/components/forms/mantenimiento/compras/CreateWarehouseRequisitionForm";
import { CreateGeneralRequisitionForm } from "@/components/forms/mantenimiento/compras/CreateGeneralRequisitionForm";

export function PurchasesRequisitionDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* ===================== TRIGGER ===================== */}
      <DialogTrigger asChild>
        <ActionTriggerButton>
          <Plus className="size-4" />
          Nueva solicitud
        </ActionTriggerButton>
      </DialogTrigger>

      <FormDialogContent
        className="sm:max-w-215"
        icon={FilePlus2}
        title="Centro de solicitudes"
        description="Cree solicitudes de compra según el tipo de operación."
      >
        <SegmentedTabs defaultValue="AERONAUTICAL">
          <SegmentedTabsList className="mb-4 max-sm:flex-col max-sm:items-stretch">
            <SegmentedTabsTrigger value="AERONAUTICAL">
              <Plane className="size-4" />
              Aeronáutica
            </SegmentedTabsTrigger>

            <SegmentedTabsTrigger value="WAREHOUSE">
              <Boxes className="size-4" />
              Almacén
            </SegmentedTabsTrigger>

            <SegmentedTabsTrigger value="GENERAL">
              <Package className="size-4" />
              General
            </SegmentedTabsTrigger>
          </SegmentedTabsList>

          {/* ===================== CONTENT ===================== */}

          <SegmentedTabsContent value="AERONAUTICAL" className="mt-4">
            <CreateAeronauticalRequisitionForm onClose={() => setOpen(false)} />
          </SegmentedTabsContent>

          <SegmentedTabsContent value="WAREHOUSE" className="mt-4">
            <CreateWarehouseRequisitionForm onClose={() => setOpen(false)} />
          </SegmentedTabsContent>

          <SegmentedTabsContent value="GENERAL" className="mt-4">
            <CreateGeneralRequisitionForm
              isEditing={false}
              onClose={() => setOpen(false)}
            />
          </SegmentedTabsContent>
        </SegmentedTabs>
      </FormDialogContent>
    </Dialog>
  );
}
