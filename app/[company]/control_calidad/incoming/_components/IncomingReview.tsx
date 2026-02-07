"use client";

import { useMemo, useState } from "react";
import { Separator } from "@/components/ui/separator";
import {
  CalendarDays,
  Factory,
  FileText,
  Hash,
  MapPin,
  Package,
  ShieldAlert,
  Tag,
} from "lucide-react";

import { IncomingHeader } from "./IncomingHeader";
import { IncomingSidebar } from "./IncomingSidebar";
import { ReadOnlyField } from "./ReadOnlyField";
import type { ChecklistGroup, ChecklistValue, IncomingConfirmPayload } from "@/app/[company]/almacen/incoming/IncomingTypes";

export function IncomingReview({
  article,
  onConfirm,
  onTake,
}: {
  article: any; // cambia a EditingArticle
  onConfirm: (payload: IncomingConfirmPayload) => void;
  onTake?: () => void;
}) {
  const groups: ChecklistGroup[] = useMemo(
    () => [
      {
        title: "Coincidencia física",
        icon: <Package className="h-4 w-4" />,
        items: [
          { key: "pn_match", label: "P/N coincide con etiqueta", requiredForAccept: true },
          { key: "serial_match", label: "Serial coincide (si aplica)", requiredForAccept: true },
          { key: "package_ok", label: "Embalaje en buen estado", hint: "Si hay daño, describe en notas.", requiredForAccept: true },
        ],
      },
      {
        title: "Fechas y vida",
        icon: <CalendarDays className="h-4 w-4" />,
        items: [
          { key: "shelf_ok", label: "Shelf-life válido (si aplica)", requiredForAccept: true },
          { key: "life_limit_reviewed", label: "Life limit revisado (si aplica)" },
        ],
      },
      {
        title: "Documentación",
        icon: <FileText className="h-4 w-4" />,
        items: [
          { key: "doc_8130", label: "8130 presente o N/A", requiredForAccept: !!article?.has_documentation },
          { key: "doc_mfg", label: "Certificado fabricante presente o N/A", requiredForAccept: !!article?.has_documentation },
          { key: "doc_vendor", label: "Certificado vendedor presente o N/A", requiredForAccept: !!article?.has_documentation },
        ],
      },
    ],
    [article?.has_documentation],
  );

  const [checklist, setChecklist] = useState<Record<string, ChecklistValue>>({});

  const flat = useMemo(() => groups.flatMap((g) => g.items), [groups]);
  const total = flat.length;
  const done = flat.filter((i) => checklist[i.key] !== undefined).length;
  const okCount = flat.filter((i) => checklist[i.key] === true).length;
  const progress = total ? Math.round((done / total) * 100) : 0;

  const requiredKeys = flat.filter((i) => i.requiredForAccept).map((i) => i.key);
  const requiredPassed = requiredKeys.every((k) => checklist[k] === true || checklist[k] === "NA");

  const hasDocs = !!article?.has_documentation;
  const anyDocUploaded = !!(
    article?.certificate_8130 ||
    article?.certificate_fabricant ||
    article?.certificate_vendor ||
    article?.image
  );
  const docRisk = hasDocs && !anyDocUploaded;

  return (
    <div className="max-w-7xl mx-auto px-4 pb-10">
      <IncomingHeader
        article={article}
        progress={progress}
        done={done}
        total={total}
        okCount={okCount}
        docRisk={docRisk}
        onTake={onTake}
      />

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6">
        <div className="space-y-6">
          {/* Identificación */}
          <section>
            <h2 className="text-sm font-semibold">Identificación</h2>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
              <ReadOnlyField label="Part Number" value={article?.part_number} icon={<Hash className="h-4 w-4" />} mono />
              <ReadOnlyField
                label="Serial"
                value={
                  Array.isArray(article?.serial) ? (
                    <div className="flex flex-wrap gap-2">
                      {article.serial.map((s: string) => (
                        <span key={s} className="px-2 py-1 rounded-full border text-xs font-mono">
                          {s}
                        </span>
                      ))}
                    </div>
                  ) : (
                    article?.serial
                  )
                }
                icon={<Tag className="h-4 w-4" />}
                mono
              />
              <ReadOnlyField label="Descripción (Batch)" value={article?.batches?.name} icon={<Package className="h-4 w-4" />} />
              <ReadOnlyField label="Condición" value={article?.condition?.name} icon={<ShieldAlert className="h-4 w-4" />} />
              <ReadOnlyField label="Fabricante" value={article?.manufacturer?.name} icon={<Factory className="h-4 w-4" />} />
              <ReadOnlyField label="Zona actual" value={article?.zone} icon={<MapPin className="h-4 w-4" />} />
            </div>
          </section>

          <Separator />

          {/* Ciclo de vida */}
          <section>
            <h2 className="text-sm font-semibold">Ciclo de vida</h2>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
              <ReadOnlyField label="Fabricación" value={article?.part_component?.fabrication_date} icon={<CalendarDays className="h-4 w-4" />} />
              <ReadOnlyField label="Vencimiento" value={article?.part_component?.expiration_date} icon={<CalendarDays className="h-4 w-4" />} />
              <ReadOnlyField
                label="Shelf life"
                value={
                  article?.part_component?.shelf_life
                    ? `${article.part_component.shelf_life} ${article.part_component.shelf_life_unit ?? ""}`
                    : undefined
                }
                icon={<CalendarDays className="h-4 w-4" />}
              />
              <ReadOnlyField label="Life limit calendar" value={article?.part_component?.life_limit_part_calendar} icon={<CalendarDays className="h-4 w-4" />} />
            </div>
          </section>

          <Separator />

          {/* Documentos */}
          <section>
            <h2 className="text-sm font-semibold">Documentos</h2>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
              <ReadOnlyField label="8130" value={article?.certificate_8130 ? "Cargado" : "—"} icon={<FileText className="h-4 w-4" />} />
              <ReadOnlyField label="Fabricante" value={article?.certificate_fabricant ? "Cargado" : "—"} icon={<FileText className="h-4 w-4" />} />
              <ReadOnlyField label="Vendedor" value={article?.certificate_vendor ? "Cargado" : "—"} icon={<FileText className="h-4 w-4" />} />
              <ReadOnlyField label="Imagen" value={article?.image ? "Cargada" : "—"} icon={<FileText className="h-4 w-4" />} />
            </div>

            {/* Aquí conectas tus handlers de preview/descarga */}
          </section>

          <Separator />

          {/* Observaciones */}
          <section>
            <h2 className="text-sm font-semibold">Observaciones</h2>
            <div className="mt-3 rounded-2xl border bg-background p-4 text-sm">
              {article?.description ? article.description : <span className="text-muted-foreground">—</span>}
            </div>
          </section>
        </div>

        <IncomingSidebar
          groups={groups}
          checklist={checklist}
          setChecklist={setChecklist}
          requiredPassed={requiredPassed}
          progress={progress}
          onConfirm={onConfirm}
        />
      </div>
    </div>
  );
}
