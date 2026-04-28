"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";

import {
  Calendar as CalendarIcon,
  AlertCircle,
  Filter,
  PackageSearch
} from "lucide-react";

import { useState, useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";

import { cn } from "@/lib/utils";

/* ---------------- TYPES ---------------- */

interface Props {
  startDate?: Date;
  endDate?: Date;
  setStartDate: (d?: Date) => void;
  setEndDate: (d?: Date) => void;

  aircraft: string | null;
  setAircraft: (v: string | null) => void;
  aircrafts?: any[];
  isLoadingAircrafts?: boolean;

  departmentId: string | null;
  setDepartmentId: (v: string | null) => void;
  departments?: any[];
  isLoadingDepartments?: boolean;

  authorizedEmployeeId: string | null;
  setAuthorizedEmployeeId: (v: string | null) => void;
  authorizedEmployees?: any[];
  isLoadingEmployees?: boolean;

  thirdPartyId: string | null;
  setThirdPartyId: (v: string | null) => void;
  thirdParties?: any[];
  isLoadingThirdParties?: boolean;

  isDateRangeInvalid: boolean;

  // ================= ARTÍCULOS (NUEVO) =================
  articles?: any[];
  isLoadingArticles?: boolean;

  articleFilters: {
    part_number: string;
    alternative_part_number: string;
    description: string;
    batch_id: string;
    variant_type: string;
    brand_model: string;
  };

  setArticleFilters: (v: any) => void;
}

/* ---------------- COMPONENT ---------------- */

export function DispatchReportFilters({
  startDate,
  endDate,
  setStartDate,
  setEndDate,

  aircraft,
  setAircraft,
  aircrafts,
  isLoadingAircrafts,

  departmentId,
  setDepartmentId,
  departments,
  isLoadingDepartments,

  authorizedEmployeeId,
  setAuthorizedEmployeeId,
  authorizedEmployees,
  isLoadingEmployees,

  thirdPartyId,
  setThirdPartyId,
  thirdParties,
  isLoadingThirdParties,

  isDateRangeInvalid,

  // ================= ARTÍCULOS =================
  articles = [],
  isLoadingArticles,
  articleFilters,
  setArticleFilters
}: Props) {
  const today = new Date();

  const [openGeneral, setOpenGeneral] = useState(false);
  const [openItems, setOpenItems] = useState(false);

  const [openStartDate, setOpenStartDate] = useState(false);
  const [openEndDate, setOpenEndDate] = useState(false);

  // ================= FILTRO LOCAL POR CAMPO =================
  const filteredByField = (field: string, value: string) => {
    if (!value) return articles;

    return articles.filter((a) =>
      String(a?.[field] ?? "")
        .toLowerCase()
        .includes(value.toLowerCase())
    );
  };
  const uniquePartNumbers = useMemo(() => {
    const map = new Map();
    (articles ?? []).forEach((a: any) => {
      if (a?.part_number) map.set(a.part_number, a);
    });
    return Array.from(map.values());
  }, [articles]);

  const uniqueAltPartNumbers = useMemo(() => {
    const map = new Map();
    (articles ?? []).forEach((a: any) => {
      if (a?.alternative_part_number) map.set(a.alternative_part_number, a);
    });
    return Array.from(map.values());
  }, [articles]);

  const uniqueDescriptions = useMemo(() => {
    const map = new Map();
    (articles ?? []).forEach((a: any) => {
      if (a?.description) map.set(a.description, a);
    });
    return Array.from(map.values());
  }, [articles]);

  const uniqueModels = useMemo(() => {
    const map = new Map();
    (articles ?? []).forEach((a: any) => {
      if (a?.variant_type) map.set(a.variant_type, a);
    });
    return Array.from(map.values());
  }, [articles]);

  const uniqueBrands = useMemo(() => {
    const map = new Map();
    (articles ?? []).forEach((a: any) => {
      if (a?.brand_model) map.set(a.brand_model, a);
    });
    return Array.from(map.values());
  }, [articles]);

  const uniqueOTs = useMemo(() => {
    const map = new Map();
    (articles ?? []).forEach((a: any) => {
      if (a?.batch_id) map.set(a.batch_id, a);
    });
    return Array.from(map.values());
  }, [articles]);

  return (
    <div className="space-y-4 py-2 flex flex-col items-center">

      {/* ===================== FECHAS ===================== */}
      <div className="p-4 border rounded-xl bg-muted/20 dark:bg-muted/10 space-y-3 w-full">
        <div className="flex items-center gap-2 text-foreground/80">
          <CalendarIcon className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Rango de Fechas</span>
        </div>

        <div className="flex gap-2">

          <Popover open={openStartDate} onOpenChange={setOpenStartDate}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full text-xs justify-start">
                {startDate
                  ? format(startDate, "dd/MM/yyyy", { locale: es })
                  : "Desde"}
              </Button>
            </PopoverTrigger>

            <PopoverContent className="p-0 w-auto">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={(date) => {
                  setStartDate(date);
                  setOpenStartDate(false);
                }}
                locale={es}
                disabled={(d) => d > today}
              />
            </PopoverContent>
          </Popover>

          <Popover open={openEndDate} onOpenChange={setOpenEndDate}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full text-xs justify-start">
                {endDate
                  ? format(endDate, "dd/MM/yyyy", { locale: es })
                  : "Hasta"}
              </Button>
            </PopoverTrigger>

            <PopoverContent className="p-0 w-auto">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={(date) => {
                  setEndDate(date);
                  setOpenEndDate(false);
                }}
                locale={es}
                disabled={(d) =>
                  d > today || (startDate ? d < startDate : false)
                }
              />
            </PopoverContent>
          </Popover>

        </div>

        {isDateRangeInvalid && (
          <div className="flex items-center gap-2 text-xs text-red-500">
            <AlertCircle className="w-3 h-3" />
            Rango de fechas inválido
          </div>
        )}
      </div>

      {/* ===================== FILTRO GENERAL (SIN CAMBIOS) ===================== */}
      <div className="w-full flex justify-center">
        <Popover open={openGeneral} onOpenChange={setOpenGeneral}>
          <PopoverTrigger asChild>
            <Button
              className={cn(
                "w-[70%] justify-between h-12 text-sm font-medium transition-all border",
                "bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/40 dark:hover:bg-slate-900/60",
                "border-slate-200 dark:border-slate-800",
                openGeneral &&
                  "ring-2 ring-slate-300/40 dark:ring-slate-700/40"
              )}
            >
              <span className="flex items-center gap-2 text-foreground/80">
                <Filter className="w-4 h-4 text-muted-foreground" />
                Filtro General
              </span>

              <span className="text-xs text-muted-foreground">
                Aeronave / Depto / ...
              </span>
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-[92vw] max-w-[340px] space-y-4 p-4">

            <div className="space-y-1">
              <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                Aeronave
              </div>

              <Select value={aircraft || "all"} onValueChange={v => setAircraft(v === "all" ? null : v)}>
                <SelectTrigger disabled={isLoadingAircrafts}>
                  <SelectValue placeholder="Seleccionar aeronave" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {(aircrafts ?? []).map(a => (
                    <SelectItem key={a.id} value={a.id.toString()}>
                      {a.acronym ?? `#${a.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                Departamento
              </div>

              <Select value={departmentId || "all"} onValueChange={v => setDepartmentId(v === "all" ? null : v)}>
                <SelectTrigger disabled={isLoadingDepartments}>
                  <SelectValue placeholder="Seleccionar departamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {(departments ?? []).map(d => (
                    <SelectItem key={d.id} value={d.id.toString()}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                Empresa
              </div>

              <Select value={authorizedEmployeeId || "all"} onValueChange={v => setAuthorizedEmployeeId(v === "all" ? null : v)}>
                <SelectTrigger disabled={isLoadingEmployees}>
                  <SelectValue placeholder="Seleccionar empresa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {(authorizedEmployees ?? []).map(emp => (
                    <SelectItem key={emp.id} value={emp.id.toString()}>
                      {emp.employee_name} - {(emp.from_company_db ?? "").toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                Terceros
              </div>

              <Select value={thirdPartyId || "all"} onValueChange={v => setThirdPartyId(v === "all" ? null : v)}>
                <SelectTrigger disabled={isLoadingThirdParties}>
                  <SelectValue placeholder="Seleccionar terceros" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {(thirdParties ?? []).map(tp => (
                    <SelectItem key={tp.id} value={tp.id.toString()}>
                      {tp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

          </PopoverContent>
        </Popover>
      </div>


{/* ===================== FILTRO ARTÍCULOS ===================== */}
<div className="w-full flex justify-center">
  <Popover open={openItems} onOpenChange={setOpenItems}>
    <PopoverTrigger asChild>
      <Button
        className={cn(
          "w-[70%] justify-between h-12 text-sm font-medium transition-all border",
          "bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/20 dark:hover:bg-indigo-950/30",
          "border-indigo-200 dark:border-indigo-900",
          openItems &&
            "ring-2 ring-indigo-300/40 dark:ring-indigo-700/40"
        )}
      >
        <span className="flex items-center gap-2 text-foreground/80">
          <PackageSearch className="w-4 h-4 text-muted-foreground" />
          Filtro de Artículos
        </span>

        <span className="text-xs text-muted-foreground">
          Part / Desc / Modelo / OT
        </span>
      </Button>
    </PopoverTrigger>

    <PopoverContent className="w-[92vw] max-w-[340px] space-y-4 p-4">

      {/* ================= PART NUMBER ================= */}
      <div className="space-y-1">
        <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
          Part Number
        </div>

        <Select
          value={articleFilters.part_number || "all"}
          onValueChange={(v) =>
            setArticleFilters((prev: any) => ({
              ...prev,
              part_number: v === "all" ? "" : v
            }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar Part Number" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {uniquePartNumbers.map((a: any) => (
              <SelectItem key={a.id} value={a.part_number}>
                {a.part_number}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ================= ALT PART ================= */}
      <div className="space-y-1">
        <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
          Alt Part Number
        </div>

        <Select
          value={articleFilters.alternative_part_number || "all"}
          onValueChange={(v) =>
            setArticleFilters((prev: any) => ({
              ...prev,
              alternative_part_number: v === "all" ? "" : v
            }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar Alt Part" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {uniqueAltPartNumbers.map((a: any) => (
              <SelectItem key={a.id} value={a.alternative_part_number}>
                {a.alternative_part_number}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ================= DESCRIPCIÓN ================= */}
      <div className="space-y-1">
        <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
          Descripción
        </div>

        <Select
          value={articleFilters.description || "all"}
          onValueChange={(v) =>
            setArticleFilters((prev: any) => ({
              ...prev,
              description: v === "all" ? "" : v
            }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar descripción" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {uniqueDescriptions.map((a: any) => (
              <SelectItem key={a.id} value={a.description}>
                {a.description}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ================= MODELO ================= */}
      <div className="space-y-1">
        <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
          Modelo
        </div>

        <Select
          value={articleFilters.variant_type || "all"}
          onValueChange={(v) =>
            setArticleFilters((prev: any) => ({
              ...prev,
              variant_type: v === "all" ? "" : v
            }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar modelo" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {uniqueModels.map((a: any) => (
              <SelectItem key={a.id} value={a.variant_type}>
                {a.variant_type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ================= MARCA ================= */}
      <div className="space-y-1">
        <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
          Marca
        </div>

        <Select
          value={articleFilters.brand_model || "all"}
          onValueChange={(v) =>
            setArticleFilters((prev: any) => ({
              ...prev,
              brand_model: v === "all" ? "" : v
            }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar marca" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {uniqueBrands.map((a: any) => (
              <SelectItem key={a.id} value={a.brand_model}>
                {a.brand_model}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ================= OT =================
      <div className="space-y-1">
        <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
          Orden de trabajo
        </div>

        <Select
          value={articleFilters.batch_id || "all"}
          onValueChange={(v) =>
            setArticleFilters((prev: any) => ({
              ...prev,
              batch_id: v === "all" ? "" : v
            }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar OT" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {uniqueOTs.map((a: any) => (
              <SelectItem key={a.id} value={a.batch_id}>
                {a.batch_id}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div> */}

    </PopoverContent>
  </Popover>
</div>

    </div>
  );
}