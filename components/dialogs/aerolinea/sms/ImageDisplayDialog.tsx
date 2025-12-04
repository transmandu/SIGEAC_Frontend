"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { FileImage, Loader2, Download } from "lucide-react";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useGetImage } from "@/hooks/sms/UseGetImage";

interface ImageDisplayDialogProps {
  fileName: string;
  triggerElement?: React.ReactNode;
  triggerText?: string;
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

function ImageDisplayDialog({
  fileName,
  triggerElement,
  triggerText = "Imagen",
  className = "",
  variant = "outline",
  size = "sm",
}: ImageDisplayDialogProps) {
  const { selectedCompany } = useCompanyStore();
  const [isOpen, setIsOpen] = useState(false);
  const [localImageUrl, setLocalImageUrl] = useState<string | null>(null);

  const {
    data: imageUrl,
    isLoading,
    error,
    refetch,
  } = useGetImage({
    company: selectedCompany?.slug,
    origin: "sms",
    fileName,
  });

  // Cuando se abre el diálogo, activamos la query
  useEffect(() => {
    if (isOpen && selectedCompany?.slug && fileName) {
      refetch();
    }
  }, [isOpen, selectedCompany?.slug, fileName, refetch]);

  // Manejar la URL local para cleanup
  useEffect(() => {
    if (imageUrl) {
      // Limpiar URL anterior si existe
      if (localImageUrl && localImageUrl !== imageUrl) {
        URL.revokeObjectURL(localImageUrl);
      }
      setLocalImageUrl(imageUrl);
    }
  }, [imageUrl]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (localImageUrl) {
        URL.revokeObjectURL(localImageUrl);
      }
    };
  }, [localImageUrl]);

  const downloadImage = () => {
    if (!localImageUrl) return;

    const link = document.createElement("a");
    link.href = localImageUrl;

    // Extraer solo el nombre del archivo sin la ruta
    let downloadName = fileName;
    if (fileName.includes("/") || fileName.includes("\\")) {
      const parts = fileName.split(/[\/\\]/);
      downloadName = parts[parts.length - 1];
    }

    // Asegurar extensión
    if (!downloadName.includes(".")) {
      downloadName = `${downloadName}.jpg`;
    }

    link.download = downloadName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const defaultTrigger = (
    <Button variant={variant} size={size} className={`gap-2 ${className}`}>
      <FileImage size={16} />
      {triggerText}
    </Button>
  );

  const loading = isLoading;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{triggerElement || defaultTrigger}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Imagen del Reporte</DialogTitle>
        </DialogHeader>

        <div className="mt-4 flex flex-col h-[70vh]">
          {loading ? (
            <div className="flex flex-col justify-center items-center h-full">
              <Loader2 className="h-10 w-10 animate-spin text-gray-500 mb-4" />
              <span>Cargando imagen...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col justify-center items-center h-full text-red-500">
              <p className="text-lg font-medium mb-2">Error</p>
              <p>{error.message || "Error al cargar la imagen"}</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => refetch()}
              >
                Reintentar
              </Button>
            </div>
          ) : localImageUrl ? (
            <>
              <div className="relative flex-1 overflow-hidden rounded-lg bg-gray-50">
                <Image
                  src={localImageUrl}
                  alt={`Imagen: ${fileName}`}
                  fill
                  className="object-contain"
                  sizes="90vw"
                  priority={false}
                />
              </div>

              <div className="flex justify-end items-center mt-4 pt-4 border-t">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={downloadImage}
                    className="gap-2"
                  >
                    <Download size={16} />
                    Descargar
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex justify-center items-center h-full text-gray-500">
              No hay imagen disponible
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ImageDisplayDialog;
