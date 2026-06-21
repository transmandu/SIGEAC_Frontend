'use client';

import { ContentLayout } from '@/components/layout/ContentLayout';
import LoadingPage from '@/components/misc/LoadingPage';
import BackButton from '@/components/misc/BackButton';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { useGetRequisitionByOrderNumber } from '@/hooks/mantenimiento/compras/useGetRequisitionByOrderNumber';
import { useCompanyStore } from '@/stores/CompanyStore';
import { FileText, MessageSquare, Plane, UserCheck, UserPlus, CalendarDays } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import RequisitionActions from './_components/RequisitionActions';
import PriorityIndicator from './_components/PriorityIndicator';
import MetaItem from './_components/MetaItem';
import InfoSection from './_components/InfoSection';
import ImageAttachment from './_components/ImageAttachment';
import GeneralArticleCard from './_components/GeneralArticleCard';
import ImageViewer from './_components/ImageViewer';
import RequisitionOutOfScope from './_components/RequisitionOutOfScope';
import { statusBadgeCls, requisitionTypeLabel, formatSolicitudDate } from './_components/utils/uiHelpers';

// ── Página ────────────────────────────────────────────────────────────
const RequisitionPage = () => {
  const [openImage, setOpenImage] = useState<string | null>(null);
  const { selectedCompany } = useCompanyStore();
  const { order_number } = useParams<{ order_number: string }>();

  const { data, isLoading, refetch } = useGetRequisitionByOrderNumber({
    company: selectedCompany?.slug,
    order_number,
  });
  const batches = data?.batch ?? [];
  const generalArticles = data?.general_articles ?? [];

  const isOutOfScope = !!data && data.type === 'AERONAUTICAL';

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenImage(null);
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const aircraftList = useMemo(() => {
    if (!data) return []

    const reqAircraft =
      data.aircraft?.acronym
        ? [data.aircraft.acronym]
        : []

    const articleAircraft = (data.batch ?? [])
      .flatMap((b: any) =>
        (b.batch_articles ?? [])
          .map((a: any) => {
            if (typeof a.aircraft === 'string') return a.aircraft
            if (a.aircraft?.acronym) return a.aircraft.acronym
            return null
          })
          .filter(Boolean)
      )

    // prioridad: requisición + artículos
    const merged = [...reqAircraft, ...articleAircraft]

    // dedupe
    return Array.from(new Set(merged))
  }, [data])

  const aircraftChunks = useMemo(() => {
    return aircraftList.reduce((acc: string[][], item, idx) => {
      const chunkIndex = Math.floor(idx / 2)

      if (!acc[chunkIndex]) acc[chunkIndex] = []

      acc[chunkIndex].push(item)

      return acc
    }, [])
  }, [aircraftList])
  
  if (isLoading) return <LoadingPage />;

  if (isOutOfScope) return <RequisitionOutOfScope />;

  return (
    <ContentLayout title="Requisición General">
      <div className="flex flex-col gap-4 sm:gap-6">

        {/* ── Breadcrumb ──────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto">
          <BackButton iconOnly tooltip="Volver" variant="secondary" />
          <Breadcrumb>
            <BreadcrumbList className="flex-nowrap">
              <BreadcrumbItem>
                <BreadcrumbLink href={`/${selectedCompany?.slug}/dashboard`}>
                  Inicio
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/${selectedCompany?.slug}/compras/requisiciones_generales`}>
                  Requisiciones Generales
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="truncate">{order_number}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-2 border-b border-border/60 pb-3 sm:pb-4">

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 sm:gap-4">

            {/* Title block */}
            <div className="flex flex-col min-w-0 w-full">

              <div className="flex items-end gap-3 sm:gap-4 flex-wrap">

                <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight min-w-0 break-words">
                  {order_number}
                </h1>

                <div className="flex flex-col items-center justify-start gap-1 min-w-[70px] sm:min-w-[80px]">
                  <span className="text-[8px] sm:text-[9px] leading-none tracking-widest text-muted-foreground select-none">
                    ESTADO
                  </span>

                  <Badge className={statusBadgeCls(data?.status)}>
                    {data?.status}
                  </Badge>
                </div>

                <div className="flex flex-col items-center justify-start gap-1 min-w-[70px] sm:min-w-[80px]">
                  <span className="text-[8px] sm:text-[9px] leading-none tracking-widest text-muted-foreground select-none">
                    PRIORIDAD
                  </span>

                  <PriorityIndicator priority={data?.priority} />
                </div>

              </div>

              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Solicitud de Compra General de {requisitionTypeLabel(data?.type)}
              </p>

              {/* ACTIONS SOLO MOBILE (debajo del título) */}
              {data && (
                <div className="flex md:hidden justify-center mt-3">
                  <RequisitionActions req={data} onSuccessUpdate={refetch}/>
                </div>
              )}

            </div>

            {/* ACTIONS DESKTOP */}
            {data && (
              <div className="hidden md:flex items-center gap-1.5 shrink-0">
                <RequisitionActions req={data} onSuccessUpdate={refetch}/>
              </div>
            )}

          </div>
        </div>

        {/* ── Meta ────────────────────────────────────────────────────── */}
        <div className="mx-auto w-full max-w-4xl px-3 sm:px-4 py-2 sm:py-3 rounded-md border border-border/50 bg-muted/20">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-x-4 sm:gap-x-6 md:gap-x-10 gap-y-2 sm:gap-y-3 md:gap-y-4 justify-items-center">
            <MetaItem
              label="CREADO POR"
              value={
                data?.created_by
                  ? `${data.created_by.first_name} ${data.created_by.last_name}`.toUpperCase()
                  : undefined
              }
              icon={UserCheck}
            />
            <MetaItem
              label="SOLICITADO POR"
              value={data?.requested_by?.toUpperCase()}
              icon={UserPlus}
            />
            <MetaItem
              label="FECHA DE SOLICITUD"
              value={formatSolicitudDate(data?.submission_date)}
              icon={CalendarDays}
            />
            {aircraftList.length > 0 && (
              <MetaItem
                label={aircraftList.length > 1 ? "AERONAVES" : "AERONAVE"}
                value={aircraftList.join(", ")}
                icon={Plane}
              />
            )}
          </div>
        </div>

        {/* ── CONTEXTO DE LA REQUISICIÓN ───────────────────────────── */}
        <div className="w-full space-y-4 sm:space-y-6">

          {/* GRID PRINCIPAL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">

            {/* JUSTIFICACIÓN */}
            <InfoSection
              title="JUSTIFICACIÓN DE SOLICITUD"
              icon={FileText}
              content={data?.justification}
              emptyMessage="SIN JUSTIFICACIÓN"
            />

            {/* OBSERVACIÓN */}
            <InfoSection
              title="OBSERVACIÓN"
              icon={MessageSquare}
              content={data?.observation}
              emptyMessage="SIN OBSERVACIONES"
            />
          </div>

          {/* ── IMAGEN ADJUNTA ───────────────────────────── */}
          {data?.image && (
            <ImageAttachment
              image={data.image}
              onImageClick={setOpenImage}
            />
          )}

        </div>

        {/* ── ARTÍCULOS ───────────────────────────────────────── */}
        <div className="space-y-3 sm:space-y-4">

          {/* HEADER ÚNICO */}
          <div className="flex items-end justify-between border-b border-border/60 pb-2 select-none">

            <div className="flex flex-col">
              <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-foreground/90">
                ARTÍCULOS SOLICITADOS
              </h2>
            </div>

            <div className="flex items-center gap-2 rounded-md border border-border/50 bg-muted/30 px-2.5 py-1 select-none">
              <span className="text-[9px] sm:text-[10px] tracking-wider text-muted-foreground">
                TOTAL
              </span>

              <span className="text-sm font-semibold tabular-nums">
                {generalArticles?.length ?? 0}
              </span>
            </div>

          </div>

          {/* ===================== GENERAL ARTICLES ===================== */}
          {generalArticles?.length > 0 && (
            <div className="space-y-2">
              {generalArticles.map((article: any, idx: number) => (
                <GeneralArticleCard
                  key={idx}
                  article={article}
                  onImageClick={setOpenImage}
                  requisitionStatus={data?.status}
                />
              ))}
            </div>
          )}

        </div>

        {/* ── Image Modal ───────────────────────────────────────── */}
        <ImageViewer
          openImage={openImage}
          onClose={() => setOpenImage(null)}
        />
      </div>
    </ContentLayout>
  );
};

export default RequisitionPage;