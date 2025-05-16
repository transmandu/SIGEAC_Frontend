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
  base64Image: string;
}

function ImageDisplayDialog({ base64Image }: Props) {
  return (
    <div className="flex justify-center items-center">
      {base64Image && typeof base64Image === "string" && (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className=" hidden h-8 lg:flex">
              Ver Imagen
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Imagen del Reporte</DialogTitle>
            </DialogHeader>

            <div className="flex justify-center items-center h-full">
              <img
                src={
                  base64Image.startsWith("data:image")
                    ? base64Image
                    : `data:image/jpeg;base64,${base64Image}`
                }
                alt="Imagen completa"
                className="max-w-full max-h-[70vh] object-contain border-4 border-gray-100 shadow-lg rounded-lg"
              />
            </div>

            <div className="flex justify-end mt-4">
              <a
                href={
                  base64Image.startsWith("data:image")
                    ? base64Image
                    : `data:image/jpeg;base64,${base64Image}`
                }
                download="imagen-reporte.jpg"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                Descargar Imagen
              </a>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default ImageDisplayDialog;
