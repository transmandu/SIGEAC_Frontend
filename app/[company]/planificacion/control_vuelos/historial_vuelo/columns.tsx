"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FlightHistory } from "@/types"
import { AlertTriangle, CheckCircle2, ChevronDown, ChevronRight, Clock, Gauge, Plane } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

/**
 * Tipo para los vuelos agrupados
 */
export type GroupedFlight = {
  id: string
  flight_number: string
  flight_date: string
  flight_hours: number
  flight_cycles: number
  subRows: FlightHistory[]
  isGroup: true
}

/**
 * Obtiene el indicador de estado basado en valores críticos
 */
const getStatusIndicator = (current: number, limit: number) => {
  const percentage = (current / limit) * 100;
  
  if (percentage >= 90) {
    return {
      icon: AlertTriangle,
      color: "text-red-500",
      bgColor: "bg-red-50 dark:bg-red-950",
      message: "Crítico - Requiere atención inmediata"
    };
  } else if (percentage >= 75) {
    return {
      icon: AlertTriangle,
      color: "text-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-950",
      message: "Advertencia - Revisar pronto"
    };
  } else {
    return {
      icon: CheckCircle2,
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-950",
      message: "Normal"
    };
  }
};

/**
 * Columnas mejoradas con agrupación de vuelos
 */
