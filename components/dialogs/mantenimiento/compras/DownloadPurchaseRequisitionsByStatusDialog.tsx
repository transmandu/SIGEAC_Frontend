"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check, FileDown, Loader2 } from "lucide-react";

import { ActionTriggerButton } from "@/components/misc/ActionTriggerButton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useDownloadPurchaseRequisitionsByStatusPdf } from "@/hooks/mantenimiento/compras/useDownloadPurchaseRequisitionsByStatusPdf";
import { toCalendarPayload } from "@/lib/date";
import { notifyError } from "@/lib/notify-error";

/**
 * Los seis estados del ciclo. A diferencia del reporte de almacén, compras sí
 * descarga las requisiciones cerradas: gestiona el ciclo completo.
 * Debe coincidir con PURCHASE_STATUSES del backend.
 *
 * Los colores son los mismos que identifican cada estado en el resto del
 * módulo (ver STATUS_PILL en AdvanceRequisitionStatusDialog); aquí van sin
 * borde, así que el fondo sube a /15 para sostener el color por sí solo.
 */
const STATUS_OPTIONS = [
  {
    value: "CREATED",
    label: "Creada",
    description: "Registrada, aún no revisada por compras.",
    pill: "bg-slate-500/15 text-slate-700 dark:text-slate-300",
  },
  {
    value: "RECEIVED",
    label: "Recibida",
    description: "Ya un usuario de compras visualizó la solicitud.",
    pill: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  },
  {
    value: "IN_PROGRESS",
    label: "En proceso",
    description: "Se está procesando; no significa que ya esté cotizada.",
    pill: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-300",
  },
  {
    value: "QUOTED",
    label: "Cotizada",
    description: "Con cotización cargada, a la espera de aprobación.",
    pill: "bg-amber-600/15 text-amber-800 dark:text-amber-300",
  },
  {
    value: "APPROVED",
    label: "Aprobada",
    description: "La compra ya fue autorizada.",
    pill: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  },
  {
    value: "REJECTED",
    label: "No aprobada",
    description: "Rechazada; no continuó en el ciclo de compra.",
    pill: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
  },
] as const;

/**
 * El estado con el que abre el diálogo. Es el que cubría el botón anterior
 * ("Generar Reporte PDF" del listado en proceso), así que el caso de siempre
 * sigue estando a un clic y el resto queda disponible.
 */
const DEFAULT_STATUSES = ["IN_PROGRESS"];

type Props = {
  /**
   * Tipo de requisición a incluir. Lo decide la página: cada pantalla de
   * compras lista un tipo. Omitido, el reporte sale con ambos.
   */
  type?: "GENERAL" | "AERONAUTICAL";
};

/**
 * Descarga el reporte "Requisiciones por Estado" del módulo de compras: se
 * eligen los estados a incluir y el PDF lista cada requisición en una línea
 * con sus artículos, cada uno con su etapa en el ciclo de compra.
 */
