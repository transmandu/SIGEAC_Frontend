'use client'

import { Layers, Package, Plane } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Requisition } from '@/types/purchase'

interface Props {
  requisition: Requisition
}

interface FieldProps {
  label: string
  value: string | number
}

const Field = ({ label, value }: FieldProps) => (
  <div className="flex flex-col items-center justify-center gap-0.5">
    <span className="text-[9px] uppercase tracking-wide text-muted-foreground/70 border border-border/60 rounded px-1 leading-4">
      {label}
    </span>
    <span className="text-xs font-medium whitespace-nowrap">{value}</span>
  </div>
)

interface ArticleRowProps {
  icon: typeof Layers
  iconClassName: string
  title: string
  subtitle?: string
  fields: FieldProps[]
  quantity: string | number
  unit: string
}

const ArticleRow = ({
  icon: Icon,
  iconClassName,
  title,
  subtitle,
  fields,
  quantity,
  unit,
}: ArticleRowProps) => (
  <div className="flex w-fit items-center gap-3 rounded-md border bg-background/60 px-2.5 py-1.5 shadow-sm transition-colors hover:bg-muted/40">
    <div
      className={cn(
        'flex h-7 w-7 shrink-0 items-center justify-center rounded-md',
        iconClassName
      )}
    >
      <Icon className="h-3.5 w-3.5" />
    </div>

    <div className="flex flex-col leading-tight">
      <span className="text-sm font-semibold whitespace-nowrap">{title}</span>
      {subtitle && (
        <span className="text-[11px] text-muted-foreground whitespace-nowrap">
          {subtitle}
        </span>
      )}
    </div>

    <div className="h-7 w-px bg-border/60 shrink-0" />

    <div className="flex items-center gap-3.5">
      {fields.map((field) => (
        <Field key={field.label} {...field} />
      ))}
    </div>

    <div className="h-7 w-px bg-border/60 shrink-0" />

    <div className="flex shrink-0 items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-emerald-700 dark:text-emerald-300">
      <span className="text-sm font-semibold tabular-nums">{quantity}</span>
      <span className="text-[10px] text-emerald-700/70 dark:text-emerald-300/70">
        {unit}
      </span>
    </div>
  </div>
)

export default function RequisitionExpandedRow({ requisition }: Props) {
  const batches = requisition.batch ?? []
  const generalArticles = requisition.general_articles ?? []

  const hasArticles =
    batches.some((batch: any) => batch.batch_articles?.length) ||
    generalArticles.length > 0

  return (
    <div className="flex flex-col gap-4 p-4 bg-muted/20 rounded-lg border border-border/40">
      {/* Articles */}
      {hasArticles && (
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Artículos
          </span>
          <div className="flex flex-col gap-2">
            {batches.flatMap((batch: any, batchIndex: number) =>
              (batch.batch_articles ?? []).map(
                (article: any, articleIndex: number) => {
                  const acronym =
                    typeof article.aircraft === 'string'
                      ? article.aircraft
                      : article.aircraft?.acronym

                  const fields: FieldProps[] = [
                    { label: 'P/N', value: article.article_part_number ?? 'N/A' },
                    {
                      label: 'Alt. P/N',
                      value: article.article_alt_part_number ?? 'N/A',
                    },
                  ]

                  if (acronym) {
                    fields.push({ label: 'Aeronave', value: acronym })
                  }

                  return (
                    <ArticleRow
                      key={`batch-${batchIndex}-${articleIndex}`}
                      icon={acronym ? Plane : Layers}
                      iconClassName="bg-sky-500/10 text-sky-600 dark:text-sky-400"
                      title={batch.name}
                      subtitle={batch.category}
                      fields={fields}
                      quantity={article.quantity ?? '-'}
                      unit={article.unit?.label ?? 'N/A'}
                    />
                  )
                }
              )
            )}

            {generalArticles.map((article: any) => (
              <ArticleRow
                key={`general-${article.id}`}
                icon={Package}
                iconClassName="bg-amber-500/10 text-amber-600 dark:text-amber-400"
                title={article.description ?? 'N/A'}
                fields={[
                  {
                    label: 'Present. / Especif.',
                    value: article.variant_type ?? 'N/A',
                  },
                ]}
                quantity={article.quantity ?? '-'}
                unit={article.unit?.label ?? 'N/A'}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!hasArticles && (
        <p className="text-sm text-muted-foreground italic text-center py-2">
          Esta requisición no posee artículos para mostrar.
        </p>
      )}
    </div>
  )
}
