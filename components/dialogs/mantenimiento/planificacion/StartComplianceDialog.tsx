"use client";

import { Loader2, PlayCircle } from "lucide-react";
import { useState } from "react";
import { Control, useForm } from "react-hook-form";

import {
  ComplianceKind,
  useStartCompliance,
} from "@/actions/mantenimiento/planificacion/cumplimientos/lifecycle";
import {
  ComplianceStartFields,
  StartFormValues,
  buildStartSchema,
  startDefaults,
  toStartPayload,
} from "@/components/forms/mantenimiento/planificacion/ComplianceStartFields";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { zodResolver } from "@/lib/zod-resolver";
import { useCompanyStore } from "@/stores/CompanyStore";
import { ComponentAction, MaintenanceCountingMethod } from "@/types";

interface StartComplianceDialogProps {
  kind: ComplianceKind;
  /** Id del ítem (o de la tarea, en aviónica). */
  subjectId: number;
  subjectName: string;
  /** Redacción para la OT; si no se da, se usa el nombre. */
  workOrderDescription?: string;
  aircraftId: number | string;
  /** Unidades de sus intervalos: deciden qué lecturas se piden. */
  units: MaintenanceCountingMethod[];
  /** Contador actual del conjunto (aeronave o parte). */
  defaultHours?: number;
  defaultCycles?: number;
  defaultProviderId?: number | string | null;
  defaultAction?: ComponentAction;
  defaultMethod?: string | null;
}

/**
 * Abre un período de cumplimiento VIGENTE. Sin uno, el ítem no tiene reloj:
 * este es el único camino para volver a darle uno tras cerrar el anterior.
 */
export function StartComplianceDialog({
  kind,
  subjectId,
  subjectName,
  workOrderDescription,
  aircraftId,
  units,
  defaultHours,
  defaultCycles,
  defaultProviderId,
  defaultAction,
  defaultMethod,
}: StartComplianceDialogProps) {
  const [open, setOpen] = useState(false);
  const { selectedCompany } = useCompanyStore();
  const startCompliance = useStartCompliance(kind);

  const defaults = () =>
    startDefaults({
      hours: defaultHours,
      cycles: defaultCycles,
      providerId: defaultProviderId,
      action: defaultAction,
      method: defaultMethod,
    });

  const form = useForm<StartFormValues>({
    resolver: zodResolver(buildStartSchema(units)),
    defaultValues: defaults(),
  });

  const onSubmit = async (values: StartFormValues) => {
    await startCompliance.mutateAsync({
      company: selectedCompany!.slug,
      data: { subjectId, ...toStartPayload(kind, values) },
    });
    form.reset(defaults());
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <PlayCircle className="size-4" />
              <span className="sr-only">Iniciar cumplimiento</span>
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>Iniciar cumplimiento</TooltipContent>
      </Tooltip>

      <DialogContent className="flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-130">
        <DialogHeader className="shrink-0 px-6 pt-6 pb-4">
          <DialogTitle>Iniciar Cumplimiento</DialogTitle>
          <DialogDescription>{subjectName}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6 py-1">
              <ComplianceStartFields
                control={form.control as unknown as Control<any>}
                kind={kind}
                units={units}
                aircraftId={aircraftId}
                subject={subjectName}
                taskDescription={workOrderDescription ?? subjectName}
              />
            </div>

            <div className="shrink-0 border-t bg-background px-6 py-4">
              <Button
                className="h-11 w-full gap-2 rounded-lg bg-linear-to-br from-primary to-primary/85 text-primary-foreground shadow-sm transition-all duration-200 hover:shadow-md hover:shadow-blue-500/25 disabled:opacity-70"
                disabled={startCompliance.isPending}
                type="submit"
              >
                {startCompliance.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <p>Iniciar Cumplimiento</p>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
