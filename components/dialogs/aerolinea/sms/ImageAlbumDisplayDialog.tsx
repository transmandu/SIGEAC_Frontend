"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  FileImage,
  Loader2,
} from "lucide-react";
import { useCompanyStore } from "@/stores/CompanyStore";
import { fetchImage } from "@/hooks/general/archivos/UseGetImage";
import { useQueries } from "@tanstack/react-query";

interface ImageAlbumDisplayDialogProps {
  fileNames: string[];
  triggerText?: string;
  className?: string;
}

function baseName(fileName: string): string {
  const parts = fileName.split(/[\/\\]/);
  const name = parts[parts.length - 1];
  return name.includes(".") ? name : `${name}.jpg`;
}

function ImageAlbumDisplayDialog({
  fileNames,
  triggerText = "Ver imágenes",
  className = "",
}: ImageAlbumDisplayDialogProps) {
  const { selectedCompany } = useCompanyStore();
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const company = selectedCompany?.slug;

  const results = useQueries({
    queries: (fileNames ?? []).map((fileName) => ({
      queryKey: ["image", company, "sms", fileName],
      queryFn: () => fetchImage({ company: company ?? "", origin: "sms", fileName }),
      enabled: isOpen && !!company && !!fileName,
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
      retry: false,
    })),
  });

  const objectUrlsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const nextSet = new Set<string>();
    results.forEach((result) => {
      if (result.data) nextSet.add(result.data);
    });

    objectUrlsRef.current.forEach((url) => {
      if (!nextSet.has(url)) URL.revokeObjectURL(url);
    });

    objectUrlsRef.current = nextSet;
  }, [results]);

  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      objectUrlsRef.current.clear();
    };
  }, []);

  const total = fileNames?.length ?? 0;

  const goTo = (index: number) => {
    if (total === 0) return;
    setCurrentIndex(((index % total) + total) % total);
  };

  const currentFileName = fileNames[currentIndex];
  const currentResult = results[currentIndex];
  const currentUrl = currentResult?.data ?? null;
  const isLoading = currentResult?.isFetching ?? false;
  const hasError = !!currentResult?.error;

  const downloadImage = () => {
    if (!currentUrl || !currentFileName) return;

    const link = document.createElement("a");
    link.href = currentUrl;
    link.download = baseName(currentFileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (open) setCurrentIndex(0);
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`h-8 gap-2 ${className}`}
          title="Ver imágenes"
        >
          <FileImage className="h-4 w-4" />
          {triggerText}
          {total > 0 && (
            <span className="rounded-full bg-muted px-1.5 text-xs font-semibold">
              {total}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-2">
              <FileImage className="h-5 w-5" />
              Imágenes del Control
              {total > 0 && (
                <span className="text-sm font-normal text-muted-foreground">
                  ({currentIndex + 1} / {total})
                </span>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 flex flex-col h-[70vh]">
          {total === 0 ? (
            <div className="flex justify-center items-center h-full text-gray-500">
              No hay imágenes disponibles
            </div>
          ) : (
            <>
              <div className="relative flex-1 overflow-hidden rounded-lg bg-gray-50 border flex items-center justify-center">
                {isLoading && !currentUrl ? (
                  <div className="flex flex-col justify-center items-center gap-3 text-gray-500">
                    <Loader2 className="h-10 w-10 animate-spin" />
                    <span>Cargando imagen...</span>
                  </div>
                ) : hasError && !currentUrl ? (
                  <div className="flex flex-col justify-center items-center text-red-500 gap-3">
                    <p className="text-lg font-medium">Error</p>
                    <p>{currentResult?.error?.message || "Error al cargar la imagen"}</p>
                    <Button
                      variant="outline"
                      onClick={() => currentResult?.refetch()}
                    >
                      Reintentar
                    </Button>
                  </div>
                ) : currentUrl ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={currentUrl}
                      alt={`Imagen: ${currentFileName}`}
                      fill
                      className="object-contain"
                      sizes="90vw"
                      priority={false}
                    />
                  </div>
                ) : (
                  <div className="flex justify-center items-center h-full text-gray-500">
                    No hay imagen disponible
                  </div>
                )}

                {total > 1 && (
                  <>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute left-2 top-1/2 -translate-y-1/2 h-9 w-9"
                      onClick={() => goTo(currentIndex - 1)}
                      title="Anterior"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9"
                      onClick={() => goTo(currentIndex + 1)}
                      title="Siguiente"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </>
                )}
              </div>

              <div className="flex justify-end items-center mt-4 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={downloadImage}
                  disabled={!currentUrl}
                  className="gap-2"
                >
                  <Download size={16} />
                  Descargar
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ImageAlbumDisplayDialog;