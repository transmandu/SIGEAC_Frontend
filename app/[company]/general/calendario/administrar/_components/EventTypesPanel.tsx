"use client";

import { useState } from "react";
import { Palette, Pencil, Plus, Trash2 } from "lucide-react";

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
import { useGetCalendarEventTypes } from "@/hooks/general/calendario/useGetCalendarEventTypes";
import { useDeleteCalendarEventType } from "@/actions/general/calendario/actions";
import { CalendarEventType } from "@/types";
import { EventTypeDialog } from "./EventTypeDialog";

interface EventTypesPanelProps {
  company: string;
}

export function EventTypesPanel({ company }: EventTypesPanelProps) {
  const { data: eventTypes = [], isLoading } = useGetCalendarEventTypes(company);
  const { deleteCalendarEventType } = useDeleteCalendarEventType();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CalendarEventType | undefined>();

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
          <Plus className="mr-2 size-4" />
          Nuevo Tipo
        </ActionTriggerButton>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      ) : eventTypes.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-400/40 py-10 text-center dark:border-slate-600/40">
          <Palette className="size-6 text-muted-foreground/60" />
          <p className="text-sm text-muted-foreground">Sin tipos de evento todavía.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {eventTypes.map((type) => (
            <div
              key={type.id}
              className="flex items-center justify-between gap-2 rounded-xl border border-slate-400/40 bg-gradient-to-br from-background/70 to-background/40 p-3.5 backdrop-blur-md shadow-sm dark:border-slate-600/40"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <span
                  className="size-4 shrink-0 rounded-full ring-2 ring-background"
                  style={{ backgroundColor: type.color }}
                />
                <span className="truncate text-sm font-medium">{type.label}</span>
                {type.is_system && (
                  <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    Sistema
                  </span>
                )}
              </div>

              <TooltipProvider disableHoverableContent>
                <div className="flex shrink-0 items-center gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="size-7"
                        onClick={() => {
                          setEditing(type);
                          setDialogOpen(true);
                        }}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Editar</TooltipContent>
                  </Tooltip>

                  {/* Los tipos de sistema no se pueden borrar (el backend lo
                      rechaza) — no se renderiza el botón para no ofrecer una
                      acción que va a fallar. */}
                  {!type.is_system && (
                    <AlertDialog>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <AlertDialogTrigger asChild>
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="size-7 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                        </TooltipTrigger>
                        <TooltipContent>Eliminar</TooltipContent>
                      </Tooltip>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar este tipo de evento?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Los eventos que usen &quot;{type.label}&quot; quedarán sin tipo (y sin su color). Esta
                            acción no se puede deshacer.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => deleteCalendarEventType.mutate({ id: type.id, company })}
                          >
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </TooltipProvider>
            </div>
          ))}
        </div>
      )}

      <EventTypeDialog open={dialogOpen} onOpenChange={setDialogOpen} company={company} eventType={editing} />
    </div>
  );
}
