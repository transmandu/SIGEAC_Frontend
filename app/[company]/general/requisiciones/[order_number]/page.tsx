'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, Trash2, User, FileText, Image as ImageIcon, Plane } from 'lucide-react';

import { useDeleteRequisition } from '@/actions/mantenimiento/compras/requisiciones/actions';
import { useGetRequisitionByOrderNumber } from '@/hooks/mantenimiento/compras/useGetRequisitionByOrderNumber';
import { useCompanyStore } from '@/stores/CompanyStore';
import { cn } from '@/lib/utils';

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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Separator } from '@/components/ui/separator';

/* -------------------- ARTICLE CARD (SIN CAMBIOS) -------------------- */
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
    <div className="grid grid-cols-12 gap-3 items-start">

      {/* ---------------- INFO ---------------- */}
      <div className="col-span-8 space-y-2">

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
                {article.priority}
              </span>
            </div>
          )}

          {article.status && (
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">Estado:</span>
              <Badge variant="outline" className="text-xs">
                {article.status}
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

          {/* CANTIDAD / UNIDAD */}
          <div>
            <p className="text-muted-foreground text-xs">Cantidad</p>
            <p className="font-medium">{article.quantity ?? '-'}</p>
          </div>

          <div>
            <p className="text-muted-foreground text-xs">Unidad</p>
            <p className="font-medium">{article.unit?.label ?? '-'}</p>
          </div>

          {/* CANTIDAD APROBADA */}
          {showExtra && (
            <div>
              <p className="text-muted-foreground text-xs">
                Cantidad aprobada
              </p>
              <p className="font-medium">
                {article.approved_quantity ?? '-'}
              </p>
            </div>
          )}

          {/* JUSTIFICACIÓN */}
          {showExtra && (
            <div className="col-span-2">
              <p className="text-muted-foreground text-xs">
                Justificación
              </p>
              <p className="text-sm italic text-muted-foreground">
                {article.justification ?? 'Sin justificación'}
              </p>
            </div>
          )}

        </div>

      </div>

      {/* ---------------- IMAGEN CENTRADA ---------------- */}
      <div className="col-span-4 flex justify-center items-center">

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
    <div className="grid grid-cols-12 gap-3 items-start">

      {/* CARD MÁS COMPACTA (MENOS ANCHO) */}
      <div className="col-span-8 space-y-2">

        {/* HEADER */}
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
                  {article.priority}
                </span>
              </div>
            )}

            {article.status && (
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">Estado:</span>
                <Badge variant="outline" className="text-xs">
                  {article.status}
                </Badge>
              </div>
            )}

          </div>
        </div>

        {/* DETALLES */}
        <div className="grid grid-cols-3 gap-x-4 gap-y-2 text-sm pt-1">

          {article.variant_type && (
            <div>
              <p className="text-muted-foreground text-xs">Present. / Especif.</p>
              <p className="font-medium">{article.variant_type}</p>
            </div>
          )}

          <div>
            <p className="text-muted-foreground text-xs">Cantidad</p>
            <p className="font-medium">{article.quantity}</p>
          </div>

          {/* SOLO SI NO ES PENDING */}
          {showExtra && (
            <div>
              <p className="text-muted-foreground text-xs">Cantidad Aprobada</p>
              <p className="font-medium">
                {article.approved_quantity ?? '-'}
              </p>
            </div>
          )}

          {article.unit && (
            <div>
              <p className="text-muted-foreground text-xs">Unidad</p>
              <p className="font-medium">{article.unit.label}</p>
            </div>
          )}

        </div>

        {/* JUSTIFICACIÓN SOLO SI NO ES PENDING */}
        {showExtra && (
          <div className="pt-1">
            <p className="text-muted-foreground text-xs">Justificación</p>
            <p className="text-sm italic text-muted-foreground">
              {article.justification || 'Sin justificación'}
            </p>
          </div>
        )}

      </div>

      {/* IMAGEN (MÁS COMPACTA Y MENOS DOMINANTE) */}
      <div className="col-span-4 flex justify-center items-center">

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

  const { selectedCompany } = useCompanyStore();
  const router = useRouter();
  const { order_number } = useParams<{ order_number: string }>();

  const { data, isLoading } = useGetRequisitionByOrderNumber({
    company: selectedCompany?.slug,
    order_number
  });

  const { deleteRequisition } = useDeleteRequisition();

  if (isLoading) return <LoadingPage />;

  const handleDelete = async () => {
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
          Detalles de la orden de requisición #{order_number}
        </p>
      </div>

      <Card className="max-w-7xl mx-auto">

        {/* HEADER CARD */}
        <CardHeader className="flex flex-col items-center gap-4">
          <CardTitle className="text-4xl">
            #{order_number}
          </CardTitle>

          {/* BADGES EN FORMATO LABEL ARRIBA */}
          <div className="flex gap-6 flex-wrap justify-center text-center">

            <div className="flex flex-col items-center">
              <p className="text-xs text-muted-foreground">Estado</p>
              <Badge className="text-xs">
                {data?.status?.toUpperCase()}
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
                  {data.priority}
                </Badge>
              </div>
            )}

            {data?.type && (
              <div className="flex flex-col items-center">
                <p className="text-xs text-muted-foreground">Tipo</p>
                <Badge variant="outline" className="text-xs">
                  {data.type}
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
                {`${data?.created_by.first_name ?? ''} ${data?.created_by.last_name ?? ''}`.trim().toUpperCase()}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div className="text-center">
              <h2 className="font-semibold text-base mb-1">Justificación</h2>
              <p className="text-sm italic bg-secondary p-3 rounded-md">
                {data?.justification || 'No se proporcionó justificación'}
              </p>
            </div>

            <div className="text-center">
              <h2 className="font-semibold text-base mb-1">Observación (indicada por Compras)</h2>
              <p className="text-sm italic bg-secondary p-3 rounded-md">
                {data?.observation || 'Sin observaciones'}
              </p>
            </div>

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
                  <Card key={index} className="w-full">
                    <CardContent className="p-3">
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

      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">
              ¿Eliminar Requisición?
            </DialogTitle>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDelete(false)}>
              Cancelar
            </Button>

            <Button onClick={handleDelete} disabled={deleteRequisition.isPending}>
              {deleteRequisition.isPending && (
                <Loader2 className="animate-spin size-4 mr-2" />
              )}
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ContentLayout>
  );
};

export default RequisitionPage;