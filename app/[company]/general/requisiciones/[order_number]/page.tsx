'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, Trash2, User, FileText, Image as ImageIcon, Plane, FileBadge, AlertTriangle } from 'lucide-react';

import { useDeleteRequisition } from '@/actions/mantenimiento/compras/requisiciones/actions';
import { useGetRequisitionByOrderNumber } from '@/hooks/mantenimiento/compras/useGetRequisitionByOrderNumber';
import { useCompanyStore } from '@/stores/CompanyStore';
import { cn, formatRequestedDate } from '@/lib/utils';

import { ContentLayout } from '@/components/layout/ContentLayout';
import LoadingPage from '@/components/misc/LoadingPage';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

/* -------------------- TRADUCCIONES -------------------- */
const STATUS_LABELS: Record<string, string> = {
  PENDING: 'PENDIENTE',
  CREATED: 'CREADA',
  RECEIVED: 'RECIBIDA',
  IN_PROGRESS: 'EN PROCESO',
  QUOTED: 'COTIZADA',
  APPROVED: 'APROBADA',
  PARTIAL: 'PARCIAL',
  REJECTED: 'NO APROBADA',
};

const PRIORITY_LABELS: Record<string, string> = {
  HIGH: 'ALTA',
  MEDIUM: 'MEDIA',
  LOW: 'BAJA',
};

const TYPE_LABELS: Record<string, string> = {
  AERONAUTICAL: 'AERONÁUTICO',
  GENERAL: 'GENERAL',
};

const translateStatus = (value?: string | null) =>
  value ? STATUS_LABELS[value.toUpperCase()] ?? value : value;

const translatePriority = (value?: string | null) =>
  value ? PRIORITY_LABELS[value.toUpperCase()] ?? value : value;

const translateType = (value?: string | null) =>
  value ? TYPE_LABELS[value.toUpperCase()] ?? value : value;

/* -------------------- DOCUMENTOS REQUERIDOS (POPOVER) -------------------- */
interface RequiredDocumentsPopoverProps {
  batches: {
    batch_articles: {
      article_part_number: string;
      document_types?: { id: number; name: string; regulation?: string | null }[];
    }[];
  }[];
}

