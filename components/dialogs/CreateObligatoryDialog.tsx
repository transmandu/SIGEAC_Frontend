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
import { CreateObligatoryReportForm } from "../forms/CreateObligatoryReportForm";
import { useState } from "react";
import { ObligatoryReport } from "@/types";

interface FormProps {
  title: string;
  initialData?: ObligatoryReport;
  isEditing?: boolean;
}

export default function CreateObligatoryReportDialog({
  title,
  isEditing,
  initialData,
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
          <DialogContent className="flex flex-col max-w-2xl m-2 max-h-screen overflow-auto">
            <DialogHeader>
              <DialogTitle></DialogTitle>
              <DialogDescription></DialogDescription>
            </DialogHeader>

            {isEditing && initialData ? (
              <CreateObligatoryReportForm
                isEditing={true}
                initialData={initialData}
                onClose={() => setOpen(false)}
              />
            ) : (
              <CreateObligatoryReportForm onClose={() => setOpen(false)} />
            )}
          </DialogContent>
        </Dialog>
      </Card>
    </>
  );
}
