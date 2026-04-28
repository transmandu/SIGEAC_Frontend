"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";

import {
  Calendar as CalendarIcon,
  AlertCircle,
  Filter,
  PackageSearch,
  Check
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

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

  const [partNumberSearch, setPartNumberSearch] = useState("");
  const [altPartSearch, setAltPartSearch] = useState("");
  const [descriptionSearch, setDescriptionSearch] = useState("");
  const [modelSearch, setModelSearch] = useState("");
  const [brandSearch, setBrandSearch] = useState("");

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

  const safeValue = (value: any) => {
    const stringValue = String(value ?? "").trim();
    return stringValue.length > 0 ? stringValue : null;
  };

  // ================= RESUMEN FILTRO GENERAL =================
  const generalSelectedFilters = [
    aircraft && {
      label: "Aeronave",
      value:
        aircrafts?.find((a) => String(a.id) === String(aircraft))?.acronym ??
        aircraft,
    },
    departmentId && {
      label: "Departamento",
      value:
        departments?.find((d) => String(d.id) === String(departmentId))?.name ??
        departmentId,
    },
    authorizedEmployeeId && {
      label: "Empresa",
      value:
        authorizedEmployees?.find(
          (e) => String(e.id) === String(authorizedEmployeeId)
        )?.employee_name ?? authorizedEmployeeId,
    },
    thirdPartyId && {
      label: "Tercero",
      value:
        thirdParties?.find((t) => String(t.id) === String(thirdPartyId))?.name ??
        thirdPartyId,
    },
  ].filter(Boolean) as { label: string; value: string }[];

  const generalSelectedCount = generalSelectedFilters.length;

  // ================= RESUMEN FILTRO ARTÍCULOS =================
  const articleSelectedFilters = [
    articleFilters.part_number && {
      label: "Part Number",
      value: articleFilters.part_number,
    },
    articleFilters.alternative_part_number && {
      label: "Alt Part",
      value: articleFilters.alternative_part_number,
    },
    articleFilters.description && {
      label: "Descripción",
      value: articleFilters.description,
    },
    articleFilters.variant_type && {
      label: "Presentación",
      value: articleFilters.variant_type,
    },
    articleFilters.brand_model && {
      label: "Marca",
      value: articleFilters.brand_model,
    },
  ].filter(Boolean) as { label: string; value: string }[];

  const articleSelectedCount = articleSelectedFilters.length;

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

                {generalSelectedCount === 0 ? (
                  "Filtro General"
                ) : (
                  <span className="text-sm font-medium">
                    Filtros Generales
                  </span>
                )}
              </span>

              <div className="flex items-center gap-2">
                {generalSelectedCount > 0 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="w-6 h-6 rounded-full bg-indigo-600 text-white text-[11px] flex items-center justify-center font-medium">
                          {generalSelectedCount}
                        </div>
                      </TooltipTrigger>

                      <TooltipContent className="text-xs space-y-1">
                        {generalSelectedFilters.map((f, i) => (
                          <div key={i}>
                            {f.label}:{" "}
                            <span className="font-medium">{f.value}</span>
                          </div>
                        ))}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}

                {generalSelectedCount === 0 && (
                  <span className="text-xs text-muted-foreground hidden sm:block">
                    Aeronave / Depto / ...
                  </span>
                )}
              </div>
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

                {articleSelectedCount === 0 ? (
                  "Filtro de Artículos"
                ) : (
                  <span className="text-sm font-medium">
                    Filtro de Artículos
                  </span>
                )}
              </span>

              <div className="flex items-center gap-2">
                {articleSelectedCount > 0 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="w-6 h-6 rounded-full bg-indigo-600 text-white text-[11px] flex items-center justify-center font-medium">
                          {articleSelectedCount}
                        </div>
                      </TooltipTrigger>

                      <TooltipContent className="text-xs space-y-1">
                        {articleSelectedFilters.map((f, i) => (
                          <div key={i}>
                            {f.label}:{" "}
                            <span className="font-medium">{f.value}</span>
                          </div>
                        ))}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}

                {articleSelectedCount === 0 && (
                  <span className="text-xs text-muted-foreground hidden sm:block">
                    Part / Desc / Marca...
                  </span>
                )}
              </div>
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
                    part_number: v === "all" ? "" : v,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar Part Number" />
                </SelectTrigger>

                <SelectContent>
                  <div className="p-2">
                    <Input
                      autoFocus
                      value={partNumberSearch}
                      onChange={(e) => setPartNumberSearch(e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                      placeholder="Buscar Part Number..."
                      className="h-9"
                    />
                  </div>

                  <SelectItem value="all">Todos</SelectItem>

              {/* ================= PART NUMBER ================= */}
              {uniquePartNumbers
                .filter(
                  (a: any) =>
                    safeValue(a.part_number) &&
                    a.part_number.toLowerCase().includes(partNumberSearch.toLowerCase())
                )
                .map((a: any) => (
                  <SelectItem
                    key={`pn-${a.part_number}`}
                    value={safeValue(a.part_number)!}
                  >
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
                    alternative_part_number: v === "all" ? "" : v,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar Alt Part" />
                </SelectTrigger>

                <SelectContent>
                  <div className="p-2">
                    <Input
                      value={altPartSearch}
                      onChange={(e) => setAltPartSearch(e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                      placeholder="Buscar Alt Part..."
                      className="h-9"
                    />
                  </div>

                  <SelectItem value="all">Todos</SelectItem>

                  {/* ================= ALT PART NUMBER ================= */}
                  {uniqueAltPartNumbers
                    .filter(
                      (a: any) =>
                        safeValue(a.alternative_part_number) &&
                        String(a.alternative_part_number)
                          .toLowerCase()
                          .includes(altPartSearch.toLowerCase())
                    )
                    .map((a: any) => (
                      <SelectItem
                        key={`apn-${a.alternative_part_number}`}
                        value={safeValue(a.alternative_part_number)!}
                      >
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
                    description: v === "all" ? "" : v,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar descripción" />
                </SelectTrigger>

                <SelectContent>
                  <div className="p-2">
                    <Input
                      value={descriptionSearch}
                      onChange={(e) => setDescriptionSearch(e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                      placeholder="Buscar descripción..."
                      className="h-9"
                    />
                  </div>

                  <SelectItem value="all">Todos</SelectItem>
                  {/* ================= DESCRIPCIÓN ================= */}
                  {uniqueDescriptions
                    .filter(
                      (a: any) =>
                        safeValue(a.description) &&
                        a.description
                          .toLowerCase()
                          .includes(descriptionSearch.toLowerCase())
                    )
                    .map((a: any) => (
                      <SelectItem
                        key={`desc-${a.description}`}
                        value={safeValue(a.description)!}
                      >
                        {a.description}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* ================= ESPECIFICACION ================= */}
            <div className="space-y-1">
              <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                Present. / Especif.
              </div>

              <Select
                value={articleFilters.variant_type || "all"}
                onValueChange={(v) =>
                  setArticleFilters((prev: any) => ({
                    ...prev,
                    variant_type: v === "all" ? "" : v,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar Present. / Especif." />
                </SelectTrigger>

                <SelectContent>
                  <div className="p-2">
                    <Input
                      value={modelSearch}
                      onChange={(e) => setModelSearch(e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                      placeholder="Buscar Present. / Especif...."
                      className="h-9"
                    />
                  </div>

                  <SelectItem value="all">Todos</SelectItem>

              {/* ================= PRESENTACIÓN / ESPECIF ================= */}
              {uniqueModels
                .filter(
                  (a: any) =>
                    safeValue(a.variant_type) &&
                    a.variant_type
                      .toLowerCase()
                      .includes(modelSearch.toLowerCase())
                )
                .map((a: any) => (
                  <SelectItem
                    key={`variant-${a.variant_type}`}
                    value={safeValue(a.variant_type)!}
                  >
                    {a.variant_type}
                  </SelectItem>
                ))}
                </SelectContent>
              </Select>
            </div>

            {/* ================= MARCA ================= */}
            <div className="space-y-1">
              <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                Marca / Modelo
              </div>

              <Select
                value={articleFilters.brand_model || "all"}
                onValueChange={(v) =>
                  setArticleFilters((prev: any) => ({
                    ...prev,
                    brand_model: v === "all" ? "" : v,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar marca / modelo" />
                </SelectTrigger>

                <SelectContent>
                  <div className="p-2">
                    <Input
                      value={brandSearch}
                      onChange={(e) => setBrandSearch(e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                      placeholder="Buscar marca / modelo..."
                      className="h-9"
                    />
                  </div>

                  <SelectItem value="all">Todos</SelectItem>

                  {/* ================= MARCA / MODELO ================= */}
                  {uniqueBrands
                    .filter(
                      (a: any) =>
                        safeValue(a.brand_model) &&
                        a.brand_model
                          .toLowerCase()
                          .includes(brandSearch.toLowerCase())
                    )
                    .map((a: any) => (
                      <SelectItem
                        key={`brand-${a.brand_model}`}
                        value={safeValue(a.brand_model)!}
                      >
                        {a.brand_model}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </PopoverContent>
        </Popover>
      </div>

    </div>
  );
}