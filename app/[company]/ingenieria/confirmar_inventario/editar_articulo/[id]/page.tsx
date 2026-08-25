'use client';

import RegisterArticleForm from '@/components/forms/mantenimiento/almacen/RegisterArticleForm';
import { ContentLayout } from '@/components/layout/ContentLayout';
import LoadingPage from '@/components/misc/LoadingPage';
import { useGetArticleById } from '@/hooks/mantenimiento/almacen/articulos/useGetArticleById';
import { useCompanyStore } from '@/stores/CompanyStore';
import { redirect, useParams } from 'next/navigation';
import { PageHeader } from "@/components/layout/PageHeader";

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
      <PageHeader className="mb-6" />

      <div className="space-y-5">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Confirmar Ingreso</h1>
          <p className="text-sm text-muted-foreground">
            Revise y complete los datos del artículo antes de confirmarlo.
          </p>
        </div>

        <RegisterArticleForm isEditing initialData={data} category={data?.batches?.category} />
      </div>
    </ContentLayout>
  );
};

export default ConfirmInventory;
