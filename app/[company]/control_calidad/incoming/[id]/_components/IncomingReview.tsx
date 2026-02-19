"use client";

import { Separator } from "@/components/ui/separator";
import { useGetIncomingChecks } from "@/hooks/mantenimiento/control_calidad/useGetIncomingInspectionChecks";
import {
  Factory,
  FileText,
  Hash,
  Loader2,
  Package,
  ShieldAlert,
  Tag
} from "lucide-react";
import { useMemo, useState } from "react";
import { ChecklistValue } from "../../IncomingTypes";
import { IncomingHeader } from "./IncomingHeader";
import { IncomingSidebar } from "./IncomingSidebar";
import { ReadOnlyField } from "./ReadOnlyField";
export function IncomingReview({
  article,
}: {
  article: any; // cambia a EditingArticle
}) {
  const hasDocs = !!article?.has_documentation;
  const anyDocUploaded = !!(
    article?.certificate_8130 ||
    article?.certificate_fabricant ||
    article?.certificate_vendor ||
    article?.image
  );
  const docRisk = hasDocs && !anyDocUploaded;
  const { data: groups = [], isLoading: isChecksLoading } = useGetIncomingChecks(hasDocs);
  const [checklist, setChecklist] = useState<Record<string, ChecklistValue>>({});
  const [inspectorNotes, setInspectorNotes] = useState("");
  const flat = useMemo(() => groups.flatMap((g) => g.items), [groups]);
  const total = flat.length;
  const done = flat.filter((i) => checklist[i.key] !== undefined).length;
  const okCount = flat.filter((i) => checklist[i.key] === true).length;
  const progress = total ? Math.round((done / total) * 100) : 0;

  const requiredKeys = flat.filter((i) => i.requiredForAccept).map((i) => i.key);
  const requiredPassed = requiredKeys.every((k) => checklist[k] === true || checklist[k] === "NA");

  const allDecided = flat.every((i) => checklist[i.key] !== undefined);

// “todo OK” significa: todos evaluados y todos en true
  const allOk = allDecided && flat.every((i) => checklist[i.key] === true);

  return (
    <div className="max-w-7xl mx-auto px-4 pb-10">
      <IncomingHeader
        article={article}
        progress={progress}
        done={done}
        total={total}
        okCount={okCount}
        docRisk={docRisk}
      />

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6">
        <div className="space-y-6">
          {/* Identificación */}
          <section>
            <h2 className="text-sm font-semibold">Identificación</h2>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
              <ReadOnlyField
                label="Part Number"
                value={article?.part_number}
                icon={<Hash className="h-4 w-4" />}
                mono
              />
              <ReadOnlyField
                label="Serial"
                value={
                  Array.isArray(article?.serial) ? (
                    <div className="flex flex-wrap gap-2">
                      {article.serial.map((s: string) => (
                        <span
                          key={s}
                          className="px-2 py-1 rounded-full border text-xs font-mono"
                        >
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
              <ReadOnlyField
                label="Descripción (Batch)"
                value={article?.batch?.name}
                icon={<Package className="h-4 w-4" />}
              />
              <ReadOnlyField
                label="Condición"
                value={article?.condition?.name}
                icon={<ShieldAlert className="h-4 w-4" />}
              />
              <ReadOnlyField
                label="Fabricante"
                value={article?.manufacturer?.name}
                icon={<Factory className="h-4 w-4" />}
              />
            </div>
          </section>

          <Separator />

          {/* Documentos */}
          <section>
            <h2 className="text-sm font-semibold">Documentos</h2>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
              <ReadOnlyField
                label="8130"
                value={article?.certificate_8130 ? "Cargado" : "—"}
                icon={<FileText className="h-4 w-4" />}
              />
              <ReadOnlyField
                label="Fabricante"
                value={article?.certificate_fabricant ? "Cargado" : "—"}
                icon={<FileText className="h-4 w-4" />}
              />
              <ReadOnlyField
                label="Vendedor"
                value={article?.certificate_vendor ? "Cargado" : "—"}
                icon={<FileText className="h-4 w-4" />}
              />
              <ReadOnlyField
                label="Imagen"
                value={article?.image ? "Cargada" : "—"}
                icon={<FileText className="h-4 w-4" />}
              />
            </div>

            {/* Aquí conectas tus handlers de preview/descarga */}
          </section>

          <Separator />

          {/* Observaciones */}
          <section>
            <h2 className="text-sm font-semibold">Observaciones</h2>
            <div className="mt-3 rounded-2xl border bg-background p-4 text-sm">
              {article?.description ? (
                article.description
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </div>
          </section>
        </div>

        {
          groups.length > 0 ? (
            <IncomingSidebar
              article_id={article.id}
              groups={groups}
              checklist={checklist}
              setChecklist={setChecklist}
              inspectorNotes={inspectorNotes}
              setInspectorNotes={setInspectorNotes}
            />
          ) :
          <div className="flex items-center justify-center h-full">
            <Loader2 className="animate-spin w-12 h-12" />
          </div>
        }

      </div>
    </div>
  );
}
