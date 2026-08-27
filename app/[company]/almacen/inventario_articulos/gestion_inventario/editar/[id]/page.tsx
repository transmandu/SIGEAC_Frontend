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
      <PageHeader className="mb-6" currentLabel={data?.part_number} />

      <div className="space-y-5">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Editar Artículo</h1>
          <p className="text-sm text-muted-foreground">
            Actualice los datos del artículo registrado en el inventario.
          </p>
        </div>

        {/* `showPreview`: esta es la edición formal del artículo, así que se
            confirma cómo queda antes de guardar. */}
        <RegisterArticleForm
          isEditing
          initialData={data}
          category={data?.batch?.category}
          showPreview
          onEditSuccess={() =>
            router.push(`/${selectedCompany?.slug}/almacen/inventario_articulos/gestion_inventario`)
          }
        />
      </div>
    </ContentLayout>
  );
};

export default EditArticlePage;
