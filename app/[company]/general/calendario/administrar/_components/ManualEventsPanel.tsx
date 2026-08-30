"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarPlus, CalendarX2, Pencil, Trash2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ActionTriggerButton } from "@/components/misc/ActionTriggerButton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useGetManualCalendarEvents } from "@/hooks/general/calendario/useGetManualCalendarEvents";
import { useGetAllCalendarVisibilityRules } from "@/hooks/general/calendario/useGetAllCalendarVisibilityRules";
import { useDeleteCalendarEvent } from "@/actions/general/calendario/actions";
import { ManualCalendarEvent } from "@/types";
import { ManualEventDialog } from "./ManualEventDialog";
import { VisibilityRulesEditor } from "./VisibilityRulesEditor";

// Mismo problema de especificidad que en SourceAccessPanel: AccordionItem
// trae "border-b" de base, se fuerza con !important para el borde completo.
const ACCORDION_ITEM_CLASS =
  "rounded-xl !border !border-slate-400/40 bg-gradient-to-br from-background/70 to-background/40 backdrop-blur-md shadow-sm dark:!border-slate-600/40";

interface ManualEventsPanelProps {
  company: string;
}

export function ManualEventsPanel({ company }: ManualEventsPanelProps) {
  const { data: events = [], isLoading } = useGetManualCalendarEvents(company);
  const { data: allRules = [], isLoading: isLoadingRules } = useGetAllCalendarVisibilityRules(company);
  const { deleteCalendarEvent } = useDeleteCalendarEvent();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ManualCalendarEvent | undefined>();

  const rulesByEvent = useMemo(() => {
    const map: Record<number, typeof allRules> = {};
    for (const rule of allRules) {
      if (rule.scope_type !== "EVENT" || !rule.calendar_event_id) continue;
      (map[rule.calendar_event_id] ??= []).push(rule);
    }
    return map;
  }, [allRules]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <ActionTriggerButton
          type="button"
          onClick={() => {
            setEditing(undefined);
            setDialogOpen(true);
          }}
        >
          <CalendarPlus className="mr-2 size-4" />
          Nuevo Evento
        </ActionTriggerButton>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-400/40 py-10 text-center dark:border-slate-600/40">
          <CalendarX2 className="size-6 text-muted-foreground/60" />
          <p className="text-sm text-muted-foreground">Sin eventos manuales todavía.</p>
        </div>
      ) : (
        <Accordion type="multiple" className="flex flex-col gap-2.5">
          {events.map((event) => (
            <AccordionItem key={event.id} value={String(event.id)} className={ACCORDION_ITEM_CLASS}>
              <div className="flex items-center gap-2 px-4">
                <AccordionTrigger className="flex-1 py-3.5 text-sm font-semibold hover:no-underline [&[data-state=open]]:pb-2">
                  <div className="flex flex-col items-start gap-0.5 text-left">
                    <span className="flex items-center gap-2">
                      <span
                        className="size-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: event.calendar_event_type?.color ?? "hsl(var(--muted-foreground))" }}
                      />
                      {event.title}
                    </span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {format(new Date(event.start_at), "d 'de' MMMM, yyyy — H:mm", { locale: es })}
                    </span>
                  </div>
                </AccordionTrigger>

                <TooltipProvider disableHoverableContent>
                  <div className="flex shrink-0 items-center gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="size-8"
                          onClick={() => {
                            setEditing(event);
                            setDialogOpen(true);
                          }}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Editar</TooltipContent>
                    </Tooltip>
                    {/* Eliminar el evento se lleva por cascada sus reglas de
                        visibilidad: se confirma antes. */}
                    <AlertDialog>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <AlertDialogTrigger asChild>
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="size-8 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                        </TooltipTrigger>
                        <TooltipContent>Eliminar</TooltipContent>
                      </Tooltip>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar este evento?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Se eliminará &quot;{event.title}&quot; junto con sus reglas de visibilidad. Esta acción no
                            se puede deshacer.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => deleteCalendarEvent.mutate({ id: event.id, company })}
                          >
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TooltipProvider>
              </div>

              {/* !pt-2: sin esto el halo de foco del primer Select queda
                  pegado al overflow-hidden del wrapper de Radix y se corta. */}
              <AccordionContent className="px-4 pb-4 !pt-2">
                <p className="mb-2 text-xs font-medium text-muted-foreground">Quién lo ve</p>
                <VisibilityRulesEditor
                  company={company}
                  subject={{ calendarEventId: event.id }}
                  rules={rulesByEvent[event.id] ?? []}
                  isLoading={isLoadingRules}
                  hint="Sin ninguna regla acá, este evento es visible para todos."
                />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      <ManualEventDialog open={dialogOpen} onOpenChange={setDialogOpen} company={company} event={editing} />
    </div>
  );
}
