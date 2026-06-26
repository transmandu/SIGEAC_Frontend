'use client';

import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn, formatRequestedDate } from '@/lib/utils';
import { Building2, CalendarDays, Handshake, ImageIcon, ShieldCheck, User } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import PriorityIndicator from './PriorityIndicator';
import { articleStatusUI } from './utils/uiHelpers';

interface GeneralArticleCardProps {
  article: any;
  onImageClick: (image: string) => void;
  requisitionStatus?: string;
}

const GeneralArticleCard = ({ article, onImageClick, requisitionStatus }: GeneralArticleCardProps) => {
  const showApprovalDetails = (status?: string) => {
    return status && status !== 'PENDING';
  };

  const showQuantityApproval =
    showApprovalDetails(article.status) && article.approved_quantity !== article.quantity;

  const getImageSrc = () => {
    if (!article.image) return null;
    return article.image.startsWith('data:image')
      ? article.image
      : `data:image/jpeg;base64,${article.image}`;
  };

  const imageSrc = getImageSrc();
  const isRejected = article.status === 'REJECTED' && requisitionStatus !== 'RECHAZADO';

  // Usually at most 1-2 of these are populated, so only the ones present render.
  const destinationEntries = [
    article.department && {
      key: 'department',
      icon: Building2,
      label: 'Departamento',
      value: article.department.acronym ?? article.department.name,
      tooltip: article.department.acronym
        ? `Departamento: ${article.department.name}`
        : `Departamento: ${article.department.name} (sin acrónimo)`,
    },
    article.third_party && {
      key: 'third_party',
      icon: Handshake,
      label: 'Tercero',
      value: article.third_party.name,
      tooltip: `Tercero: ${article.third_party.name}`,
    },
    article.employee && {
      key: 'employee',
      icon: User,
      label: 'Solicitante',
      value: `${article.employee.first_name} ${article.employee.last_name}`.trim(),
      tooltip: `Solicitante: ${article.employee.first_name} ${article.employee.last_name}`.trim(),
    },
    article.authorized_employee && {
      key: 'authorized_employee',
      icon: ShieldCheck,
      label: 'Autorizado',
      value: article.authorized_employee.full_name ?? article.authorized_employee.dni_employee,
      tooltip: `Autorizado: ${article.authorized_employee.full_name ?? article.authorized_employee.dni_employee}`,
    },
  ].filter(Boolean) as { key: string; icon: typeof Building2; label: string; value: string; tooltip: string }[];

  return (
    <div className="rounded-lg border border-border/60 bg-background/70 overflow-hidden mx-3">
      <div className="relative">
        <AnimatePresence>
          {isRejected && (
            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center overflow-hidden">
              <motion.span
                initial={{ opacity: 0, scale: 2.6, rotate: -12 }}
                animate={{ opacity: 1, scale: 1, rotate: -12 }}
                exit={{ opacity: 0, scale: 1.4, transition: { duration: 0.1 } }}
                transition={{ type: 'spring', stiffness: 700, damping: 18, mass: 0.6 }}
                className="select-none whitespace-nowrap rounded border-2 border-red-500/50 px-4 py-1 text-xl font-extrabold uppercase tracking-widest text-red-500/50"
              >
                No Cotizado
              </motion.span>
            </div>
          )}
        </AnimatePresence>

        <div className={cn(isRejected && 'opacity-40')}>
      {/* HEADER GENERAL */}
      <div className="flex items-center justify-between border-b border-border/50 bg-muted/25 px-3 py-1.5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="truncate text-sm font-medium text-foreground">
            GENERAL
          </span>
        </div>
        {article.requested_date && (
          <div className="flex items-center gap-1 shrink-0 text-[11px] text-muted-foreground">
            <CalendarDays className="size-3 opacity-70" />
            <span>Solicitado el {formatRequestedDate(article.requested_date, 'dd/MM/yyyy')}</span>
          </div>
        )}
      </div>

      {/* BODY */}
      <div className="px-3 py-3">
        {/* Desktop & Tablet: side-by-side layout */}
        <div className="hidden md:grid grid-cols-[1fr_auto_auto] gap-5 items-center">
          {/* IZQUIERDA */}
          <div className="min-w-0 space-y-2.5">
            <div className="space-y-1">
              <span className="text-[10px] tracking-wide text-muted-foreground">
                DESCRIPCIÓN
              </span>
              <div className="w-[300px] text-sm bg-muted/40 border border-border/40 rounded px-2 py-1 truncate">
                {article.description}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] tracking-wide text-muted-foreground">
                PRESENT. / ESPECIF.
              </span>
              <div className="w-[300px] text-[11px] border border-dashed border-border/40 rounded px-2 py-1 truncate text-muted-foreground">
                {article.variant_type ?? 'N/A'}
              </div>
            </div>
          </div>

          {/* CENTRO: DESTINO */}
          {destinationEntries.length > 0 && (
            <div className="flex flex-col items-center gap-1.5 shrink-0 px-2">
              <span className="text-[10px] tracking-wide text-muted-foreground select-none">
                DESTINO
              </span>
              <div className="flex flex-col gap-1.5">
                {destinationEntries.map(({ key, icon: Icon, label, value, tooltip }) => (
                  <Tooltip key={key}>
                    <TooltipTrigger asChild>
                      <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground bg-background/60 border border-border/40 rounded-full px-2.5 py-1 w-[210px] cursor-default">
                        <Icon className="size-3 shrink-0 opacity-70" />
                        <span className="font-medium text-foreground/80 shrink-0">{label}:</span>
                        <span className="truncate">{value}</span>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      {tooltip}
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>
          )}

          {/* DERECHA */}
          <div className="flex flex-col gap-2 shrink-0">
            {/* FILA 1 */}
            <div className="flex items-start gap-4">
              {/* ESTATUS */}
              <div className="flex flex-col items-center min-w-[90px]">
                <span className="h-4 w-full flex items-center justify-center text-[10px] tracking-wide text-muted-foreground mb-2 select-none">
                  ESTATUS
                </span>
                <div className="flex items-center justify-center w-full">
                  <Badge className={articleStatusUI(article.status).className}>
                    {articleStatusUI(article.status).label}
                  </Badge>
                </div>
              </div>

              {/* PRIORIDAD */}
              <div className="flex flex-col items-center min-w-[90px]">
                <span className="h-4 w-full flex items-center justify-center text-[10px] tracking-wide text-muted-foreground mb-2 select-none">
                  PRIORIDAD
                </span>
                <div className="flex items-center justify-center w-full">
                  <PriorityIndicator priority={article.priority} />
                </div>
              </div>

              {/* CANTIDAD */}
              <div className="flex flex-col items-center min-w-[55px]">
                {showQuantityApproval ? (
                  <>
                    <span className="h-4 w-full flex items-center justify-center text-[10px] tracking-wide text-muted-foreground select-none">
                      CANTIDAD SOLICITADA
                    </span>
                    <span className="text-sm tabular-nums leading-none">
                      {article.quantity}
                    </span>
                    <span className="h-4 w-full flex items-center justify-center text-[10px] tracking-wide text-muted-foreground mt-1 select-none">
                      CANTIDAD APROBADA
                    </span>
                    <span className="text-sm tabular-nums leading-none">
                      {article.approved_quantity ?? '—'}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="h-4 w-full flex items-center justify-center text-[10px] tracking-wide text-muted-foreground mb-2 select-none">
                      CANTIDAD
                    </span>
                    <div className="flex items-center justify-center w-full">
                      <span className="text-sm tabular-nums leading-none">
                        {article.quantity}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* UNIDAD */}
              <div className="flex flex-col items-center min-w-[75px]">
                <span className="h-4 w-full flex items-center justify-center text-[10px] tracking-wide text-muted-foreground mb-2 select-none">
                  UNIDAD
                </span>
                <div className="flex items-center justify-center w-full">
                  <span className="text-sm text-muted-foreground leading-none">
                    {article.unit?.label ?? '—'}
                  </span>
                </div>
              </div>

              {/* IMAGEN */}
              <div className="flex flex-col items-center">
                <span className="h-4 w-full flex items-center justify-center text-[10px] tracking-wide text-muted-foreground mb-2 select-none">
                  IMAGEN
                </span>
                <div className="flex items-center justify-center w-full">
                  {imageSrc ? (
                    <div
                      className="relative w-12 h-12 rounded-md overflow-hidden border border-border/40 bg-muted/20 cursor-pointer hover:opacity-80 transition"
                      onClick={() => onImageClick(imageSrc)}
                    >
                      <Image
                        src={imageSrc}
                        alt="Imagen artículo general"
                        fill
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-md border border-border/40 bg-muted/10 flex items-center justify-center">
                      <ImageIcon className="size-4 text-muted-foreground/40" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile: stacked layout */}
        <div className="md:hidden space-y-4">
          {/* Info section */}
          <div className="space-y-3">
            {/* DESCRIPCIÓN */}
            <div className="space-y-1">
              <span className="text-[10px] tracking-wide text-muted-foreground">
                DESCRIPCIÓN
              </span>
              <div className="flex-1 text-sm bg-muted/40 border border-border/40 rounded px-2 py-1 truncate">
                {article.description}
              </div>
            </div>

            {/* PRESENT. / ESPECIF. */}
            <div className="space-y-1">
              <span className="text-[10px] tracking-wide text-muted-foreground">
                PRESENT. / ESPECIF.
              </span>
              <div className="flex-1 text-[11px] border border-dashed border-border/40 rounded px-2 py-1 truncate text-muted-foreground">
                {article.variant_type ?? 'N/A'}
              </div>
            </div>

            {destinationEntries.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] tracking-wide text-muted-foreground">
                  DESTINO
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {destinationEntries.map(({ key, icon: Icon, label, value, tooltip }) => (
                    <Tooltip key={key}>
                      <TooltipTrigger asChild>
                        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground bg-background/60 border border-border/40 rounded-full px-2.5 py-1 max-w-[210px] cursor-default">
                          <Icon className="size-3 shrink-0 opacity-70" />
                          <span className="font-medium text-foreground/80 shrink-0">{label}:</span>
                          <span className="truncate">{value}</span>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        {tooltip}
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Attributes grid */}
          <div className="grid grid-cols-3 gap-3">
            {/* ESTATUS */}
            <div className="flex flex-col items-center">
              <span className="text-[9px] tracking-wide text-muted-foreground mb-1.5 select-none">
                ESTATUS
              </span>
              <Badge className={articleStatusUI(article.status).className}>
                {articleStatusUI(article.status).label}
              </Badge>
            </div>

            {/* PRIORIDAD */}
            <div className="flex flex-col items-center">
              <span className="text-[9px] tracking-wide text-muted-foreground mb-1.5 select-none">
                PRIORIDAD
              </span>
              <PriorityIndicator priority={article.priority} />
            </div>

            {/* CANTIDAD / UNIDAD combined */}
            <div className="flex flex-col items-center justify-center">
              <span className="text-[9px] tracking-wide text-muted-foreground mb-1.5 select-none">
                {showQuantityApproval ? 'SOLICITADA' : 'CANT.'}
              </span>
              <span className="text-sm tabular-nums leading-none">
                {article.quantity}
              </span>
              <span className="text-[9px] text-muted-foreground leading-none mt-0.5">
                {article.unit?.label ?? '—'}
              </span>
              {showQuantityApproval && (
                <>
                  <span className="text-[9px] tracking-wide text-muted-foreground mb-1.5 mt-1.5 select-none">
                    APROBADA
                  </span>
                  <span className="text-sm tabular-nums leading-none">
                    {article.approved_quantity ?? '—'}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Image */}
          <div className="flex justify-center pt-1">
            {imageSrc ? (
              <div
                className="relative w-16 h-16 rounded-md overflow-hidden border border-border/40 bg-muted/20 cursor-pointer hover:opacity-80 transition"
                onClick={() => onImageClick(imageSrc)}
              >
                <Image
                  src={imageSrc}
                  alt="Imagen artículo general"
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-md border border-border/40 bg-muted/10 flex items-center justify-center">
                <ImageIcon className="size-5 text-muted-foreground/40" />
              </div>
            )}
          </div>
        </div>
      </div>
        </div>
      </div>

      {/* JUSTIFICACIÓN */}
      {article.justification && (
        <div className="border-t border-border/50 bg-muted/20 px-3 py-1.5">
          <span className="select-none text-[9px] leading-none text-muted-foreground uppercase">
            Justificación
          </span>
          <p className="mt-0.5 text-xs text-foreground/80">
            {article.justification}
          </p>
        </div>
      )}
    </div>
  );
}

export default GeneralArticleCard;