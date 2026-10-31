"use client";

import UpdateCompanyLoanScopesForm from "@/components/forms/ajustes/UpdateCompanyLoanScopesForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { CompanyLoanAgreement } from "@/hooks/ajustes/convenios/types";

interface Props {
  agreement: CompanyLoanAgreement;
  companySlug?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** El otorgante decide qué módulos abre a la empresa del convenio. */
export function CompanyLoanScopesDialog({
  agreement,
  companySlug,
  open,
  onOpenChange,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[90vh] flex-col overflow-hidden sm:max-w-lg"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Configurar alcances</DialogTitle>
          <DialogDescription>
            Qué puede hacer{" "}
            <span className="font-medium text-foreground">
              {agreement.borrower_company_name}
            </span>{" "}
            en su empresa; solo se guardará lo que cambie.
          </DialogDescription>
        </DialogHeader>
        {open && (
          <UpdateCompanyLoanScopesForm
            agreement={agreement}
            companySlug={companySlug}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
