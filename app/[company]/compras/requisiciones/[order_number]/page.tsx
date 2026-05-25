'use client';

import { useDeleteRequisition } from '@/actions/mantenimiento/compras/requisiciones/actions';
import { ContentLayout } from '@/components/layout/ContentLayout';
import LoadingPage from '@/components/misc/LoadingPage';
import BackButton from '@/components/misc/BackButton';
import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useGetRequisitionByOrderNumber } from '@/hooks/mantenimiento/compras/useGetRequisitionByOrderNumber';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { useCompanyStore } from '@/stores/CompanyStore';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarDays, FileText, ImageIcon, MessageSquare, Plane, User, UserCheck, UserPlus } from 'lucide-react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, type ElementType } from 'react';
import DeleteRequisitionDialog from './_components/DeleteRequisitionDialog';
import GenerateQuoteDialog from './_components/GenerateQuoteDialog';
import RejectRequisitionDialog from './_components/RejectRequisitionDialog';

// ── Status badge ──────────────────────────────────────────────────────
const statusBadgeCls = (status?: string) => {
  const process =
    status === 'PROCESO' ||
    status === 'COTIZADO'

  const approved = status === 'APROBADO'

  return cn(
    'rounded-md border px-2 py-0.5 text-[10px] font-semibold tracking-wide shadow-sm transition-colors duration-150 cursor-default hover:scale-100 hover:translate-y-0 select-none',

    process &&
      'border-yellow-500/30 bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-500/15 dark:hover:text-yellow-200 select-none',

    approved &&
      'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/15 dark:hover:text-emerald-200',

    !process &&
      !approved &&
      'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300 hover:bg-red-500/15 dark:hover:text-red-200 select-none'
  )
}
// ── Requisition type text ──────────────────────────────────────────────────────
const requisitionTypeLabel = (type?: string) => {
  switch (type) {
    case 'Aeronautico':
      return 'material aeronáutico'

    default:
      return 'uso general'
  }
}

// ── Day Format ──────────────────────────────────────────────────────
const formatSolicitudDate = (date?: string | Date | null): string | undefined => {
  if (!date) return undefined;

  const d = typeof date === 'string' ? new Date(date) : date;

  const day = format(d, 'dd');
  const month = format(d, 'MMMM', { locale: es }).toUpperCase();
  const year = format(d, 'yyyy');

  return `${day} ${month} ${year}`;
};

// ── Meta item ─────────────────────────────────────────────────────────
function MetaItem({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value?: string | null;
  icon?: ElementType;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-medium tracking-wider text-muted-foreground/60 select-none">
        {label}
      </span>
      <span className="text-sm font-medium flex items-center gap-1.5">
        {Icon && <Icon className="size-3.5 text-muted-foreground/50 shrink-0" />}
        {value ?? '—'}
      </span>
    </div>
  );
}

