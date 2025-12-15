// app/bulletins-sms/page.tsx
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CustomCard } from "@/components/cards/CustomCard";
import { GuestContentLayout } from "@/components/layout/GuestContentLayout";
import { YearPicker } from "@/components/selects/YearPicker";
import { useGetSafetyBulletinsByYear } from "@/hooks/sms/boletin/useGetSafetyBulletinsByYear";
import { useParams } from "next/navigation";
import { Download, FileWarning, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BulletinsSMSPage() {
  const params = useParams();
  const company = params.company as string;

  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [selectedDocumentTitle, setSelectedDocumentTitle] =
    useState<string>("");

  const handleYearChange = (year: number | undefined) => {
    if (year !== undefined) {
      setSelectedYear(year);
    }
  };

  const handleDocumentClick = (documentUrl: string, title: string) => {
    // Verificar si la URL ya tiene el dominio completo
    const isFullUrl = documentUrl.startsWith("http");

    // Construir la URL completa
    const fullUrl = isFullUrl
      ? documentUrl
      : `${process.env.NEXT_PUBLIC_STORAGE_BASE_URL || ""}${documentUrl}`;

    // Agregar parámetros para mejor visualización si es PDF
    const finalUrl = fullUrl.toLowerCase().endsWith(".pdf")
      ? `${fullUrl}#view=FitH&toolbar=0&navpanes=0`
      : fullUrl;

    setSelectedDocument(finalUrl);
    setSelectedDocumentTitle(title);
    console.log("Documento seleccionado:", finalUrl);
  };

  // Función para forzar la descarga del archivo
  const handleDownload = (documentUrl: string, title: string) => {
    // Verificar si la URL ya tiene el dominio completo
    const isFullUrl = documentUrl.startsWith("http");

    // Construir la URL completa
    const fullUrl = isFullUrl
      ? documentUrl
      : `${process.env.NEXT_PUBLIC_STORAGE_BASE_URL || ""}${documentUrl}`;

    // Crear un enlace temporal
    const link = document.createElement("a");
    link.href = fullUrl;

    // Forzar la descarga agregando el atributo download
    // Extraer el nombre del archivo del URL o usar el título del boletín
    const fileName =
      fullUrl.split("/").pop() || `${title.replace(/\s+/g, "_")}.pdf`;
    link.download = fileName;

    // Configurar para que se abra en una nueva ventana
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    // Simular clic
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const {
    data: bulletinsByYear,
    isLoading: bulletinsLoading,
    error: bulletinsError,
  } = useGetSafetyBulletinsByYear({
    company,
    year: selectedYear?.toString() || "",
  });

  return (
    <GuestContentLayout title="Boletines de SMS">
      <div className="flex flex-col container mx-auto py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6 h-[calc(100vh-10rem)]">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Boletines de SMS
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl sm:max-w-3xl mx-auto px-2 sm:px-4">
            Acceda a los últimos boletines, directrices y mejores prácticas del
            sistema de gestión de seguridad para la seguridad operativa.
          </p>
        </div>
        <div className="flex justify-center mb-4">
          <YearPicker
            value={selectedYear}
            onValueChange={handleYearChange}
            placeholder="Elige un año"
            className="w-1/8"
          />
        </div>
        {/* Bulletins Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
          {bulletinsError ? (
            <div className="flex justify-center items-center h-64">
              <p>Error al cargar los boletines</p>
            </div>
          ) : (
            bulletinsByYear &&
            bulletinsByYear.length > 0 &&
            bulletinsByYear?.map((bulletin) => (
              <div
                key={bulletin.id}
                className="cursor-pointer transition-transform duration-200 hover:scale-[1.02] active:scale-95"
                onClick={() =>
                  handleDocumentClick(bulletin.document, bulletin.title)
                }
              >
                <CustomCard
                  imageUrl={bulletin?.image || "images/no_image.png"}
                  imageAlt={bulletin.title}
                  title={bulletin.title}
                  description={bulletin.description}
                  actionLink={{
                    href: "#",
                    label: "Ver",
                    variant: "outline",
                  }}
                  className="h-full"
                  imageClassName="w-full h-32 sm:h-40 lg:h-48 object-cover"
                  titleClassName="text-base sm:text-lg font-semibold"
                  descriptionClassName="text-xs sm:text-sm"
                />
              </div>
            ))
          )}
        </div>
        {bulletinsLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin sm:h-24 sm:w-24 h-12 w-12"></Loader2>
          </div>
        ) : (
          selectedYear &&
          !bulletinsLoading &&
          bulletinsByYear?.length === 0 && (
            <div className="flex text-xl justify-center items-center h-64">
              <FileWarning className="h-12 w-12 pr-4" />
              Sin boletines disponibles durante el {selectedYear}
            </div>
          )
        )}

        {/* Dialog Para el Documento Seleccionado*/}
        <Dialog
          open={!!selectedDocument}
          onOpenChange={(open) => {
            if (!open) setSelectedDocument(null);
          }}
        >
          <DialogContent className="max-w-[90vw] max-h-[80vh] sm:max-w-[65vw] sm:max-h-[80vh] w-full h-full rounded-lg">
            <DialogHeader>
              <DialogTitle className="sm:text-lg text-base font-semibold">
                {selectedDocumentTitle}
              </DialogTitle>
            </DialogHeader>

            <div className="flex-1 min-h-[60vh] h-full">
              {selectedDocument && (
                <iframe
                  src={selectedDocument}
                  className="w-full h-full min-h-[60vh] border-0 rounded-lg"
                  title="Document Preview"
                />
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => {
                  if (selectedDocument) {
                    handleDownload(selectedDocument, selectedDocumentTitle);
                  }
                }}
              >
                <Download className="mr-2 h-4 w-4" />
                Descargar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </GuestContentLayout>
  );
}
