'use client';

import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ImageIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import PriorityIndicator from './PriorityIndicator';
import { articleStatusUI } from './utils/uiHelpers';

interface ArticleCardProps {
  article: any;
  batchName: string;
  batchCategory?: string;
  onImageClick: (image: string) => void;
  requisitionStatus?: string;
}

const ArticleCard = ({ article, batchName, batchCategory, onImageClick, requisitionStatus }: ArticleCardProps) => {
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
      {/* HEADER (batch name dentro del card, no externo) */}
      <div className="flex items-center justify-between border-b border-border/50 bg-muted/25 px-3 py-1.5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="truncate text-sm font-medium text-foreground">
            {batchName}
          </span>
          {batchCategory && (
            <Badge
              variant="secondary"
              className="h-4 px-1.5 text-[9px] uppercase tracking-wide text-muted-foreground select-none"
            >
              {batchCategory}
            </Badge>
          )}
        </div>
      </div>

      {/* BODY */}
      <div className="px-3 py-3">
        {/* Desktop & Tablet: side-by-side layout */}
        <div className="hidden md:grid grid-cols-[1fr_auto] gap-5 items-center">
          {/* IZQUIERDA */}
          <div className="min-w-0 space-y-2.5">
            {/* PN */}
            <div className="space-y-1">
              <span className="text-[10px] leading-none tracking-wide text-muted-foreground select-none">
                PART NUMBER
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
              <span className="text-[10px] leading-none tracking-wide text-muted-foreground select-none">
                ALTERNATIVE PART NUMBER
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
          <div className="flex flex-col gap-2 shrink-0">
            {/* ── FILA 1 ── */}
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
                        alt={`Imagen ${article.article_part_number}`}
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
            {/* PN */}
            <div className="space-y-1">
              <span className="text-[10px] leading-none tracking-wide text-muted-foreground select-none">
                PART NUMBER
              </span>
              <div className="flex items-center gap-2 min-w-0">
                <span className="shrink-0 text-[10px] px-1.5 py-[2px] rounded bg-teal-500/10 text-teal-700 border border-teal-500/20 font-medium select-none">
                  P/N
                </span>
                <div className="flex-1 text-sm bg-muted/40 border border-border/40 rounded px-2 py-1 truncate">
                  {article.article_part_number || 'N/A'}
                </div>
              </div>
            </div>

            {/* ALT */}
            <div className="space-y-1">
              <span className="text-[10px] leading-none tracking-wide text-muted-foreground select-none">
                ALTERNATIVE PART NUMBER
              </span>
              <div className="flex items-center gap-2 min-w-0">
                <span className="shrink-0 text-[10px] px-1.5 py-[2px] rounded bg-slate-500/10 text-slate-600 border border-slate-500/20 font-medium select-none">
                  ALT
                </span>
                <div className="flex-1 text-[11px] border border-dashed border-border/40 rounded px-2 py-1 truncate text-muted-foreground">
                  {article.article_alt_part_number || 'N/A'}
                </div>
              </div>
            </div>
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
                  alt={`Imagen ${article.article_part_number}`}
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

export default ArticleCard;