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
import type { CompanyLoanAgreement } from "@/hooks/ajustes/convenios/types";
import { useGetLoanPersonnel } from "@/hooks/ajustes/convenios/useGetLoanPersonnel";

interface Props {
  agreement: CompanyLoanAgreement;
  companySlug?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Detalle de solo lectura: cierra con clic fuera, no hay nada que perder. */
export function LoanPersonnelDialog({
  agreement,
  companySlug,
  open,
  onOpenChange,
}: Props) {
  const { data, isLoading, isError } = useGetLoanPersonnel(
    open ? companySlug : undefined,
    agreement.id,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Personal autorizado</DialogTitle>
          <DialogDescription>
            Personas de{" "}
            <span className="font-medium text-foreground">
              {agreement.borrower_company_name}
            </span>{" "}
            que esa empresa eligió, una a una o por departamento, para actuar en
            los alcances que usted le abrió.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <Loader2 className="mx-auto my-10 size-5 animate-spin text-muted-foreground" />
        ) : isError ? (
          <p className="py-8 text-center text-sm text-destructive">
            No se pudo cargar el personal.
          </p>
        ) : !data || data.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {agreement.borrower_company_name} aún no ha autorizado a nadie.
          </p>
        ) : (
          <ScrollArea className="max-h-96 rounded-xl border border-slate-400/50 dark:border-slate-600/50">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre y apellido</TableHead>
                  <TableHead>DNI</TableHead>
                  <TableHead>Departamento</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Alcances</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((p) => (
                  <TableRow key={p.dni}>
                    <TableCell className="font-medium">
                      {p.first_name} {p.last_name}
                    </TableCell>
                    <TableCell className="tabular-nums">{p.dni}</TableCell>
                    <TableCell>{p.department ?? "—"}</TableCell>
                    <TableCell>{p.job_title ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {p.scopes.join(", ")}
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
