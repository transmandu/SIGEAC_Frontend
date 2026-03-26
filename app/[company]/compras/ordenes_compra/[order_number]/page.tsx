'use client';

import { ContentLayout } from '@/components/layout/ContentLayout';
import LoadingPage from '@/components/misc/LoadingPage';
import BackButton from '@/components/misc/BackButton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { CompletePurchaseForm } from '@/components/forms/mantenimiento/compras/CompletePurchaseForm';
import { useGetPurchaseOrder } from '@/hooks/mantenimiento/compras/useGetPurchaseOrder';
import { cn } from '@/lib/utils';
import { useCompanyStore } from '@/stores/CompanyStore';
import {
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  CreditCard,
  FileText,
  MapPin,
  Package,
  Trash2,
  Truck,
  User,
} from 'lucide-react';
import { useParams } from 'next/navigation';
import { useState } from 'react';

const displayValue = (value: string | number | null | undefined, fallback = '—') =>
  value !== null && value !== undefined && value !== '' ? String(value) : fallback;

const CostRow = ({ label, value }: { label: string; value: string | number | null | undefined }) => (
  <div className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="font-mono text-sm tabular-nums">${Number(value || 0).toFixed(2)}</span>
  </div>
);

const PurchaseOrderPage = () => {
  const [openDelete, setOpenDelete] = useState(false);
  const [openComplete, setOpenComplete] = useState(false);
  const { selectedCompany } = useCompanyStore();
  const { order_number } = useParams<{ order_number: string }>();
  const { data, isLoading } = useGetPurchaseOrder(selectedCompany?.slug, order_number);

  if (isLoading) return <LoadingPage />;

  const isPaid = data?.status === 'PAGADO';

  return (
    <ContentLayout title="Orden de Compra">
      <div className="max-w-7xl mx-auto space-y-5 pb-12">

        {/* ── Cabecera del documento ──────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <BackButton iconOnly tooltip="Volver" variant="secondary" />
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="font-mono text-2xl font-bold tracking-tight">
                  {order_number}
                </h1>
                <Badge
                  className={cn(
                    "text-xs font-medium px-2 py-0.5",
                    isPaid
                      ? "bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800"
                      : "bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800"
                  )}
                >
                  {isPaid ? (
                    <><CheckCircle2 className="size-3 mr-1" />PAGADO</>
                  ) : (
                    <><Package className="size-3 mr-1" />EN PROCESO</>
                  )}
                </Badge>
              </div>
              {data && (
                <p className="text-xs text-muted-foreground mt-0.5 space-x-2">
                  {data.requisition_order?.order_number && (
                    <span>Req: <span className="font-mono">{data.requisition_order.order_number}</span></span>
                  )}
                  {data.quote_order?.quote_number && (
                    <>
                      <span className="text-muted-foreground/40">·</span>
                      <span>Cot: <span className="font-mono">{data.quote_order.quote_number}</span></span>
                    </>
                  )}
                  {data.purchase_date && (
                    <>
                      <span className="text-muted-foreground/40">·</span>
                      <span>{new Date(data.purchase_date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </>
                  )}
                </p>
              )}
            </div>
          </div>

          {data && !isPaid && (
            <div className="flex items-center gap-2 shrink-0">
              <Button
                onClick={() => setOpenComplete(true)}
              >
                <ClipboardCheck className="size-4 mr-2" />
                Completar
              </Button>
              <Button
                onClick={() => setOpenDelete(true)}
                variant="outline"
                size="icon"
                className="h-9 w-9 border-destructive/40 text-destructive hover:bg-destructive/10 hover:border-destructive"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          )}
        </div>

        {data && (
          <>
            {/* ── Meta: proveedor / creado por / ubicación ───────────── */}
            <div className="grid grid-cols-3 gap-3">
              <div className="flex items-start gap-2.5 p-3 rounded-lg border border-border/60 bg-muted/20">
                <Truck className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">Proveedor</p>
                  <p className="text-sm font-medium mt-0.5">{displayValue(data.vendor?.name)}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 p-3 rounded-lg border border-border/60 bg-muted/20">
                <User className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">Creado por</p>
                  <p className="text-sm font-medium mt-0.5">{displayValue(data.created_by)}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 p-3 rounded-lg border border-border/60 bg-muted/20">
                <CalendarDays className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">Fecha de compra</p>
                  <p className="text-sm font-medium mt-0.5">
                    {new Date(data.purchase_date).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>

            {/* ── Justificación ───────────────────────────────────────── */}
            {data.justification && (
              <div className="flex items-start gap-2.5 p-3 rounded-lg border border-border/60 bg-muted/20">
                <FileText className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70 mb-1">Justificación</p>
                  <p className="text-sm">{data.justification}</p>
                </div>
              </div>
            )}

            {/* ── Artículos ───────────────────────────────────────────── */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Artículos</span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {data.article_purchase_order.length} {data.article_purchase_order.length === 1 ? 'ítem' : 'ítems'}
                </span>
              </div>

              {/* Cabecera de columnas */}
              <div className="grid grid-cols-[1fr_60px_90px_140px_140px_120px] gap-3 px-3 pb-1.5 border-b border-border/60">
                {['Parte / Alterno', 'Cant.', 'P. Unit.', 'Tracking USA', 'Tracking OCK', 'Ubicación'].map((h) => (
                  <span key={h} className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">{h}</span>
                ))}
              </div>

              <div className="space-y-0">
                {data.article_purchase_order.map((article) => (
                  <div
                    key={article.article_part_number}
                    className="grid grid-cols-[1fr_60px_90px_140px_140px_120px] gap-3 items-start px-3 py-3 border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors"
                  >
                    {/* Identidad de parte */}
                    <div className="space-y-1 min-w-0">
                      <div className="font-mono text-sm bg-muted/60 px-2 py-1 rounded border border-border/50 tracking-wide truncate">
                        {article.article_part_number}
                      </div>
                      {article.article_alt_part_number ? (
                        <div className="flex items-center gap-1.5">
                          <span className="shrink-0 text-[10px] font-mono font-semibold text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 px-1.5 py-0.5 rounded tracking-widest">
                            ALT
                          </span>
                          <span className="font-mono text-xs text-muted-foreground truncate">
                            {article.article_alt_part_number}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono text-muted-foreground/40 border border-dashed border-border/40 px-1.5 py-0.5 rounded">
                            ALT —
                          </span>
                        </div>
                      )}
                      {article.batch?.name && (
                        <span className="text-[10px] text-muted-foreground/60">{article.batch.name}</span>
                      )}
                    </div>

                    {/* Cantidad */}
                    <div className="font-mono text-sm tabular-nums pt-1">
                      {displayValue(article.quantity)}
                      {article.unit && (
                        <span className="text-xs text-muted-foreground ml-1">{article.unit.label}</span>
                      )}
                    </div>

                    {/* Precio unitario */}
                    <div className="font-mono text-sm tabular-nums pt-1">
                      ${Number(article.unit_price || 0).toFixed(2)}
                    </div>

                    {/* Tracking USA */}
                    <div className="pt-1">
                      {article.usa_tracking ? (
                        <span className="font-mono text-xs bg-muted/50 px-2 py-1 rounded border border-border/40 block truncate">
                          {article.usa_tracking}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground/50 italic">Pendiente</span>
                      )}
                    </div>

                    {/* Tracking OCK */}
                    <div className="pt-1">
                      {article.ock_tracking ? (
                        <span className="font-mono text-xs bg-muted/50 px-2 py-1 rounded border border-border/40 block truncate">
                          {article.ock_tracking}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground/50 italic">Pendiente</span>
                      )}
                    </div>

                    {/* Ubicación */}
                    <div className="pt-1">
                      {article.article_location ? (
                        <div className="flex items-start gap-1">
                          <MapPin className="size-3 text-muted-foreground mt-0.5 shrink-0" />
                          <span className="text-xs">{article.article_location}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground/50 italic">Pendiente</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Costos ──────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-4">

              {/* Desglose de costos */}
              <div className="space-y-1">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Desglose de costos</span>
                <div className="p-3 rounded-lg border border-border/60 bg-muted/10 space-y-0">
                  <CostRow label="Subtotal de artículos" value={data.sub_total} />
                  <CostRow label="Tax" value={data.tax} />
                  <CostRow label="Wire Fee" value={data.wire_fee} />
                  <CostRow label="Handling Fee" value={data.handling_fee} />
                  <CostRow label="Envío USA" value={data.usa_shipping} />
                  <CostRow label="Envío OCK21" value={data.ock_shipping} />
                </div>
              </div>

              {/* Total + Pago */}
              <div className="space-y-3">
                {/* Total */}
                <div className="p-3 rounded-lg border border-border/60 bg-muted/10">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total</span>
                    <span className="font-mono text-2xl font-bold tabular-nums">
                      ${Number(data.total || data.sub_total || 0).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Pago */}
                {(data.bank_account || data.card) && (
                  <div className="space-y-1">
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Pago</span>
                    <div className="p-3 rounded-lg border border-border/60 bg-muted/10 space-y-2">
                      {data.bank_account && (
                        <div className="flex items-start gap-2">
                          <Building2 className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs text-muted-foreground">{data.bank_account.bank?.name}</p>
                            <p className="text-sm font-medium">
                              {data.bank_account.name}
                              <span className="font-mono text-xs text-muted-foreground ml-1">
                                ({data.bank_account.account_number})
                              </span>
                            </p>
                          </div>
                        </div>
                      )}
                      {data.card && (
                        <div className="flex items-start gap-2">
                          <CreditCard className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs text-muted-foreground">{data.card.name}</p>
                            <p className="font-mono text-sm">{data.card.card_number}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Dialog: Completar compra ─────────────────────────────────── */}
      {data && (
        <Dialog open={openComplete} onOpenChange={setOpenComplete}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="pb-2 border-b border-border/60">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-500 shrink-0">
                  <ClipboardCheck className="h-4 w-4" />
                </div>
                <div>
                  <DialogTitle className="text-base font-semibold leading-tight">
                    Completar orden de compra
                  </DialogTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    OC <span className="font-mono">{order_number}</span>
                    {' · '}
                    {data.vendor?.name}
                  </p>
                </div>
              </div>
            </DialogHeader>
            <CompletePurchaseForm po={data} onClose={() => setOpenComplete(false)} />
          </DialogContent>
        </Dialog>
      )}

      {/* ── Dialog: Eliminar ────────────────────────────────────────── */}
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              Eliminar orden de compra
            </DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Esta acción no se puede deshacer. ¿Confirma que desea eliminar la OC{' '}
              <span className="font-mono font-medium text-foreground">{order_number}</span>?
            </p>
          </DialogHeader>
          <Separator />
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpenDelete(false)}>
              Cancelar
            </Button>
            <Button variant="destructive">
              <Trash2 className="size-4 mr-2" />
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ContentLayout>
  );
};

export default PurchaseOrderPage;