export function DownloadPurchaseRequisitionsByStatusDialog({ type }: Props) {
  const { selectedCompany, selectedStation } = useCompanyStore();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>(DEFAULT_STATUSES);

  const { mutateAsync: downloadPdf, isPending } =
    useDownloadPurchaseRequisitionsByStatusPdf();

  const toggleStatus = (value: string) => {
    setSelected((current) =>
      current.includes(value)
        ? current.filter((status) => status !== value)
        : [...current, value],
    );
  };

  const allSelected = selected.length === STATUS_OPTIONS.length;

  const handleDownload = async () => {
    if (!selectedCompany?.slug || selected.length === 0) return;

    // El endpoint lleva la estación en la ruta. Se resetea al cambiar de
    // compañía, así que puede faltar sin que el usuario lo note: sin avisar,
    // el botón simplemente no haría nada.
    if (!selectedStation) {
      toast.error("¡Ops! Seleccione una estación para generar el reporte.");
      return;
    }

    try {
      const blob = await downloadPdf({
        company: selectedCompany.slug,
        locationId: selectedStation,
        statuses: selected,
        type,
      });

      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");

      anchor.href = url;
      anchor.download = `requisiciones-por-estado-${(toCalendarPayload(new Date()) ?? "").replace(/-/g, "")}.pdf`;

      // El ancla debe estar en el documento: Firefox ignora el click sobre un
      // elemento suelto y la descarga no ocurre.
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 100);

      toast.success("Reporte de requisiciones generado");
      setOpen(false);
    } catch (error) {
      notifyError(error, {
        action: "generar el reporte de requisiciones por estado",
      });
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        // Al abrir se vuelve al estado por defecto: así una descarga acotada
        // anterior no condiciona la siguiente en silencio.
        if (next) setSelected(DEFAULT_STATUSES);
        setOpen(next);
      }}
    >
      <DialogTrigger asChild>
        <ActionTriggerButton className="px-3">
          <FileDown className="size-4" />
          Generar Reporte PDF
        </ActionTriggerButton>
      </DialogTrigger>

      <FormDialogContent
        className="sm:max-w-120"
        icon={FileDown}
        title="Generar reporte de requisiciones"
        description="Elija los estados a incluir. El PDF lista los artículos de cada requisición con una columna en blanco para cotizar a mano."
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>

            <Button
              onClick={handleDownload}
              disabled={isPending || selected.length === 0}
              className="min-w-35"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Generando…
                </>
              ) : (
                <>
                  <FileDown className="mr-2 size-4" />
                  Descargar PDF
                </>
              )}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs text-muted-foreground tabular-nums">
            {selected.length === 0
              ? "Ningún estado seleccionado"
              : `${selected.length} de ${STATUS_OPTIONS.length} seleccionados`}
          </span>

          <button
            type="button"
            onClick={() =>
              setSelected(
                allSelected ? [] : STATUS_OPTIONS.map((option) => option.value),
              )
            }
            className="text-xs font-medium text-primary hover:underline"
          >
            {allSelected ? "Limpiar" : "Seleccionar todos"}
          </button>
        </div>

        {/* Dos columnas: con seis estados una sola lista obligaba a desplazar
            el diálogo, y la retícula deja ver el ciclo completo de una vez. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[50vh] overflow-y-auto px-1">
          {STATUS_OPTIONS.map((option) => {
            const isSelected = selected.includes(option.value);

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleStatus(option.value)}
                aria-pressed={isSelected}
                /* El contorno va por dentro (ring-inset) y no como borde: así
                   la tarjeta tiene filo sin el trazo duro que endurecía la
                   retícula, y al seleccionar solo cambia de color —la caja no
                   se engrosa ni desplaza el contenido.

                   El relleno por sí solo no bastaba: sobre el fondo claro del
                   diálogo la tarjeta sin contorno desaparecía y su contenido
                   quedaba flotando. */
                className={cn(
                  "group relative flex flex-col gap-1.5 rounded-2xl p-3 text-left",
                  "ring-1 ring-inset transition-colors duration-200",
                  isSelected
                    ? "bg-primary/8 ring-primary/30"
                    : "bg-muted/30 ring-border/70 hover:bg-muted/60 hover:ring-border",
                )}
              >
                <span className="flex items-center justify-between gap-2">
                  {/* Sin borde ni sombra: dentro de la tarjeta la píldora ya
                      está contenida, y el trazo solo sumaba otro filo. El
                      color de fondo basta para identificar el estado. */}
                  <span
                    className={cn(
                      "select-none whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-medium",
                      option.pill,
                    )}
                  >
                    {option.label}
                  </span>

                  {/* El check ocupa su sitio siempre: si apareciera solo al
                      marcar, la píldora se correría en cada clic. */}
                  <span
                    className={cn(
                      "flex size-4 shrink-0 items-center justify-center rounded-full transition-colors",
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-background ring-1 ring-inset ring-muted-foreground/35",
                    )}
                  >
                    {isSelected && <Check className="size-2.5" />}
                  </span>
                </span>

                <span className="text-xs leading-snug text-muted-foreground">
                  {option.description}
                </span>
              </button>
            );
          })}
        </div>
        </div>
      </FormDialogContent>
    </Dialog>
  );
}
