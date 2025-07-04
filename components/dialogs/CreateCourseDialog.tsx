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
import { Course } from "@/types";
import { useState } from "react";
import { CreateCourseForm } from "../forms/aerolinea/sms/CreateCourseForm";

interface FormProps {
  title: string;
  initialData?: Course;
  isEditing?: boolean;
}

export default function CreateCourseDialog({
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

          <DialogContent className="flex flex-col max-w-2xl m-2">
            <DialogHeader>
              <DialogTitle></DialogTitle>
              <DialogDescription></DialogDescription>
            </DialogHeader>

            {isEditing && initialData ? (
              <CreateCourseForm
                isEditing={true}
                initialData={initialData}
                onClose={() => setOpen(false)}
              />
            ) : (
              <CreateCourseForm onClose={() => setOpen(false)} />
            )}
          </DialogContent>
        </Dialog>
      </Card>
    </>
  );
}
