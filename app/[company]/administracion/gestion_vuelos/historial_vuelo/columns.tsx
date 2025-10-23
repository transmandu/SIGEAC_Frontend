"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader"
import { Badge } from "@/components/ui/badge"
import { FlightHistory } from "@/types"
import { AlertTriangle, CheckCircle2, Clock, Gauge } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

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
 * Columnas mejoradas con diseño UI/UX profesional
 */
export const columns: ColumnDef<FlightHistory>[] = [
  // ========== INFORMACIÓN DEL VUELO ==========
  {
    id: "fecha_hora",
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="FECHA" />
    ),
    cell: ({ row }) => {
      // Intentar obtener la fecha del vuelo relacionado primero, luego created_at
      const dateString = row.original.flight?.flight_date || row.original.created_at;
      
      if (!dateString) {
        return (
          <div className="text-xs text-muted-foreground">
            Sin fecha
          </div>
        );
      }

      const date = new Date(dateString);
      
      // Verificar si la fecha es válida
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
  },
  
  {
    accessorKey: "flight_number",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="VUELO" />
    ),
    cell: ({ row }) => (
      <div className="text-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="outline" className="font-mono text-sm px-3 py-1 cursor-help">
                {row.original.flight_number}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Número de vuelo registrado</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    )
  },

  // ========== PARTE/COMPONENTE (Destacado) ==========
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
      const part = row.original.aircraft_part;
      const partId = row.original.aircraft_part_id;
      
      return (
        <div className="flex justify-center">
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

  // ========== VUELO (Info del vuelo actual) ==========
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
      const value = typeof row.original.flight_hours === 'string' 
        ? parseFloat(row.original.flight_hours) 
        : row.original.flight_hours;
      
      return (
        <div className="text-center">
          <Badge variant="default" className="font-semibold text-base">
            {value.toFixed(2)}
          </Badge>
        </div>
      );
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
      const value = typeof row.original.flight_cycles === 'string' 
        ? parseFloat(row.original.flight_cycles) 
        : row.original.flight_cycles;
      
      return (
        <div className="text-center">
          <Badge variant="default" className="font-semibold text-base">
            {Math.round(value)}
          </Badge>
        </div>
      );
    }
  },

  // ========== TIME SINCE NEW (TSN) ==========
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
      const value = typeof row.original.time_since_new === 'string' 
        ? parseFloat(row.original.time_since_new) 
        : row.original.time_since_new;
      
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
      const value = typeof row.original.cycles_since_new === 'string' 
        ? parseFloat(row.original.cycles_since_new) 
        : row.original.cycles_since_new;
      
      return (
        <div className="text-center">
          <Badge variant="secondary" className="font-medium bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-100">
            {Math.round(value)}
          </Badge>
        </div>
      );
    }
  },

  // ========== TIME SINCE OVERHAUL (TSO) ==========
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
      const value = typeof row.original.time_since_overhaul === 'string' 
        ? parseFloat(row.original.time_since_overhaul) 
        : row.original.time_since_overhaul;
      
      // Ejemplo: límite de 2000 horas (esto debería venir de la configuración de la parte)
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
      const value = typeof row.original.cycles_since_overhaul === 'string' 
        ? parseFloat(row.original.cycles_since_overhaul) 
        : row.original.cycles_since_overhaul;
      
      // Ejemplo: límite de 5000 ciclos
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
