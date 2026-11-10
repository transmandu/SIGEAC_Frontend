"use client";

import type { ReactNode } from "react";
import { MapPin, MessageSquareText, Pencil, Plane } from "lucide-react";

import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import { PanelSection } from "@/components/forms/PanelSection";
import { TagBadge } from "@/components/misc/TagBadge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import {
  AIRCRAFT_STATUS_LABELS,
  AIRCRAFT_STATUS_TONES,
} from "@/lib/airline-aircraft";
import { formatCalendarDate } from "@/lib/date";
import { locationLabel } from "@/lib/locations";
import type { AirlineAircraft } from "@/types";

const Row = ({ label, value }: { label: string; value?: ReactNode }) => (
  <div className="flex items-baseline justify-between gap-4 py-2 max-sm:flex-col max-sm:gap-0.5">
    <dt className="shrink-0 text-[13px] text-muted-foreground">{label}</dt>
    <dd className="min-w-0 text-right text-sm font-medium wrap-anywhere text-foreground max-sm:text-left max-sm:text-base">
      {value || "—"}
    </dd>
  </div>
);

/** Ficha de una aeronave: lo que la tabla no muestra, ordenado por tema. */
export function AircraftDetailDialog({
  aircraft,
  open,
  onOpenChange,
  onEdit,
}: {
  aircraft: AirlineAircraft;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
}) {
  const manufacturer = aircraft.manufacturer;
  const location = aircraft.location ? locationLabel(aircraft.location) : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <FormDialogContent
        icon={Plane}
        title={
          <span className="flex flex-wrap items-center gap-2">
            {aircraft.acronym}
            <TagBadge tone={AIRCRAFT_STATUS_TONES[aircraft.status] ?? "slate"}>
              {AIRCRAFT_STATUS_LABELS[aircraft.status] ?? aircraft.status}
            </TagBadge>
            {aircraft.is_external && <TagBadge tone="amber">Externa</TagBadge>}
          </span>
        }
        description={`${aircraft.brand} ${aircraft.model}`}
        lockOutside={false}
        className="sm:max-w-2xl"
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cerrar
            </Button>
            <Button type="button" onClick={onEdit}>
              <Pencil className="mr-2 size-4" />
              Editar aeronave
            </Button>
          </>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <PanelSection
            icon={Plane}
            title="Aeronave"
            hint="Cómo se identifica."
            compact
          >
            <dl className="divide-y divide-border/60">
              <Row label="Matrícula" value={aircraft.acronym} />
              <Row label="Marca" value={aircraft.brand} />
              <Row label="Modelo" value={aircraft.model} />
              <Row label="Serial" value={aircraft.serial} />
              <Row
                label="Fabricada"
                value={formatCalendarDate(aircraft.fabricant_date, "long", "")}
              />
            </dl>
          </PanelSection>

          <PanelSection
            icon={MapPin}
            title="Propiedad y ubicación"
            hint="De quién es y dónde está."
            compact
          >
            <dl className="divide-y divide-border/60">
              <Row
                label="Tipo"
                value={aircraft.is_external ? "Externa" : "Flota propia"}
              />
              <Row label="Propietario" value={aircraft.owner} />
              <Row
                label="Fabricante"
                value={
                  manufacturer && (
                    <>
                      {manufacturer.name}
                      {manufacturer.description && (
                        <span className="block text-xs font-normal text-muted-foreground">
                          {manufacturer.description}
                        </span>
                      )}
                    </>
                  )
                }
              />
              <Row label="Ubicación" value={location} />
            </dl>
          </PanelSection>

          <PanelSection
            icon={MessageSquareText}
            title="Comentarios"
            compact
            className="md:col-span-2"
          >
            {aircraft.comments ? (
              <p className="text-sm whitespace-pre-wrap wrap-anywhere text-slate-700 dark:text-slate-200 max-sm:text-base">
                {aircraft.comments}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">Sin comentarios.</p>
            )}
          </PanelSection>
        </div>
      </FormDialogContent>
    </Dialog>
  );
}
