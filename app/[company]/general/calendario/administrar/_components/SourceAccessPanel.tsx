"use client";

import { useMemo } from "react";
import { Radio } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetCalendarEventSources } from "@/hooks/general/calendario/useGetCalendarEventSources";
import { useGetAllCalendarVisibilityRules } from "@/hooks/general/calendario/useGetAllCalendarVisibilityRules";
import { VisibilityRulesEditor } from "./VisibilityRulesEditor";

// AccordionItem trae "border-b" de base (pensado para la lista plana
// original) — misma propiedad que mi borde completo, así que sin !important
// es una moneda al aire cuál gana. Con !border se fuerza siempre.
const ACCORDION_ITEM_CLASS =
  "rounded-xl !border !border-slate-400/40 bg-gradient-to-br from-background/70 to-background/40 backdrop-blur-md shadow-sm dark:!border-slate-600/40";

/**
 * Cumpleaños es la única fuente con un default "allow dentro del árbol
 * propio" — sus reglas son una elevación, no el único portón. El resto es
 * deny por defecto: sin reglas, nadie más que SUPERUSER las ve.
 */
const SOURCE_HINTS: Record<string, string> = {
  employee_birthday:
    "Por defecto, cada quien ya ve los cumpleaños de su propio departamento y su árbol. Las reglas de acá son una EXCEPCIÓN que eleva a ver TODOS los cumpleaños (ej. Presidencia, RRHH).",
  sms_course:
    "Los cursos no se configuran acá: los ve quien esté afiliado a SMS Y esté inscrito en ese curso puntual — no requiere reglas.",
};

interface SourceAccessPanelProps {
  company: string;
}

export function SourceAccessPanel({ company }: SourceAccessPanelProps) {
  const { data: sources = [], isLoading: isLoadingSources } = useGetCalendarEventSources(company);
  const { data: allRules = [], isLoading: isLoadingRules } = useGetAllCalendarVisibilityRules(company);

  const rulesBySource = useMemo(() => {
    const map: Record<string, typeof allRules> = {};
    for (const rule of allRules) {
      if (rule.scope_type !== "SOURCE" || !rule.source_key) continue;
      (map[rule.source_key] ??= []).push(rule);
    }
    return map;
  }, [allRules]);

  if (isLoadingSources) {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-14 w-full rounded-xl" />
        <Skeleton className="h-14 w-full rounded-xl" />
        <Skeleton className="h-14 w-full rounded-xl" />
      </div>
    );
  }

  if (sources.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-400/40 py-10 text-center dark:border-slate-600/40">
        <Radio className="size-6 text-muted-foreground/60" />
        <p className="text-sm text-muted-foreground">No hay fuentes de sistema disponibles en esta empresa.</p>
      </div>
    );
  }

  return (
    <Accordion type="multiple" className="flex flex-col gap-2.5">
      {sources.map((source) => (
        <AccordionItem
          key={source.key}
          value={source.key}
          className={ACCORDION_ITEM_CLASS}
        >
          <AccordionTrigger className="px-4 py-3.5 text-sm font-semibold hover:no-underline [&[data-state=open]]:pb-2">
            <span className="flex items-center gap-2.5">
              <Radio className="size-4 text-primary" />
              {source.label}
            </span>
          </AccordionTrigger>
          {/* AccordionContent trae pt-0 de base — el halo de foco de lo
              primero adentro (el Select) queda pegado al borde superior con
              overflow-hidden (el propio wrapper de Radix, para la animación)
              y se corta. !pt-2 le da margen real. */}
          <AccordionContent className="px-4 pb-4 !pt-2">
            <VisibilityRulesEditor
              company={company}
              subject={{ sourceKey: source.key }}
              rules={rulesBySource[source.key] ?? []}
              isLoading={isLoadingRules}
              hint={SOURCE_HINTS[source.key]}
            />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
