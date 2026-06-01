'use client';

import { ContentLayout } from '@/components/layout/ContentLayout';
import BackButton from '@/components/misc/BackButton';
import LoadingPage from '@/components/misc/LoadingPage';
import { Badge } from '@/components/ui/badge';
import { useGetQuoteByQuoteNumber } from '@/hooks/mantenimiento/compras/useGetQuoteByQuoteNumber';
import { cn } from '@/lib/utils';
import { useCompanyStore } from '@/stores/CompanyStore';
import {
  CalendarDays,
  FileText,
  MessageSquare,
  Truck,
  User,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { useParams } from 'next/navigation';
import { type ElementType } from 'react';
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
  const { selectedCompany } = useCompanyStore();
  const { quote_number } = useParams<{ quote_number: string }>();

  const { data, isLoading, refetch } = useGetQuoteByQuoteNumber(
    selectedCompany?.slug ?? null,
    quote_number
  );

  if (isLoading) return <LoadingPage />;

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
                  <QuoteActions quote={data} onSuccessUpdate={refetch}/>
                </div>
              )}

            </div>

            {/* ACTIONS DESKTOP */}
            {data && (
              <div className="hidden md:flex items-center gap-1.5 shrink-0">
                <QuoteActions quote={data} onSuccessUpdate={refetch}/>
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

        {/* ── ARTÍCULOS ───────────────────────────────────────────── */}
        <div className="space-y-4">

        {/* HEADER */}
        <div className="flex items-end justify-between border-b border-border/60 pb-2 select-none">

            <div className="flex flex-col">
            <h2 className="text-xl font-semibold tracking-tight text-foreground/90">
                Artículos Cotizados
            </h2>
            </div>

            <div className="flex items-center gap-2 rounded-md border border-border/50 bg-muted/30 px-2.5 py-1 select-none">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                TOTAL
            </span>

            <span className="text-sm font-semibold tabular-nums">
                {data?.article_quote_order?.length ?? 0}
            </span>
            </div>

        </div>

        {/* LISTA */}
        <div className="space-y-2">

            {data?.article_quote_order?.map((article: any, idx: number) => (
            <div
                key={`${article.article_part_number}-${idx}`}
                className="rounded-lg border border-border/60 bg-background/70 overflow-hidden mx-3"
            >

                {/* HEADER (tipo batch visual fake para consistencia) */}
                <div className="flex items-center justify-between border-b border-border/50 bg-muted/25 px-3 py-1.5">

                <div className="flex items-center gap-2 min-w-0">
                    <span className="truncate text-sm font-medium text-foreground">
                    {article.batch?.name ?? 'SIN LOTE'}
                    </span>
                        {article.batch.category && (
                          <Badge
                            variant="secondary"
                            className="h-4 px-1.5 text-[9px] uppercase tracking-wide text-muted-foreground select-none"
                          >
                            {article.batch.category}
                          </Badge>
                        )}
                </div>

                </div>

                {/* BODY */}
                <div className="px-3 py-3">

                <div className="grid grid-cols-[1fr_auto] gap-5 items-center">

                    {/* IZQUIERDA */}
                    <div className="min-w-0 space-y-2.5">

                    {/* PART NUMBER */}
                    <div className="space-y-1">

                        <span className="text-[10px] leading-none uppercase tracking-wide text-muted-foreground select-none">
                        Part Number
                        </span>

                        <div className="flex items-center gap-2 min-w-0">

                        <span className="shrink-0 text-[10px] px-1.5 py-[2px] rounded bg-teal-500/10 text-teal-700 border border-teal-500/20 font-medium select-none">
                            P/N
                        </span>

                        <div className="w-[300px] text-sm bg-muted/40 border border-border/40 rounded px-2 py-1 truncate">
                            {article.article_part_number || 'N/A'}
                        </div>

                        </div>

                    </div>

                    {/* ALT PART */}
                    <div className="space-y-1">

                        <span className="text-[10px] leading-none uppercase tracking-wide text-muted-foreground select-none">
                        Alternative Part Number
                        </span>

                        <div className="flex items-center gap-2 min-w-0">

                        <span className="shrink-0 text-[10px] px-1.5 py-[2px] rounded bg-slate-500/10 text-slate-600 border border-slate-500/20 font-medium select-none">
                            ALT
                        </span>

                        <div className="w-[300px] text-[11px] border border-dashed border-border/40 rounded px-2 py-1 truncate text-muted-foreground">
                            {article.article_alt_part_number || 'N/A'}
                        </div>

                        </div>

                    </div>

                    </div>

                    {/* DERECHA */}
                    <div className="flex items-start gap-5 shrink-0">

                    {/* CANTIDAD */}
                    <div className="flex flex-col items-start min-w-[55px]">
                        <span className="h-4 text-[10px] uppercase tracking-wide text-muted-foreground select-none mb-2 block">
                        Cantidad
                        </span>

                        <span className="text-sm tabular-nums leading-none block">
                        {article.quantity}
                        </span>
                    </div>

                    {/* UNIDAD */}
                    <div className="flex flex-col items-start min-w-[75px]">
                        <span className="h-4 text-[10px] uppercase tracking-wide text-muted-foreground select-none mb-2 block">
                        Unidad
                        </span>

                        <span className="text-sm text-muted-foreground leading-none block">
                        {article.unit?.label ?? '—'}
                        </span>
                    </div>

                    {/* PRECIO UNITARIO (FALTABA) */}
                    <div className="flex flex-col items-start min-w-[100px]">
                        <span className="h-4 text-[10px] uppercase tracking-wide text-muted-foreground select-none mb-2 block">
                        P. Unitario
                        </span>

                        <span className="text-sm tabular-nums leading-none block">
                        ${Number(article.unit_price).toFixed(2)}
                        </span>
                    </div>

                    {/* TOTAL LINEA (CORRECTO DESDE BACKEND) */}
                    <div className="flex flex-col items-start min-w-[100px]">
                        <span className="h-4 text-[10px] uppercase tracking-wide text-muted-foreground select-none mb-2 block">
                        Total
                        </span>

                        <span className="text-sm font-semibold tabular-nums block">
                        ${Number(article.amount).toFixed(2)}
                        </span>
                    </div>

                    </div>

                </div>

                </div>

            </div>
            ))}

        </div>

        {/* ── Total general ────────────────────────────────────────────────────── */}
        <div className="flex justify-end pt-2 border-t border-border/60">
          <div className="flex items-center justify-between gap-6 rounded-md bg-muted/10 px-4 py-2 border border-border/40 min-w-[200px]">

            <span className="text-[10px] font-medium tracking-wide text-muted-foreground whitespace-nowrap">
              TOTAL GENERAL
            </span>

            <span className="font-mono text-xl font-semibold tabular-nums leading-none">
              ${Number(data?.total).toFixed(2)}
            </span>

          </div>
        </div>

        </div>
      </div>

    </ContentLayout>
  );
};

export default QuotePage;
