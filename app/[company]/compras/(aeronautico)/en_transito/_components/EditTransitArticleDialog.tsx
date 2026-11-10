"use client";

import RegisterArticleForm from "@/components/forms/mantenimiento/almacen/RegisterArticleForm";
import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import { Dialog } from "@/components/ui/dialog";
import { useGetArticleById } from "@/hooks/mantenimiento/almacen/articulos/useGetArticleById";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useQueryClient } from "@tanstack/react-query";
import { FilePen, Loader2 } from "lucide-react";

interface Props {
  articleId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * Rótulos del encabezado. Almacén también monta este diálogo, sobre artículos
   * que ya están en recepción, y ahí el texto por defecto nombra un estado que
   * el artículo dejó atrás.
   */
  title?: string;
  description?: string;
}

/**
 * Diálogo de edición parcial de un artículo en tránsito, para el personal de
 * compras: permite ir agregando/actualizando datos y documentación de forma
 * progresiva (pre-revisión) sin salir de la vista de tránsito. No exige
 * completitud: el pase final a recepción lo gobierna el botón de acciones.
 */
export function EditTransitArticleDialog({
  articleId,
  open,
  onOpenChange,
  title = "Editar artículo en tránsito",
  description = "Agregue o actualice progresivamente los datos y la documentación del artículo a medida que la recibe. Puede guardar de forma parcial las veces que necesite.",
}: Props) {
  const { selectedCompany } = useCompanyStore();
  const queryClient = useQueryClient();

  const { data, isLoading } = useGetArticleById(
    open ? String(articleId) : "",
    selectedCompany?.slug,
  );

  const handleEditSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["article", String(articleId)] });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <FormDialogContent
        className="sm:max-w-6xl"
        icon={FilePen}
        title={title}
        description={description}
      >
        {isLoading || !data ? (
          <div className="flex min-h-50 items-center justify-center">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <RegisterArticleForm
            key={data.id}
            isEditing
            initialData={data}
            category={data.batch?.category}
            onEditSuccess={handleEditSuccess}
            onCancel={() => onOpenChange(false)}
            submitLabel="Guardar avance"
          />
        )}
      </FormDialogContent>
    </Dialog>
  );
}
