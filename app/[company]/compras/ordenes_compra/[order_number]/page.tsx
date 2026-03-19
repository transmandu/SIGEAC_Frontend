'use client';

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
import { useGetPurchaseOrder } from '@/hooks/mantenimiento/compras/useGetPurchaseOrder';
import { cn } from '@/lib/utils';
import { useCompanyStore } from '@/stores/CompanyStore';
import { Trash2, User, Truck, DollarSign, Building, CreditCard } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useState } from 'react';

const CotizacionPage = () => {
  const [openDelete, setOpenDelete] = useState<boolean>(false);
  const { selectedCompany } = useCompanyStore();
  const { order_number } = useParams<{ order_number: string }>();
  const { data, isLoading } = useGetPurchaseOrder(selectedCompany?.slug, order_number);

  if (isLoading) return <LoadingPage />;

  // Función displayValue que acepta string o number y convierte a string automáticamente
  const displayValue = (value: string | number | null | undefined, fallback = 'Pendiente de completar') =>
    value !== null && value !== undefined ? String(value) : fallback;

  return (
    <ContentLayout title='Orden de Compra'>
      {/* Header */}
      <div className='flex flex-col gap-y-2 mb-12'>
        <div className='flex items-center gap-2'>
          <BackButton iconOnly tooltip="Volver" variant="secondary" />
          <h1 className='text-4xl font-bold text-center flex-1'>
            Orden de Compra Nro: <span className='text-blue-600'>#{order_number}</span>
          </h1>
        </div>
        <p className='text-sm text-muted-foreground text-center italic'>
          Detalles de la Orden de Compra #{order_number}
        </p>
      </div>

      {data && (
        <Card className='max-w-5xl mx-auto'>
          <CardHeader className='flex flex-col items-center'>
            <CardTitle className='text-5xl mb-2'>#{order_number}</CardTitle>
            <Badge className={cn("text-lg", data.status === 'PAGADO' ? "bg-green-500" : "bg-yellow-600")}>
              {displayValue(data.status?.toUpperCase(), 'En proceso')}
            </Badge>
          </CardHeader>

          <CardContent className='flex flex-col gap-6'>

            {/* Información General */}
            <div className='flex flex-wrap justify-center gap-6'>
              {/* Creado Por */}
              <div className='flex flex-col items-center p-4 border rounded-lg shadow-sm min-w-[200px] flex-1 max-w-[250px]'>
                <div className='flex items-center gap-2 text-xl font-bold text-gray-700 mb-2'>
                  <User className="text-blue-500" /> Creado Por
                </div>
                <div className='text-center text-gray-900 text-lg'>{displayValue(data.created_by)}</div>
              </div>

              {/* Proveedor */}
              <div className='flex flex-col items-center p-4 border rounded-lg shadow-sm min-w-[200px] flex-1 max-w-[250px]'>
                <div className='flex items-center gap-2 text-xl font-bold text-gray-700 mb-2'>
                  <Truck className="text-green-500" /> Proveedor
                </div>
                <div className='text-center text-gray-900 text-lg'>{displayValue(data.vendor?.name)}</div>
              </div>
            </div>

            {/* Pagos y Costos */}
            <div className='flex justify-center'>
              <div className='flex flex-col items-center p-6 border rounded-lg shadow-sm min-w-[320px] max-w-[700px]'>
                
                {/* Título del contenedor */}
                <div className='flex items-center gap-2 text-xl font-bold text-gray-700 mb-4'>
                  <Building /> Detalles de Pago y Costos
                </div>

                {/* Contenido en dos columnas */}
                <div className='flex flex-wrap justify-between w-full gap-6'>

                  {/* Columna de Pagos */}
                  <div className='flex flex-col gap-2 flex-1 min-w-[280px]'>
                    <p className='font-bold text-lg'>Banco: <span className='font-normal'>{displayValue(data.bank_account?.bank?.name)}</span></p>
                    <p className='font-bold text-lg'>Cuenta: <span className='font-normal'>{displayValue(data.bank_account?.name)} ({displayValue(data.bank_account?.account_number)})</span></p>
                    <p className='font-bold text-lg'>
                      Tarjeta: <span className='font-normal'>
                        {data.card ? <><CreditCard className='inline mr-1' /> {data.card.name} ({data.card.card_number})</> : 'Pendiente de completar'}
                      </span>
                    </p>
                  </div>

                  {/* Columna de Costos */}
                  <div className='flex flex-col gap-2 flex-1 min-w-[280px]'>
                    <p className='font-bold text-lg'>Tax: <span className='font-normal'>${displayValue(data.tax, '0')}</span></p>
                    <p className='font-bold text-lg'>Wire Fee: <span className='font-normal'>${displayValue(data.wire_fee, '0')}</span></p>
                    <p className='font-bold text-lg'>Handling Fee: <span className='font-normal'>${displayValue(data.handling_fee, '0')}</span></p>
                    <p className='font-bold text-lg'>Envío USA: <span className='font-normal'>${displayValue(data.usa_shipping, '0')}</span></p>
                    <p className='font-bold text-lg'>Envío OCK21: <span className='font-normal'>${displayValue(data.ock_shipping, '0')}</span></p>
                  </div>

                </div>
              </div>
            </div>

            {/* Justificación */}
            <div className='flex flex-col items-center'>
              <div className='text-xl font-bold text-gray-700 mb-2'>Justificación</div>
              <div className='bg-gray-100 p-4 rounded-lg text-center italic text-gray-900 max-w-3xl w-full'>
                {displayValue(data.justification, 'Pendiente de completar')}
              </div>
            </div>

          {/* Artículos */}
          <div className='flex flex-col gap-4'>
            <h2 className='text-2xl font-bold text-center mb-2'>Artículos</h2>

            <div className='overflow-x-auto'>
              <div className='flex flex-wrap justify-center gap-4'>
                {data.article_purchase_order.map((article) => (
                  <Card
                    key={article.article_part_number}
                    className='w-[280px] flex-shrink-0 border rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200'
                  >
                    <CardHeader className='p-4 bg-gray-50 border-b'>
                      <CardTitle className='text-lg font-bold text-center'>
                        {displayValue(article.batch?.name)} - {article.article_part_number}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className='flex flex-col gap-2 p-4 text-gray-900 text-left'>
                      <p className='font-bold'>Cantidad: <span className='font-normal'>{displayValue(article.quantity)} {displayValue(article.unit?.label, 'UNIDADES')}</span></p>
                      <p className='font-bold'>Tracking - USA: <span className='font-normal'>{displayValue(article.usa_tracking)}</span></p>
                      <p className='font-bold'>Tracking - OCK21: <span className='font-normal'>{displayValue(article.ock_tracking)}</span></p>
                      <p className='font-bold'>Ubicación: <span className='font-normal'>{displayValue(article.article_location)}</span></p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          </CardContent>

          {/* Footer */}
          {data.status !== 'PAGADO' && (
            <CardFooter className='flex gap-2 justify-end'>
              <Button>Completar</Button>
              <Button onClick={() => setOpenDelete(true)} variant={"destructive"}><Trash2 /></Button>
            </CardFooter>
          )}
        </Card>
      )}

      {/* Dialogo de eliminación */}
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center text-3xl">¿Eliminar Cotización?</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant={"destructive"} onClick={() => setOpenDelete(false)}>Cancelar</Button>
            <Button>Borrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ContentLayout>
  );
};

export default CotizacionPage;