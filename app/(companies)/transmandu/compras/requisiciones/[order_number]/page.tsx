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

  const [openDelete, setOpenDelete] = useState<boolean>(false)

  const { selectedCompany } = useCompanyStore()

  const router = useRouter()

  const { order_number } = useParams<{ order_number: string }>()

  const { data, isLoading, isError } = useGetRequisitionByOrderNumber(selectedCompany?.split(" ").join("") ?? null, order_number);

  const { deleteRequisition } = useDeleteRequisition()

  if (isLoading) return <LoadingPage />

  const handleDelete = async (id: number, company: string) => {
    await deleteRequisition.mutateAsync({
      id,
      company
    });
    router.push(`/${company}/general/requisiciones`)
  }

  return (
    <ContentLayout title='Inventario'>
      <div className='flex flex-col gap-y-2 mb-12'>
        <h1 className='text-4xl font-bold text-center'>Nro. Requisición: <span className='text-blue-600'>#{order_number}</span></h1>
        <p className='text-sm text-muted-foreground text-center italic'>
          Detalles de la order de requisición #{order_number}
        </p>
      </div>
      <Card className='max-w-5xl mx-auto'>
        <CardHeader className='flex flex-col items-center'>
          <CardTitle className='flex justify-center text-5xl mb-2'>#{order_number}</CardTitle>
          <Badge className={cn("text-lg", data?.status === 'aprobada' ? "bg-green-500" : "bg-yellow-600")}>{data?.status.toUpperCase()}</Badge>
        </CardHeader>
        <CardContent className='flex flex-col gap-8' >
          <div className='flex w-full justify-center gap-24 text-xl'>
            <div className='flex flex-col gap-2 items-center'>
              <h1>Creado Por:</h1>
              <p className='font-bold flex gap-2 items-center'><User /> {`${data?.created_by.first_name}`} {`${data?.created_by.last_name}`}</p>
            </div>
            <div className='flex flex-col gap-2 items-center'>
              <h1>Solicitado Por:</h1>
              <p className='font-bold flex gap-2 items-center'><User /> {data?.requested_by}</p>
            </div>
          </div>
          <p className='text-center font-medium italic'>{data?.justification}</p>
          <div className='flex justify-center gap-2'>
            {
              data && data.batch.map((batch) => (
                <Card className='w-[280px] text-center' key={batch.id}>
                  <CardTitle className='p-6'>{batch.name}</CardTitle>
                  <CardContent>
                    {
                      batch.batch_articles.map((article) => (
                        <>
                          <div key={article.article_part_number} className='space-y-2'>
                            <p className='font-medium'>Nro. Parte: <span className='font-bold italic'>{article.article_part_number}</span></p>
                            {
                              article.unit && (
                                <p className='font-medium'>Unidad: <span className='font-bold italic'>{article.unit.unit.label} - {article.unit.unit.value}</span></p>
                              )
                            }
                            <p className='font-medium'>Cantidad: <span className='font-bold italic'>{article.quantity}</span></p>
                          </div>
                          <Separator />
                        </>
                      ))
                    }
                  </CardContent>
                </Card>

              ))
            }
          </div>
        </CardContent>
        <CardFooter className='flex gap-2 justify-end'>
          <Button>Aprobar</Button>
          <Button onClick={() => setOpenDelete(true)} variant={"destructive"}><Trash2 /></Button>
        </CardFooter>
      </Card>
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center text-3xl">¿Eliminar Requisición?</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant={"destructive"} onClick={() => setOpenDelete(false)}>Cancelar</Button>
            <Button className={cn("", data?.status === 'aprobado' ? "hidden" : "flex")} onClick={() => handleDelete(data!.id, selectedCompany!.split(" ").join(""))} disabled={deleteRequisition.isPending}>{deleteRequisition.isPending ? <Loader2 className="animate-spin size-4" /> : "Confirmar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ContentLayout>
  )
}

export default InventarioPage
