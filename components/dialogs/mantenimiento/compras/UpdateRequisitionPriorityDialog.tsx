"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Loader2, Minus, Tag } from "lucide-react";

import { useUpdateRequisitionPriority } from "@/actions/mantenimiento/compras/requisiciones/actions";
import { useCompanyStore } from "@/stores/CompanyStore";
import type { MyRequisition, Requisition } from "@/types/purchase";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import LoadingPage from "@/components/misc/LoadingPage";

const priorityOptions = [
  { value: "HIGH", label: "Alta", icon: ArrowUp, className: "text-red-500" },
  { value: "MEDIUM", label: "Media", icon: Minus, className: "text-amber-500" },
  { value: "LOW", label: "Baja", icon: ArrowDown, className: "text-green-500" },
];

const PriorityOptionLabel = ({ value }: { value: string }) => {
  const option = priorityOptions.find((p) => p.value === value);
  if (!option) return null;
  const Icon = option.icon;

  return (
    <span className="flex items-center gap-2">
      <Icon className={`size-3.5 ${option.className}`} />
      {option.label}
    </span>
  );
};

type Item = {
  id: number;
  label: string;
  priority?: string;
};

type Props = {
  req: Requisition | MyRequisition;
  open: boolean;
  setOpen: (open: boolean) => void;
  onSuccess?: () => void;
};

/**
 * El contenido vive aparte y se remonta en cada apertura (ver el `key` del
 * padre), de modo que su estado nace ya con la prioridad de la solicitud
 * actual: lo elegido para otra no queda preseleccionado.
 *
 * Antes se reiniciaba desde un efecto, que obliga a pintar el formulario con
 * los valores viejos y volver a renderizar con los nuevos
 * (react-hooks/set-state-in-effect). Remontar da el mismo resultado en un solo
 * render, y además cubre el caso de abrir cambiando `open` desde el padre, que
 * no pasa por `onOpenChange`.
 */
const PriorityForm = ({ req, setOpen, onSuccess }: Omit<Props, "open">) => {
  const { selectedCompany } = useCompanyStore();
  const { updatePriorityRequisition } = useUpdateRequisitionPriority();

  const [headerPriority, setHeaderPriority] = useState<string | undefined>(
    req.priority,
  );
  const [articlePriorities, setArticlePriorities] = useState<
    Record<number, string>
  >({});

  const articleItems: Item[] = (req.batch ?? []).flatMap((batch) =>
    (batch.batch_articles ?? [])
      .filter(
        (article): article is typeof article & { id: number } =>
          article.id != null,
      )
      .map((article) => ({
        id: article.id,
        label: `${batch.name} · ${article.article_part_number}`,
        priority: article.priority,
      })),
  );

  const generalArticleItems: Item[] = (req.general_articles ?? []).map(
    (article) => ({
      id: article.id,
      label: article.description,
      priority: article.priority,
    }),
  );

  const items = [...articleItems, ...generalArticleItems];

  if (!selectedCompany) return <LoadingPage />;

  const handleSubmit = async () => {
    const articles = articleItems
      .filter(
        (item) =>
          articlePriorities[item.id] &&
          articlePriorities[item.id] !== item.priority,
      )
      .map((item) => ({ id: item.id, priority: articlePriorities[item.id] }));

    const general_articles = generalArticleItems
      .filter(
        (item) =>
          articlePriorities[item.id] &&
          articlePriorities[item.id] !== item.priority,
      )
      .map((item) => ({ id: item.id, priority: articlePriorities[item.id] }));

    try {
      await updatePriorityRequisition.mutateAsync({
        id: req.id,
        data: {
          priority: headerPriority !== req.priority ? headerPriority : null,
          articles,
          general_articles,
        },
        company: selectedCompany.slug,
      });
    } catch {
      // La mutación ya avisó el error; el diálogo queda abierto.
      return;
    }

    setOpen(false);
    onSuccess?.();
  };

  return (
    <FormDialogContent
      className="sm:max-w-115"
      icon={Tag}
      tone="amber"
      title="Cambiar prioridad"
      description={
        <>
          Actualice la prioridad de la solicitud{" "}
          <span className="font-medium text-foreground">{req.order_number}</span>
          {items.length > 0 && " y, opcionalmente, la de sus artículos"}.
        </>
      }
      footer={
        <>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={updatePriorityRequisition.isPending}
            className="min-w-35"
          >
            {updatePriorityRequisition.isPending && (
              <Loader2 className="mr-2 size-4 animate-spin" />
            )}
            Guardar
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Prioridad de la solicitud (opcional)
          </label>
          <Select value={headerPriority} onValueChange={setHeaderPriority}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccione prioridad..." />
            </SelectTrigger>
            <SelectContent>
              {priorityOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <PriorityOptionLabel value={option.value} />
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {items.length > 0 && (
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-muted-foreground">
              Prioridad de los artículos (opcional)
            </label>

            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-2">
                <span className="flex-1 text-sm truncate" title={item.label}>
                  {item.label}
                </span>
                <Select
                  value={articlePriorities[item.id] ?? item.priority}
                  onValueChange={(value) =>
                    setArticlePriorities((prev) => ({
                      ...prev,
                      [item.id]: value,
                    }))
                  }
                >
                  <SelectTrigger className="w-32.5">
                    <SelectValue placeholder="Sin cambio" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <PriorityOptionLabel value={option.value} />
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        )}
      </div>
    </FormDialogContent>
  );
};

const UpdateRequisitionPriorityDialog = ({
  req,
  open,
  setOpen,
  onSuccess,
}: Props) => (
  <Dialog open={open} onOpenChange={setOpen}>
    {/* Montado solo mientras está abierto y con `key` por solicitud: así el
        formulario arranca limpio en cada apertura, sin reiniciarlo a mano. */}
    {open && (
      <PriorityForm
        key={req.id}
        req={req}
        setOpen={setOpen}
        onSuccess={onSuccess}
      />
    )}
  </Dialog>
);

export default UpdateRequisitionPriorityDialog;
