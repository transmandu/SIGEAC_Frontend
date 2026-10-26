"use client";

import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type {
  CompanyLoanAgreement,
  CompanyLoanScope,
} from "@/hooks/ajustes/convenios/types";
import { useGetLoanAudience } from "@/hooks/ajustes/convenios/useGetLoanAudience";
import { AudienceEditor } from "./AudienceEditor";

interface Props {
  agreement: CompanyLoanAgreement;
  scope: CompanyLoanScope;
  companySlug?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** El receptor elige qué personas y departamentos suyos usan un alcance. */
export function LoanAudienceDialog({
  agreement,
  scope,
  companySlug,
  open,
  onOpenChange,
}: Props) {
  const { data, isLoading } = useGetLoanAudience(
    open ? companySlug : undefined,
    agreement.id,
    scope.scope,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex h-[90vh] flex-col overflow-hidden sm:max-w-4xl"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="shrink-0">
          <DialogTitle>{scope.label}</DialogTitle>
          <DialogDescription>
            Elija quién de su empresa puede usarlo en{" "}
            <span className="font-medium text-foreground">
              {agreement.lender_company_name}
            </span>
            ; solo se guardará lo que cambie.
          </DialogDescription>
        </DialogHeader>

        {open &&
          (isLoading || !data ? (
            <Loader2 className="mx-auto my-10 size-5 animate-spin text-muted-foreground" />
          ) : (
            <AudienceEditor
              agreement={agreement}
              scope={scope}
              companySlug={companySlug}
              initial={data}
              onDone={() => onOpenChange(false)}
            />
          ))}
      </DialogContent>
    </Dialog>
  );
}
