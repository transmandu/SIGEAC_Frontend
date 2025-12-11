"use client";

import { CreateSafetyBulletinForm } from "@/components/forms/aerolinea/sms/CreateSafetyBulletinForm";
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
import { SafetyBulletin } from "@/types";
import { useState } from "react";

interface FormProps {
  title: string;
  initialData?: SafetyBulletin;
  isEditing?: boolean;
}

export default function CreateSafetyBulletinDialog({
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
              className=" hidden  lg:flex border-dashed"
            >
              {title}
            </Button>
          </DialogTrigger>

          <DialogContent className="flex flex-col max-w-3xl max-h-[calc(100vh-10rem)] m-2 overflow-auto">
            <DialogHeader>
              <DialogTitle></DialogTitle>
              <DialogDescription></DialogDescription>
            </DialogHeader>

            {isEditing && initialData ? (
              <CreateSafetyBulletinForm
                isEditing={true}
                initialData={initialData}
                onClose={() => setOpen(false)}
              />
            ) : (
              <CreateSafetyBulletinForm onClose={() => setOpen(false)} />
            )}
          </DialogContent>
        </Dialog>
      </Card>
    </>
  );
}
