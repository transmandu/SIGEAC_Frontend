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
import { useState, useEffect } from "react";
import { CreateCourseForm } from "@/components/forms/aerolinea/sms/CreateCourseForm";
import { useTourContext } from "@/components/tour/TourProvider";
import { cursosCrearSteps } from "@/components/tour/steps/general/cursos/cursos/crear";

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
  const { registerTour, unregisterTour } = useTourContext();

  useEffect(() => {
    if (open) {
      registerTour("cursos-crear", "Crear Cursos", cursosCrearSteps);
      return () => unregisterTour("cursos-crear");
    }
  }, [registerTour, unregisterTour, open]);

  return (
    <>
      <Card className="flex">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => setOpen(true)}
              variant="outline"
              size="sm"
              className="flex items-center justify-center gap-2 h-8 border-dashed"
            >
              {title}
            </Button>
          </DialogTrigger>

          <DialogContent
            className="flex flex-col max-w-2xl m-2"
            data-tour="cursos-create-dialog"
          >
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