export const columns: ColumnDef<FlightHistory | GroupedFlight>[] = [
  // ========== EXPANSIÓN ==========
  {
    id: "expander",
    header: () => null,
    cell: ({ row }) => {
      const isGroup = (row.original as any).isGroup;
      
      if (!isGroup) {
        return <div className="w-8" />;
      }

      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => row.toggleExpanded()}
          className="h-8 w-8 p-0"
        >
          {row.getIsExpanded() ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      );
    },
  },

  // ========== INFORMACIÓN DEL VUELO ==========
  {
    id: "fecha_hora",
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="FECHA" />
    ),
    cell: ({ row }) => {
      const isGroup = (row.original as any).isGroup;
      
      // Si es un grupo, mostrar la fecha del vuelo
      if (isGroup) {
        const dateString = (row.original as GroupedFlight).flight_date;
        
        if (!dateString) {
          return (
            <div className="text-xs text-muted-foreground">
              Sin fecha
            </div>
          );
        }

        const date = new Date(dateString);
        
        if (isNaN(date.getTime())) {
          return (
            <div className="text-xs text-muted-foreground">
              Fecha inválida
            </div>
          );
        }

        return (
          <div className="min-w-[120px] text-center">
            <div className="font-semibold text-sm">
              {date.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })}
            </div>
          </div>
        );
      }

      // Si es un componente individual, no mostrar nada (ya está en el grupo)
      return null;
    }
  },
  
  {
    accessorKey: "flight_number",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="VUELO" />
    ),
    cell: ({ row }) => {
      const isGroup = (row.original as any).isGroup;
      
      if (isGroup) {
        const grouped = row.original as GroupedFlight;
        return (
          <div className="text-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="outline" className="font-mono text-sm px-3 py-1 cursor-help">
                    {grouped.flight_number}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{grouped.subRows.length} componente(s)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      }

      return null;
    }
  },

  // ========== COMPONENTE ==========
  {
    id: "componente",
    accessorKey: "aircraft_part_id",
    header: ({ column }) => (
      <DataTableColumnHeader 
        filter 
        column={column} 
        title="COMPONENTE" 
        className="bg-blue-50 dark:bg-blue-950/30"
      />
    ),
    cell: ({ row }) => {
      const isGroup = (row.original as any).isGroup;
      
      // Si es un grupo, mostrar resumen
      if (isGroup) {
        const grouped = row.original as GroupedFlight;
        return (
          <div className="flex justify-center">
            <div className="space-y-1 min-w-[180px] p-2 rounded bg-blue-50/50 dark:bg-blue-950/20 text-center">
              <div className="font-bold text-blue-700 dark:text-blue-300 flex items-center justify-center gap-2">
                <Plane className="h-4 w-4" />
                {grouped.subRows.length} Componente(s)
              </div>
              <div className="text-xs text-muted-foreground">
                Click para expandir
              </div>
            </div>
          </div>
        );
      }

      // Si es un componente individual, mostrar detalles
      const item = row.original as FlightHistory;
      const part = item.aircraft_part;
      const partId = item.aircraft_part_id;
      
      return (
        <div className="flex justify-center pl-8">
          <div className="space-y-1 min-w-[180px] p-2 rounded bg-blue-50/50 dark:bg-blue-950/20 text-center">
            {part ? (
              <>
                <div className="font-bold text-blue-700 dark:text-blue-300">
                  {part.part_number}
                </div>
                <div className="text-xs text-muted-foreground line-clamp-1">
                  {part.part_name}
                </div>
                {part.serial && (
                  <div className="text-xs font-mono text-blue-600 dark:text-blue-400">
                    S/N: {part.serial}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center">
                <div className="font-bold text-blue-700 dark:text-blue-300">
                  ID: {partId}
                </div>
                <div className="text-xs text-muted-foreground">
                  Componente
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
  },

  // ========== HORAS DE VUELO ==========
  {
    id: "vuelo_horas",
    accessorKey: "flight_hours",
    header: ({ column }) => (
      <DataTableColumnHeader 
        column={column} 
        title="HORAS DE VUELO"
      />
    ),
    cell: ({ row }) => {
      const isGroup = (row.original as any).isGroup;
      
      if (isGroup) {
        const grouped = row.original as GroupedFlight;
        return (
          <div className="text-center">
            <Badge variant="default" className="font-semibold text-base">
              {grouped.flight_hours.toFixed(2)}
            </Badge>
          </div>
        );
      }

      return null;
    }
  },

  {
    id: "vuelo_ciclos",
    accessorKey: "flight_cycles",
    header: ({ column }) => (
      <DataTableColumnHeader 
        column={column} 
        title="CICLOS DE VUELO"
      />
    ),
    cell: ({ row }) => {
      const isGroup = (row.original as any).isGroup;
      
      if (isGroup) {
        const grouped = row.original as GroupedFlight;
        return (
          <div className="text-center">
            <Badge variant="default" className="font-semibold text-base">
              {Math.round(grouped.flight_cycles)}
            </Badge>
          </div>
        );
      }

      return null;
    }
  },

  // ========== TSN ==========
  {
    id: "tsn",
    accessorKey: "time_since_new",
    header: ({ column }) => (
      <DataTableColumnHeader 
        column={column} 
        title="TSN (Horas desde nuevo)"
      />
    ),
    cell: ({ row }) => {
      const isGroup = (row.original as any).isGroup;
      if (isGroup) return null;

      const item = row.original as FlightHistory;
      const value = typeof item.time_since_new === 'string' 
        ? parseFloat(item.time_since_new) 
        : item.time_since_new;
      
      return (
        <div className="text-center">
          <div className="flex items-center justify-center gap-1">
            <Gauge className="h-3 w-3 text-amber-500" />
            <Badge variant="secondary" className="font-medium bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-100">
              {value.toFixed(2)}
            </Badge>
          </div>
        </div>
      );
    }
  },

  {
    id: "csn",
    accessorKey: "cycles_since_new",
    header: ({ column }) => (
      <DataTableColumnHeader 
        column={column} 
        title="CSN (Ciclos desde nuevo)"
      />
    ),
    cell: ({ row }) => {
      const isGroup = (row.original as any).isGroup;
      if (isGroup) return null;

      const item = row.original as FlightHistory;
      const value = typeof item.cycles_since_new === 'string' 
        ? parseFloat(item.cycles_since_new) 
        : item.cycles_since_new;
      
      return (
        <div className="text-center">
          <Badge variant="secondary" className="font-medium bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-100">
            {Math.round(value)}
          </Badge>
        </div>
      );
    }
  },

  // ========== TSO ==========
  {
    id: "tso",
    accessorKey: "time_since_overhaul",
    header: ({ column }) => (
      <DataTableColumnHeader 
        column={column} 
        title="TSO (Horas desde overhaul)"
      />
    ),
    cell: ({ row }) => {
      const isGroup = (row.original as any).isGroup;
      if (isGroup) return null;

      const item = row.original as FlightHistory;
      const value = typeof item.time_since_overhaul === 'string' 
        ? parseFloat(item.time_since_overhaul) 
        : item.time_since_overhaul;
      
      const limit = 2000;
      const status = getStatusIndicator(value, limit);
      const Icon = status.icon;
      
      return (
        <div className="text-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className={`flex items-center justify-center gap-1 p-1 rounded ${status.bgColor}`}>
                  <Icon className={`h-3 w-3 ${status.color}`} />
                  <Badge variant="outline" className="font-medium">
                    {value.toFixed(2)}
                  </Badge>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">{status.message}</p>
                <p className="text-xs text-muted-foreground">
                  {((value / limit) * 100).toFixed(1)}% del límite
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      );
    }
  },

  {
    id: "cso",
    accessorKey: "cycles_since_overhaul",
    header: ({ column }) => (
      <DataTableColumnHeader 
        column={column} 
        title="CSO (Ciclos desde overhaul)"
      />
    ),
    cell: ({ row }) => {
      const isGroup = (row.original as any).isGroup;
      if (isGroup) return null;

      const item = row.original as FlightHistory;
      const value = typeof item.cycles_since_overhaul === 'string' 
        ? parseFloat(item.cycles_since_overhaul) 
        : item.cycles_since_overhaul;
      
      const limit = 5000;
      const status = getStatusIndicator(value, limit);
      const Icon = status.icon;
      
      return (
        <div className="text-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className={`flex items-center justify-center gap-1 p-1 rounded ${status.bgColor}`}>
                  <Icon className={`h-3 w-3 ${status.color}`} />
                  <Badge variant="outline" className="font-medium">
                    {Math.round(value)}
                  </Badge>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">{status.message}</p>
                <p className="text-xs text-muted-foreground">
                  {((value / limit) * 100).toFixed(1)}% del límite
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      );
    }
  },
];

