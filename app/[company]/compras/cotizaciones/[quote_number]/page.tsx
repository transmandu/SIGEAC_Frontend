'use client';

import { useDeleteQuote } from '@/actions/mantenimiento/compras/cotizaciones/actions';
import { ContentLayout } from '@/components/layout/ContentLayout';
import LoadingPage from '@/components/misc/LoadingPage';
import BackButton from '@/components/misc/BackButton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useGetQuoteByQuoteNumber } from '@/hooks/mantenimiento/compras/useGetQuoteByQuoteNumber';
import { useGetPurchaseOrderByQuoteId } from '@/hooks/mantenimiento/compras/useGetPurchaseOrderByQuoteId';
import { cn } from '@/lib/utils';
import { useCompanyStore } from '@/stores/CompanyStore';
import { Trash2, Loader2, User } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

const QuotePage = () => {
  const [openDelete, setOpenDelete] = useState<boolean>(false);
  const { selectedCompany } = useCompanyStore();
  const router = useRouter();
  const { quote_number } = useParams<{ quote_number: string }>();
  const { data, isLoading } = useGetQuoteByQuoteNumber(selectedCompany?.slug ?? null, quote_number);

  const quoteId = data?.id;

  const { data: purchaseOrder, isLoading: loadingPO } = useGetPurchaseOrderByQuoteId({
    company: selectedCompany?.slug ?? null,
    quoteId: quoteId
  });

  const { deleteQuote } = useDeleteQuote();

  if (isLoading) return <LoadingPage />;

  const handleDelete = async (id: number, company: string) => {
    await deleteQuote.mutateAsync({
      id,
      company: selectedCompany!.slug
    });
    router.push(`/${selectedCompany!.slug}/general/cotizaciones`);
  };

  const handleApprove = () => {};

  const goToPurchaseOrder = () => {
    if (purchaseOrder?.order_number) {
      router.push(`/${selectedCompany!.slug}/compras/ordenes_compra/${purchaseOrder.order_number}`);
    }
  };

  return (
    <ContentLayout title="Cotización">
      <div className="flex flex-col gap-y-2 mb-12">
        <div className="flex items-center gap-2">
          <BackButton iconOnly tooltip="Volver" variant="secondary" />
          <h1 className="text-4xl font-bold text-center flex-1">
            Cotización Nro: <span className="text-blue-600">#{quote_number}</span>
          </h1>
        </div>
        <p className="text-sm text-muted-foreground text-center italic">
          Detalles de la cotización #{quote_number}
        </p>
      </div>
      <Card className="max-w-5xl mx-auto">
        <CardHeader className="flex flex-col items-center">
          <CardTitle className="flex justify-center text-5xl mb-2">
            #{quote_number}
          </CardTitle>
          <Badge
            className={cn(
              "text-lg",
              data?.status === "APROBADO" ? "bg-green-500" : "bg-yellow-600"
            )}
          >
            {data?.status.toUpperCase()}
          </Badge>
        </CardHeader>
        <CardContent className="flex flex-col gap-8">
          <div className="flex w-full justify-center gap-24 text-xl">
            <div className="flex flex-col gap-2 items-center">
              <h1>Creado Por:</h1>
              <p className="font-bold flex gap-2 items-center">
                <User /> {data?.created_by}
              </p>
            </div>
            <div className="flex flex-col gap-2 items-center">
              <h1>Proveedor:</h1>
              <p className="font-bold flex gap-2 items-center">
                {data?.vendor.name}
              </p>
            </div>
          </div>
          <div className='text-center'>
            <h2 className='font-semibold text-lg mb-2'>Justificación:</h2>
            <p className="font-medium italic bg-secondary p-4 rounded-md">
              {data?.justification || "No se proporcionó justificación"}
            </p>
          </div>
          <div className="flex justify-center gap-2">
            {data?.article_quote_order.map((article) => (
              <Card
                className="w-[280px] text-center"
                key={article.article_part_number}
              >
                <CardTitle className="p-6">{article.batch.name}</CardTitle>
                <CardContent>
                  <p className="font-medium">
                    Nro. de Parte:{" "}
                    <span className="font-bold italic">{article.article_part_number}</span>
                  </p>
                  <p className="font-medium">
                    Cantidad:{" "}
                    <span className="font-bold italic">
                      {article.quantity} {article.unit ? article.unit.label : "UNIDADES"}
                    </span>
                  </p>
                  <p className="font-medium">
                    Precio Unitario:{" "}
                    <span className="font-bold italic">
                      ${Number(article.unit_price).toFixed(2)}
                    </span>
                  </p>
                  <p className="font-medium">
                    Total:{" "}
                    <span className="font-bold italic">
                      ${(article.quantity * Number(article.unit_price)).toFixed(2)}
                    </span>
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex gap-2 justify-end">
          {data?.status === "PENDIENTE" && <Button onClick={handleApprove}>Aprobar</Button>}
          {data?.status === "APROBADO" && !loadingPO && purchaseOrder?.order_number && (
            <Button onClick={goToPurchaseOrder}>Ver Orden de Compra</Button>
          )}
          <Button
            onClick={() => setOpenDelete(true)}
            variant={"destructive"}
            disabled={data?.status === "APROBADO"}
          >
            <Trash2 />
          </Button>
        </CardFooter>
      </Card>
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center text-3xl">
              ¿Eliminar Cotización?
            </DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant={"destructive"}
              onClick={() => setOpenDelete(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => handleDelete(data!.id, selectedCompany!.slug)}
              disabled={deleteQuote.isPending || data?.status === "APROBADO"}
            >
              {deleteQuote.isPending ? (
                <Loader2 className="animate-spin size-4" />
              ) : (
                "Confirmar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ContentLayout>
  );
};

export default QuotePage;