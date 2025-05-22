'use client';

import { useDeleteRequisition } from '@/actions/compras/requisiciones/actions';
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
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from '@/components/ui/separator';
import { useGetRequisitionByOrderNumber } from '@/hooks/compras/useGetRequisitionByOrderNumber';
import { cn } from '@/lib/utils';
import { useCompanyStore } from '@/stores/CompanyStore';
import { Loader2, Trash2, User } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

const InventarioPage = () => {
  const [openDelete, setOpenDelete] = useState<boolean>(false);
  const { selectedCompany } = useCompanyStore();
  const router = useRouter();
  const { order_number } = useParams<{ order_number: string }>();
  const { data, isLoading, isError } = useGetRequisitionByOrderNumber(selectedCompany?.split(" ").join("") ?? null, order_number);
  const { deleteRequisition } = useDeleteRequisition();

  if (isLoading) return <LoadingPage />;

  const handleDelete = async (id: number, company: string) => {
    await deleteRequisition.mutateAsync({
      id,
      company
    });
    router.push(`/${company}/general/requisiciones`);
  };

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <ContentLayout title='Inventario'>
      <div className='flex flex-col gap-y-2 mb-12'>
        <h1 className='text-4xl font-bold text-center'>Nro. Requisición: <span className='text-blue-600'>#{order_number}</span></h1>
        <p className='text-sm text-muted-foreground text-center italic'>
          Detalles de la orden de requisición #{order_number}
        </p>
      </div>

      <Card className='max-w-5xl mx-auto'>
        <CardHeader className='flex flex-col items-center'>
          <CardTitle className='flex justify-center text-5xl mb-2'>#{order_number}</CardTitle>
          <Badge className={cn("text-lg", data?.status === 'aprobada' ? "bg-green-500" : "bg-yellow-600")}>
            {data?.status.toUpperCase()}
          </Badge>
          <p className='text-sm text-muted-foreground mt-2'>
            Fecha de solicitud: {data && formatDate(data.submission_date)}
          </p>
        </CardHeader>

        <CardContent className='flex flex-col gap-8'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-lg'>
            <div className='flex flex-col gap-2 items-center'>
              <h1 className='font-medium'>Creado Por:</h1>
              <p className='font-bold flex gap-2 items-center'>
                <User size={18} /> {`${data?.created_by.first_name}`} {`${data?.created_by.last_name}`}
              </p>
            </div>
            <div className='flex flex-col gap-2 items-center'>
              <h1 className='font-medium'>Solicitado Por:</h1>
              <p className='font-bold flex gap-2 items-center'>
                <User size={18} /> {data?.requested_by}
              </p>
            </div>
            <div className='flex flex-col gap-2 items-center'>
              <h1 className='font-medium'>Recibido Por:</h1>
              <p className='font-bold flex gap-2 items-center'>
                <User size={18} /> {data?.received_by || 'No especificado'}
              </p>
            </div>
          </div>

          {data?.aircraft && (
            <div className='flex flex-col items-center gap-2'>
              <h1 className='font-medium'>Aeronave:</h1>
              <p className='font-bold'>
                {data.aircraft.model} - {data.aircraft.registration}
              </p>
            </div>
          )}

          <div className='text-center'>
            <h2 className='font-medium mb-2'>Justificación:</h2>
            <p className='italic bg-gray-100 p-4 rounded-lg'>{data?.justification}</p>
          </div>

          <div className='space-y-4'>
            <h2 className='text-xl font-bold text-center'>Artículos solicitados</h2>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {data?.batch.map((batch, batchIndex) => (
                <Card key={`batch-${batchIndex}`}>
                  <CardContent className='p-4 space-y-2'>
                    <div className='font-medium'>Descripción:</div>
                    <p className='font-bold italic'>{batch.batch_articles.description}</p>
                    <Separator />
                    <div className='font-medium'>Cantidad:</div>
                    <p className='font-bold'>{batch.batch_articles.quantity}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>

        <CardFooter className='flex gap-2 justify-end'>
          <Button>Aprobar</Button>
          <Button onClick={() => setOpenDelete(true)} variant={"destructive"}>
            <Trash2 className='mr-2' size={18} /> Eliminar
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center text-3xl">¿Eliminar Requisición?</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant={"outline"} onClick={() => setOpenDelete(false)}>Cancelar</Button>
            <Button
              variant={"destructive"}
              onClick={() => handleDelete(data!.id, selectedCompany!.split(" ").join(""))}
              disabled={deleteRequisition.isPending}
            >
              {deleteRequisition.isPending ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ContentLayout>
  );
};

export default InventarioPage;
