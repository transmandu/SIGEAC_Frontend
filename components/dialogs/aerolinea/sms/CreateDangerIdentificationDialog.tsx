"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DangerIdentification } from "@/types";
import { useState } from "react";
import CreateDangerIdentificationForm from "@/components/forms/aerolinea/sms/CreateIdentificationForm";

interface FormProps {
  title: string;
  id: number | string;
  initialData?: DangerIdentification;
  isEditing?: boolean;
  reportType: string;
}

export default function CreateDangerIdentificationDialog({
  title,
  id,
  isEditing,
  initialData,
  reportType,
}: FormProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Card className="flex">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => setOpen(true)}
              variant="outline"
              size="sm"
              className=" hidden h-8 lg:flex"
            >
              {title}
            </Button>
          </DialogTrigger>

          {!isEditing && !initialData ? (
            // ===== CAMBIO AQUÍ: Añadidas clases para scroll =====
            <DialogContent className="flex flex-col max-w-2xl m-2 max-h-[calc(100vh-theme(spacing.16))] overflow-y-auto">
              <DialogHeader>
                <DialogTitle></DialogTitle>
                <DialogDescription></DialogDescription>
              </DialogHeader>
              <CreateDangerIdentificationForm
                id={id}
                reportType={reportType}
                onClose={() => setOpen(false)}
              />
            </DialogContent>
          ) : (
            // ===== CAMBIO AQUÍ: Añadidas clases para scroll =====
            <DialogContent className="flex flex-col max-w-6xl m-2 max-h-[calc(100vh-theme(spacing.16))] overflow-y-auto">
              <DialogHeader>
                <DialogTitle></DialogTitle>
                <DialogDescription></DialogDescription>
              </DialogHeader>
              <CreateDangerIdentificationForm
                id={id}
                onClose={() => setOpen(false)}
                initialData={initialData}
                isEditing={isEditing}
                reportType={reportType}
              />
            </DialogContent>
          )}
        </Dialog>
      </Card>
    </>
  );
}
