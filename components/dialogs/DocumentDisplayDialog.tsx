import React from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"; // Ajusta la ruta a tus componentes de diálogo
import { Button } from "@/components/ui/button"; // Ajusta la ruta a tu componente de botón

interface Props {
  base64Document: string;
}

function DocumentDisplayDialog({ base64Document }: Props) {
  return (
    <div className="flex justify-center items-center">
      {base64Document && typeof base64Document === "string" && (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className=" hidden h-8 lg:flex">
              Ver Documento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-6xl  max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Documento del Reporte</DialogTitle>
            </DialogHeader>

            <div className="flex-1 overflow-auto h-full">
              <div className="flex flex-col items-center gap-4 w-full h-full">
                <div className="w-full flex justify-end">
                  <a
                    href={
                      base64Document.startsWith("data:application/pdf")
                        ? base64Document
                        : `data:application/pdf;base64,${base64Document}`
                    }
                    download="reporte-voluntario.pdf"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Descargar PDF
                  </a>
                </div>

                <iframe
                  src={
                    base64Document.startsWith("data:application/pdf")
                      ? base64Document
                      : `data:application/pdf;base64,${base64Document}`
                  }
                  width="100%"
                  height="100%"
                  className="border rounded-md flex-1 min-h-[70vh] w-full"
                  title="Documento PDF"
                />

                <p className="text-sm text-muted-foreground">
                  Documento adjunto
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default DocumentDisplayDialog;
