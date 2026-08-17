'use client'

import { HelpCircle, Layers, Package, Plane } from 'lucide-react'

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn, formatRequestedDate } from '@/lib/utils'
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

    <div className="flex shrink-0 items-center gap-1 rounded-md bg-blue-500/10 px-2 py-0.5 text-blue-700 dark:text-blue-300">
      <span className="text-sm font-semibold tabular-nums">{quantity}</span>
      <span className="text-[10px] text-blue-700/70 dark:text-blue-300/70">
        {unit}
      </span>
    </div>
  </div>
)

export default function RequisitionArticlesPopover({ requisition }: Props) {
  const batches = requisition.batch ?? []
  const generalArticles = requisition.general_articles ?? []

  const hasArticles =
    batches.some((batch: any) => batch.batch_articles?.length) ||
    generalArticles.length > 0

  return (
    <Popover>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <button
                type="button"
                disabled={!hasArticles}
                className={cn(
                  'flex items-center justify-center rounded-md p-1 transition-colors',
                  hasArticles
                    ? 'text-muted-foreground hover:text-blue-600 hover:bg-blue-500/10 dark:hover:text-blue-400'
                    : 'text-muted-foreground/30 cursor-not-allowed'
                )}
              >
                <HelpCircle className="size-4" />
              </button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>
            {hasArticles ? 'Visualizar artículos' : 'Sin artículos asociados'}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <PopoverContent
        align="center"
        className="w-auto max-w-[90vw] max-h-[60vh] overflow-auto p-3"
      >
        <span className="block px-1 pb-2 text-[10px] uppercase tracking-wide text-muted-foreground">
          Artículos de la requisición {requisition.order_number}
        </span>

        <div className="flex flex-col items-center gap-2">
          {batches.flatMap((batch: any, batchIndex: number) =>
            (batch.batch_articles ?? []).map((article: any, articleIndex: number) => {
              const acronym =
                typeof article.aircraft === 'string'
                  ? article.aircraft
                  : article.aircraft?.acronym

              const fields: FieldProps[] = [
                { label: 'P/N', value: article.article_part_number ?? 'N/A' },
                { label: 'Alt. P/N', value: article.article_alt_part_number ?? 'N/A' },
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
            })
          )}

          {generalArticles.map((article: any) => {
            const fields: FieldProps[] = [
              { label: 'Present. / Especif.', value: article.variant_type ?? 'N/A' },
            ]

            if (article.requested_date) {
              fields.push({
                label: 'Fecha Solicitud',
                value: formatRequestedDate(article.requested_date),
              })
            }

            const destinations = [
              article.department?.name,
              article.third_party?.name,
              article.employee &&
                `${article.employee.first_name} ${article.employee.last_name}`,
              article.authorized_employee?.full_name ||
                article.authorized_employee?.dni_employee,
            ].filter(Boolean)

            if (destinations.length > 0) {
              fields.push({ label: 'Destino', value: destinations.join(' / ') })
            }

            return (
              <ArticleRow
                key={`general-${article.id}`}
                icon={Package}
                iconClassName="bg-amber-500/10 text-amber-600 dark:text-amber-400"
                title={article.description ?? 'N/A'}
                fields={fields}
                quantity={article.quantity ?? '-'}
                unit={article.unit?.label ?? 'N/A'}
              />
            )
          })}

          {!hasArticles && (
            <p className="text-sm text-muted-foreground italic text-center px-2 py-1">
              Esta requisición no posee artículos asociados.
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
