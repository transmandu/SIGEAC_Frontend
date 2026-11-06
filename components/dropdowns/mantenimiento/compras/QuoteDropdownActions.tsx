"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanyStore } from "@/stores/CompanyStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import {
  AlertOctagon,
  ClipboardCheck,
  ClipboardX,
  FileCheck2,
  FileDown,
  FileUp,
  MoreHorizontal,
  PackagePlus,
  Trash2,
} from "lucide-react";
import type { Quote } from "@/types/purchase";
import QuoteDropdownDialogs from "@/components/dialogs/mantenimiento/compras/QuoteDropdownDialogs";
import DownloadQuotePdfDialog from "@/components/dialogs/mantenimiento/compras/DownloadQuotePdfDialog";
import SignedQuoteDocumentDialog from "@/components/dialogs/mantenimiento/compras/SignedQuoteDocumentDialog";
import { useCompanyTimezone } from "@/hooks/general/useCompanyTimezone";
import PurchaseOrderMenuLink from "@/components/dropdowns/mantenimiento/compras/PurchaseOrderMenuLink";
import CreateComplementaryQuoteDialog from "@/app/[company]/compras/(general)/cotizaciones_generales/[quote_number]/_components/CreateComplementaryQuoteDialog";
import {
  RowAction,
  RowActionsBar,
  rowActionIconClass,
  rowActionItemClass,
} from "./RowAction";

/**
 * `variant="menu"` es el menú flotante de la fila; `variant="bar"` pone las
 * mismas acciones en una barra delgada de una sola línea (panel lateral).
 */
const QuoteDropdownActions = ({
  quote,
  variant = "menu",
}: {
  quote: Quote;
  variant?: "menu" | "bar";
}) => {
  const { user } = useAuth();
  const { selectedCompany } = useCompanyStore();
  const inBar = variant === "bar";

  const [openDropdown, setOpenDropdown] = useState(false);
  const [openReject, setOpenReject] = useState(false);
  const [openApprove, setOpenApprove] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openCascadeDelete, setOpenCascadeDelete] = useState(false);
  const [openComplementary, setOpenComplementary] = useState(false);
  const [openPdf, setOpenPdf] = useState(false);
  const [openSigned, setOpenSigned] = useState(false);
  const timeZone = useCompanyTimezone();

  const canDelete = quote.status !== "APPROVED";
  const canViewPO = quote.status === "APPROVED";
  const canApproveOrReject = quote.status === "PENDING";
  const isSuperUser = (user?.roles?.map((role) => role.name) || []).includes(
    "SUPERUSER",
  );

  // Cotización complementaria: solo sobre una original APROBADA con
  // artículos generales cotizados. Registra la diferencia entre lo comprado
  // realmente y lo amparado, sin editar los documentos ya pagados.
  const canCreateComplementary =
    quote.status === "APPROVED" &&
    !quote.parent_quote_order &&
    (quote.general_article_quote_order ?? []).some((i) => !i.is_not_quoted);

  const shouldFetchPO = canViewPO && !!selectedCompany?.slug && !!quote.id;

  const run = (action: () => void) => () => {
    setOpenDropdown(false);
    action();
  };

  const actions = (
    <>
      {canApproveOrReject && (
        <RowAction
          inBar={inBar}
          icon={ClipboardCheck}
          tone="text-emerald-600"
          title="Aprobar cotización"
          onSelect={run(() => setOpenApprove(true))}
        />
      )}

      {canApproveOrReject && (
        <RowAction
          inBar={inBar}
          icon={ClipboardX}
          tone="text-orange-600"
          title="Rechazar cotización"
          onSelect={run(() => setOpenReject(true))}
        />
      )}

      <RowAction
        inBar={inBar}
        icon={FileDown}
        tone="text-blue-600"
        title="Descargar formato"
        onSelect={run(() => setOpenPdf(true))}
      />

      <RowAction
        inBar={inBar}
        icon={quote.signed_document ? FileCheck2 : FileUp}
        tone={quote.signed_document ? "text-emerald-600" : "text-slate-600"}
        title={
          quote.signed_document
            ? "Ver / reemplazar documento firmado"
            : "Cargar documento firmado"
        }
        onSelect={run(() => setOpenSigned(true))}
      />

      {canCreateComplementary && (
        <RowAction
          inBar={inBar}
          icon={PackagePlus}
          tone="text-primary"
          title="Crear cotización complementaria"
          onSelect={run(() => setOpenComplementary(true))}
        />
      )}

      {canViewPO && selectedCompany?.slug && (
        <PurchaseOrderMenuLink
          company={selectedCompany.slug}
          quoteId={quote.id}
          enabled={shouldFetchPO}
          itemClassName={rowActionItemClass}
          iconClassName={rowActionIconClass}
          inBar={inBar}
        />
      )}

      {canDelete && (
        <RowAction
          inBar={inBar}
          icon={Trash2}
          tone="text-red-600"
          title="Eliminar cotización"
          onSelect={run(() => setOpenDelete(true))}
        />
      )}

      {isSuperUser && (
        <RowAction
          inBar={inBar}
          icon={AlertOctagon}
          tone="text-red-700"
          title="Eliminar en cascada (SuperUser)"
          onSelect={run(() => setOpenCascadeDelete(true))}
        />
      )}
    </>
  );

  return (
    <TooltipProvider delayDuration={120}>
      <>
        {inBar ? (
          <RowActionsBar>{actions}</RowActionsBar>
        ) : (
          <DropdownMenu open={openDropdown} onOpenChange={setOpenDropdown}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="
                  size-8
                  rounded-xl
                  border border-transparent
                  transition-all duration-200
                  hover:bg-muted/70
                  hover:border-border/50
                  hover:shadow-xs
                  data-[state=open]:bg-muted
                "
              >
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="center"
              sideOffset={3}
              className="
                flex items-center justify-center gap-1.5
                rounded-2xl
                border border-border/50
                bg-background/90
                backdrop-blur-xl
                shadow-xl
                p-1.5
                overflow-visible
                animate-in fade-in zoom-in-95 duration-200
              "
            >
              {actions}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <QuoteDropdownDialogs
          quote={quote}
          openDelete={openDelete}
          setOpenDelete={setOpenDelete}
          openReject={openReject}
          setOpenReject={setOpenReject}
          openApprove={openApprove}
          setOpenApprove={setOpenApprove}
          openCascadeDelete={openCascadeDelete}
          setOpenCascadeDelete={setOpenCascadeDelete}
        />

        <DownloadQuotePdfDialog
          quote={quote}
          open={openPdf}
          onOpenChange={setOpenPdf}
        />
        <SignedQuoteDocumentDialog
          quote={quote}
          open={openSigned}
          onOpenChange={setOpenSigned}
          timeZone={timeZone}
        />

        {selectedCompany?.slug && (
          <CreateComplementaryQuoteDialog
            key={openComplementary ? "open" : "closed"}
            quote={quote}
            company={selectedCompany.slug}
            open={openComplementary}
            onOpenChange={setOpenComplementary}
          />
        )}
      </>
    </TooltipProvider>
  );
};

export default QuoteDropdownActions;
