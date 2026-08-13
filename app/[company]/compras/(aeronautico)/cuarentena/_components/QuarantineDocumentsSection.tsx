'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { ArticleDocumentRequirementSummary } from '@/types'
import { Check, FileUp, Paperclip, RefreshCw, X } from 'lucide-react'

export type DocumentDraft = {
  file?: File
  isPhysical: boolean
  /** Documento que se reemplaza; solo cuando el requerimiento ya tenía uno. */
  replaceDocumentId?: number
}

type Props = {
  requirements: ArticleDocumentRequirementSummary[]
  drafts: Record<number, DocumentDraft>
  onChange: (requirementId: number, draft: DocumentDraft | undefined) => void
  disabled?: boolean
}

/**
 * Documentación del artículo retenido. Es el motivo de cuarentena más común
 * (falta un certificado, o el cargado no corresponde), así que va primero y
 * distingue lo pendiente de lo ya consignado — que también puede reemplazarse.
 */
export function QuarantineDocumentsSection({
  requirements,
  drafts,
  onChange,
  disabled,
}: Props) {
  if (requirements.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-slate-200 px-4 py-6 text-center text-xs text-muted-foreground dark:border-slate-700">
        Este artículo no tiene documentación requerida registrada.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {requirements.map((requirement) => {
        const consigned = requirement.documents.length > 0
        const draft = drafts[requirement.id]
        const resolved = !!draft?.file || !!draft?.isPhysical

        return (
          <div
            key={requirement.id}
            className={cn(
              'rounded-xl border px-4 py-3 transition-colors',
              resolved
                ? 'border-emerald-500/40 bg-emerald-500/5'
                : consigned
                  ? 'border-slate-200/70 dark:border-slate-700/60'
                  : 'border-amber-500/40 bg-amber-500/5',
            )}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                  {requirement.document_type?.name ?? 'Documento'}
                </p>
                {requirement.document_type?.regulation && (
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    {requirement.document_type.regulation}
                  </p>
                )}
              </div>

              <Badge
                className={cn(
                  'gap-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold tracking-wide shadow-sm',
                  resolved
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                    : consigned
                      ? 'border-slate-300/50 bg-slate-500/10 text-slate-600 dark:text-slate-300'
                      : 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
                )}
              >
                {resolved ? (
                  <>
                    <Check className="size-3" />
                    Listo para subir
                  </>
                ) : consigned ? (
                  'Consignado'
                ) : (
                  'Pendiente'
                )}
              </Badge>
            </div>

            {/* Lo ya consignado se lista para poder señalar cuál se reemplaza */}
            {consigned && !draft && (
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {requirement.documents.map((doc) => (
                  <span
                    key={doc.id}
                    className="inline-flex items-center gap-1 rounded-full border border-slate-200/70 px-2 py-0.5 text-[10px] text-muted-foreground dark:border-slate-700/60"
                  >
                    <Paperclip className="size-2.5" />
                    <span className="max-w-[160px] truncate">
                      {doc.file_path?.split('/').pop() ?? (doc.is_physical ? 'Recibido en físico' : 'Documento')}
                    </span>
                  </span>
                ))}

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={disabled}
                      onClick={() =>
                        onChange(requirement.id, {
                          isPhysical: false,
                          replaceDocumentId: requirement.documents[0]?.id,
                        })
                      }
                      className="h-6 gap-1 px-2 text-[10px]"
                    >
                      <RefreshCw className="size-2.5" />
                      Reemplazar
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Sustituir el documento por uno corregido
                  </TooltipContent>
                </Tooltip>
              </div>
            )}

            {/* Zona de carga: pendiente, o consignado que se está reemplazando */}
            {(!consigned || draft) && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="relative h-9 flex-1">
                    <FileUp className="absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      disabled={disabled}
                      onChange={(e) =>
                        onChange(requirement.id, {
                          ...draft,
                          isPhysical: draft?.isPhysical ?? false,
                          file: e.target.files?.[0],
                        })
                      }
                      className="h-9 cursor-pointer pl-9 text-xs"
                    />
                  </div>

                  {draft && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={disabled}
                          onClick={() => onChange(requirement.id, undefined)}
                          className="size-9 shrink-0"
                        >
                          <X className="size-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Descartar</TooltipContent>
                    </Tooltip>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id={`physical-${requirement.id}`}
                    checked={draft?.isPhysical ?? false}
                    disabled={disabled}
                    onCheckedChange={(checked) =>
                      onChange(requirement.id, {
                        ...draft,
                        isPhysical: checked === true,
                      })
                    }
                  />
                  <Label
                    htmlFor={`physical-${requirement.id}`}
                    className="cursor-pointer text-xs font-normal text-muted-foreground"
                  >
                    Recibido en físico
                  </Label>
                </div>

                {draft?.file && (
                  <p className="truncate text-[10px] text-muted-foreground">{draft.file.name}</p>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
