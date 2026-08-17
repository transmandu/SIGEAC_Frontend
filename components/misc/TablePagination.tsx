"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export const PAGE_SIZES = [15, 25, 50, 100];

const NavButton = ({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="ghost" size="icon" className="size-8" onClick={onClick}>
        {icon}
      </Button>
    </TooltipTrigger>
    <TooltipContent>{label}</TooltipContent>
  </Tooltip>
);

/**
 * Paginación de filas en cliente, para tablas cuyo conjunto crece sin techo y
 * no debe pintarse completo. Los controles se omiten cuando no hay a dónde ir.
 */
export const TablePagination = ({
  page,
  pageSize,
  totalRows,
  onPageChange,
  onPageSizeChange,
}: {
  page: number;
  pageSize: number;
  totalRows: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}) => {
  const pageCount = Math.max(1, Math.ceil(totalRows / pageSize));
  const start = totalRows === 0 ? 0 : page * pageSize + 1;
  const end = Math.min((page + 1) * pageSize, totalRows);

  const canPrev = page > 0;
  const canNext = page < pageCount - 1;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t px-3 py-2">
      <p className="text-xs text-muted-foreground">
        Mostrando{" "}
        <span className="font-medium tabular-nums text-foreground">
          {start}
        </span>
        {" - "}
        <span className="font-medium tabular-nums text-foreground">{end}</span>
        {" de "}
        <span className="font-medium tabular-nums text-foreground">
          {totalRows}
        </span>{" "}
        registros
      </p>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Por página</span>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger className="h-8 w-[72px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="top">
              {PAGE_SIZES.map((size) => (
                <SelectItem key={size} value={`${size}`} className="text-xs">
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <span className="text-xs tabular-nums text-muted-foreground">
          Página {page + 1} de {pageCount}
        </span>

        <TooltipProvider delayDuration={200}>
          <div className="flex items-center gap-1">
            {canPrev && (
              <>
                <NavButton
                  label="Primera página"
                  icon={<ChevronFirst className="size-4" />}
                  onClick={() => onPageChange(0)}
                />
                <NavButton
                  label="Página anterior"
                  icon={<ChevronLeft className="size-4" />}
                  onClick={() => onPageChange(page - 1)}
                />
              </>
            )}
            {canNext && (
              <>
                <NavButton
                  label="Página siguiente"
                  icon={<ChevronRight className="size-4" />}
                  onClick={() => onPageChange(page + 1)}
                />
                <NavButton
                  label="Última página"
                  icon={<ChevronLast className="size-4" />}
                  onClick={() => onPageChange(pageCount - 1)}
                />
              </>
            )}
          </div>
        </TooltipProvider>
      </div>
    </div>
  );
};
