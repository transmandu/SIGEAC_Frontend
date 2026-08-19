"use client"

import { useGetArticleDimension } from "@/hooks/mantenimiento/almacen/articulos/useGetArticleDimension"
import { useCompanyStore } from "@/stores/CompanyStore"
import type { GeneralArticle } from "@/types"
import { ArticleRowCard } from "./ArticleRowCard"
import { CutCapturePanel, EMPTY_CUT, type CutDraft } from "./CutCapturePanel"

type RowMsg = { msg: string; level: "error" | "warn" } | undefined
type RowConversion = { unitId: number; unitLabel: string; factor: number; baseLabel: string }

interface GeneralArticleRowProps {
  article?: GeneralArticle
  generalId: number
  qty: string
  max: number
  rowMsg: RowMsg
  conversion?: RowConversion
  showConversionPanel: boolean
  conversionPanelNode: React.ReactNode
  cut?: CutDraft
  onQtyChange: (val: string) => void
  onCommit: () => void
  onSetMax: () => void
  onOpenConversion: () => void
  onRemove: () => void
  onCutChange: (next: CutDraft) => void
}

/**
 * Fila de artículo general en una salida.
 *
 * Consulta si el artículo se mide por dimensiones y, de ser así, cambia la
 * captura de cantidad por la de un trazo. La consulta vive aquí y no en el
 * hook del formulario porque depende del artículo de ESTA fila.
 */
export function GeneralArticleRow({
  article,
  generalId,
  qty,
  max,
  rowMsg,
  conversion,
  showConversionPanel,
  conversionPanelNode,
  cut,
  onQtyChange,
  onCommit,
  onSetMax,
  onOpenConversion,
  onRemove,
  onCutChange,
}: GeneralArticleRowProps) {
  const { selectedCompany } = useCompanyStore()
  const { data: dimension } = useGetArticleDimension(
    generalId || null,
    selectedCompany?.slug,
  )

  const isDimensional = dimension?.dimensional === true

  const subtitle = isDimensional
    ? `${article?.brand_model ?? "N/A"} · ${article?.variant_type ?? "N/A"} · ${dimension.pieces.length} pieza(s) · ${dimension.total_remaining} ${dimension.profile.magnitude_label} en total`
    : `${article?.brand_model ?? "N/A"} · ${article?.variant_type ?? "N/A"} · Disponible: ${article?.quantity ?? 0} ${article?.general_primary_unit?.label ?? ""}`

  return (
    <ArticleRowCard
      title={article?.description ?? (generalId ? `ID: ${generalId}` : "Artículo")}
      subtitle={subtitle}
      qty={qty}
      max={max}
      rowMsg={rowMsg}
      disabled={!article}
      canConvert={!!article && !isDimensional}
      showConversionPanel={showConversionPanel}
      conversionPanelNode={conversionPanelNode}
      accentClass="border-l-amber-500/50"
      baseUnitLabel={article?.general_primary_unit?.label ?? undefined}
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
      onQtyChange={onQtyChange}
      onCommit={onCommit}
      onSetMax={onSetMax}
      onOpenConversion={onOpenConversion}
      onRemove={onRemove}
    />
  )
}
