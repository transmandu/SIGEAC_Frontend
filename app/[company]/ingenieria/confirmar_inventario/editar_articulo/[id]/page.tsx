"use client";

import RegisterArticleForm from "@/components/forms/mantenimiento/almacen/RegisterArticleForm";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import LoadingPage from "@/components/misc/LoadingPage";
import { Button } from "@/components/ui/button";
import { useGetArticleById } from "@/hooks/mantenimiento/almacen/articulos/useGetArticleById";
import { useCompanyStore } from "@/stores/CompanyStore";
import { BadgeCheck } from "lucide-react";
import { redirect, useParams, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ApproveArticlesDialog } from "@/app/[company]/ingenieria/confirmar_inventario/_components/ApproveArticlesDialog";

type ConfirmStep = "saved" | "direct" | null;

const ConfirmInventory = () => {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { selectedCompany } = useCompanyStore();
  const { data, isLoading, isError } = useGetArticleById(
    params.id,
    selectedCompany?.slug,
  );
  const [step, setStep] = useState<ConfirmStep>(null);
  const approved = useRef(false);

  const backToTable = () =>
    router.push(`/${selectedCompany?.slug}/ingenieria/confirmar_inventario`);

  if (isLoading) {
    return <LoadingPage />;
  }
  if (isError) {
    redirect(`/${selectedCompany?.slug}/dashboard`);
  }

  const scope =
    data?.status?.toUpperCase() === "CHECKING" ? "checking" : "reception";

  return (
    <ContentLayout title="Confirmar Ingreso">
      <PageHeader className="mb-6" currentLabel={data?.part_number} />

      <div className="space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              Chequeo de información
            </h1>
            <p className="text-sm text-muted-foreground">
              Revise y corrija los datos del artículo. Al guardar podrá
              aprobarlo o volver a la tabla.
            </p>
          </div>

          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setStep("direct")}
          >
            <BadgeCheck className="size-4 text-green-600" />
            Aprobar sin cambios
          </Button>
        </div>

        <RegisterArticleForm
          isEditing
          initialData={data}
          category={data?.batch?.category}
          showPreview
          onEditSuccess={() => setStep("saved")}
        />
      </div>

      <ApproveArticlesDialog
        open={step !== null}
        onOpenChange={(open) => {
          if (open) return;
          // Ya guardado, cerrar el aviso equivale a dejarlo pendiente en la tabla.
          // Si lo cerró una aprobación, esa ya navega: no se navega dos veces.
          if (step === "saved" && !approved.current) backToTable();
          setStep(null);
        }}
        ids={data?.id ? [Number(data.id)] : []}
        scope={scope}
        title={
          step === "saved" ? "Artículo actualizado" : "Aprobar el artículo"
        }
        description={
          step === "saved"
            ? "¿Desea aprobarlo ahora o volver a la tabla para hacerlo después?"
            : "Se aprobará con los datos guardados; los cambios sin guardar de este formulario se perderán."
        }
        cancelLabel={step === "saved" ? "Volver a la tabla" : "Cancelar"}
        onApproved={() => {
          approved.current = true;
          backToTable();
        }}
      />
    </ContentLayout>
  );
};

export default ConfirmInventory;
