'use client';

import { useDeleteRequisition } from '@/actions/mantenimiento/compras/requisiciones/actions';
import { ContentLayout } from '@/components/layout/ContentLayout';
import LoadingPage from '@/components/misc/LoadingPage';
import BackButton from '@/components/misc/BackButton';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Separator } from '@/components/ui/separator';
import { useGetRequisitionByOrderNumber } from '@/hooks/mantenimiento/compras/useGetRequisitionByOrderNumber';
import { cn } from '@/lib/utils';
import { useCompanyStore } from '@/stores/CompanyStore';
import { FileText, User, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import DeleteRequisitionDialog from './_components/DeleteRequisitionDialog';

const RequisitionPage = () => {
  const [openDelete, setOpenDelete] = useState<boolean>(false);
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

    router.push(`/${selectedCompany!.slug}/compras/requisiciones`);
  };

  return (
    <ContentLayout title='Inventario'>
      <div className="flex items-center gap-2 mb-4">
        <BackButton iconOnly tooltip="Volver" variant="secondary"/>
        <h1 className='text-4xl font-bold text-center flex-1'>
          Nro. Requisición: <span className='text-blue-600'>#{order_number}</span>
        </h1>
      </div>

      <p className='text-sm text-muted-foreground text-center italic mb-6'>
        Detalles de la orden de requisición #{order_number}
      </p>

      <Card className='max-w-7xl mx-auto'>
        <CardHeader className='flex flex-col items-center'>
          <CardTitle className='flex justify-center text-5xl mb-2'>
            #{order_number}
          </CardTitle>
          <Badge className={cn("text-lg", data?.status === 'APROBADO' ? "bg-green-500" : "bg-yellow-600")}>
            {data?.status.toUpperCase()}
          </Badge>
        </CardHeader>

        <CardContent className='flex flex-col gap-4'>
          {data?.image && (
            <div className="flex flex-col items-center gap-2">
              <div className="relative w-[250px] h-[250px]">
                <Image
                  src={data.image.startsWith('data:image') ? data.image : `data:image/jpeg;base64,${data.image}`}
                  alt="Imagen de la requisición"
                  fill
                  className="object-contain border rounded-md"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Imagen adjunta a la requisición
              </p>
            </div>
          )}

          <div className='flex w-full justify-center gap-24 text-xl'>
            <div className='flex flex-col gap-2 items-center'>
              <h1>Creado Por:</h1>
              <p className='font-bold flex gap-2 items-center'>
                <User /> {data?.created_by.first_name} {data?.created_by.last_name}
              </p>
            </div>
            <div className='flex flex-col gap-2 items-center'>
              <h1>Solicitado Por:</h1>
              <p className='font-bold flex gap-2 items-center'>
                <User /> {data?.requested_by}
              </p>
            </div>
          </div>

          <div className='text-center'>
            <h2 className='font-semibold text-lg mb-2'>Justificación:</h2>
            <p className='font-medium italic bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-4 rounded-md'>
              {data?.justification || "No se proporcionó justificación"}
            </p>
          </div>

          <div className='flex flex-wrap justify-center gap-4'>
            {data && data.batch.map((batch) => (
              <Card key={batch.id} className='w-full max-w-xl'>
                <CardHeader className='pb-2'>
                  <CardTitle className='text-2xl text-center'>
                    {batch.name}
                  </CardTitle>
                </CardHeader>

                <CardContent className='space-y-4'>
                  {batch.batch_articles.map((article, index) => (
                    <div key={`${article.article_part_number}-${index}`} className='space-y-4'>
                      <div className='grid grid-cols-1 md:grid-cols-2'>
                        <div className='space-y-2'>
                          <h3 className='font-semibold text-lg flex items-center gap-2'>
                            <FileText className='h-5 w-5' /> Artículo {index + 1}
                          </h3>

                          <div className='grid grid-cols-2 gap-2'>
                            <div>
                              <p className='text-sm text-muted-foreground'>N° Parte:</p>
                              <p className='font-medium'>{article.article_part_number || "N/A"}</p>
                            </div>

                            <div>
                              <p className='text-sm text-muted-foreground'>N° Parte Alt:</p>
                              <p className='font-medium'>{article.article_alt_part_number || "N/A"}</p>
                            </div>

                            <div>
                              <p className='text-sm text-muted-foreground'>Cantidad:</p>
                              <p className='font-medium'>{article.quantity}</p>
                            </div>

                            {article.manual && (
                              <div>
                                <p className='text-sm text-muted-foreground'>Manual:</p>
                                <p className='font-medium'>{article.manual}</p>
                              </div>
                            )}

                            {article.reference_cod && (
                              <div>
                                <p className='text-sm text-muted-foreground'>Cód. Referencia:</p>
                                <p className='font-medium'>{article.reference_cod}</p>
                              </div>
                            )}

                            {article.pma && (
                              <div>
                                <p className='text-sm text-muted-foreground'>PMA:</p>
                                <p className='font-medium'>{article.pma}</p>
                              </div>
                            )}

                            {article.justification && (
                              <div className='col-span-2'>
                                <p className='text-sm text-muted-foreground'>Justificación:</p>
                                <p className='font-medium italic'>{article.justification}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className='flex flex-col items-center'>
                          {article.image ? (
                            <>
                              <div className='max-w-xs'>
                                <Image
                                  src={article.image.startsWith('data:image')
                                    ? article.image
                                    : `data:image/jpeg;base64,${article.image}`}
                                  alt={`Imagen del artículo ${article.article_part_number}`}
                                  className='max-h-48 object-contain border rounded-md'
                                  width={300}
                                  height={200}
                                />
                              </div>
                              <p className='text-sm text-muted-foreground mt-2'>
                                Imagen del artículo
                              </p>
                            </>
                          ) : (
                            <div className='flex flex-col items-center justify-center h-full text-muted-foreground'>
                              <ImageIcon className='h-12 w-12' />
                              <p className='text-sm mt-2'>No hay imagen</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {index < batch.batch_articles.length - 1 && (
                        <Separator className='my-4' />
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>

        <CardFooter className='flex justify-end'>
          <DeleteRequisitionDialog
            open={openDelete}
            onOpenChange={setOpenDelete}
            onConfirm={handleDelete}
            loading={deleteRequisition.isPending}
            status={data?.status}
          />
        </CardFooter>
      </Card>
    </ContentLayout>
  );
};

export default RequisitionPage;