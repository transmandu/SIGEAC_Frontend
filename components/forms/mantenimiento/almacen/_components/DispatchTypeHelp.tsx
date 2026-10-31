"use client";

import { CircleHelp } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const DESCRIPTIONS = {
  aircraft: {
    label: "Aeronave",
    text: "El material se instala o consume en una aeronave, identificada por su matrícula. Lleva orden de trabajo.",
  },
  department: {
    label: "Departamento",
    text: "Uso interno: lo retira personal de esta empresa para un departamento propio. No lleva orden de trabajo.",
  },
  other_company: {
    label: "Otra empresa",
    text: "Lo retira una persona de otra empresa con convenio vigente, y se atribuye a esta o a esa empresa. No lleva orden de trabajo.",
  },
  location: {
    label: "Otra sede",
    text: "Traslado a otra sede de esta empresa. Queda en tránsito hasta que allá confirmen la recepción.",
  },
  third_party: {
    label: "Terceros",
    text: "Salida a una persona o entidad externa registrada como tercero, sin convenio con la empresa.",
  },
} as const;

export type DispatchTypeKey = keyof typeof DESCRIPTIONS;

/**
 * Icono de ayuda junto a las pestañas de "Tipo de Despacho": al pasar el
 * cursor explica para qué sirve la pestaña activa, para que no se confundan
 * los fines de cada una.
 */
export function DispatchTypeHelp({ current }: { current?: string }) {
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label="Qué significa cada tipo de despacho"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <CircleHelp className="size-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="end" className="w-72 p-3">
          {current && current in DESCRIPTIONS && (
            <p className="text-xs leading-snug">
              <span className="font-semibold">
                {DESCRIPTIONS[current as DispatchTypeKey].label}:{" "}
              </span>
              {DESCRIPTIONS[current as DispatchTypeKey].text}
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
