'use client'

import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Props = {
  pageIndex: number
  pageSize: number
  pageCount: number
  totalGroups?: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

const GroupPagination = ({
  pageIndex,
  pageSize,
  pageCount,
  totalGroups,
  onPageChange,
  onPageSizeChange,
}: Props) => {

  const canPrev = pageIndex > 0
  const canNext = pageIndex < pageCount - 1

  const start = pageIndex * pageSize + 1
  const end = Math.min((pageIndex + 1) * pageSize, totalGroups ?? pageCount * pageSize)

  return (
    <div
      className="
        flex flex-col md:flex-row items-center justify-between px-3 py-2 gap-2
        border-t border-slate-200/50 dark:border-slate-700/40
        bg-transparent
      "
    >

      <div className="flex-1 text-xs text-muted-foreground">
        {typeof totalGroups !== 'undefined' && (
          <span>
            Mostrando{" "}
            <span className="font-semibold text-foreground">{start}</span>
            {" - "}
            <span className="font-semibold text-foreground">{end}</span>
            {" de "}
            <span className="font-semibold text-foreground">{totalGroups}</span>
            {" grupos"}
          </span>
        )}
      </div>

      <div className="flex items-center space-x-6 lg:space-x-8">

        <div className="flex items-center space-x-2">
          <p className="text-xs font-medium text-muted-foreground">
            Grupos por página:
          </p>

          <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
              onPageSizeChange(Number(value))
              onPageChange(0) // reset obligatorio
            }}
          >
            <SelectTrigger
              className="
                h-8 w-[70px] text-xs
                bg-white dark:bg-slate-900/60
                border border-slate-200/60 dark:border-slate-700/50
                shadow-[0_1px_2px_rgba(0,0,0,0.04)]
                hover:shadow-[0_2px_6px_rgba(0,0,0,0.06)]
                transition-all
              "
            >
              <SelectValue />
            </SelectTrigger>

            <SelectContent side="top">
              {[5, 10, 15, 20, 30, 40, 50].map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex w-[120px] items-center justify-center text-xs font-medium">
          <span className="text-muted-foreground">Grupos</span>

          <span className="mx-1 text-foreground font-semibold tabular-nums">
            {pageIndex + 1}
          </span>

          <span className="text-muted-foreground">de</span>

          <span className="ml-1 text-foreground font-semibold tabular-nums">
            {pageCount}
          </span>
        </div>

        <div className="flex items-center space-x-2">

          <Button
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(0)}
            disabled={!canPrev}
          >
            <ChevronFirst className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(pageIndex - 1)}
            disabled={!canPrev}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(pageIndex + 1)}
            disabled={!canNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(pageCount - 1)}
            disabled={!canNext}
          >
            <ChevronLast className="h-4 w-4" />
          </Button>

        </div>

      </div>
    </div>
  )
}

export default GroupPagination