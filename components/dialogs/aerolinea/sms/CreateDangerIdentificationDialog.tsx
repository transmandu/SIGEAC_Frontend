"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { DangerIdentification } from "@/types";
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
    <Card className="flex">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            onClick={() => setOpen(true)}
            variant="outline"
            size="sm"
            className="hidden h-8 lg:flex"
          >
            {title}
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[65%] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>

          <div className="mt-2">
            <CreateDangerIdentificationForm
              id={id}
              initialData={initialData}
              isEditing={isEditing}
              reportType={reportType}
            />
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
