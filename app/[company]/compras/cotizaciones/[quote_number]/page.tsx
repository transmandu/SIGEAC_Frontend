'use client';

import { useDeleteQuote, useUpdateQuoteStatus } from '@/actions/mantenimiento/compras/cotizaciones/actions';
import { useCreatePurchaseOrder } from '@/actions/mantenimiento/compras/ordenes_compras/actions';
import { useUpdateRequisitionStatus } from '@/actions/mantenimiento/compras/requisiciones/actions';
import { ContentLayout } from '@/components/layout/ContentLayout';
import BackButton from '@/components/misc/BackButton';
import LoadingPage from '@/components/misc/LoadingPage';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useGetPurchaseOrderByQuoteId } from '@/hooks/mantenimiento/compras/useGetPurchaseOrderByQuoteId';
import { useGetQuoteByQuoteNumber } from '@/hooks/mantenimiento/compras/useGetQuoteByQuoteNumber';
import { cn } from '@/lib/utils';
import { useCompanyStore } from '@/stores/CompanyStore';
import {
  AlertCircle,
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  ExternalLink,
  FileText,
  Loader2,
  Trash2,
  Truck,
  User,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

const QuotePage = () => {
  const [openDelete, setOpenDelete] = useState(false);
  const [openApprove, setOpenApprove] = useState(false);

  const { selectedCompany } = useCompanyStore();
  const { user } = useAuth();
  const router = useRouter();
  const { quote_number } = useParams<{ quote_number: string }>();

  const { data, isLoading } = useGetQuoteByQuoteNumber(
    selectedCompany?.slug ?? null,
    quote_number
  );

  const { updateStatusQuote } = useUpdateQuoteStatus();
  const { updateStatusRequisition } = useUpdateRequisitionStatus();
  const { createPurchaseOrder } = useCreatePurchaseOrder();
  const { deleteQuote } = useDeleteQuote();

  const quoteId = data?.id;
  const { data: purchaseOrder, isLoading: loadingPO } = useGetPurchaseOrderByQuoteId({
    company: selectedCompany?.slug ?? null,
    quoteId,
  });

  if (isLoading) return <LoadingPage />;

  const handleDelete = async (id: number) => {
    await deleteQuote.mutateAsync({ id, company: selectedCompany!.slug });
    router.push(`/${selectedCompany!.slug}/compras/cotizaciones`);
  };

  const handleApprove = async (quote: any) => {
    if (!selectedCompany) return;
    try {
      await updateStatusQuote.mutateAsync({
        id: Number(quote.id),
        data: { status: 'APROBADO', updated_by: `${user?.first_name} ${user?.last_name}` },
        company: selectedCompany.slug,
      });
      await createPurchaseOrder.mutateAsync({
        data: {
          status: 'PROCESO',
          justification: quote.justification,
          purchase_date: new Date(),
          sub_total: Number(quote.total),
          total: Number(quote.total),
          vendor_id: Number(quote.vendor.id),
          created_by: `${user?.first_name} ${user?.last_name}`,
          articles_purchase_orders: quote.article_quote_order,
          quote_order_id: Number(quote.id),
        },
        company: selectedCompany.slug,
      });
      await updateStatusRequisition.mutateAsync({
        id: quote.requisition_order.id,
        data: { status: 'APROBADO', updated_by: `${user?.first_name} ${user?.last_name}` },
        company: selectedCompany.slug,
      });
      router.refresh();
    } catch (error) {
      console.error('Error al aprobar:', error);
    }
  };

  const isApproved = data?.status === 'APROBADO';
  const isPending = data?.status === 'PENDIENTE';
  const isRejected = data?.status === 'RECHAZADA';
  const isApprovePending =
    updateStatusQuote.isPending ||
    createPurchaseOrder.isPending ||
    updateStatusRequisition.isPending;

  const statusBadge = isApproved ? (
    <Badge className="text-xs font-medium px-2 py-0.5 border bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800">
      <CheckCircle2 className="size-3 mr-1" /> APROBADO
    </Badge>
  ) : isRejected ? (
    <Badge className="text-xs font-medium px-2 py-0.5 border bg-destructive/10 text-destructive border-destructive/30">
      RECHAZADO
    </Badge>
  ) : (
    <Badge className="text-xs font-medium px-2 py-0.5 border bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800">
      PENDIENTE
    </Badge>
  );

  return (
    <ContentLayout title="Cotización">
      <div className="max-w-7xl mx-auto space-y-5 pb-12">

        {/* ── Cabecera del documento ──────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <BackButton iconOnly tooltip="Volver" variant="secondary" />
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="font-mono text-2xl font-bold tracking-tight">{quote_number}</h1>
                {statusBadge}
              </div>
              {data && (
                <p className="text-xs text-muted-foreground mt-0.5 space-x-2">
                  {data.requisition_order?.order_number && (
                    <span>
                      Req:{' '}
                      <span className="font-mono">{data.requisition_order.order_number}</span>
                    </span>
                  )}
                  {data.quote_date && (
                    <>
                      <span className="text-muted-foreground/40">·</span>
                      <span>
                        {new Date(data.quote_date).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </>
                  )}
                </p>
              )}
            </div>
          </div>

          {data && (
            <div className="flex items-center gap-2 shrink-0">
              {isPending && (
                <Button onClick={() => setOpenApprove(true)}>
                  <CheckCircle2 className="size-4 mr-2" />
                  Aprobar
                </Button>
              )}
              {isApproved && !loadingPO && purchaseOrder?.order_number && (
                <Button
                  variant="outline"
                  onClick={() =>
                    router.push(
                      `/${selectedCompany!.slug}/compras/ordenes_compra/${purchaseOrder.order_number}`
                    )
                  }
                >
                  <ExternalLink className="size-4 mr-2" />
                  Ver Orden de Compra
                </Button>
              )}
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 border-destructive/40 text-destructive hover:bg-destructive/10 hover:border-destructive"
                disabled={isApproved}
                onClick={() => setOpenDelete(true)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          )}
        </div>

        {data && (
          <>
            {/* ── Meta: proveedor / creado por / fecha ───────────────── */}
            <div className="grid grid-cols-3 gap-3">
              <div className="flex items-start gap-2.5 p-3 rounded-lg border border-border/60 bg-muted/20">
                <Truck className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
                    Proveedor
                  </p>
                  <p className="text-sm font-medium mt-0.5">{data.vendor.name}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 p-3 rounded-lg border border-border/60 bg-muted/20">
                <User className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
                    Creado por
                  </p>
                  <p className="text-sm font-medium mt-0.5">{data.created_by}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 p-3 rounded-lg border border-border/60 bg-muted/20">
                <CalendarDays className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
                    Fecha cotización
                  </p>
                  <p className="text-sm font-medium mt-0.5">
                    {new Date(data.quote_date).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* ── Justificación ───────────────────────────────────────── */}
            {data.justification && (
              <div className="flex items-start gap-2.5 p-3 rounded-lg border border-border/60 bg-muted/20">
                <FileText className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70 mb-1">
                    Justificación
                  </p>
                  <p className="text-sm">{data.justification}</p>
                </div>
              </div>
            )}

            {/* ── Artículos ───────────────────────────────────────────── */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Artículos
                </span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {data.article_quote_order.length}{' '}
                  {data.article_quote_order.length === 1 ? 'ítem' : 'ítems'}
                </span>
              </div>

              {/* Cabecera de columnas */}
              <div className="grid grid-cols-[1fr_80px_60px_110px_100px] gap-3 px-3 pb-1.5 border-b border-border/60">
                {['Parte / Alterno', 'Batch', 'Cant.', 'P. Unitario', 'Total'].map((h) => (
                  <span
                    key={h}
                    className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70"
                  >
                    {h}
                  </span>
                ))}
              </div>

              <div className="space-y-0">
                {data.article_quote_order.map((article) => (
                  <div
                    key={article.article_part_number}
                    className="grid grid-cols-[1fr_80px_60px_110px_100px] gap-3 items-start px-3 py-3 border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors"
                  >
                    {/* Identidad de parte */}
                    <div className="space-y-1.5 min-w-0">
                      <div className="font-mono text-sm bg-muted/60 px-2 py-1 rounded border border-border/50 tracking-wide truncate">
                        {article.article_part_number}
                      </div>
                      {article.article_alt_part_number ? (
                        <div className="flex items-center gap-1.5">
                          <span className="shrink-0 text-[10px] font-mono font-semibold text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 px-1.5 py-0.5 rounded tracking-widest select-none">
                            ALT
                          </span>
                          <span className="font-mono text-xs text-muted-foreground truncate">
                            {article.article_alt_part_number}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-mono text-muted-foreground/30 border border-dashed border-border/40 px-1.5 py-0.5 rounded">
                          ALT —
                        </span>
                      )}
                    </div>

                    {/* Batch */}
                    <div className="pt-1">
                      <span className="text-xs text-muted-foreground">{article.batch?.name ?? '—'}</span>
                    </div>

                    {/* Cantidad */}
                    <div className="font-mono text-sm tabular-nums pt-1">
                      {article.quantity}
                      {article.unit && (
                        <span className="text-xs text-muted-foreground ml-1">{article.unit.label}</span>
                      )}
                    </div>

                    {/* Precio unitario */}
                    <div className="font-mono text-sm tabular-nums pt-1">
                      ${Number(article.unit_price).toFixed(2)}
                    </div>

                    {/* Total línea */}
                    <div className="font-mono text-sm tabular-nums font-semibold pt-1">
                      ${(article.quantity * Number(article.unit_price)).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Total ───────────────────────────────────────────────── */}
            <div className="flex justify-end pt-1 border-t border-border/60">
              <div className="flex items-baseline gap-3">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Total
                </span>
                <span className="font-mono text-2xl font-bold tabular-nums">
                  ${Number(data.total).toFixed(2)}
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Dialog: Eliminar ────────────────────────────────────────── */}
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Eliminar cotización</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Esta acción no se puede deshacer. ¿Confirma que desea eliminar la cotización{' '}
              <span className="font-mono font-medium text-foreground">{quote_number}</span>?
            </p>
          </DialogHeader>
          <Separator />
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpenDelete(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleDelete(data!.id)}
              disabled={deleteQuote.isPending}
            >
              {deleteQuote.isPending ? (
                <Loader2 className="animate-spin size-4" />
              ) : (
                <>
                  <Trash2 className="size-4 mr-2" />
                  Eliminar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Dialog: Aprobar ─────────────────────────────────────────── */}
      <Dialog open={openApprove} onOpenChange={setOpenApprove}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader className="pb-3 border-b border-border/60">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-500 shrink-0">
                <ClipboardList className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold leading-tight">
                  Aprobar cotización
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  <span className="font-mono">{quote_number}</span>
                </p>
              </div>
            </div>
          </DialogHeader>

          {data && (
            <div className="space-y-3 py-1">
              {/* Meta */}
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-border/50 bg-muted/20">
                  <Truck className="size-3.5 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Proveedor</p>
                    <p className="text-sm font-medium truncate">{data.vendor.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-border/50 bg-muted/20">
                  <CalendarDays className="size-3.5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Fecha</p>
                    <p className="text-sm font-medium">
                      {new Date(data.quote_date).toLocaleDateString('es-ES', {
                        day: '2-digit', month: 'short', year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Artículos */}
              <div className="space-y-0">
                <div className="grid grid-cols-[1fr_44px_80px_72px] gap-2 px-2 pb-1 border-b border-border/50">
                  {['Parte / Alterno', 'Cant.', 'P. Unit.', 'Total'].map((h) => (
                    <span key={h} className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
                      {h}
                    </span>
                  ))}
                </div>
                <div className="max-h-[200px] overflow-y-auto">
                  {data.article_quote_order.map((article) => (
                    <div
                      key={article.article_part_number}
                      className="grid grid-cols-[1fr_44px_80px_72px] gap-2 items-start px-2 py-2 border-b border-border/20 last:border-0"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="font-mono text-[11px] bg-muted/60 px-1.5 py-0.5 rounded border border-border/40 truncate tracking-wide">
                          {article.article_part_number}
                        </div>
                        {article.article_alt_part_number ? (
                          <div className="flex items-center gap-1">
                            <span className="shrink-0 text-[9px] font-mono font-semibold text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 px-1 py-0.5 rounded tracking-widest select-none">
                              ALT
                            </span>
                            <span className="font-mono text-[11px] text-muted-foreground truncate">
                              {article.article_alt_part_number}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] font-mono text-muted-foreground/30 border border-dashed border-border/30 px-1 py-0.5 rounded">
                            ALT —
                          </span>
                        )}
                      </div>
                      <div className="font-mono text-xs tabular-nums pt-0.5 text-center">{article.quantity}</div>
                      <div className="font-mono text-xs tabular-nums pt-0.5 text-right">${Number(article.unit_price).toFixed(2)}</div>
                      <div className="font-mono text-xs tabular-nums font-semibold pt-0.5 text-right">
                        ${(article.quantity * Number(article.unit_price)).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="flex items-baseline justify-end gap-3 pt-1 border-t border-border/60">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total</span>
                <span className="font-mono text-lg font-bold tabular-nums">${Number(data.total).toFixed(2)}</span>
              </div>

              {/* Avisos */}
              <div className="space-y-1.5">
                <div className="flex items-start gap-2 px-3 py-2 rounded-md border border-border/40 bg-muted/20">
                  <AlertCircle className="size-3.5 text-muted-foreground shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    Se generará una <span className="font-medium text-foreground">orden de compra</span> automáticamente y la requisición quedará marcada como aprobada.
                  </p>
                </div>
                <div className="flex items-start gap-2 px-3 py-2 rounded-md border border-destructive/30 bg-destructive/5">
                  <AlertTriangle className="size-3.5 text-destructive/70 shrink-0 mt-0.5" />
                  <p className="text-xs text-destructive/80">
                    Las demás cotizaciones de la misma requisición serán rechazadas automáticamente.
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 pt-1">
            <Button variant="outline" onClick={() => setOpenApprove(false)}>
              Cancelar
            </Button>
            <Button
              onClick={async () => {
                await handleApprove(data);
                setOpenApprove(false);
              }}
              disabled={isApprovePending}
            >
              {isApprovePending ? (
                <Loader2 className="animate-spin size-4" />
              ) : (
                <>
                  <CheckCircle2 className="size-4 mr-2" />
                  Aprobar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ContentLayout>
  );
};

export default QuotePage;
