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
import { CreateBatchForm } from "@/components/forms/mantenimiento/almacen/CreateBatchForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EditBatchForm } from "@/components/forms/mantenimiento/almacen/EditBatchForm";
import { Card } from "@/components/ui/card";

interface CreateBatchDialogProps {
  onSuccess?: (batchName: string) => void;
  triggerButton?: React.ReactNode;
  defaultCategory?: string;
}

type DialogMode = "create" | "edit";

export function CreateBatchDialog({
  onSuccess,
  triggerButton,
  defaultCategory,
}: CreateBatchDialogProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [mode, setMode] = useState<DialogMode>("create");

  return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {triggerButton || (
            <Button onClick={() => setOpen(true)} variant={"ghost"}>
              Renglón
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="">
          <DialogHeader className="px-1">
            <DialogTitle>Renglón</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>

          <Tabs
            value={mode}
            onValueChange={(value) => setMode(value as DialogMode)}
            className="w-full"
          >
            <TabsList className="w-full">
              <TabsTrigger value="create">Crear Nuevo</TabsTrigger>
              <TabsTrigger value="edit">Edición</TabsTrigger>
            </TabsList>

            <div className="">
              <TabsContent value="create" className="space-y-4 p-1">
                <CreateBatchForm
                  onClose={() => setOpen(false)}
                  onSuccess={(batchName) => {
                    if (onSuccess) {
                      onSuccess(batchName);
                    }
                    setOpen(false);
                  }}
                  defaultCategory={defaultCategory}
                />
              </TabsContent>

              <TabsContent value="edit" className="space-y-4 p-1">
                <EditBatchForm
                  onClose={() => setOpen(false)}
                  onSuccess={(batchName) => {
                    if (onSuccess) {
                      onSuccess(batchName);
                    }
                    setOpen(false);
                  }}
                />
              </TabsContent>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>
  );
}
