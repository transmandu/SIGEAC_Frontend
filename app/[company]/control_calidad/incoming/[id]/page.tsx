"use client"
import { ContentLayout } from '@/components/layout/ContentLayout'
import React from 'react'
import { IncomingReview } from '../../../control_calidad/incoming/_components/IncomingReview'
import { useParams } from 'next/navigation';
import { useGetArticle } from '@/hooks/mantenimiento/almacen/articulos/useGetArticle';
import { useGetArticleById } from '@/hooks/mantenimiento/almacen/articulos/useGetArticleById';
import LoadingPage from '@/components/misc/LoadingPage';
import { useCompanyStore } from '@/stores/CompanyStore';

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
            onConfirm={() => console.log("CONFIRM")}
            onTake={() => console.log("TAKE")}
            article={article}/>
        ) : (
          <p>No se encontró el artículo.</p>
        )
      }
    </ContentLayout>
  )
}

export default IncomingPage
