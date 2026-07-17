'use client';

import { ContentLayout } from '@/components/layout/ContentLayout';
import BackButton from '@/components/misc/BackButton';
import LoadingPage from '@/components/misc/LoadingPage';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { useGetQuoteByQuoteNumber } from '@/hooks/mantenimiento/compras/useGetQuoteByQuoteNumber';
import { useCompanyStore } from '@/stores/CompanyStore';
import { CalendarDays, FileText, MessageSquare, Truck, User } from 'lucide-react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import QuoteActions from './_components/QuoteActions';
import MetaItem from './_components/MetaItem';
import InfoSection from './_components/InfoSection';
import QuoteGeneralArticleCard from './_components/QuoteGeneralArticleCard';
import QuoteOutOfScope from './_components/QuoteOutOfScope';
import { statusBadgeCls, statusLabel, formatQuoteDate } from './_components/utils/uiHelpers';
import { isGeneralQuoteScope } from '@/lib/purchases/quote-scope';

const QuotePage = () => {
  const { selectedCompany } = useCompanyStore();
  const { quote_number } = useParams<{ quote_number: string }>();

  const { data, isLoading, refetch } = useGetQuoteByQuoteNumber(
    selectedCompany?.slug ?? null,
    quote_number
  );

  const generalArticles = data?.general_article_quote_order ?? [];

  const isOutOfScope = !!data && !isGeneralQuoteScope(data);

  // General quotes are placed at retailers (lugares de compra), not vendors.
  // Collect the header retailer plus any per-article retailers so a quote that
  // spans several places lists them all.
  const retailerNames = Array.from(
    new Set(
      [
        data?.retailer?.name,
        ...generalArticles.map((a) => a.retailer?.name),
      ].filter((name): name is string => !!name)
    )
  );

  if (isLoading) return <LoadingPage />;

  if (isOutOfScope) return <QuoteOutOfScope />;

  return (
    <ContentLayout title="Cotización General">
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
                <BreadcrumbLink href={`/${selectedCompany?.slug}/compras/cotizaciones_generales`}>
                  Cotizaciones Generales
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
                  {statusLabel(data?.status)}
                </Badge>

                {data?.parent_quote_order && (
                  <Badge
                    variant="outline"
                    className="border-violet-500/40 bg-violet-500/10 text-violet-700 dark:text-violet-300 text-[10px] font-semibold uppercase tracking-wide"
                  >
                    Complementaria de{' '}
                    <Link
                      href={`/${selectedCompany?.slug}/compras/cotizaciones_generales/${data.parent_quote_order.quote_number}`}
                      className="ml-1 underline underline-offset-2 hover:opacity-80"
                    >
                      {data.parent_quote_order.quote_number}
                    </Link>
                  </Badge>
                )}

              </div>

              <p className="text-sm text-muted-foreground">
                Cotización de Compra General
                {data?.requisition_order?.order_number && (
                  <>
                    {' '}derivada de{' '}
                    <Link
                      href={`/${selectedCompany?.slug}/compras/requisiciones_generales/${data.requisition_order.order_number}`}
                      className="hover:text-foreground hover:underline underline-offset-4 decoration-1 transition-colors"
                    >
                      {data.requisition_order.order_number}
                    </Link>
                  </>
                )}
              </p>

              {/* ACTIONS MOBILE */}
              {data && (
                <div className="flex md:hidden justify-center mt-3">
                  <QuoteActions quote={data} onSuccessUpdate={refetch} />
                </div>
              )}

            </div>

            {/* ACTIONS DESKTOP */}
            {data && (
              <div className="hidden md:flex items-center gap-1.5 shrink-0">
                <QuoteActions quote={data} onSuccessUpdate={refetch} />
              </div>
            )}

          </div>
        </div>

        {/* ── Meta ────────────────────────────────────────────────────── */}
        <div className="mx-auto w-full max-w-4xl px-4 py-3 rounded-md border border-border/50 bg-muted/20">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-x-4 sm:gap-x-6 md:gap-x-10 gap-y-3 md:gap-y-4 justify-items-center">

            {retailerNames.length > 0 && (
              <MetaItem
                label={retailerNames.length > 1 ? 'LUGARES DE COMPRA' : 'LUGAR DE COMPRA'}
                value={retailerNames.join(', ').toUpperCase()}
                icon={Truck}
                clamp
              />
            )}

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
            <InfoSection
              title="JUSTIFICACIÓN DE LA SOLICITUD ORIGEN"
              icon={FileText}
              content={data?.requisition_order?.justification}
              emptyMessage="SIN JUSTIFICACIÓN"
            />

            {/* OBSERVACIÓN */}
            <InfoSection
              title="OBSERVACIÓN DE COTIZACIÓN"
              icon={MessageSquare}
              content={data?.observation}
              emptyMessage="SIN OBSERVACIONES"
            />

            {/* JUSTIFICACIÓN DE LA COMPLEMENTARIA */}
            {data?.parent_quote_order && (
              <InfoSection
                title="JUSTIFICACIÓN DE LA COTIZACIÓN COMPLEMENTARIA"
                icon={FileText}
                content={data?.complementary_justification}
                emptyMessage="SIN JUSTIFICACIÓN"
              />
            )}

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
                {generalArticles.length}
              </span>
            </div>

          </div>

          {/* ===================== GENERAL ===================== */}
          <div className="space-y-2">
            {generalArticles.map((article) => (
              <QuoteGeneralArticleCard
                key={article.id}
                article={article}
              />
            ))}
          </div>

          {/* ── Total general ──────────────────────────────────────── */}
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
