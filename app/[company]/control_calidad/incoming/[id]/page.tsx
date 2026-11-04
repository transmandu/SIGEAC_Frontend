"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import LoadingPage from "@/components/misc/LoadingPage";
import { EmptyState } from "@/components/misc/EmptyState";
import { Button } from "@/components/ui/button";
import { useGetArticleById } from "@/hooks/mantenimiento/almacen/articulos/useGetArticleById";
import { statusDisplay } from "@/lib/warehouse/statuses";
import { useCompanyStore } from "@/stores/CompanyStore";
import { AlertCircle, ClipboardX, SearchX } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { INSPECTABLE_STATUSES } from "@/app/[company]/control_calidad/incoming/IncomingTypes";
import { IncomingReview } from "./_components/IncomingReview";

const IncomingPage = () => {
  const { selectedCompany } = useCompanyStore();
  const params = useParams<{ id: string }>();
  const {
    data: article,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetArticleById(params.id, selectedCompany?.slug);

  if (isLoading) return <LoadingPage />;

  const listHref = `/${selectedCompany?.slug}/control_calidad/incoming`;
  const backToList = (
    <Button asChild variant="outline" size="sm">
      <Link href={listHref}>Volver a Incoming</Link>
    </Button>
  );

  // Un 404 es que el artículo no existe; cualquier otro fallo (red, permisos,
  // servidor) no dice nada sobre eso y tiene que poder reintentarse.
  const notFound =
    (error as { response?: { status?: number } } | null)?.response?.status ===
    404;

  const status = article?.status?.toUpperCase();
  const inspectable = !!status && INSPECTABLE_STATUSES.includes(status);

  const message = (() => {
    if (isError && !notFound) {
      return (
        <EmptyState
          tone="error"
          icon={AlertCircle}
          title="No se pudo cargar el artículo"
          description="Revise su conexión e intente de nuevo."
          className="py-20"
          action={
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => refetch()}
            >
              Reintentar
            </Button>
          }
        />
      );
    }

    if (!article) {
      return (
        <EmptyState
          icon={SearchX}
          title="No se encontró el artículo"
          className="py-20"
          action={backToList}
        />
      );
    }

    if (!inspectable) {
      return (
        <EmptyState
          icon={ClipboardX}
          title="Este artículo ya no está pendiente de inspección"
          description={`Su estado actual es ${statusDisplay(article.status ?? "—")}.`}
          className="py-20"
          action={backToList}
        />
      );
    }

    return null;
  })();

  return (
    <ContentLayout title="Incoming">
      <PageHeader className="mb-6" currentLabel={article?.part_number} />

      {message ?? <IncomingReview article={article} />}
    </ContentLayout>
  );
};

export default IncomingPage;
