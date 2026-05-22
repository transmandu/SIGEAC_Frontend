'use client';

import DirectRegisterArticleForm from '@/app/[company]/almacen/ingresar_inventario/_components/DirectRegisterArticleForm';
import { ContentLayout } from '@/components/layout/ContentLayout';
import LoadingPage from '@/components/misc/LoadingPage';
import { useGetArticleById } from '@/hooks/mantenimiento/almacen/articulos/useGetArticleById';
import { useCompanyStore } from '@/stores/CompanyStore';
import { redirect, useParams } from 'next/navigation';

const ConfirmInventory = () => {
  const params = useParams<{ id: string }>();
  const { selectedCompany } = useCompanyStore();
  const { data, isLoading, isError } = useGetArticleById(params.id, selectedCompany?.slug);
  if (isLoading) {
    return <LoadingPage />;
  }
  if (isError) {
    redirect(`/${selectedCompany?.slug}/dashboard`);
  }
  return (
    <ContentLayout title="Confirmar Ingreso">
      <DirectRegisterArticleForm isEditing initialData={data} category={data?.batches?.category} />
    </ContentLayout>
  );
};

export default ConfirmInventory;
