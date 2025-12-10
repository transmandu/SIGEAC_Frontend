"use client";

import { CreateBulletinForm } from "@/components/forms/aerolinea/sms/CreateBulletinForm";
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
import { Bulletin } from "@/types";
import { useState } from "react";

interface FormProps {
  title: string;
  initialData?: Bulletin;
  isEditing?: boolean;
}

export default function CreateBulletinDialog({
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
              <CreateBulletinForm
                isEditing={true}
                initialData={initialData}
                onClose={() => setOpen(false)}
              />
            ) : (
              <CreateBulletinForm onClose={() => setOpen(false)} />
            )}
          </DialogContent>
        </Dialog>
      </Card>
    </>
  );
}
