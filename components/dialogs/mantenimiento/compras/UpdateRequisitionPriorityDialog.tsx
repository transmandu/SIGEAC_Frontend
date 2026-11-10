"use client";

import { useState } from "react";
import { ArrowRight, Flag, Loader2, Package } from "lucide-react";

import { useUpdateRequisitionPriority } from "@/actions/mantenimiento/compras/requisiciones/actions";
import { useCompanyStore } from "@/stores/CompanyStore";
import type { MyRequisition, Requisition } from "@/types/purchase";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import LoadingPage from "@/components/misc/LoadingPage";
import { PanelSection } from "@/components/forms/PanelSection";
import {
  PriorityChoice,
  priorityLabel,
} from "@/components/forms/mantenimiento/compras/_components/PriorityChoice";

type Item = {
  id: number;
  /** Lo que identifica al artículo: número de parte o descripción. */
  title: string;
  /** Renglón al que pertenece, cuando lo tiene. */
  subtitle?: string;
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
        title: article.article_part_number,
        subtitle: batch.name,
        priority: article.priority,
      })),
  );

  const generalArticleItems: Item[] = (req.general_articles ?? []).map(
    (article) => ({
      id: article.id,
      title: article.description,
      priority: article.priority,
    }),
  );

  const items = [...articleItems, ...generalArticleItems];

  if (!selectedCompany) return <LoadingPage />;

  const currentOf = (item: Item) => articlePriorities[item.id] ?? item.priority;
  const changed = (item: Item) =>
    !!articlePriorities[item.id] &&
    articlePriorities[item.id] !== item.priority;

  const handleSubmit = async () => {
    const articles = articleItems
      .filter(changed)
      .map((item) => ({ id: item.id, priority: articlePriorities[item.id] }));

    const general_articles = generalArticleItems
      .filter(changed)
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
      className="sm:max-w-130"
      icon={Flag}
      tone="amber"
      title="Cambiar prioridad"
      description={
        <>
          Actualice la prioridad de la solicitud{" "}
          <span className="font-medium text-foreground">
            {req.order_number}
          </span>
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
            className="min-w-35 gap-2"
          >
            {updatePriorityRequisition.isPending && (
              <Loader2 className="size-4 animate-spin" />
            )}
            Guardar
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <PanelSection
          icon={Flag}
          title="Prioridad de la solicitud"
          hint={
            req.priority
              ? `Actual: ${priorityLabel(req.priority)}`
              : "Sin prioridad asignada."
          }
          compact
        >
          <PriorityChoice
            label="Prioridad de la solicitud"
            value={headerPriority}
            onChange={setHeaderPriority}
          />
        </PanelSection>

        {items.length > 0 && (
          <PanelSection
            icon={Package}
            title="Prioridad de los artículos"
            hint="Opcional. Solo se guardan los que cambie."
            compact
            action={
              items.length > 1 && headerPriority ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-[13px] max-sm:h-9"
                  onClick={() =>
                    setArticlePriorities(
                      Object.fromEntries(
                        items.map((item) => [item.id, headerPriority]),
                      ),
                    )
                  }
                >
                  Igualar a la solicitud
                </Button>
              ) : undefined
            }
          >
            {/* Filas separadas por una línea de borde a borde: sin recuadro
                por artículo, que en una lista corta pesaba más que el dato. */}
            <ul className="-m-3 divide-y divide-border/60">
              {items.map((item) => {
                const current = currentOf(item);
                const willChange = changed(item);

                return (
                  <li
                    key={item.id}
                    className="flex flex-col gap-2.5 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium wrap-anywhere">
                        {item.title}
                      </p>
                      <p className="flex flex-wrap items-center gap-x-1.5 text-[13px] text-muted-foreground">
                        {item.subtitle && (
                          <span className="wrap-anywhere">{item.subtitle}</span>
                        )}
                        {item.subtitle && <span aria-hidden>·</span>}
                        {willChange ? (
                          <span className="inline-flex items-center gap-1 font-medium text-amber-700 dark:text-amber-400">
                            {priorityLabel(item.priority) ?? "Sin prioridad"}
                            <ArrowRight className="size-3" aria-hidden />
                            {priorityLabel(current)}
                          </span>
                        ) : (
                          <span>
                            {item.priority
                              ? `Actual: ${priorityLabel(item.priority)}`
                              : "Sin prioridad"}
                          </span>
                        )}
                      </p>
                    </div>

                    <PriorityChoice
                      size="sm"
                      label={`Prioridad de ${item.title}`}
                      value={current}
                      onChange={(value) =>
                        setArticlePriorities((prev) => ({
                          ...prev,
                          [item.id]: value,
                        }))
                      }
                      placeholder="Sin cambio"
                      className="sm:w-40 sm:shrink-0"
                    />
                  </li>
                );
              })}
            </ul>
          </PanelSection>
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
