import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

import { Table } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DataTablePaginationProps<TData> {
  table: Table<TData>
}

export function DataTablePagination<TData>({
  table,
}: DataTablePaginationProps<TData>) {
  return (
    <div
      className="
        flex flex-col md:flex-row items-center justify-between px-3 py-2 gap-2
        border-t border-slate-200/50 dark:border-slate-700/40
        bg-transparent
      "
    >

      <div className="flex-1 text-sm text-muted-foreground" />

      <div className="flex items-center space-x-6 lg:space-x-8">

        {/* PAGE SIZE */}
        <div className="flex items-center space-x-2">
          <p className="text-xs font-medium text-muted-foreground">
            Items por página:
          </p>

          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => table.setPageSize(Number(value))}
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
              {[5, 10, 15, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* PAGE INFO */}
        <div className="flex w-[100px] items-center justify-center text-xs font-medium">
          <span className="text-muted-foreground">Página</span>

          <span className="mx-1 text-foreground font-semibold tabular-nums">
            {table.getState().pagination.pageIndex + 1}
          </span>

          <span className="text-muted-foreground">de</span>

          <span className="ml-1 text-foreground font-semibold tabular-nums">
            {table.getPageCount()}
          </span>
        </div>

        {/* NAV */}
        <div className="flex items-center space-x-2">

          {[
            {
              icon: ChevronFirst,
              action: () => table.setPageIndex(0),
              disabled: !table.getCanPreviousPage(),
              label: "Primera",
            },
            {
              icon: ChevronLeft,
              action: () => table.previousPage(),
              disabled: !table.getCanPreviousPage(),
              label: "Anterior",
            },
            {
              icon: ChevronRight,
              action: () => table.nextPage(),
              disabled: !table.getCanNextPage(),
              label: "Siguiente",
            },
            {
              icon: ChevronLast,
              action: () => table.setPageIndex(table.getPageCount() - 1),
              disabled: !table.getCanNextPage(),
              label: "Última",
            },
          ].map(({ icon: Icon, action, disabled, label }) => (
            <Button
              key={label}
              variant="ghost"
              className="
                h-8 w-8 p-0 rounded-md
                text-muted-foreground
                hover:text-foreground
                hover:bg-white dark:hover:bg-slate-800/50
                border border-transparent hover:border-slate-200/40 dark:hover:border-slate-700/40
                shadow-none hover:shadow-sm
                transition-all
              "
              onClick={action}
              disabled={disabled}
            >
              <span className="sr-only">{label}</span>
              <Icon className="h-4 w-4" />
            </Button>
          ))}

        </div>
      </div>
    </div>
  )
}