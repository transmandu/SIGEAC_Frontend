'use client';

import { useUpdateArticleStatus } from '@/actions/mantenimiento/almacen/inventario/articulos/actions';
import RegisterArticleForm from '@/components/forms/mantenimiento/almacen/RegisterArticleForm';
import { ContentLayout } from '@/components/layout/ContentLayout';
import { PageHeader } from "@/components/layout/PageHeader";
import LoadingPage from '@/components/misc/LoadingPage';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useGetArticleById } from '@/hooks/mantenimiento/almacen/articulos/useGetArticleById';
import { useCompanyStore } from '@/stores/CompanyStore';
import { BadgeCheck, Loader2 } from 'lucide-react';
import { redirect, useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

type ConfirmStep = 'saved' | 'direct' | null;

const ConfirmInventory = () => {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { selectedCompany } = useCompanyStore();
  const { data, isLoading, isError } = useGetArticleById(params.id, selectedCompany?.slug);
  const { updateArticleStatus } = useUpdateArticleStatus();
  const [step, setStep] = useState<ConfirmStep>(null);

  const backToTable = () =>
    router.push(`/${selectedCompany?.slug}/ingenieria/confirmar_inventario`);

  const confirmToStorage = () => {
    if (!data?.id) return;
    updateArticleStatus.mutate(
      { id: Number(data.id), status: 'STORED' },
      { onSuccess: backToTable },
    );
  };

  if (isLoading) {
    return <LoadingPage />;
  }
  if (isError) {
    redirect(`/${selectedCompany?.slug}/dashboard`);
  }

  const confirming = updateArticleStatus.isPending;

  return (
    <ContentLayout title="Confirmar Ingreso">
      <PageHeader className="mb-6" currentLabel={data?.part_number} />

      <div className="space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">Confirmar Ingreso</h1>
            <p className="text-sm text-muted-foreground">
              Revise y corrija los datos del artículo. Al guardar podrá confirmarlo o volver a la tabla.
            </p>
          </div>

          <Button variant="outline" className="gap-2" onClick={() => setStep('direct')}>
            <BadgeCheck className="size-4 text-green-600" />
            Confirmar sin cambios
          </Button>
        </div>

        <RegisterArticleForm
          isEditing
          initialData={data}
          category={data?.batch?.category}
          showPreview
          onEditSuccess={() => setStep('saved')}
        />
      </div>

      <Dialog
        open={step !== null}
        onOpenChange={(open) => {
          if (open || confirming) return;
          // Ya guardado, cerrar el aviso equivale a dejarlo pendiente en la tabla.
          if (step === 'saved') backToTable();
          setStep(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center">
              {step === 'saved' ? 'Artículo actualizado' : 'Confirmar Registro de Artículo'}
            </DialogTitle>
            <DialogDescription className="text-center">
              {step === 'saved'
                ? '¿Desea confirmar ahora su ingreso al almacén o volver a la tabla para confirmarlo después?'
                : 'Se confirmará el artículo con los datos guardados; los cambios sin guardar de este formulario se perderán.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2 md:gap-0">
            <Button
              variant="outline"
              disabled={confirming}
              onClick={() => (step === 'saved' ? backToTable() : setStep(null))}
            >
              {step === 'saved' ? 'Volver a la tabla' : 'Cancelar'}
            </Button>
            <Button disabled={confirming} onClick={confirmToStorage} className="min-w-45">
              {confirming ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                'Confirmar ingreso a almacén'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ContentLayout>
  );
};

export default ConfirmInventory;
