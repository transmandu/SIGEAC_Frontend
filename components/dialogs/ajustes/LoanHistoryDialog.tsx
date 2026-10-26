"use client";

import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  CompanyLoanAgreement,
  LoanHistoryEvent,
} from "@/hooks/ajustes/convenios/types";
import { useGetLoanHistory } from "@/hooks/ajustes/convenios/useGetLoanHistory";

interface Props {
  agreement: CompanyLoanAgreement;
  companySlug?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** `2026-10-26` → `26/10/2026`, sin pasar por Date (no se desplaza de zona). */
const formatDay = (day: string) => day.split("-").reverse().join("/");

const describe = (e: LoanHistoryEvent): string => {
  const scope = e.scope ? `«${e.scope}»` : "";
  const subject = e.subject ?? "";

  switch (e.type) {
    case "agreement_created":
      return "Convenio creado";
    case "agreement_suspended":
      return "Convenio suspendido";
    case "agreement_resumed":
      return "Convenio reanudado";
    case "scope_opened":
      return `Alcance ${scope} abierto`;
    case "scope_closed":
      return `Alcance ${scope} cerrado`;
    case "scope_reopened":
      return `Alcance ${scope} reabierto`;
    case "person_added":
      return `${subject} autorizado en ${scope}`;
    case "person_removed":
      return `${subject} dado de baja de ${scope}`;
    case "department_added":
      return `Departamento ${subject} elegido en ${scope}`;
    case "department_removed":
      return `Departamento ${subject} dado de baja de ${scope}`;
    case "person_excluded":
      return `${subject} excluido de ${scope}`;
    case "exclusion_lifted":
      return `${subject} reincorporado a ${scope}`;
  }
};

/** Detalle de solo lectura: cierra con clic fuera, no hay nada que perder. */
export function LoanHistoryDialog({
  agreement,
  companySlug,
  open,
  onOpenChange,
}: Props) {
  const { data, isLoading, isError } = useGetLoanHistory(
    open ? companySlug : undefined,
    agreement.id,
  );

  const otherName =
    companySlug === agreement.lender_company_slug
      ? agreement.borrower_company_name
      : agreement.lender_company_name;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Historial del convenio</DialogTitle>
          <DialogDescription>
            Todo lo ocurrido en el convenio con{" "}
            <span className="font-medium text-foreground">{otherName}</span>,
            del más reciente al más antiguo.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <Loader2 className="mx-auto my-10 size-5 animate-spin text-muted-foreground" />
        ) : isError ? (
          <p className="py-8 text-center text-sm text-destructive">
            No se pudo cargar el historial.
          </p>
        ) : !data || data.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Aún no hay movimientos.
          </p>
        ) : (
          <ScrollArea className="max-h-96 rounded-xl border border-slate-400/50 dark:border-slate-600/50">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-28">Fecha</TableHead>
                  <TableHead>Qué ocurrió</TableHead>
                  <TableHead className="w-40">Por</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((event, i) => (
                  <TableRow key={`${event.date}-${event.type}-${i}`}>
                    <TableCell className="tabular-nums">
                      {formatDay(event.date)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {describe(event)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {event.by ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
