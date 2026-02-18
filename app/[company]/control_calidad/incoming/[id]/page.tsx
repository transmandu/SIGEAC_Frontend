"use client"
import { ContentLayout } from '@/components/layout/ContentLayout';
import LoadingPage from '@/components/misc/LoadingPage';
import { useGetArticleById } from '@/hooks/mantenimiento/almacen/articulos/useGetArticleById';
import { useCompanyStore } from '@/stores/CompanyStore';
import { useParams } from 'next/navigation';
import { IncomingReview } from './_components/IncomingReview';

const IncomingPage = () => {
  const {selectedCompany} = useCompanyStore();
  const params = useParams<{ id: string }>();
  const { data: article, isLoading } = useGetArticleById(params.id, selectedCompany?.slug);
  if(isLoading) return <LoadingPage />;
  return (
    <ContentLayout title='Incoming'>
      {
        article ? (
          <IncomingReview
            article={article}/>
        ) : (
          <p>No se encontró el artículo.</p>
        )
      }
    </ContentLayout>
  )
}

export default IncomingPage
