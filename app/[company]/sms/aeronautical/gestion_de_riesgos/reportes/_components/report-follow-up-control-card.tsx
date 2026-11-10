"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, FileText } from "lucide-react";
import Image from "next/image";

import { FileServer } from "@/components/misc/FileServer";
import { Button } from "@/components/ui/button";

import {
  buildControlDetails,
  formatDisplayDate,
} from "./report-detail-helpers";
import { ReportDataGrid } from "./report-data-grid";
import { FollowUpControlLike } from "./report-detail-types";

type ReportFollowUpControlCardProps = {
  company: string;
  control: FollowUpControlLike;
  controlIndex: number;
};

export function ReportFollowUpControlCard({
  company,
  control,
  controlIndex,
}: ReportFollowUpControlCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const imagePath = control.image;

  return (
    <div className="py-3 first:pt-0 last:pb-0">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        aria-expanded={isOpen}
        className="flex w-full items-start justify-between gap-3 text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden"
      >
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-sm font-medium">
              Control {controlIndex + 1}
            </span>
            {control.date ? (
              <span className="text-xs text-muted-foreground">
                {formatDisplayDate(control.date)}
              </span>
            ) : null}
          </div>

          <p className="line-clamp-2 text-sm text-muted-foreground">
            {control.description || "Control de seguimiento sin descripción"}
          </p>
        </div>

        {isOpen ? (
          <ChevronUp className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
        )}
      </button>

      {isOpen ? (
        <div className="mt-3 space-y-3 border-t pt-3">
          <ReportDataGrid
            items={buildControlDetails(control)}
            className="sm:grid-cols-2 xl:grid-cols-2"
          />

          {imagePath ? (
            <FileServer path={imagePath} company={company} type="file">
              {(url, isLoading, hasError) => (
                <div className="space-y-2">
                  <p className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                    Imagen del control
                  </p>

                  {isLoading ? (
                    <p className="text-sm text-muted-foreground">
                      Cargando imagen…
                    </p>
                  ) : null}

                  {hasError ? (
                    <p className="text-sm text-destructive">
                      Error al cargar la imagen
                    </p>
                  ) : null}

                  {!isLoading && !hasError && url ? (
                    <div className="space-y-2">
                      <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="block overflow-hidden rounded-md border bg-muted/30"
                      >
                        <div className="relative h-56 w-full">
                          <Image
                            src={url}
                            alt={`Imagen del control ${controlIndex + 1}`}
                            fill
                            className="object-contain"
                            unoptimized
                          />
                        </div>
                      </a>

                      <Button asChild variant="outline" size="sm">
                        <a href={url} target="_blank" rel="noreferrer">
                          Abrir imagen
                        </a>
                      </Button>
                    </div>
                  ) : null}
                </div>
              )}
            </FileServer>
          ) : null}

          {control.document ? (
            <FileServer path={control.document} company={company} type="file">
              {(url, isLoading, hasError) => (
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    Documento del control
                  </span>

                  {isLoading ? (
                    <span className="text-xs text-muted-foreground">
                      Cargando…
                    </span>
                  ) : hasError ? (
                    <span className="text-xs text-destructive">
                      Error al cargar
                    </span>
                  ) : url ? (
                    <Button asChild variant="outline" size="sm">
                      <a href={url} target="_blank" rel="noreferrer">
                        Abrir documento
                      </a>
                    </Button>
                  ) : null}
                </div>
              )}
            </FileServer>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
