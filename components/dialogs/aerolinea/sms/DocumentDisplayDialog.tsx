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
import { FileText, Loader2, Download } from "lucide-react";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useGetDocument } from "@/hooks/general/archivos/useGetDocument";

interface DocumentDisplayDialogProps {
  fileName: string;
  triggerElement?: React.ReactNode;
  triggerText?: string;
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

function DocumentDisplayDialog({
  fileName,
  triggerElement,
  triggerText = "Documento",
  className = "",
  variant = "outline",
  size = "sm",
}: DocumentDisplayDialogProps) {
  const { selectedCompany } = useCompanyStore();
  const [isOpen, setIsOpen] = useState(false);
  const [localDocumentUrl, setLocalDocumentUrl] = useState<string | null>(null);

  // Función para extraer el nombre de archivo como string
  const getFileNameString = (): string | null => {
    if (!fileName) return null;

    if (typeof fileName === "string") {
      return fileName.trim();
    }
    return null;
  };

  const actualFileName = getFileNameString();

  const {
    data: documentUrl,
    isLoading,
    error,
    refetch,
  } = useGetDocument({
    company: selectedCompany?.slug,
    fileName: actualFileName || "",
  });

  // Cuando se abre el diálogo, activamos la query
  useEffect(() => {
    if (isOpen && selectedCompany?.slug && actualFileName) {
      refetch();
    }
  }, [isOpen, selectedCompany?.slug, actualFileName, refetch]);

  // Manejar la URL local para cleanup
  useEffect(() => {
    if (documentUrl) {
      // Limpiar URL anterior si existe
      if (localDocumentUrl && localDocumentUrl !== documentUrl) {
        URL.revokeObjectURL(localDocumentUrl);
      }
      setLocalDocumentUrl(documentUrl);
    }
  }, [documentUrl]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (localDocumentUrl) {
        URL.revokeObjectURL(localDocumentUrl);
      }
    };
  }, [localDocumentUrl]);

  const downloadDocument = () => {
    if (!localDocumentUrl || !actualFileName) return;

    const link = document.createElement("a");
    link.href = localDocumentUrl;

    // Extraer solo el nombre del archivo sin la ruta
    let downloadName = actualFileName;
    if (actualFileName.includes("/") || actualFileName.includes("\\")) {
      const parts = actualFileName.split(/[\/\\]/);
      downloadName = parts[parts.length - 1];
    }

    // Asegurar extensión PDF si no la tiene
    if (!downloadName.toLowerCase().endsWith(".pdf")) {
      downloadName = `${downloadName}.pdf`;
    }

    link.download = downloadName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const defaultTrigger = (
    <Button variant={variant} size={size} className={`gap-2 ${className}`}>
      <FileText size={16} />
      {triggerText}
    </Button>
  );

  // Solo renderizar si tenemos un nombre de archivo válido
  if (!actualFileName) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{triggerElement || defaultTrigger}</DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-2">
              <FileText size={20} />
              Documento PDF
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 flex flex-col h-[70vh]">
          {isLoading ? (
            <div className="flex flex-col justify-center items-center h-full">
              <Loader2 className="h-10 w-10 animate-spin text-gray-500 mb-4" />
              <span>Cargando documento...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col justify-center items-center h-full text-red-500">
              <p className="text-lg font-medium mb-2">Error</p>
              <p>
                {error.message.includes("404")
                  ? "Documento no encontrado"
                  : "Error al cargar el documento"}
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => refetch()}
              >
                Reintentar
              </Button>
            </div>
          ) : localDocumentUrl ? (
            <>
              <div className="relative flex-1 overflow-hidden rounded-lg bg-gray-50 border">
                <iframe
                  src={localDocumentUrl}
                  width="100%"
                  height="100%"
                  className="min-h-[500px]"
                  title={`Documento: ${actualFileName}`}
                />
              </div>

              <div className="flex justify-end items-center mt-4 pt-4 border-t">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={downloadDocument}
                    className="gap-2"
                  >
                    <Download size={16} />
                    Descargar PDF
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex justify-center items-center h-full text-gray-500">
              No hay documento disponible
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default DocumentDisplayDialog;
