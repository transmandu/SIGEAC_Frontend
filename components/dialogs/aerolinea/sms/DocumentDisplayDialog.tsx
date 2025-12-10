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
  isPublic?: boolean;
}

function DocumentDisplayDialog({
  fileName,
  isPublic = false,
}: DocumentDisplayDialogProps) {
  const { selectedCompany } = useCompanyStore();
  const [isOpen, setIsOpen] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  const actualFileName = typeof fileName === "string" ? fileName.trim() : null;

  // Hook para documentos privados - siempre se inicializa pero no se ejecuta hasta que se necesite
  const {
    data: privateDocumentUrl,
    isLoading,
    error,
    refetch,
  } = useGetDocument({
    company: selectedCompany?.slug,
    fileName: actualFileName || "",
  });

  // Generar URL para documentos públicos
  const getPublicDocumentUrl = (): string => {
    if (!actualFileName) return "";
    const baseUrl = process.env.NEXT_PUBLIC_DOCUMENT_BASE_URL || "";
    const cleanFileName = actualFileName.startsWith("/")
      ? actualFileName.substring(1)
      : actualFileName;
    console.log("baseUrl", baseUrl + cleanFileName);
    return `${baseUrl}${cleanFileName}`;
  };

  // Refetch cuando se abre para documentos privados
  useEffect(() => {
    if (
      isOpen &&
      !isPublic &&
      actualFileName &&
      selectedCompany?.slug &&
      !hasFetched
    ) {
      refetch();
      setHasFetched(true);
    }

    if (!isOpen) {
      setHasFetched(false);
    }
  }, [
    isOpen,
    isPublic,
    actualFileName,
    selectedCompany?.slug,
    refetch,
    hasFetched,
  ]);

  // Determinar la URL a usar
  const documentUrl = isPublic
    ? getPublicDocumentUrl()
    : isOpen
      ? privateDocumentUrl
      : null;

  const downloadDocument = () => {
    if (!documentUrl || !actualFileName) return;

    const link = document.createElement("a");
    link.href = documentUrl;

    const fileNameParts = actualFileName.split(/[\/\\]/);
    const downloadName = fileNameParts[fileNameParts.length - 1];

    link.download = downloadName.endsWith(".pdf")
      ? downloadName
      : `${downloadName}.pdf`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!actualFileName) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-2"
          title="Ver documento"
        >
          <FileText className="h-4 w-4" />
          Ver
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documento PDF
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 flex flex-col h-[70vh]">
          {!isPublic && isLoading ? (
            <div className="flex flex-col justify-center items-center h-full">
              <Loader2 className="h-10 w-10 animate-spin text-gray-500 mb-4" />
              <span>Cargando documento...</span>
            </div>
          ) : !isPublic && error ? (
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
          ) : documentUrl ? (
            <>
              <div className="relative flex-1 overflow-hidden rounded-lg bg-gray-50 border">
                <iframe
                  src={documentUrl}
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
                    <Download className="h-4 w-4" />
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
