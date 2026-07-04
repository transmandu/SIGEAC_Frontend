'use client';

import { ContentLayout } from '@/components/layout/ContentLayout';
import BackButton from '@/components/misc/BackButton';
import LoadingPage from '@/components/misc/LoadingPage';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGetPurchaseOrder } from '@/hooks/mantenimiento/compras/useGetPurchaseOrder';
import { useCompanyStore } from '@/stores/CompanyStore';
import { CalendarDays, FileText, Ship, Truck, User } from 'lucide-react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import PurchaseOrderActions from './_components/PurchaseOrderActions';
import MetaItem from './_components/MetaItem';
import InfoSection from './_components/InfoSection';
import PurchaseOrderArticleCard from './_components/PurchaseOrderArticleCard';
import PurchaseOrderGeneralArticleCard from './_components/PurchaseOrderGeneralArticleCard';
import PurchaseOrderCostSummary from './_components/PurchaseOrderCostSummary';
import { statusBadgeCls, statusLabel, formatPurchaseDate } from './_components/utils/uiHelpers';
import { isAeronauticalPurchaseOrder } from '@/lib/purchases/purchase-order-scope';

const PurchaseOrderPage = () => {
  const { selectedCompany } = useCompanyStore();
  const { order_number } = useParams<{ order_number: string }>();

  const { data, isLoading } = useGetPurchaseOrder(selectedCompany?.slug, order_number);

  const articles = data?.article_purchase_order ?? [];
  const generalArticles = data?.general_article_purchase_order ?? [];

  if (isLoading) return <LoadingPage />;

  return (
    <ContentLayout title="Orden de Compra General">
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
                <BreadcrumbLink href={`/${selectedCompany?.slug}/compras/ordenes_compra_generales`}>
                  Órdenes de Compra Generales
                </BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbSeparator />

              <BreadcrumbItem>
                <BreadcrumbPage>{order_number}</BreadcrumbPage>
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
                  {order_number}
                </h1>

                <Badge className={statusBadgeCls(data?.status)}>
                  {statusLabel(data?.status)}
                </Badge>

              </div>

              <p className="text-sm text-muted-foreground">
                Orden de Compra General
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
                  <PurchaseOrderActions po={data} />
                </div>
              )}

            </div>

            {/* ACTIONS DESKTOP */}
            {data && (
              <div className="hidden md:flex items-center gap-1.5 shrink-0">
                <PurchaseOrderActions po={data} />
              </div>
            )}

          </div>
        </div>

        {/* ── Meta ────────────────────────────────────────────────────── */}
        <div className="mx-auto w-full max-w-4xl px-4 py-3 rounded-md border border-border/50 bg-muted/20">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-x-4 sm:gap-x-6 md:gap-x-10 gap-y-3 md:gap-y-4 justify-items-center">

            <MetaItem
              label="PROVEEDOR"
              value={data?.vendor?.name}
              icon={Truck}
            />

            <MetaItem
              label="CREADO POR"
              value={data?.created_by?.toUpperCase()}
              icon={User}
            />

            <MetaItem
              label="FECHA DE COMPRA"
              value={formatPurchaseDate(data?.purchase_date)}
              icon={CalendarDays}
            />

            {data?.shipping_agency?.name && (
              <MetaItem
                label="AGENCIA DE ENVÍO"
                value={data.shipping_agency.name}
                icon={Ship}
              />
            )}

          </div>
        </div>

        {/* ── CONTEXTO DE LA ORDEN ───────────────────────────────────── */}
        <div className="w-full">

          {/* JUSTIFICACIÓN */}
          <InfoSection
            title="JUSTIFICACIÓN DE LA SOLICITUD ORIGEN"
            icon={FileText}
            content={data?.justification}
            emptyMessage="SIN JUSTIFICACIÓN"
            compact
          />

        </div>

        {/* ── ARTÍCULOS ───────────────────────────────────────────── */}
        <div className="space-y-4">

          {/* HEADER */}
          <div className="flex items-end justify-between border-b border-border/60 pb-2 select-none">

            <div className="flex flex-col">
              <h2 className="text-xl font-semibold tracking-tight text-foreground/90">
                Artículos de la Orden
              </h2>
            </div>

            <div className="flex items-center gap-2 rounded-md border border-border/50 bg-muted/30 px-2.5 py-1 select-none">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                TOTAL
              </span>

              <span className="text-sm font-semibold tabular-nums">
                {articles.length + generalArticles.length}
              </span>
            </div>

          </div>

          {/* Grid de artículos: 2 por fila, scroll a partir de la 2da fila */}
          <ScrollArea className={(articles.length + generalArticles.length) > 2 ? 'h-[300px]' : ''}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-3">

              {/* ===================== BATCH ===================== */}
              {articles.map((article) => (
                <PurchaseOrderArticleCard
                  key={article.id}
                  article={article}
                />
              ))}

              {/* ===================== GENERAL ===================== */}
              {generalArticles.map((article) => (
                <PurchaseOrderGeneralArticleCard
                  key={article.id}
                  article={article}
                />
              ))}

            </div>
          </ScrollArea>

        </div>

        {/* ── Desglose de costos + Total general ─────────────────── */}
        <PurchaseOrderCostSummary
          costs={{
            sub_total: data?.sub_total,
            tax: data?.tax,
            wire_fee: data?.wire_fee,
            handling_fee: data?.handling_fee,
            international_shipping: data?.international_shipping,
            shipping_fee: data?.shipping_fee,
            total: data?.total,
          }}
          paymentMethod={data?.payment_method}
          bankAccount={data?.bank_account}
          card={data?.card}
          isAeronautical={isAeronauticalPurchaseOrder(data)}
        />

      </div>

    </ContentLayout>
  );
};

export default PurchaseOrderPage;
