"use client";

import { Separator } from "@/components/ui/separator";
import {
  Factory,
  FileText,
  Hash,
  Package,
  ShieldAlert,
  Tag
} from "lucide-react";
import { useMemo, useState } from "react";
import { ChecklistGroup, ChecklistValue, IncomingConfirmPayload } from "../IncomingTypes";
import { IncomingHeader } from "./IncomingHeader";
import { IncomingSidebar } from "./IncomingSidebar";
import { ReadOnlyField } from "./ReadOnlyField";
export function IncomingReview({
  article,
}: {
  article: any; // cambia a EditingArticle
}) {
const groups: ChecklistGroup[] = useMemo(
  () => [
    {
      title: "Coincidencia física",
      icon: <Package className="h-4 w-4" />,
      items: [
        {
          key: "pn_serial_oc_match",
          label:
            "Verifique que P/N, Serial, Modelo y Lote coincidan con la Orden de Compra",
          hint:
            "Compare contra OC y etiqueta física. Si hay diferencias, registre en observaciones y no confirme.",
          requiredForAccept: true,
        },
        {
          key: "8130_21004_easa1_document",
          label:
            "Verifique el tipo de certificación aplicable (8130 / 21-004 / EASA 1)",
          hint:
            "Debe corresponder al origen del suministro y estar legible, completo y sin alteraciones.",
          requiredForAccept: true,
        },
        {
          key: "ms_an_nas_as_standars",
          label:
            "Partes estándar conforme a MS, AN, NAS y AS (si aplica)",
          hint:
            "Confirme identificación, marcaje y especificación. Si no aplica, marque N/A.",
          requiredForAccept: true,
        },
        {
          key: "canibalism_document",
          label:
            "Registros de liberación / historial (canibalización si aplica)",
          hint:
            "Adjunte evidencia o indique N/A. Si falta respaldo, no confirme.",
          requiredForAccept: true,
        },
        {
          key: "tso_standar",
          label:
            "Placa TSO emitida por la autoridad (si aplica)",
          hint:
            "Verifique presencia y legibilidad. Si el componente no es TSO, marque N/A.",
          requiredForAccept: true,
        },
        {
          key: "pma",
          label:
            "Placa PMA emitida por la autoridad (si aplica)",
          hint:
            "Confirme que la parte sea PMA. Si no aplica, marque N/A.",
          requiredForAccept: true,
        },
        {
          key: "tc_pc_certificate",
          label:
            "Certificado TC/PC (si aplica)",
          hint:
            "Valide que el documento corresponda al artículo y al proveedor. Si no aplica, N/A.",
          requiredForAccept: true,
        },
        {
          key: "production_certificate",
          label:
            "Declaración de producción bajo certificado (si aplica)",
          hint:
            "Debe estar trazable al fabricante/producción. Si no aplica, N/A.",
          requiredForAccept: true,
        },
      ],
    },
    {
      title: "Documentación",
      icon: <FileText className="h-4 w-4" />,
      items: [
        {
          key: "doc_8130",
          label: "8130 presente o N/A",
          hint:
            "Cargue el documento o marque N/A si el tipo de artículo no requiere 8130.",
          requiredForAccept: !!article?.has_documentation,
        },
        {
          key: "doc_mfg",
          label: "Certificado fabricante presente o N/A",
          hint:
            "Usar cuando aplique trazabilidad directa con fabricante.",
          requiredForAccept: !!article?.has_documentation,
        },
        {
          key: "doc_vendor",
          label: "Certificado vendedor presente o N/A",
          hint:
            "Adjunte invoice/packing list si es el soporte disponible.",
          requiredForAccept: !!article?.has_documentation,
        },
      ],
    },
  ],
  [article?.has_documentation],
);


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

        <IncomingSidebar
          article_id={article.id}
          groups={groups}
          checklist={checklist}
          setChecklist={setChecklist}
          inspectorNotes={inspectorNotes}
          setInspectorNotes={setInspectorNotes}
        />
        
      </div>
    </div>
  );
}
