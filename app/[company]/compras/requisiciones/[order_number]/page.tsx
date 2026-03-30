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
import { useGetRequisitionByOrderNumber } from '@/hooks/mantenimiento/compras/useGetRequisitionByOrderNumber';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { useCompanyStore } from '@/stores/CompanyStore';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarDays, Plane, User } from 'lucide-react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useState, type ElementType } from 'react';
import DeleteRequisitionDialog from './_components/DeleteRequisitionDialog';
import GenerateQuoteDialog from './_components/GenerateQuoteDialog';
import RejectRequisitionDialog from './_components/RejectRequisitionDialog';

// ── Status badge ──────────────────────────────────────────────────────
const statusCls = (status?: string) => {
  switch (status) {
    case 'APROBADO':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800';
    case 'RECHAZADO':
      return 'bg-destructive/10 text-destructive border-destructive/30';
    default:
      return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800';
  }
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
      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
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
  const { selectedCompany } = useCompanyStore();
  const { user } = useAuth();
  const router = useRouter();
  const { order_number } = useParams<{ order_number: string }>();

  const { data, isLoading } = useGetRequisitionByOrderNumber({
    company: selectedCompany?.slug,
    order_number,
  });

  const { deleteRequisition } = useDeleteRequisition();

  if (isLoading) return <LoadingPage />;

  const handleDelete = async () => {
    await deleteRequisition.mutateAsync({
      id: data!.id,
      company: selectedCompany!.slug,
    });
    router.push(`/${selectedCompany!.slug}/compras/requisiciones`);
  };

  const userRoles = user?.roles?.map((r) => r.name) ?? [];
  const userName = `${user?.first_name} ${user?.last_name}`;

  return (
    <ContentLayout title="Requisición">
      <div className="flex flex-col gap-y-5 max-w-4xl">

        {/* ── Breadcrumb ──────────────────────────────────────────────── */}
        <div className="flex items-center gap-2">
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
                  Requisiciones
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-mono">{order_number}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-border/60">
          <div className="space-y-1">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-mono text-2xl font-bold tracking-wide">
                {order_number}
              </span>
              <Badge
                className={cn(
                  'text-xs font-medium px-2 py-0.5 border',
                  statusCls(data?.status)
                )}
              >
                {data?.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Requisición de{' '}
              {data?.type === 'AERONAUTICO'
                ? 'material aeronáutico'
                : 'uso general'}
            </p>
          </div>

          {/* Acciones */}
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

        {/* ── Meta ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-x-6 gap-y-3 px-3 py-3 rounded-md border border-border/50 bg-muted/20">
          <MetaItem
            label="Creado por"
            value={
              data?.created_by
                ? `${data.created_by.first_name} ${data.created_by.last_name}`
                : undefined
            }
            icon={User}
          />
          <MetaItem
            label="Solicitado por"
            value={data?.requested_by}
            icon={User}
          />
          <MetaItem
            label="Fecha de envío"
            value={
              data?.submission_date
                ? format(new Date(data.submission_date), 'dd MMM yyyy', {
                  locale: es,
                })
                : undefined
            }
            icon={CalendarDays}
          />
          {data?.aircraft && (
            <MetaItem
              label="Aeronave"
              value={`${data.aircraft.brand} ${data.aircraft.model} (${data.aircraft.acronym})`}
              icon={Plane}
            />
          )}
        </div>

        {/* ── Justificación ───────────────────────────────────────────── */}
        {data?.justification && (
          <div className="space-y-1.5">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Justificación
            </span>
            <p className="text-sm text-muted-foreground leading-relaxed px-3 py-2.5 rounded-md border border-border/50 bg-muted/20 border-l-2 border-l-border">
              {data.justification}
            </p>
          </div>
        )}

        {/* ── Imagen adjunta ───────────────────────────────────────────── */}
        {(data as any)?.image && (
          <div className="flex items-start gap-3">
            <div className="relative w-20 h-20 shrink-0 rounded border border-border/40 overflow-hidden bg-muted/30">
              <Image
                src={
                  (data as any).image.startsWith('data:image')
                    ? (data as any).image
                    : `data:image/jpeg;base64,${(data as any).image}`
                }
                alt="Imagen adjunta"
                fill
                className="object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
            <span className="text-xs text-muted-foreground mt-1">
              Imagen adjunta a la requisición
            </span>
          </div>
        )}

        {/* ── Artículos por lote ───────────────────────────────────────── */}
        <div className="space-y-3">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Artículos solicitados
          </span>

          {data?.batch.map((batch, batchIdx) => (
            <div
              key={`${batch.name}-${batchIdx}`}
              className="rounded-md border border-border/60 overflow-hidden"
            >
              {/* Batch header */}
              <div className="flex items-center gap-2 px-3 py-2 bg-muted/20 border-b border-border/50">
                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
                  Lote
                </span>
                <span className="text-sm font-semibold">{batch.name}</span>
                <span className="ml-auto text-[10px] text-muted-foreground/50 tabular-nums">
                  {batch.batch_articles.length}{' '}
                  {batch.batch_articles.length === 1 ? 'artículo' : 'artículos'}
                </span>
              </div>

              {/* Column headers */}
              <div className="grid grid-cols-[1fr_56px_72px] gap-3 px-3 py-1.5 border-b border-border/40">
                {['Parte / Alterno', 'Cant.', 'Unidad'].map((h) => (
                  <span
                    key={h}
                    className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60"
                  >
                    {h}
                  </span>
                ))}
              </div>

              {/* Article rows */}
              {batch.batch_articles.map((article, idx) => {
                const a = article as any;
                return (
                  <div
                    key={`${article.article_part_number}-${idx}`}
                    className="grid grid-cols-[1fr_56px_72px] gap-3 items-start px-3 py-2.5 border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors"
                  >
                    {/* PN identity block */}
                    <div className="space-y-1 min-w-0">
                      <div className="font-mono text-sm bg-muted/60 px-1.5 py-0.5 rounded border border-border/40 truncate tracking-wide">
                        {article.article_part_number || 'N/A'}
                      </div>

                      {a.article_alt_part_number ? (
                        <div className="flex items-center gap-1.5">
                          <span className="shrink-0 text-[9px] font-mono font-semibold text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 px-1 py-0.5 rounded tracking-widest select-none">
                            ALT
                          </span>
                          <span className="font-mono text-[11px] text-muted-foreground truncate">
                            {a.article_alt_part_number}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-mono text-muted-foreground/30 border border-dashed border-border/30 px-1 py-0.5 rounded">
                          ALT —
                        </span>
                      )}

                      {/* Optional fields */}
                      {a.manual && (
                        <span className="text-[10px] text-muted-foreground/60 block">
                          Manual: {a.manual}
                        </span>
                      )}
                      {a.reference_cod && (
                        <span className="text-[10px] text-muted-foreground/60 block">
                          Ref: {a.reference_cod}
                        </span>
                      )}
                      {a.pma && (
                        <span className="text-[10px] text-muted-foreground/60 block">
                          PMA: {a.pma}
                        </span>
                      )}
                      {a.justification && (
                        <span className="text-[10px] text-muted-foreground/60 italic block">
                          &quot;{a.justification}&quot;
                        </span>
                      )}

                      {/* Article image thumbnail */}
                      {article.image && (
                        <div className="relative w-10 h-10 rounded border border-border/40 overflow-hidden bg-muted/30 mt-1">
                          <Image
                            src={
                              article.image.startsWith('data:image')
                                ? article.image
                                : `data:image/jpeg;base64,${article.image}`
                            }
                            alt={`Imagen ${article.article_part_number}`}
                            fill
                            className="object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Quantity */}
                    <span className="font-mono text-sm tabular-nums pt-0.5">
                      {article.quantity}
                    </span>

                    {/* Unit */}
                    <span className="text-sm text-muted-foreground pt-0.5">
                      {article.unit?.label ?? '—'}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </ContentLayout>
  );
};

export default RequisitionPage;