// ── Página ────────────────────────────────────────────────────────────
const RequisitionPage = () => {
  const [openDelete, setOpenDelete] = useState(false);
  const [openImage, setOpenImage] = useState<string | null>(null);
  const { selectedCompany } = useCompanyStore();
  const { user } = useAuth();
  const router = useRouter();
  const { order_number } = useParams<{ order_number: string }>();

  const { data, isLoading } = useGetRequisitionByOrderNumber({
    company: selectedCompany?.slug,
    order_number,
  });

  const { deleteRequisition } = useDeleteRequisition();

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenImage(null);
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  if (isLoading) return <LoadingPage />;

  const handleDelete = async () => {
    await deleteRequisition.mutateAsync({
      id: data!.id,
      company: selectedCompany!.slug,
    });
    router.push(`/${selectedCompany!.slug}/compras/requisiciones`);
  };

  const aircraftList = Array.from(
    new Set(
      data?.batch?.flatMap((b: any) =>
        b.batch_articles?.map((a: any) => a.aircraft).filter(Boolean)
      ) ?? []
    )
  )

  const userRoles = user?.roles?.map((r) => r.name) ?? [];
  const userName = `${user?.first_name} ${user?.last_name}`;

  return (
    <ContentLayout title="Solicitud de Compra">
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
                <BreadcrumbLink href={`/${selectedCompany?.slug}/compras/requisiciones`}>
                  Solicitudes
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
          <div className="flex items-start justify-between gap-4">
            {/* Title block */}
            <div className="flex flex-col">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl font-semibold tracking-tight">
                  {order_number}
                </h1>

                <Badge className={statusBadgeCls(data?.status)}>
                  {data?.status}
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground">
                Solicitud de Compra de {requisitionTypeLabel(data?.type)}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 shrink-0">
              {data && <GenerateQuoteDialog req={data} />}

              {data && (
                <RejectRequisitionDialog
                  req={data}
                  userRoles={userRoles}
                  userName={userName}
                />
              )}

              <DeleteRequisitionDialog
                open={openDelete}
                onOpenChange={setOpenDelete}
                onConfirm={handleDelete}
                loading={deleteRequisition.isPending}
                status={data?.status}
              />
            </div>
          </div>
        </div>

        {/* ── Meta ────────────────────────────────────────────────────── */}
        <div className="mx-auto w-full max-w-4xl px-4 py-3 rounded-md border border-border/50 bg-muted/20">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-x-10 gap-y-4 justify-items-center">
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
        <div className="w-full space-y-6">

          {/* GRID PRINCIPAL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* JUSTIFICACIÓN */}
            <div className="relative rounded-xl border border-border/60 bg-gradient-to-b from-muted/30 to-muted/10 p-5 shadow-sm">

              <div className="flex items-center gap-3 mb-3 select-none">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                  JUSTIFICACIÓN DE SOLICITUD
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
                  OBSERVACIÓN
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

          {/* ── IMAGEN ADJUNTA ───────────────────────────── */}
          {data?.image && (
            <div className="relative w-full flex items-center justify-center">

              {/* LINEA IZQUIERDA */}
              <div className="flex-1 h-px bg-border/50 mr-4" />

              {/* CARD */}
              <div className="relative w-fit max-w-[300px] rounded-md border border-border/60 bg-gradient-to-b from-muted/30 to-muted/10 p-2.5 shadow-sm space-y-2 shrink-0">

                {/* HEADER */}
                <div className="flex items-center gap-2 select-none">
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                    IMAGEN ADJUNTA
                  </span>

                  <div className="h-px flex-1 bg-border/50" />
                </div>

                {/* CONTENIDO */}
                <div className="flex items-center justify-center">
                  <div className="max-w-[260px] max-h-[160px]">

                    <Image
                      src={
                        (data as any).image.startsWith('data:image')
                          ? (data as any).image
                          : `data:image/jpeg;base64,${(data as any).image}`
                      }
                      alt="Imagen adjunta"
                      width={260}
                      height={160}
                      className="object-contain w-auto h-auto max-w-full max-h-[160px] cursor-pointer transition hover:opacity-90"
                      onClick={() => setOpenImage((data as any).image)}
                    />

                  </div>
                </div>

              </div>

              {/* LINEA DERECHA */}
              <div className="flex-1 h-px bg-border/50 ml-4" />

            </div>
          )}

        </div>

        {/* ── Artículos por lote ───────────────────────────────────────── */}
        <div className="space-y-4">

          {/* HEADER */}
          <div className="flex items-end justify-between border-b border-border/60 pb-2 select-none">

            <div className="flex flex-col">
              <h2 className="text-xl font-semibold tracking-tight text-foreground/90">
                Artículos Solicitados
              </h2>
            </div>

            <div className="flex items-center gap-2 rounded-md border border-border/50 bg-muted/30 px-2.5 py-1 select-none">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Total
              </span>

              <span className="text-sm font-semibold tabular-nums">
                {data?.batch?.reduce(
                  (acc, batch) => acc + batch.batch_articles.length,
                  0
                ) ?? 0}
              </span>
            </div>

          </div>

          {data?.batch.map((batch: any, batchIdx: number) => (
            <div
              key={`${batch.name}-${batchIdx}`}
              className="space-y-2"
            >

              {batch.batch_articles.map((article: any, idx: number) => {

                const a = article as any;

                return (
                  <div
                    key={`${article.article_part_number}-${idx}`}
                    className="rounded-lg border border-border/60 bg-background/70 overflow-hidden mx-3"
                  >

                    {/* HEADER */}
                    <div className="flex items-center justify-between border-b border-border/50 bg-muted/25 px-3 py-1.5">

                      <div className="flex items-center gap-2 min-w-0">
                        <span className="truncate text-sm font-medium text-foreground">
                          {batch.name}
                        </span>

                        {batch.category && (
                          <Badge
                            variant="secondary"
                            className="h-4 px-1.5 text-[9px] uppercase tracking-wide text-muted-foreground select-none"
                          >
                            {batch.category}
                          </Badge>
                        )}
                      </div>

                    </div>

                    {/* BODY */}
                    <div className="px-3 py-3">

                      <div className="grid grid-cols-[1fr_auto] gap-5 items-center">

                        {/* IZQUIERDA */}
                        <div className="min-w-0 space-y-2.5">

                          {/* PN */}
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

                          {/* ALT */}
                          <div className="space-y-1">

                            <span className="text-[10px] leading-none uppercase tracking-wide text-muted-foreground select-none">
                              Alternate Part Number
                            </span>

                            <div className="flex items-center gap-2 min-w-0">

                              <span className="shrink-0 text-[10px] px-1.5 py-[2px] rounded bg-slate-500/10 text-slate-600 border border-slate-500/20 font-medium select-none">
                                ALT
                              </span>

                              <div className="w-[300px] text-[11px] border border-dashed border-border/40 rounded px-2 py-1 truncate text-muted-foreground">
                                {a.article_alt_part_number || 'N/A'}
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

                          {/* THUMB */}
                          <div className="flex flex-col items-center">

                            <span className="h-4 text-[10px] uppercase tracking-wide text-muted-foreground mb-2 select-none block">
                              Imagen
                            </span>

                            {article.image ? (
                              <div
                                className="relative w-12 h-12 rounded-md overflow-hidden border border-border/40 bg-muted/20 cursor-pointer hover:opacity-80 transition"
                                onClick={() =>
                                  setOpenImage(
                                    article.image.startsWith('data:image')
                                      ? article.image
                                      : `data:image/jpeg;base64,${article.image}`
                                  )
                                }
                              >
                                <Image
                                  src={
                                    article.image.startsWith('data:image')
                                      ? article.image
                                      : `data:image/jpeg;base64,${article.image}`
                                  }
                                  alt={`Imagen ${article.article_part_number}`}
                                  fill
                                  className="object-contain"
                                />
                              </div>
                            ) : (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="w-12 h-12 rounded-md border border-border/40 bg-muted/10 flex items-center justify-center relative overflow-hidden">
                                      <div className="absolute inset-0 bg-gradient-to-br from-muted/30 to-transparent opacity-60" />
                                      <ImageIcon className="relative z-10 size-4 text-muted-foreground/40" />
                                      <div className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-red-400/60" />
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Este artículo no tiene imagen adjunta</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}

                          </div>

                        </div>

                      </div>

                    </div>

                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {openImage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={() => setOpenImage(null)}
          >
            <div
              className="relative max-w-[90vw] max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >

              <Image
                src={
                  openImage.startsWith('data:image')
                    ? openImage
                    : `data:image/jpeg;base64,${openImage}`
                }
                alt="Imagen ampliada"
                width={1400}
                height={900}
                className="object-contain max-w-full max-h-[90vh] rounded-lg shadow-2xl"
              />

            </div>
          </div>
        )}
      </div>
    </ContentLayout>
  );
};

export default RequisitionPage;
