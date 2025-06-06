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
import { useState } from "react";
import { CreateVoluntaryReportForm } from "../forms/CreateVoluntaryReportForm";
import { Analysis, DangerIdentification, VoluntaryReport } from "@/types";
import CreateAnalysisForm from "../forms/CreateAnalysisForm";

interface FormProps {
  id: string | number; // ID AL CUAL SERA ASIGNADO EL ANALISIS, MITIGATION OR IDENTIFICATION
  buttonTitle: string; // TITULO QUE CONTENDRA EL BOTON DEL DIALOG
  name: string; // NOMBRE AL CUAL SERA ASIGNADO EL ANALISIS, MITIGATION OR IDENTIFICATION
  initialData?: Analysis; // DATOS PARA INICIALIZAR CON INFORMACION PREVIA EL FORMULARIO PARA SU EDICION
  isEditing?: boolean; //PARA SABER SI ES UN EDIT O CREACION DE UN NUEVO ANALISIS
}

export default function CreateAnalysesDialog({
  id,
  buttonTitle,
  name,
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
              {buttonTitle}
            </Button>
          </DialogTrigger>

          <DialogContent className="flex flex-col max-w-2xl m-2">
            <DialogHeader>
              <DialogTitle></DialogTitle>
              <DialogDescription></DialogDescription>
            </DialogHeader>

            {isEditing && initialData ? (
              <CreateAnalysisForm
                id={id}
                name={name}
                isEditing={true}
                initialData={initialData}
                onClose={() => setOpen(false)}
              />
            ) : (
              <CreateAnalysisForm
                onClose={() => setOpen(false)}
                name={name}
                id={id}
              />
            )}
          </DialogContent>
        </Dialog>
      </Card>
    </>
  );
}
