"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Boxes,
  CalendarClock,
  CheckCircle2,
  CircleAlert,
  ClipboardList,
  Eye,
  FileWarning,
  Fingerprint,
  Gauge,
  MapPin,
  Package,
  PencilLine,
  Plane,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanyStore } from "@/stores/CompanyStore";
import { EditTransitArticleDialog } from "@/app/[company]/compras/(aeronautico)/en_transito/_components/EditTransitArticleDialog";
import SecureFileViewer from "@/components/library/SecureFileViewer";
import axiosInstance from "@/lib/axios";
import { cn, toAltPartNumbers } from "@/lib/utils";
import type { TransitArticle } from "@/types/purchase/in-transit";
import type { ArticleDocument } from "@/types";
import { AssignDocumentRequirements } from "./AssignDocumentRequirements";

// SUPERUSER va en la lista como en el resto del módulo: opera sobre todas las
// sedes y sin él quedaba viendo la ficha sin poder editarla.
const EDIT_ROLES = [
  "SUPERUSER",
  "JEFE_ALMACEN",
  "ANALISTA_ALMACEN",
  "JEFE_MANTENIMIENTO",
];

const TRANSIT_STATUS_LABELS: Record<string, string> = {
  TRANSIT: "EN TRÁNSITO",
  RECEPTION: "EN RECEPCIÓN",
};

/**
 * Cada categoría trae su icono y su rótulo: la ficha de una herramienta y la de
 * un componente describen cosas distintas, y el encabezado de su sección es lo
 * que lo anuncia antes de leer los campos.
 */
const CATEGORY_META: Record<string, { label: string; icon: LucideIcon }> = {
  CONSUMABLE: { label: "Consumible", icon: Boxes },
  TOOL: { label: "Herramienta", icon: Wrench },
  COMPONENT: { label: "Componente", icon: Plane },
  PART: { label: "Parte", icon: Package },
};

type FieldSpec = {
  label: string;
  value?: string | number | null;
  /** Resalta el valor: es el dato por el que se abre la ficha. */
  strong?: boolean;
  span?: 1 | 2;
};

const isBlank = (value: FieldSpec["value"]) =>
  value === null ||
  value === undefined ||
  (typeof value === "string" && value.trim() === "");

/** Dato suelto: rótulo arriba en versalitas, valor debajo. */
function Field({ label, value, strong, span = 1 }: FieldSpec) {
  const empty = isBlank(value);

  return (
    <div className={cn("min-w-0", span === 2 && "sm:col-span-2")}>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
        {label}
      </p>
      <p
        className={cn(
          "mt-0.5 truncate text-[13px] leading-snug",
          strong && !empty && "font-mono font-semibold",
          empty && "text-muted-foreground/40",
        )}
        title={empty ? undefined : String(value)}
      >
        {empty ? "—" : value}
      </p>
    </div>
  );
}

