"use client";

import { memo, useState } from "react";
import {
  BarChart,
  Download,
  History,
  LayoutGrid,
  Link2,
  List,
  Plus,
  Search,
  Send,
  SlidersHorizontal,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { selectTriggerClass } from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import { PanelStaticLabel } from "@/components/forms/PanelSection";
import { ActionTriggerButton } from "@/components/misc/ActionTriggerButton";
import ShortcutsHelp from "@/components/library/ShortcutsHelp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { cn } from "@/lib/utils";

export type LibraryView = "list" | "grid";

export type SortKey =
  "default" | "title-asc" | "title-desc" | "expiry-asc" | "expiry-desc";

export const SORT_LABELS: Record<SortKey, string> = {
  default: "Orden de la biblioteca",
  "title-asc": "Nombre (A → Z)",
  "title-desc": "Nombre (Z → A)",
  "expiry-asc": "Vence primero",
  "expiry-desc": "Vence al final",
};

const ALL = "all";

const STATUS_LABELS = [
  { value: "vigente", label: "Vigente" },
  { value: "vencido", label: "Vencido" },
  { value: "no_aplica", label: "Permanente" },
];

// Botón de solo icono de la barra: el mismo en las herramientas, el filtro y
// el cambio de vista.
const iconButtonClass =
  "relative size-8 shrink-0 rounded-md border-slate-200/60 bg-white/80 p-0 dark:border-slate-700/60 dark:bg-slate-900/60 max-sm:size-10";

function Counter({ value }: { value: number }) {
  if (value <= 0) return null;
  return (
    <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-none text-white">
      {value > 99 ? "99+" : value}
    </span>
  );
}

function ToolButton({
  icon: Icon,
  label,
  onClick,
  count,
  tour,
  active = false,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  count?: number;
  tour?: string;
  /** La vista que abre este botón está a la vista ahora. */
  active?: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={label}
          onClick={onClick}
          data-tour={tour}
          aria-pressed={active || undefined}
          className={cn(
            iconButtonClass,
            active && "border-primary/40 bg-primary/10 text-primary",
          )}
        >
          <Icon className="size-4" />
          {count !== undefined && <Counter value={count} />}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top" className="px-2 py-1 text-xs">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

interface LibraryToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;

  category: string;
  onCategoryChange: (value: string) => void;
  categories: { id: number; name: string }[];
  status: string;
  onStatusChange: (value: string) => void;
  sort: SortKey;
  onSortChange: (value: SortKey) => void;

  view: LibraryView;
  onViewChange: (view: LibraryView) => void;

  /** Documentos a la vista; `undefined` mientras carga (no se muestra un 0 falso). */
  count?: number;

  canManage: boolean;
  isDipDirector: boolean;
  canViewDashboard: boolean;
  pendingRequestCount: number;
  pendingFolderShareCount: number;
  onUpload: () => void;
  onHistory: () => void;
  onRequests: () => void;
  onFolderShares: () => void;
  onDashboard: () => void;
  onDownloadFolders: () => void;
  /** La papelera está a la vista. */
  trashOpen: boolean;
  onTrash: () => void;
}

/**
 * Barra de herramientas de la biblioteca, con el lenguaje de las barras de
 * ajustes y compras: buscador y filtros a la izquierda; a la derecha el
 * recuento, el cambio de vista, las herramientas (solo icono, con su
 * tooltip) y la acción principal.
 *
 * Aquí se suman las próximas herramientas del explorador (papelera,
 * favoritos…) como un `ToolButton` más.
 */
function LibraryToolbar({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  categories,
  status,
  onStatusChange,
  sort,
  onSortChange,
  view,
  onViewChange,
  count,
  canManage,
  isDipDirector,
  canViewDashboard,
  pendingRequestCount,
  pendingFolderShareCount,
  onUpload,
  onHistory,
  onRequests,
  onFolderShares,
  onDashboard,
  onDownloadFolders,
  trashOpen,
  onTrash,
}: LibraryToolbarProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);

  // La búsqueda ya se ve en su campo: el contador del botón avisa solo de lo
  // que queda oculto dentro del menú.
  const hidden =
    Number(category !== "") +
    Number(status !== "") +
    Number(sort !== "default");

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-xl border border-slate-200/40 bg-slate-200/40 px-3 py-2 backdrop-blur-md dark:border-slate-700/60 dark:bg-slate-800/70 dark:shadow-[0_4px_20px_rgba(0,0,0,0.35)] max-sm:flex-col max-sm:items-stretch max-sm:gap-2 max-sm:p-2">
        <div className="flex min-w-0 items-center gap-2">
          <div
            className="relative w-64 sm:w-72 max-sm:flex-1"
            data-tour="biblioteca-search-input"
          >
            <Search
              aria-hidden
              className="pointer-events-none absolute left-2.5 top-1/2 z-10 size-3.5 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Buscar en todo el departamento..."
              aria-label="Buscar documentos"
              className="h-8 border-slate-200/60 bg-white/80 pl-8 text-xs focus-visible:ring-1 focus-visible:ring-primary/40 dark:border-slate-700/60 dark:bg-slate-900/60 max-sm:h-10 max-sm:text-base"
            />
          </div>

          <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Filtros y orden"
                    data-tour="biblioteca-filter-btn"
                    className={iconButtonClass}
                  >
                    <SlidersHorizontal className="size-4" />
                    {hidden > 0 && (
                      <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                        {hidden}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent side="top" className="px-2 py-1 text-xs">
                Filtros y orden
              </TooltipContent>
            </Tooltip>

            <PopoverContent
              align="start"
              sideOffset={8}
              collisionPadding={12}
              className="w-72 max-w-[calc(100vw-2rem)] space-y-4 p-4"
            >
              <div data-tour="biblioteca-filter-categoria">
                <PanelStaticLabel>Categoría</PanelStaticLabel>
                <Select
                  value={category || ALL}
                  onValueChange={(value) =>
                    onCategoryChange(value === ALL ? "" : value)
                  }
                >
                  <SelectTrigger
                    className={selectTriggerClass}
                    aria-label="Categoría"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL}>Todas las categorías</SelectItem>
                    {categories.map((item) => (
                      <SelectItem key={item.id} value={item.name}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div data-tour="biblioteca-filter-estado">
                <PanelStaticLabel>Estado</PanelStaticLabel>
                <Select
                  value={status || ALL}
                  onValueChange={(value) =>
                    onStatusChange(value === ALL ? "" : value)
                  }
                >
                  <SelectTrigger
                    className={selectTriggerClass}
                    aria-label="Estado"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL}>Todos los estados</SelectItem>
                    {STATUS_LABELS.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <PanelStaticLabel>Ordenar por</PanelStaticLabel>
                <Select
                  value={sort}
                  onValueChange={(value) => onSortChange(value as SortKey)}
                >
                  <SelectTrigger
                    className={selectTriggerClass}
                    aria-label="Ordenar por"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
                      <SelectItem key={key} value={key}>
                        {SORT_LABELS[key]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                data-tour="biblioteca-filter-limpiar"
                className="w-full max-sm:h-10"
                disabled={hidden === 0}
                onClick={() => {
                  onCategoryChange("");
                  onStatusChange("");
                  onSortChange("default");
                  setFiltersOpen(false);
                }}
              >
                Restablecer filtros
              </Button>
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-3 max-sm:justify-between">
          <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
            {count === undefined
              ? "—"
              : `${count} ${count === 1 ? "documento" : "documentos"}`}
          </span>

          <div
            role="group"
            aria-label="Vista"
            data-tour="biblioteca-vista-toggle"
            className="flex items-center rounded-md border border-slate-200/60 bg-white/80 p-0.5 dark:border-slate-700/60 dark:bg-slate-900/60"
          >
            {(
              [
                { value: "list", label: "Vista de lista", icon: List },
                {
                  value: "grid",
                  label: "Vista de cuadrícula",
                  icon: LayoutGrid,
                },
              ] as const
            ).map(({ value, label, icon: Icon }) => (
              <Tooltip key={value}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-label={label}
                    aria-pressed={view === value}
                    onClick={() => onViewChange(value)}
                    className={cn(
                      "grid size-7 place-items-center rounded-[5px] text-muted-foreground motion-safe:transition-colors max-sm:size-9",
                      view === value
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-slate-100 hover:text-foreground dark:hover:bg-slate-800",
                    )}
                  >
                    <Icon className="size-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="px-2 py-1 text-xs">
                  {label}
                </TooltipContent>
              </Tooltip>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            {canManage && (
              <ToolButton
                icon={History}
                label="Historial de la biblioteca"
                onClick={onHistory}
                tour="biblioteca-historial-btn"
              />
            )}
            {canManage && isDipDirector && (
              <ToolButton
                icon={Send}
                label="Solicitudes de enlace"
                onClick={onRequests}
                count={pendingRequestCount}
                tour="biblioteca-solicitudes-btn"
              />
            )}
            {canManage && (
              <ToolButton
                icon={Link2}
                label="Enlaces de carpetas"
                onClick={onFolderShares}
                count={pendingFolderShareCount}
              />
            )}
            {canManage && canViewDashboard && (
              <ToolButton
                icon={BarChart}
                label="Panel de la biblioteca"
                onClick={onDashboard}
                tour="biblioteca-dashboard-btn"
              />
            )}
            {canManage && (
              <ToolButton
                icon={Trash2}
                label="Papelera"
                onClick={onTrash}
                active={trashOpen}
                tour="biblioteca-papelera-btn"
              />
            )}
            <ShortcutsHelp canManage={canManage} />
            {/* Descargar no es gestionar: el backend valida documento por
                documento y los que no pasan se omiten del ZIP avisando. */}
            <ToolButton
              icon={Download}
              label="Descargar carpetas"
              onClick={onDownloadFolders}
            />
          </div>

          {canManage && (
            <ActionTriggerButton
              type="button"
              size="sm"
              onClick={onUpload}
              data-tour="biblioteca-subir-btn"
              className="h-8 px-3 text-xs max-sm:h-10 max-sm:text-sm"
            >
              <Plus className="mr-2 size-4" />
              Subir documento
            </ActionTriggerButton>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}

export default memo(LibraryToolbar);