const RequiredDocumentsPopover = ({ batches }: RequiredDocumentsPopoverProps) => {
  const items = batches
    .flatMap((batch) => batch.batch_articles ?? [])
    .filter((article) => (article.document_types?.length ?? 0) > 0)
    .sort((a, b) => a.article_part_number.localeCompare(b.article_part_number));

  const hasItems = items.length > 0;

  return (
    <Popover>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <button
                type="button"
                disabled={!hasItems}
                className={cn(
                  'flex items-center justify-center rounded-md p-2.5 border transition-colors',
                  hasItems
                    ? 'text-muted-foreground hover:text-blue-600 hover:bg-blue-500/10 dark:hover:text-blue-400'
                    : 'text-muted-foreground/30 cursor-not-allowed'
                )}
              >
                <FileBadge className="size-5" />
              </button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>
            {hasItems ? 'Documentos requeridos' : 'Sin documentos requeridos'}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <PopoverContent align="center" className="w-72 max-h-72 overflow-y-auto p-3">
        <span className="block px-1 pb-2 text-[10px] uppercase tracking-wide text-muted-foreground">
          Documentos requeridos
        </span>

        {hasItems ? (
          <ul className="flex flex-col gap-2">
            {items.map((article, idx) => (
              <li
                key={`${article.article_part_number}-${idx}`}
                className="rounded-md border bg-background/60 px-2.5 py-1.5 shadow-sm"
              >
                <span className="block text-xs font-semibold text-foreground/90 truncate">
                  P/N: {article.article_part_number}
                </span>
                <ul className="mt-1 space-y-0.5 border-l border-border/50 pl-2">
                  {article.document_types!.map((type) => (
                    <li
                      key={type.id}
                      className="text-[11px] leading-tight text-muted-foreground truncate"
                    >
                      {type.name}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground italic text-center px-2 py-1">
            Sin documentos requeridos
          </p>
        )}
      </PopoverContent>
    </Popover>
  );
};

/* -------------------- CANTIDAD (SOLICITADA / APROBADA) -------------------- */
const QuantityField = ({
  quantity,
  approvedQuantity,
  showApproved,
}: {
  quantity: string | number | null | undefined;
  approvedQuantity: string | number | null | undefined;
  showApproved: boolean;
}) => {
  const hasApproved = showApproved && approvedQuantity !== undefined && approvedQuantity !== null && approvedQuantity !== '';
  const sameValue = hasApproved && String(approvedQuantity) === String(quantity ?? '');

  if (!hasApproved || sameValue) {
    return (
      <div>
        <p className="text-muted-foreground text-xs">Cantidad</p>
        <p className="font-medium">{quantity ?? '-'}</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-muted-foreground text-xs">Cantidad (solicitada / aprobada)</p>
      <p className="font-medium">{quantity ?? '-'} / {approvedQuantity ?? '-'}</p>
    </div>
  );
};

/* -------------------- JUSTIFICACIÓN (EXTENSIÓN) -------------------- */
const ArticleJustificationStrip = ({ justification }: { justification?: string | null }) => {
  if (!justification) return null;

  return (
    <div className="mt-2 -mx-2.5 px-2.5 py-2 border-t border-dashed bg-muted/30 rounded-b-md">
      <p className="text-muted-foreground text-xs mb-0.5">Justificación</p>
      <p className="text-sm italic text-muted-foreground">{justification}</p>
    </div>
  );
};

/* -------------------- ARTICLE CARD -------------------- */
const BatchArticleCard = ({ article }: { article: any }) => {
  const isPending = article.status === 'PENDING';
  const showExtra = !isPending;

  const priorityColor =
    article.priority === 'HIGH'
      ? 'bg-red-100 text-red-700'
      : article.priority === 'MEDIUM'
        ? 'bg-yellow-100 text-yellow-700'
        : article.priority === 'LOW'
          ? 'bg-green-100 text-green-700'
          : 'bg-muted';

  return (
    <div className="flex gap-3 items-center">

      {/* ---------------- INFO + JUSTIFICACIÓN ---------------- */}
      <div className="flex-1 min-w-0">

        <div className="space-y-2">

          {/* BADGE P/N + TITLE (BADGE ANTES) */}
          <div className="flex items-center gap-2 flex-wrap">

            <span className="text-[10px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground border">
              P/N
            </span>

            <h3 className="font-semibold text-base leading-tight">
              {article.article_part_number || 'N/A'}
            </h3>

          </div>

          {/* PRIORIDAD + ESTADO */}
          <div className="flex gap-3 flex-wrap items-center text-xs">

            {article.priority && (
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">Prioridad:</span>
                <span className={cn(
                  "px-2 py-0.5 rounded-md font-semibold",
                  priorityColor
                )}>
                  {translatePriority(article.priority)}
                </span>
              </div>
            )}

            {article.status && (
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">Estado:</span>
                <Badge variant="outline" className="text-xs">
                  {translateStatus(article.status)}
                </Badge>
              </div>
            )}

          </div>

          {/* ---------------- CAMPOS (ORDEN EXACTO) ---------------- */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm pt-1">

            {/* ALT / AIRCRAFT */}
            <div>
              <p className="text-muted-foreground text-xs">
                Alt Part Number
              </p>
              <p className="font-medium">
                {article.article_alt_part_number ?? 'N/A'}
              </p>
            </div>

            <div>
              <p className="text-muted-foreground text-xs">
                Aeronave
              </p>
              <p className="font-medium">
                {article.aircraft?.acronym ?? 'N/A'}
              </p>
            </div>

            {/* CANTIDAD (MERGED) / UNIDAD */}
            <QuantityField
              quantity={article.quantity}
              approvedQuantity={article.approved_quantity}
              showApproved={showExtra}
            />

            <div>
              <p className="text-muted-foreground text-xs">Unidad</p>
              <p className="font-medium">{article.unit?.label ?? '-'}</p>
            </div>

          </div>

        </div>

        {showExtra && <ArticleJustificationStrip justification={article.justification} />}

      </div>

      {/* ---------------- IMAGEN CENTRADA EN LA TARJETA ---------------- */}
      <div className="shrink-0 flex justify-center items-center self-stretch">

        {article.image ? (
          <Image
            src={
              article.image.startsWith('data:image')
                ? article.image
                : `data:image/jpeg;base64,${article.image}`
            }
            alt="batch article"
            width={100}
            height={100}
            className="w-[100px] h-[100px] object-contain border rounded-md"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-muted-foreground text-xs gap-1 h-[100px] w-[100px] border rounded-md">
            <ImageIcon className="w-5 h-5 opacity-70" />
            <span>Sin imagen</span>
          </div>
        )}

      </div>
    </div>
  );
};

const GeneralArticleCard = ({ article }: { article: any }) => {
  const isPending = article.status === 'PENDING';
  const showExtra = !isPending;

  const priorityColor =
    article.priority === 'HIGH'
      ? 'bg-red-100 text-red-700'
      : article.priority === 'MEDIUM'
        ? 'bg-yellow-100 text-yellow-700'
        : article.priority === 'LOW'
          ? 'bg-green-100 text-green-700'
          : 'bg-muted';

  return (
    <div className="flex h-full">

      {/* FIELDS (3/4) */}
      <div className="w-3/4 min-w-0 pr-3 flex flex-col">

        {/* TÍTULO + PRIORIDAD/ESTADO (SIEMPRE ARRIBA) */}
        <div className="space-y-1">

          {/* TÍTULO = DESCRIPCIÓN */}
          <h3 className="font-semibold text-base leading-snug">
            {article.description}
          </h3>

          {/* PRIORIDAD + ESTADO EN FILA CON LABELS */}
          <div className="flex items-center gap-3 flex-wrap text-xs">

            {article.priority && (
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">Prioridad:</span>
                <span className={cn(
                  "px-2 py-0.5 rounded-md font-semibold",
                  priorityColor
                )}>
                  {translatePriority(article.priority)}
                </span>
              </div>
            )}

            {article.status && (
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">Estado:</span>
                <Badge variant="outline" className="text-xs">
                  {translateStatus(article.status)}
                </Badge>
              </div>
            )}

          </div>
        </div>

        {/* DETALLES + JUSTIFICACIÓN (CENTRADOS EN EL ESPACIO RESTANTE) */}
        <div className="flex-1 flex flex-col justify-center pt-1">

          <div className="grid grid-cols-3 gap-x-4 gap-y-2 text-sm">

            {article.variant_type && (
              <div>
                <p className="text-muted-foreground text-xs">Present. / Especif.</p>
                <p className="font-medium">{article.variant_type}</p>
              </div>
            )}

            {article.requested_date && (
              <div>
                <p className="text-muted-foreground text-xs">Fecha Solicitud</p>
                <p className="font-medium">
                  {formatRequestedDate(article.requested_date, 'dd/MM/yyyy')}
                </p>
              </div>
            )}

            {/* CANTIDAD (MERGED) */}
            <QuantityField
              quantity={article.quantity}
              approvedQuantity={article.approved_quantity}
              showApproved={showExtra}
            />

            {article.unit && (
              <div>
                <p className="text-muted-foreground text-xs">Unidad</p>
                <p className="font-medium">{article.unit.label}</p>
              </div>
            )}

            {article.department && (
              <div>
                <p className="text-muted-foreground text-xs">Departamento</p>
                <p className="font-medium">
                  {article.department.acronym ?? article.department.name}
                </p>
              </div>
            )}

            {article.third_party && (
              <div>
                <p className="text-muted-foreground text-xs">Tercero</p>
                <p className="font-medium">{article.third_party.name}</p>
              </div>
            )}

            {article.employee && (
              <div>
                <p className="text-muted-foreground text-xs">Solicitante</p>
                <p className="font-medium">
                  {`${article.employee.first_name} ${article.employee.last_name}`.trim()}
                </p>
              </div>
            )}

            {article.authorized_employee && (
              <div>
                <p className="text-muted-foreground text-xs">Autorizado</p>
                <p className="font-medium">
                  {article.authorized_employee.full_name ?? article.authorized_employee.dni_employee}
                </p>
              </div>
            )}

          </div>

          {showExtra && <ArticleJustificationStrip justification={article.justification} />}

        </div>

      </div>

      {/* IMAGEN (1/4, CENTRADA EN TODO EL ALTO DE LA TARJETA) */}
      <div className="w-1/4 shrink-0 flex justify-center items-center">

        {article.image ? (
          <Image
            src={
              article.image.startsWith('data:image')
                ? article.image
                : `data:image/jpeg;base64,${article.image}`
            }
            alt="general article"
            width={100}
            height={100}
            className="w-[100px] h-[100px] object-contain border rounded-md"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-muted-foreground text-xs gap-1 h-[100px] w-[100px] border rounded-md">
            <ImageIcon className="w-5 h-5 opacity-70" />
            <span>Sin imagen</span>
          </div>
        )}

      </div>
    </div>
  );
};

/* -------------------- PAGE -------------------- */
const RequisitionPage = () => {
  const [openDelete, setOpenDelete] = useState(false);
  const [confirmOrderNumber, setConfirmOrderNumber] = useState('');

  const { selectedCompany } = useCompanyStore();
  const router = useRouter();
  const { order_number } = useParams<{ order_number: string }>();

  const { data, isLoading } = useGetRequisitionByOrderNumber({
    company: selectedCompany?.slug,
    order_number
  });

  const { deleteRequisition } = useDeleteRequisition();

  if (isLoading) return <LoadingPage />;

  const batchArticleCount = data?.batch?.reduce(
    (acc, batch) => acc + (batch.batch_articles?.length ?? 0),
    0
  ) ?? 0;
  const generalArticleCount = data?.general_articles?.length ?? 0;
  const totalArticleCount = batchArticleCount + generalArticleCount;

  const canConfirmDelete = confirmOrderNumber.trim().toUpperCase() === order_number.toUpperCase();

  const handleDelete = async () => {
    if (!canConfirmDelete) return;

    await deleteRequisition.mutateAsync({
      id: data!.id,
      company: selectedCompany!.slug
    });

    router.push(`/${selectedCompany!.slug}/general/requisiciones`);
  };

  return (
    <ContentLayout title="Inventario">

      {/* HEADER */}
      <div className="flex flex-col gap-y-2 mb-10">
        <h1 className="text-4xl font-bold text-center">
          Nro. Requisición: <span className="text-blue-600">#{order_number}</span>
        </h1>
        <p className="text-sm text-muted-foreground text-center italic">
          Información detallada de la requisición
        </p>
      </div>

      <Card className="max-w-7xl mx-auto">

        {/* HEADER CARD */}
        <CardHeader className="flex flex-col items-center gap-4">

          {/* BADGES EN FORMATO LABEL ARRIBA */}
          <div className="flex gap-6 flex-wrap justify-center text-center">

            <div className="flex flex-col items-center">
              <p className="text-xs text-muted-foreground">Estado</p>
              <Badge className="text-xs">
                {translateStatus(data?.status)}
              </Badge>
            </div>

            {data?.priority && (
              <div className="flex flex-col items-center">
                <p className="text-xs text-muted-foreground">Prioridad</p>
                <Badge
                  className={cn(
                    "text-xs",
                    data.priority === 'HIGH'
                      ? "bg-red-100 text-red-700"
                      : data.priority === 'MEDIUM'
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                  )}
                >
                  {translatePriority(data.priority)}
                </Badge>
              </div>
            )}

            {data?.type && (
              <div className="flex flex-col items-center">
                <p className="text-xs text-muted-foreground">Tipo</p>
                <Badge variant="outline" className="text-xs">
                  {translateType(data.type)}
                </Badge>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-6">

          {/* IMAGEN */}
          {data?.image && (
            <div className="flex flex-col items-center gap-2">
              <Image
                src={
                  data.image.startsWith('data:image')
                    ? data.image
                    : `data:image/jpeg;base64,${data.image}`
                }
                alt="Requisición"
                width={160}
                height={160}
                className="w-[160px] h-[160px] object-contain border rounded-md"
              />
              <p className="text-xs text-muted-foreground">
                Imagen de la requisición
              </p>
            </div>
          )}

          {/* USUARIOS + FECHA + AIRCRAFT */}
          <div className="grid gap-6 text-sm [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]">

            <div className="text-center space-y-1">
              <p className="text-xs text-muted-foreground">Creado por</p>
              <p className="font-medium flex items-center gap-2 justify-center">
                <User className="w-4 h-4" />
                {data?.created_by ? `${data.created_by.first_name} ${data.created_by.last_name}`.trim().toUpperCase() : "SISTEMA"}
              </p>
            </div>

            <div className="text-center space-y-1">
              <p className="text-xs text-muted-foreground">Solicitado por</p>
              <p className="font-medium flex items-center gap-2 justify-center">
                <User className="w-4 h-4" />
                {data?.requested_by?.toUpperCase()}
              </p>
            </div>

            {data?.submission_date && (
              <div className="text-center space-y-1">
                <p className="text-xs text-muted-foreground">Fecha solicitud</p>
                <p className="font-medium">
                  {new Intl.DateTimeFormat('es-VE', {
                    timeZone: 'America/Caracas',
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                  }).format(new Date(data.submission_date))}
                </p>
              </div>
            )}

            {data?.aircraft?.acronym && (
              <div className="text-center space-y-1">
                <p className="text-xs text-muted-foreground">Aeronave</p>
                <p className="font-medium flex items-center gap-2 justify-center">
                  <Plane className="w-4 h-4" />
                  {data.aircraft.acronym}
                </p>
              </div>
            )}

          </div>

          {/* JUSTIFICACIÓN + OBSERVACIÓN */}
          <div className={cn(
            "grid grid-cols-1 gap-4",
            data?.type === 'AERONAUTICAL' ? "md:grid-cols-[1fr_1fr_auto] md:items-stretch" : "md:grid-cols-2"
          )}>

            <div className="text-center flex flex-col">
              <h2 className="font-semibold text-base mb-1">Justificación</h2>
              <p className="text-sm italic bg-secondary p-3 rounded-md flex-1">
                {data?.justification || 'No se proporcionó justificación'}
              </p>
            </div>

            <div className="text-center flex flex-col">
              <h2 className="font-semibold text-base mb-1">Observación (indicada por Compras)</h2>
              <p className="text-sm italic bg-secondary p-3 rounded-md flex-1">
                {data?.observation || 'Sin observaciones'}
              </p>
            </div>

            {data?.type === 'AERONAUTICAL' && (
              <div className="flex flex-col">
                <span className="invisible mb-1 font-semibold text-base leading-tight">.</span>
                <div className="flex-1 flex items-center justify-center">
                  <RequiredDocumentsPopover batches={data?.batch ?? []} />
                </div>
              </div>
            )}

          </div>

          {/* ---------------- BATCH ---------------- */}
          {data?.batch?.length ? (
            <div className="flex flex-wrap justify-center gap-3">
              {data.batch.map((batch) => (
                <Card key={batch.id} className="w-full max-w-xl">
                  <CardHeader className="py-2">
                    <CardTitle className="text-lg text-center">
                      {batch.name}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {batch.batch_articles.map((article, index) => (
                      <div key={index}>
                        <BatchArticleCard article={article} />

                        {index < batch.batch_articles.length - 1 && (
                          <Separator className="my-3" />
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : null}

          {/* ---------------- GENERAL ---------------- */}
          {data?.general_articles?.length ? (
            <div className="w-full max-w-6xl mx-auto space-y-4">

              {/* TÍTULO */}
              <div className="text-center">
                <h2 className="text-lg font-semibold">
                  Artículos Generales
                </h2>
                <p className="text-xs text-muted-foreground">
                  Lista de artículos generales asociados a la requisición
                </p>
              </div>

              {/* GRID SIEMPRE IGUAL, SOLO CAMBIA ALIGN */}
              <div
                className={
                  data.general_articles.length === 1
                    ? "grid grid-cols-1 justify-items-center"
                    : "grid grid-cols-1 md:grid-cols-2 gap-3"
                }
              >
                {data.general_articles.map((article, index) => (
                  <Card key={index} className="w-full flex flex-col">
                    <CardContent className="p-3 flex-1">
                      <GeneralArticleCard article={article} />
                    </CardContent>
                  </Card>
                ))}
              </div>

            </div>
          ) : null}

        </CardContent>

        <CardFooter className="flex justify-end">
          <Button onClick={() => setOpenDelete(true)} variant="destructive">
            <Trash2 className="w-4 h-4 mr-2" />
            Eliminar
          </Button>
        </CardFooter>
      </Card>

      <AlertDialog
        open={openDelete}
        onOpenChange={(next) => {
          if (!deleteRequisition.isPending) {
            setOpenDelete(next);
            if (!next) setConfirmOrderNumber('');
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader className="flex flex-col items-center text-center space-y-3">

            <div className="flex items-center justify-center size-12 rounded-2xl border border-red-500/15 bg-red-500/[0.08]">
              <Trash2 className="size-5 text-red-600" />
            </div>

            <AlertDialogTitle className="text-lg font-semibold tracking-tight">
              Eliminar requisición {order_number}
            </AlertDialogTitle>

            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm text-center">
                <p>
                  Esta acción elimina <strong>permanentemente</strong> la requisición y no se puede deshacer.
                </p>

                {totalArticleCount > 0 && (
                  <p>
                    Se perderán <strong>{totalArticleCount}</strong>{' '}
                    {totalArticleCount === 1 ? 'artículo asociado' : 'artículos asociados'}
                    {batchArticleCount > 0 && generalArticleCount > 0 && (
                      <> ({batchArticleCount} por lote, {generalArticleCount} generales)</>
                    )}
                    , junto con su justificación, observaciones e imágenes adjuntas.
                  </p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="mx-1 p-3 rounded-xl border border-red-500/20 bg-red-500/[0.05] text-sm text-red-600 flex gap-2 leading-relaxed">
            <AlertTriangle className="size-4 mt-[2px] shrink-0" />
            <div>
              Esta operación es <b>irreversible</b>. Verifica que realmente deseas eliminar este registro antes de continuar.
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-order-number">
              Escribe <strong>{order_number}</strong> para confirmar
            </Label>
            <Input
              id="confirm-order-number"
              value={confirmOrderNumber}
              onChange={(event) => setConfirmOrderNumber(event.target.value.toUpperCase())}
              placeholder={order_number}
              className="uppercase"
              autoComplete="off"
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteRequisition.isPending}>
              Cancelar
            </AlertDialogCancel>

            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={!canConfirmDelete || deleteRequisition.isPending}
              className="bg-red-600/90 hover:bg-red-600"
            >
              {deleteRequisition.isPending && (
                <Loader2 className="animate-spin size-4 mr-2" />
              )}
              Eliminar definitivamente
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ContentLayout>
  );
};

export default RequisitionPage;