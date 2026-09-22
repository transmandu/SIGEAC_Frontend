// app/bulletins-sms/page.tsx
"use client";

import { useState } from "react";
import { GuestContentLayout } from "@/components/layout/GuestContentLayout";
import { YearPicker } from "@/components/selects/YearPicker";
import { useGetSafetyBulletinsByYear } from "@/hooks/sms/boletin/useGetSafetyBulletinsByYear";
import { useParams } from "next/navigation";
import { Download, FileText, FileWarning, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Image from "next/image";

export default function BulletinsSMSPage() {
  const params = useParams();
  const company = params.company as string;

  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear(),
  );

  const handleYearChange = (year: number | undefined) => {
    if (year !== undefined) {
      setSelectedYear(year);
    }
  };

  const getFullUrl = (documentUrl: string) =>
    documentUrl.startsWith("http")
      ? documentUrl
      : `${process.env.NEXT_PUBLIC_STORAGE_BASE_URL || ""}${documentUrl}`;

  const handleDocumentClick = (documentUrl: string) => {
    window.open(getFullUrl(documentUrl), "_blank", "noopener,noreferrer");
  };

  const handleDownload = (
    documentUrl: string,
    title: string,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation(); // Evitar que se active handleDocumentClick

    const fullUrl = getFullUrl(documentUrl);

    // Crear un enlace temporal
    const link = document.createElement("a");
    link.href = fullUrl;

    // Forzar la descarga agregando el atributo download
    const fileName =
      fullUrl.split("/").pop() || `${title.replace(/\s+/g, "_")}.pdf`;
    link.download = fileName;

    // Configurar para que se abra en una nueva ventana
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    // Simular clic
    document.body.appendChild(link);
    link.click();
    link.remove();
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
      <div className="flex flex-col py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <header className="mb-6 text-center sm:mb-8">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            Boletines de SMS
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base lg:text-lg">
            Acceda a los últimos boletines, directrices y mejores prácticas del
            sistema de gestión de seguridad para la seguridad operativa.
          </p>
        </header>

        {/* Filtro por año */}
        <div className="mb-6 flex justify-center sm:mb-8">
          <div className="w-full max-w-56 space-y-1.5">
            <span className="block text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Año
            </span>
            <YearPicker
              value={selectedYear}
              onValueChange={handleYearChange}
              placeholder="Elige un año"
            />
          </div>
        </div>

        {/* Contenido */}
        {bulletinsLoading ? (
          <div className="flex min-h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : bulletinsError ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 px-4 text-center">
            <FileWarning className="h-10 w-10 text-destructive" />
            <p className="text-sm text-muted-foreground">
              Error al cargar los boletines
            </p>
          </div>
        ) : !bulletinsByYear?.length ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 px-4 text-center">
            <FileWarning className="h-10 w-10 text-muted-foreground/60" />
            <p className="text-base text-muted-foreground sm:text-lg">
              Sin boletines disponibles durante el{" "}
              <span className="font-mono font-semibold tabular-nums text-foreground">
                {selectedYear}
              </span>
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {bulletinsByYear.map((bulletin) => (
              <article
                key={bulletin.id}
                role="button"
                tabIndex={0}
                onClick={() =>
                  bulletin.document && handleDocumentClick(bulletin.document)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" && bulletin.document) {
                    handleDocumentClick(bulletin.document);
                  }
                }}
                className="group flex cursor-pointer flex-col overflow-hidden rounded-lg border border-border/60 bg-card transition-colors hover:border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-border/40 bg-muted/40">
                  {bulletin.image ? (
                    <Image
                      src={`${process.env.NEXT_PUBLIC_STORAGE_BASE_URL}${bulletin.image}`}
                      alt={bulletin.title}
                      fill
                      sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <FileText className="h-8 w-8 text-muted-foreground/40" />
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col gap-2 p-4">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
                    {format(bulletin.date, "MMMM", { locale: es })}
                  </span>
                  <h2 className="text-sm font-semibold leading-snug">
                    {bulletin.title}
                  </h2>
                  <p className="line-clamp-3 text-xs text-muted-foreground sm:text-sm">
                    {bulletin.description}
                  </p>

                  <div className="mt-auto flex items-center justify-between gap-2 border-t border-border/30 pt-3">
                    <span className="font-mono text-xs tabular-nums text-muted-foreground">
                      {format(bulletin.date, "dd MMM yyyy", { locale: es })}
                    </span>
                    <div className="flex shrink-0 items-center gap-1.5">
                      {bulletin.document && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          aria-label="Descargar boletín"
                          onClick={(e) =>
                            handleDownload(
                              bulletin.document!,
                              bulletin.title,
                              e,
                            )
                          }
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        className="h-8 px-3 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (bulletin.document) {
                            handleDocumentClick(bulletin.document);
                          }
                        }}
                      >
                        Ver
                      </Button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </GuestContentLayout>
  );
}
