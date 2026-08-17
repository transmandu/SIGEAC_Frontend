'use client';

import RegisterArticleForm from '@/components/forms/mantenimiento/almacen/RegisterArticleForm';
import { ContentLayout } from '@/components/layout/ContentLayout';
import LoadingPage from '@/components/misc/LoadingPage';
import { useGetArticleById } from '@/hooks/mantenimiento/almacen/articulos/useGetArticleById';
import { useCompanyStore } from '@/stores/CompanyStore';
import { redirect, useParams, useRouter } from 'next/navigation';
import { PageHeader } from "@/components/layout/PageHeader";

const EditArticlePage = () => {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { selectedCompany } = useCompanyStore();
  const { data, isLoading, isError } = useGetArticleById(params.id, selectedCompany?.slug);
  if (isLoading) {
    return <LoadingPage />;
  }
  if (isError) {
    redirect(`/${selectedCompany?.slug}/dashboard`);
  }
  return (
    <ContentLayout title="Editar Articulo">
      <PageHeader className="mb-6" />

      <RegisterArticleForm
        isEditing
        initialData={data}
        category={data?.batch?.category}
        onEditSuccess={() =>
          router.push(`/${selectedCompany?.slug}/almacen/inventario_articulos`)
        }
      />
    </ContentLayout>
  );
};

export default EditArticlePage;
