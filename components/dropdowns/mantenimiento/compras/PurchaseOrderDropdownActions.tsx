"use client";

import { useState } from "react";
import type { PurchaseOrder } from "@/types/purchase";
import { useAuth } from "@/contexts/AuthContext";
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
  MoreHorizontal,
  Receipt,
  Wallet,
} from "lucide-react";
import PurchaseOrderDropdownDialogs from "@/components/dialogs/mantenimiento/compras/PurchaseOrderDropdownDialogs";
import InvoicePreviewDialog from "@/components/dialogs/mantenimiento/compras/InvoicePreviewDialog";
import { useCompanyStore } from "@/stores/CompanyStore";
import { RowAction, RowActionsBar, rowActionMenuClass } from "./RowAction";

/**
 * `variant="menu"` es el menú flotante de la fila; `variant="bar"` pone las
 * mismas acciones en una barra delgada de una sola línea (panel lateral).
 */
const PurchaseOrderDropdownActions = ({
  po,
  variant = "menu",
}: {
  po: PurchaseOrder;
  variant?: "menu" | "bar";
}) => {
  const { user } = useAuth();
  const { selectedCompany } = useCompanyStore();
  const inBar = variant === "bar";

  const [openDropdown, setOpenDropdown] = useState(false);
  const [openApprove, setOpenApprove] = useState(false);
  const [openInvoice, setOpenInvoice] = useState(false);
  const [openCascadeDelete, setOpenCascadeDelete] = useState(false);

  const canPay = po.status === "PENDING";
  const canComplete = po.status === "PAID";
  const canApprove = canPay || canComplete;
  const invoices = po.invoices ?? [];
  const hasInvoice = invoices.length > 0;
  const isSuperUser = (user?.roles?.map((role) => role.name) || []).includes(
    "SUPERUSER",
  );

  // Una orden cerrada y sin facturas no tiene nada que ofrecer: en el panel
  // lateral no se dibuja una barra vacía.
  if (inBar && !canApprove && !hasInvoice && !isSuperUser) return null;

  const run = (action: () => void) => () => {
    setOpenDropdown(false);
    action();
  };

  const actions = (
    <>
      {canApprove && (
        <RowAction
          inBar={inBar}
          icon={canPay ? Wallet : ClipboardCheck}
          tone="text-emerald-600"
          title={canPay ? "Pagar compra" : "Completar compra"}
          onSelect={run(() => setOpenApprove(true))}
        />
      )}

      {hasInvoice && (
        <RowAction
          inBar={inBar}
          icon={Receipt}
          tone="text-amber-600"
          title={invoices.length > 1 ? "Ver facturas" : "Ver factura"}
          onSelect={run(() => setOpenInvoice(true))}
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
                className="size-8 rounded-xl border border-transparent transition-all duration-200 hover:bg-muted/70 hover:border-border/50 hover:shadow-xs data-[state=open]:bg-muted"
              >
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="center"
              sideOffset={3}
              collisionPadding={8}
              className={rowActionMenuClass}
            >
              {actions}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <PurchaseOrderDropdownDialogs
          po={po}
          openApprove={openApprove}
          setOpenApprove={setOpenApprove}
          openCascadeDelete={openCascadeDelete}
          setOpenCascadeDelete={setOpenCascadeDelete}
        />

        {hasInvoice && selectedCompany && (
          <InvoicePreviewDialog
            open={openInvoice}
            onOpenChange={setOpenInvoice}
            invoices={invoices}
            company={selectedCompany.slug}
            orderNumber={po.order_number}
          />
        )}
      </>
    </TooltipProvider>
  );
};

export default PurchaseOrderDropdownActions;
