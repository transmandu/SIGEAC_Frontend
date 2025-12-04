"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Loader2, FileText, Download } from "lucide-react";
import axiosInstance from "@/lib/axios";

interface Props {
  fileName: string | File | undefined; // Acepta los tres tipos
  triggerElement?: React.ReactNode;
  triggerText?: string;
}

function DocumentDisplayDialog({
  fileName,
  triggerElement,
  triggerText = "Documento",
}: Props) {
  const { selectedCompany } = useCompanyStore();
  const [isOpen, setIsOpen] = useState(false);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const blobUrlRef = useRef<string | null>(null);

  // Función para extraer el nombre de archivo como string
  const getFileNameString = (): string | null => {
    if (!fileName) return null;

    if (typeof fileName === "string") {
      return fileName.trim();
    }

    if (fileName instanceof File) {
      return fileName.name;
    }

    return null;
  };

  // Solo renderizar si tenemos un nombre de archivo válido
  const actualFileName = getFileNameString();
  if (!actualFileName) {
    return null;
  }

  const loadDocument = useCallback(async () => {
    if (!selectedCompany?.slug) {
      setError("Compañía no seleccionada");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const encodedDocumentPath = btoa(actualFileName);

      const documentResponse = await axiosInstance.get(
        `${selectedCompany.slug}/sms/document/${encodedDocumentPath}`,
        {
          responseType: "blob",
          timeout: 30000,
        }
      );

      const blob = new Blob([documentResponse.data], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);

      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }

      blobUrlRef.current = url;
      setDocumentUrl(url);
    } catch (err: any) {
      console.error("Error loading document:", err);
      setError(
        err.response?.status === 404
          ? "Documento no encontrado"
          : "Error al cargar el documento"
      );
      setDocumentUrl(null);
    } finally {
      setIsLoading(false);
    }
  }, [actualFileName, selectedCompany?.slug]);

  useEffect(() => {
    if (isOpen) {
      loadDocument();
    }
  }, [isOpen, loadDocument]);

  useEffect(() => {
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
    };
  }, []);

  const downloadDocument = () => {
    if (!documentUrl) return;

    const link = document.createElement("a");
    link.href = documentUrl;

    // Extraer solo el nombre del archivo sin la ruta para la descarga
    let downloadName = actualFileName;
    if (
      actualFileName &&
      (actualFileName.includes("/") || actualFileName.includes("\\"))
    ) {
      const parts = actualFileName.split(/[\/\\]/);
      downloadName = parts[parts.length - 1];
    }

    link.download = downloadName; // ← Solo aquí usamos el nombre limpio
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {triggerElement || (
          <Button variant="outline" size="sm" className="gap-2 h-8">
            <FileText size={16} />
            {triggerText}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-2">
              <FileText size={20} />
              Documento PDF
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-[calc(85vh-100px)]">
          {isLoading ? (
            <div className="flex flex-col justify-center items-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500 mb-2" />
              <span>Cargando documento...</span>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-full text-red-500">
              <p>{error}</p>
            </div>
          ) : documentUrl ? (
            <>
              <div className="flex-1 overflow-hidden border rounded-lg">
                <iframe
                  src={documentUrl}
                  width="100%"
                  height="100%"
                  className="min-h-[500px]"
                  title={`Documento: ${actualFileName}`}
                />
              </div>
              <div className="flex justify-end mt-4">
                <Button
                  onClick={downloadDocument}
                  className="gap-2"
                  variant="outline"
                >
                  <Download size={16} />
                  Descargar PDF
                </Button>
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
