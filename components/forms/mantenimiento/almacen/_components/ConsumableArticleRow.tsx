"use client"

import { useGetArticleDimension } from "@/hooks/mantenimiento/almacen/articulos/useGetArticleDimension"
import { useCompanyStore } from "@/stores/CompanyStore"
import type { Article } from "@/types"
import { ArticleRowCard } from "./ArticleRowCard"
import { CutCapturePanel, EMPTY_CUT, type CutDraft } from "./CutCapturePanel"

type RowMsg = { msg: string; level: "error" | "warn" } | undefined
type RowConversion = { unitId: number; unitLabel: string; factor: number; baseLabel: string }

interface ConsumableArticleRowProps {
  article?: Article
  articleId: number
  /** Renglón al que pertenece; es lo que identifica la fila una vez elegida. */
  batchName?: string
  qty: string
  max: number
  rowMsg: RowMsg
  conversion?: RowConversion
  showConversionPanel: boolean
  conversionPanelNode: React.ReactNode
  cut?: CutDraft
  /** Captura de evidencia fotográfica de la entrega. Opcional. */
  evidenceNode?: React.ReactNode
  onQtyChange: (val: string) => void
  onCommit: () => void
  onSetMax: () => void
  onOpenConversion: () => void
  onRemove: () => void
  onCutChange: (next: CutDraft) => void
}

/**
 * Fila de consumible en una salida.
 *
 * Gemela de GeneralArticleRow: consulta si el artículo se mide por dimensiones
 * y, de ser así, cambia la captura de cantidad por la de un trazo. La consulta
 * vive aquí y no en el hook del formulario porque depende del artículo de ESTA
 * fila.
 *
 * El consumible se direcciona por `article_id` —no por la clave del propio
 * consumible—, que es el id con que el resto del módulo de almacén lo nombra.
 */
export function ConsumableArticleRow({
  article,
  articleId,
  batchName,
  qty,
  max,
  rowMsg,
  conversion,
  showConversionPanel,
  conversionPanelNode,
  cut,
  evidenceNode,
  onQtyChange,
  onCommit,
  onSetMax,
  onOpenConversion,
  onRemove,
  onCutChange,
}: ConsumableArticleRowProps) {
  const { selectedCompany } = useCompanyStore()
  const { data: dimension } = useGetArticleDimension(
    articleId || null,
    selectedCompany?.slug,
    "consumables",
  )

  const isDimensional = dimension?.dimensional === true

  const subtitle = isDimensional
    ? `${batchName ?? "Sin lote"} · ${dimension.pieces.length} pieza(s) · ${dimension.total_remaining} ${dimension.profile.magnitude_label} en total`
    : `${batchName ?? "Sin lote"} · Disponible: ${article?.quantity ?? 0} ${article?.unit ?? ""}`

  return (
    <ArticleRowCard
      title={article?.part_number ?? (articleId ? `ID: ${articleId}` : "Artículo")}
      subtitle={subtitle}
      qty={qty}
      max={max}
      rowMsg={rowMsg}
      disabled={!article}
      // Un dimensionado no se convierte: sus equivalencias apuntan a la unidad
      // base (que cuenta piezas), no a la de medida con que se escribe el trazo.
      canConvert={!!article && article.unit !== "u" && !isDimensional}
      showConversionPanel={showConversionPanel && !isDimensional}
      conversionPanelNode={conversionPanelNode}
      accentClass="border-l-blue-500/50"
      baseUnitLabel={article?.unit ?? undefined}
      conversion={conversion}
      cutPanelNode={
        isDimensional ? (
          <CutCapturePanel
            profile={dimension.profile}
            pieces={dimension.pieces}
            measureUnits={dimension.measure_units}
            // Los ejes viajan en el draft para que la validación del formulario
            // sepa si el ancho es obligatorio sin tener el perfil a mano.
            draft={cut ?? { ...EMPTY_CUT, axes: dimension.profile.axes }}
            disabled={!article}
            onChange={(next) =>
              onCutChange({ ...next, axes: dimension.profile.axes })
            }
          />
        ) : undefined
      }
      evidenceNode={evidenceNode}
      onQtyChange={onQtyChange}
      onCommit={onCommit}
      onSetMax={onSetMax}
      onOpenConversion={onOpenConversion}
      onRemove={onRemove}
    />
  )
}
