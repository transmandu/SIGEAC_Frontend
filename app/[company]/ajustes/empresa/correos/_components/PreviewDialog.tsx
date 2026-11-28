"use client";

import { useState } from "react";
import { MailCheck, MailX, RefreshCw } from "lucide-react";

import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import { EmptyState } from "@/components/misc/EmptyState";
import {
  SegmentedTabs,
  SegmentedTabsList,
  SegmentedTabsTrigger,
} from "@/components/misc/SegmentedTabs";
import { DialogButton } from "@/components/misc/DialogButton";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useMailAudiencePreview } from "@/hooks/ajustes/correos/useMailRecipientRules";
import { useCompanyStore } from "@/stores/CompanyStore";
import type { MailNotice } from "@/types/mail-recipients";

interface Props {
  notice: MailNotice;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Quién recibiría HOY el aviso en una etapa, resuelto por el servidor con las
 * reglas guardadas: la comprobación de que lo configurado hace lo esperado, sin
 * esperar a que un ítem llegue a la alerta.
 */
export function PreviewDialog({ notice, open, onOpenChange }: Props) {
  const { selectedCompany } = useCompanyStore();
  const [stage, setStage] = useState<string | null>(
    notice.stages[0]?.key ?? null,
  );

  const { data, isPending, isError, refetch } = useMailAudiencePreview({
    company: selectedCompany?.slug,
    notice: notice.key,
    stage,
    enabled: open,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <FormDialogContent
        icon={MailCheck}
        title="Quién recibe hoy"
        description={
          <>
            Destinatarios de{" "}
            <span className="font-medium text-foreground">{notice.label}</span>{" "}
            con las reglas guardadas.
          </>
        }
        lockOutside={false}
        className="sm:max-w-xl"
        footer={
          <DialogButton tone="secondary" onClick={() => onOpenChange(false)}>
            Cerrar
          </DialogButton>
        }
      >
        <div className="space-y-4">
          {notice.stages.length > 0 && (
            <SegmentedTabs value={stage ?? ""} onValueChange={setStage}>
              <SegmentedTabsList size="sm" className="max-sm:flex-col">
                {notice.stages.map((item) => (
                  <SegmentedTabsTrigger key={item.key} value={item.key}>
                    {item.label}
                  </SegmentedTabsTrigger>
                ))}
              </SegmentedTabsList>
            </SegmentedTabs>
          )}

          {isPending ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : isError ? (
            <EmptyState
              icon={MailX}
              tone="error"
              title="No se pudo consultar"
              description="Intente de nuevo en un momento."
              action={
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-1 h-8 gap-2 max-sm:h-10"
                  onClick={() => refetch()}
                >
                  <RefreshCw className="size-3.5" />
                  Reintentar
                </Button>
              }
            />
          ) : data.length === 0 ? (
            <EmptyState
              icon={MailX}
              title="Nadie recibiría este aviso"
              description="No hay reglas activas para esta etapa, o sus destinatarios no tienen correo."
            />
          ) : (
            <ul className="divide-y divide-border/60 rounded-xl border border-slate-200 bg-white dark:border-slate-700/60 dark:bg-slate-900/60">
              {data.map((recipient) => (
                <li key={recipient.email} className="space-y-0.5 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-700 wrap-anywhere dark:text-slate-200">
                    {recipient.name || recipient.email}
                  </p>
                  {recipient.name && (
                    <p className="text-[13px] text-muted-foreground wrap-anywhere">
                      {recipient.email}
                    </p>
                  )}
                  {recipient.instruction && (
                    <p className="line-clamp-3 pt-1 text-[13px] text-slate-600 dark:text-slate-300">
                      {recipient.instruction}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </FormDialogContent>
    </Dialog>
  );
}
