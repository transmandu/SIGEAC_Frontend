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
  FileText,
  Loader2,
  MessageSquare,
  Trash2,
  Truck,
  User,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, type ElementType } from 'react';
import QuoteActions from './_components/QuoteActions';

const statusBadgeCls = (status?: string) => {
  const approved = status === "APROBADO"
  const rejected = status === "RECHAZADA"
  const pending = status === "PENDIENTE"

  return cn(
    "rounded-md border px-2 py-0.5 text-[10px] font-semibold tracking-wide shadow-sm transition-colors duration-150 cursor-default hover:scale-100 hover:translate-y-0 select-none",

    approved &&
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/15 dark:hover:text-emerald-200",

    rejected &&
      "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300 hover:bg-red-500/15 dark:hover:text-red-200",

    pending &&
      "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/15 dark:hover:text-amber-200"
  )
}

const formatQuoteDate = (date?: string | Date | null): string | undefined => {
  if (!date) return undefined;

  const d = typeof date === "string" ? new Date(date) : date;

  const day = format(d, "dd");
  const month = format(d, "MMMM", { locale: es }).toUpperCase();
  const year = format(d, "yyyy");

  return `${day} ${month} ${year}`;
};

function MetaItem({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value?: string | null
  icon?: ElementType
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-medium tracking-wider text-muted-foreground/60 select-none">
        {label}
      </span>
      <span className="text-sm font-medium flex items-center gap-1.5">
        {Icon && <Icon className="size-3.5 text-muted-foreground/50 shrink-0" />}
        {value ?? "—"}
      </span>
    </div>
  )
}

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

  const isApprovePending =
    updateStatusQuote.isPending ||
    createPurchaseOrder.isPending ||
    updateStatusRequisition.isPending;


  return (
    <ContentLayout title="Cotización">
      <div className="flex flex-col gap-6">

        {/* ── Breadcrumb ──────────────────────────────────────────────── */}
        <div className="flex items-center gap-3">
          <BackButton iconOnly tooltip="Volver" variant="secondary" />

          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href={`/${selectedCompany?.slug}/dashboard`}>
                  Inicio
                </BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbSeparator />

              <BreadcrumbItem>
                <BreadcrumbLink href={`/${selectedCompany?.slug}/compras/cotizaciones`}>
                  Cotizaciones
                </BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbSeparator />

              <BreadcrumbItem>
                <BreadcrumbPage>{quote_number}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-2 border-b border-border/60 pb-4">

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">

            {/* Title block */}
            <div className="flex flex-col min-w-0 w-full">

              <div className="flex items-center gap-3 flex-wrap">

                <h1 className="text-2xl md:text-3xl font-semibold tracking-tight min-w-0 break-words">
                  {quote_number}
                </h1>

                <Badge className={statusBadgeCls(data?.status)}>
                  {data?.status}
                </Badge>

              </div>

              <p className="text-sm text-muted-foreground">
                Cotización de Compra
                {data?.requisition_order?.order_number && (
                  <>
                    {" "}derivada de{" "}
                    <span>
                      {data.requisition_order.order_number}
                    </span>
                  </>
                )}
              </p>

              {/* ACTIONS MOBILE */}
              {data && (
                <div className="flex md:hidden justify-center mt-3">
                  <QuoteActions quote={data} />
                </div>
              )}

            </div>

            {/* ACTIONS DESKTOP */}
            {data && (
              <div className="hidden md:flex items-center gap-1.5 shrink-0">
                <QuoteActions quote={data} />
              </div>
            )}

          </div>
        </div>

        {/* ── Meta ────────────────────────────────────────────────────── */}
        <div className="mx-auto w-full max-w-4xl px-4 py-3 rounded-md border border-border/50 bg-muted/20">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-x-4 sm:gap-x-6 md:gap-x-10 gap-y-3 md:gap-y-4 justify-items-center">

            <MetaItem
              label="PROVEEDOR"
              value={data?.vendor?.name?.toUpperCase()}
              icon={Truck}
            />

            <MetaItem
              label="CREADO POR"
              value={data?.created_by?.toUpperCase()}
              icon={User}
            />

            <MetaItem
              label="FECHA DE COTIZACIÓN"
              value={formatQuoteDate(data?.quote_date)}
              icon={CalendarDays}
            />

          </div>
        </div>

        {/* ── CONTEXTO DE LA COTIZACIÓN ───────────────────────────── */}
        <div className="w-full space-y-6">

          {/* GRID PRINCIPAL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* JUSTIFICACIÓN */}
            <div className="relative rounded-xl border border-border/60 bg-gradient-to-b from-muted/30 to-muted/10 p-5 shadow-sm">

              <div className="flex items-center gap-3 mb-3 select-none">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                  JUSTIFICACIÓN DE LA SOLICITUD ORIGEN
                </span>
                <div className="h-px flex-1 bg-border/50" />
              </div>

              <div className="min-h-[100px] flex items-center justify-center">

                {data?.justification?.trim() ? (
                  <p className="w-full indent-5 text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">
                    {data.justification}
                  </p>
                ) : (
                  <div className="flex flex-col items-center gap-1.5 text-muted-foreground/60 select-none">
                    <FileText className="size-4 opacity-60" />
                    <span className="text-[11px] tracking-widest uppercase">
                      SIN JUSTIFICACIÓN
                    </span>
                  </div>
                )}

              </div>
            </div>

            {/* OBSERVACIÓN */}
            <div className="relative rounded-xl border border-border/60 bg-gradient-to-b from-muted/30 to-muted/10 p-5 shadow-sm">

              <div className="flex items-center gap-3 mb-3 select-none">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                  OBSERVACIÓN DE COTIZACIÓN
                </span>
                <div className="h-px flex-1 bg-border/50" />
              </div>

              <div className="min-h-[100px] flex items-center justify-center">

                {data?.observation?.trim() ? (
                  <p className="w-full indent-5 text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">
                    {data.observation}
                  </p>
                ) : (
                  <div className="flex flex-col items-center gap-1.5 text-muted-foreground/60 select-none">
                    <MessageSquare className="size-4 opacity-60" />
                    <span className="text-[11px] tracking-widest uppercase">
                      SIN OBSERVACIONES
                    </span>
                  </div>
                )}

              </div>
            </div>

          </div>
        </div>

        {data && (
          <>

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