function FieldGrid({ fields }: { fields: FieldSpec[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-4 sm:grid-cols-3">
      {fields.map((f) => (
        <Field key={f.label} {...f} />
      ))}
    </div>
  );
}

/**
 * Bloque de la ficha, con el mismo cristal y encabezado que las secciones de
 * los formularios de artículo: es la misma información y se estaba viendo con
 * un lenguaje visual propio que no se parecía a nada más del módulo.
 */
function Section({
  icon: Icon,
  title,
  hint,
  tone = "default",
  children,
}: {
  icon: LucideIcon;
  title: string;
  hint?: string;
  tone?: "default" | "alert";
  children: React.ReactNode;
}) {
  const alert = tone === "alert";

  return (
    <section
      className={cn(
        "rounded-xl border bg-linear-to-br p-4 shadow-xs backdrop-blur-md",
        alert
          ? "border-orange-300 from-orange-50/80 to-orange-50/40 dark:border-orange-700/60 dark:from-orange-950/40 dark:to-orange-950/20"
          : "border-slate-400/50 from-background/70 to-background/40 dark:border-slate-600/50",
      )}
    >
      <div className={cn("flex gap-3", hint ? "items-start" : "items-center")}>
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-lg",
            hint && "mt-0.5",
            alert
              ? "bg-orange-600 text-white"
              : "bg-primary/10 text-primary",
          )}
        >
          <Icon className="size-4" />
        </span>
        <div className="min-w-0 flex-1 space-y-1">
          <h3
            className={cn(
              "text-sm font-semibold leading-none",
              alert && "text-orange-900 dark:text-orange-200",
            )}
          >
            {title}
          </h3>
          {hint && (
            <p
              className={cn(
                "text-xs",
                alert
                  ? "text-orange-900/80 dark:text-orange-200/80"
                  : "text-muted-foreground",
              )}
            >
              {hint}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4">{children}</div>
    </section>
  );
}

export function ArticleDetailDialog({ article }: { article: TransitArticle }) {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<ArticleDocument | null>(null);
  const { user } = useAuth();
  const { selectedCompany } = useCompanyStore();

  const status = article.status?.toUpperCase();
  const isReception = status === "RECEPTION";

  const roles = user?.roles?.map((r) => r.name) ?? [];
  const canEdit = isReception && EDIT_ROLES.some((r) => roles.includes(r));

  const location = article.batch?.warehouse?.location;
  // El `?? []` crea un array nuevo en cada render, y eso invalidaba el memo de
  // `assignedTypeIds` que depende de él: la referencia tiene que ser estable.
  const requirements = useMemo(
    () => article.document_requirements ?? [],
    [article.document_requirements],
  );
  const category = article.batch?.category?.toUpperCase();
  const categoryMeta = category ? CATEGORY_META[category] : undefined;

  // Los datos de categoría llegan con la fila, así que la ficha se pinta
  // completa de una vez. Antes esta sección los pedía al abrirse contra el
  // endpoint del formulario de edición, que carga catorce relaciones: se veía
  // cargando cuando todo lo demás ya estaba puesto.
  const categoryDetails = article.category_details;

  // Mientras nadie declare qué documentos exige el artículo, compras no tiene
  // qué buscar. Es el motivo que almacén resuelve sin esperar a nadie, así que
  // se señala desde el ícono, antes de que alguien abra la ficha.
  const needsDocumentsDeclared =
    isReception &&
    (article.incoming_readiness?.reasons ?? []).includes(
      "MISSING_DOCUMENT_REQUIREMENTS",
    );

  const consignedCount = requirements.filter(
    (req) => req.documents.length > 0,
  ).length;

  // Memoizados porque este componente se monta una vez por fila de la tabla: el
  // mapeo corría en cada render de la lista, con el diálogo cerrado.
  //
  // El serial y la cantidad ya se muestran en Identificación, así que la sección
  // de categoría solo lista lo que es propio de ella.
  const categoryFields: FieldSpec[] | null = useMemo(
    () =>
      categoryDetails
        ? categoryDetails.fields.map((field) => ({
            label: field.label,
            value:
              typeof field.value === "boolean"
                ? field.value
                  ? "Sí"
                  : "No"
                : field.value,
          }))
        : null,
    [categoryDetails],
  );

  const assignedTypeIds = useMemo(
    () =>
      requirements
        .map((req) => req.document_type?.id)
        .filter((id): id is number => typeof id === "number"),
    [requirements],
  );

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "relative h-7 w-7",
                needsDocumentsDeclared
                  ? "text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
                  : "text-muted-foreground hover:text-foreground",
              )}
              onClick={() => setOpen(true)}
            >
              <Eye className="size-4" />
              {needsDocumentsDeclared && (
                <span className="absolute -right-0.5 -top-0.5 flex size-3.5 animate-pulse items-center justify-center rounded-full bg-orange-500 text-[9px] font-bold text-white">
                  !
                </span>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            {needsDocumentsDeclared
              ? "Indica qué documentos exige este artículo para que compras pueda conseguirlos"
              : "Ver detalle"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="flex max-h-[88vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl"
          // El visor de documentos se renderiza fuera del content de Radix,
          // así que sus clics cuentan como "interacción externa": sin estos
          // guards, cerrar el visor cerraría también esta ficha.
          onInteractOutside={(e) => {
            if (previewDoc) e.preventDefault();
          }}
          onEscapeKeyDown={(e) => {
            if (previewDoc) {
              e.preventDefault();
              setPreviewDoc(null);
            }
          }}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogTitle className="sr-only">
            Detalle del artículo {article.part_number}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Ficha de inventario del artículo {article.part_number}
          </DialogDescription>

          {/* Placa de identificación */}
          <div className="shrink-0 border-b bg-muted/40 px-6 py-5 pr-14">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  {categoryMeta && (
                    <span className="flex size-5 items-center justify-center rounded bg-primary/10 text-primary">
                      <categoryMeta.icon className="size-3" />
                    </span>
                  )}
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    {categoryMeta
                      ? `Ficha de ${categoryMeta.label.toLowerCase()}`
                      : "Ficha de artículo"}
                  </p>
                </div>
                <p className="mt-1 truncate font-mono text-2xl font-bold leading-tight tracking-tight">
                  {article.part_number}
                </p>
                <p className="truncate text-sm text-muted-foreground">
                  {article.batch?.name ?? "Sin descripción"}
                </p>
              </div>

              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <Badge
                  className={cn(
                    "rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                    isReception
                      ? "border-amber-300 bg-amber-100 text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/50 dark:text-amber-400"
                      : "border-sky-300 bg-sky-100 text-sky-800 dark:border-sky-800/60 dark:bg-sky-950/50 dark:text-sky-400",
                  )}
                >
                  {TRANSIT_STATUS_LABELS[status ?? ""] ?? "Sin estado"}
                </Badge>

                {needsDocumentsDeclared && (
                  <Badge className="animate-pulse rounded-md border border-orange-300 bg-orange-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-orange-800 dark:border-orange-700/60 dark:bg-orange-950/50 dark:text-orange-300">
                    <CircleAlert className="mr-1 size-2.5" />
                    Indica documentos
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
            <Section icon={Fingerprint} title="Identificación">
              <FieldGrid
                fields={[
                  {
                    label: "Número alterno",
                    value:
                      toAltPartNumbers(article.alternative_part_number).join(
                        " / ",
                      ) || null,
                    strong: true,
                  },
                  { label: "Serial", value: article.serial, strong: true },
                  { label: "Código ATA", value: article.ata_code },
                  { label: "Condición", value: article.condition?.name },
                  { label: "Fabricante", value: article.manufacturer?.name },
                  {
                    label: "Cantidad",
                    value:
                      article.quantity != null
                        ? `${article.quantity}${article.unit ? ` ${article.unit}` : ""}`
                        : null,
                  },
                ]}
              />
            </Section>

            <Section icon={ClipboardList} title="Origen y trazabilidad">
              <FieldGrid
                fields={[
                  {
                    label: "N° de orden de compra",
                    value: article.order_number,
                    strong: true,
                  },
                  {
                    label: "N° de requisición",
                    value: article.requisition_order_number,
                    strong: true,
                  },
                  {
                    label: "Fecha de recepción",
                    value: article.reception_date,
                  },
                ]}
              />
            </Section>

            <Section icon={MapPin} title="Ubicación">
              {location ? (
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">{location.address}</span>
                  {location.cod_iata && (
                    <span className="rounded border border-border/50 bg-muted/60 px-1.5 py-0.5 font-mono text-[10px]">
                      {location.cod_iata}
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground/50">
                  Sin ubicación registrada.
                </p>
              )}
            </Section>

            {/* Solo si la categoría aporta campos propios: una sección vacía
                para decir "sin datos" ocupaba el mismo espacio que una útil. */}
            {categoryFields && categoryFields.length > 0 && (
              <Section
                icon={categoryMeta?.icon ?? Gauge}
                title={`Datos de ${(categoryDetails?.label ?? categoryMeta?.label ?? "categoría").toLowerCase()}`}
              >
                <FieldGrid fields={categoryFields} />
              </Section>
            )}

            <Section
              icon={needsDocumentsDeclared ? CircleAlert : CalendarClock}
              title="Manifiesto documental"
              tone={needsDocumentsDeclared ? "alert" : "default"}
              hint={
                needsDocumentsDeclared
                  ? "Nadie ha indicado qué documentos exige este artículo. Márcalos para que compras pueda conseguirlos: por conocimiento técnico ustedes son quienes mejor saben cuáles corresponden."
                  : requirements.length > 0
                    ? `${consignedCount} de ${requirements.length} consignado${requirements.length === 1 ? "" : "s"}.`
                    : undefined
              }
            >
              {requirements.length > 0 ? (
                <ul className="divide-y divide-border/50">
                  {requirements.map((req) => {
                    const consigned = req.documents.length > 0;

                    return (
                      <li
                        key={req.id}
                        className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
                      >
                        <span
                          className={cn(
                            "flex size-7 shrink-0 items-center justify-center rounded-lg",
                            consigned
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                              : "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
                          )}
                        >
                          {consigned ? (
                            <CheckCircle2 className="size-3.5" />
                          ) : (
                            <FileWarning className="size-3.5" />
                          )}
                        </span>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-medium">
                            {req.document_type?.name ?? "Documento"}
                          </p>
                          <p className="truncate text-[10px] text-muted-foreground">
                            {req.document_type?.regulation ??
                              (consigned ? "Consignado" : "Pendiente de carga")}
                          </p>
                        </div>

                        {req.documents.map((doc, i) => (
                          <TooltipProvider key={doc.id}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-7 shrink-0 text-muted-foreground hover:text-foreground"
                                  onClick={() => setPreviewDoc(doc)}
                                >
                                  <Eye className="size-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                {req.documents.length > 1
                                  ? `Ver documento ${i + 1}`
                                  : "Ver documento"}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ))}
                      </li>
                    );
                  })}
                </ul>
              ) : !needsDocumentsDeclared ? (
                <p className="text-sm text-muted-foreground/50">
                  No hay documentación requerida para este artículo.
                </p>
              ) : null}

              {/* Declarar y consultar la documentación son la misma tarea vista
                  en dos momentos, así que comparten sección: separarlas dejaba
                  dos bloques hablando de lo mismo en la misma ficha. */}
              {needsDocumentsDeclared && (
                <AssignDocumentRequirements
                  articleId={article.id}
                  assignedTypeIds={assignedTypeIds}
                />
              )}
            </Section>
          </div>

          {canEdit && (
            <div className="flex shrink-0 justify-end border-t bg-muted/30 px-6 py-3">
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={() => setEditOpen(true)}
              >
                <PencilLine className="size-3.5" />
                Editar artículo
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {canEdit && editOpen && (
        <EditTransitArticleDialog
          articleId={article.id}
          open={editOpen}
          onOpenChange={setEditOpen}
          title="Editar artículo en recepción"
          description="Corrija o complete los datos y la documentación del artículo. Puede guardar de forma parcial las veces que necesite."
        />
      )}

      {previewDoc && (
        <SecureFileViewer
          isOpen={!!previewDoc}
          onClose={() => setPreviewDoc(null)}
          title={article.part_number}
          fetchBlobUrl={async () => {
            const { data } = await axiosInstance.get(
              `/${selectedCompany?.slug}/article-documents/${previewDoc.id}/view`,
              { responseType: "blob" },
            );
            return URL.createObjectURL(data);
          }}
        />
      )}
    </>
  );
}
