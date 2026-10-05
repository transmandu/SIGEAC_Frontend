"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGetControlQueueFormats } from "@/hooks/mantenimiento/planificacion/useGetControlQueue";
import axiosInstance from "@/lib/axios";
import { ChevronDown, FileDown, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

/**
 * Descarga de los formatos INAC con los ítems SELECCIONADOS.
 *
 * Solo ofrece los formatos que tienen filas en esa selección: cada formato
 * oficial cubre sus propios controles (el 43-008 los servicios, el 39-001 las
 * AD...), y la bandeja los mezcla.
 *
 * Lo que no valida acá es la coherencia de aeronave/conjunto: eso lo decide el
 * backend al emitir, que es quien conoce la regla de cada hoja, y su mensaje de
 * error dice exactamente qué se mezcló.
 *
 * Los templates definitivos están por definirse: hasta tenerlos, el endpoint
 * devuelve los datos de la hoja en vez del PDF, y acá se descargan como JSON
 * para poder revisar en frío que la selección y el agrupado sean correctos.
 */
export function QueueFormatsMenu({
  company,
  entryIds,
}: {
  company: string;
  entryIds: number[];
}) {
  const [downloading, setDownloading] = useState<string | null>(null);
  const { data, isLoading } = useGetControlQueueFormats(company, entryIds);

  const formats = data?.formats ?? [];

  if (!entryIds.length) return null;

  const download = async (format: string) => {
    setDownloading(format);
    try {
      const { data: payload } = await axiosInstance.get(
        `/${company}/control-queue/format`,
        { params: { format, entry_ids: entryIds } },
      );

      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${format}_${payload.aircraft?.acronym ?? "seleccion"}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error: any) {
      const errors = error?.response?.data?.errors;
      toast.error("No se pudo emitir el formato", {
        description:
          (errors && (Object.values(errors).flat()[0] as string)) ??
          error?.response?.data?.message ??
          "Intente de nuevo.",
      });
      console.log(error);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-full"
          disabled={isLoading || !formats.length}
        >
          {downloading || isLoading ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <FileDown className="mr-2 size-4" />
          )}
          Descargar formato
          <ChevronDown className="ml-auto size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        {formats.map((format) => (
          <DropdownMenuItem
            key={format.format}
            disabled={!!downloading}
            onSelect={(event) => {
              event.preventDefault();
              download(format.format);
            }}
            className="flex-col items-start gap-0.5"
          >
            <span className="font-medium">{format.format}</span>
            <span className="text-xs text-muted-foreground">
              {format.label} · {format.rows} fila(s)
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
