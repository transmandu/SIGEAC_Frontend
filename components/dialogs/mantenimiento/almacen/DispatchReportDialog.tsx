"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";

import {
  Calendar as CalendarIcon,
  Loader2,
  FileText,
  Scale,
  Download,
  AlertCircle
} from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

import { Calendar } from "@/components/ui/calendar";

import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";

import { cn } from "@/lib/utils";
import { RiFileExcel2Fill } from "react-icons/ri";

import { useCompanyStore } from "@/stores/CompanyStore";
import { useAuth } from "@/contexts/AuthContext";

import { useGetAircrafts } from "@/hooks/aerolinea/aeronaves/useGetAircrafts";
import { useGetDispatchReport } from "@/hooks/mantenimiento/almacen/reportes/useGetDispatchReport";
import { useGetBalanceAndTotalReport } from "@/hooks/mantenimiento/almacen/reportes/useGetBalanceAndTotalReport";
import { useGetAuthorizedEmployees } from "@/hooks/sistema/autorizados/useGetAuthorizedEmployees";
import { useGetThirdParties } from "@/hooks/general/terceros/useGetThirdParties";
import { useGetDepartments } from "@/hooks/sistema/departamento/useGetDepartment";

export function DispatchReportDialog() {
  const { selectedStation, selectedCompany } = useCompanyStore();
  const { user } = useAuth();

  const roles = user?.roles ?? [];

  const isAdminRole = roles.some(r =>
    ["JEFE_ADMINISTRACION", "ANALISTA_ADMINISTRACION"].includes(r.name)
  );

  const defaultTab = isAdminRole ? "balance" : "dispatch";

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [open, setOpen] = useState(false);
  const [loadingDownload, setLoadingDownload] = useState(false);

  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [aircraft, setAircraft] = useState<string | null>(null);
  const [departmentId, setDepartmentId] = useState<string | null>(null);
  const [authorizedEmployeeId, setAuthorizedEmployeeId] = useState<string | null>(null);
  const [thirdPartyId, setThirdPartyId] = useState<string | null>(null);

  const today = new Date();

  const { mutateAsync: getDispatch } = useGetDispatchReport();
  const { mutateAsync: getBalance } = useGetBalanceAndTotalReport();

  const { data: aircrafts, isLoading: isLoadingAircrafts } =
    useGetAircrafts(selectedCompany?.slug);

  const { data: departments, isLoading: isLoadingDepartments } =
    useGetDepartments(selectedCompany?.slug);

  const { data: authorizedEmployees, isLoading: isLoadingEmployees } =
    useGetAuthorizedEmployees(selectedCompany?.slug);

  const { data: thirdParties, isLoading: isLoadingThirdParties } =
    useGetThirdParties();

  const isDateRangeInvalid = startDate && endDate && endDate < startDate;
  const areDatesMissing = !startDate || !endDate;

  useEffect(() => {
    if (!open) {
      setStartDate(undefined);
      setEndDate(undefined);
      setAircraft(null);
      setDepartmentId(null);
      setAuthorizedEmployeeId(null);
      setThirdPartyId(null);
      setActiveTab(defaultTab);
    }
  }, [open, defaultTab]);

  const buildParams = () => ({
    location_id: selectedStation!,
    company: selectedCompany!.slug,
    aircraft_id: aircraft || undefined,
    department_id: departmentId || undefined,
    authorized_employee_id: authorizedEmployeeId || undefined,
    third_party_id: thirdPartyId || undefined,
    from: format(startDate!, "yyyy-MM-dd"),
    to: format(endDate!, "yyyy-MM-dd"),
  });

  const canDownload =
    !!selectedStation &&
    !!selectedCompany?.slug &&
    !areDatesMissing &&
    !isDateRangeInvalid;

  const handleDownload = async (reportType: "dispatch" | "balance") => {
    if (loadingDownload || !canDownload) return;

    try {
      setLoadingDownload(true);

      const params = buildParams();

      const blob =
        reportType === "dispatch"
          ? await getDispatch(params)
          : await getBalance({ ...params, format: "pdf" });

      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const reportName =
        reportType === "dispatch" ? "reporte-salidas" : "reporte-balance-total";

      link.download = `${reportName}-${format(startDate!, "yyyyMMdd")}-${format(endDate!, "yyyyMMdd")}.pdf`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 100);

      setOpen(false);
    } finally {
      setLoadingDownload(false);
    }
  };

  const handleExcelDownload = async (reportType: "dispatch" | "balance") => {
    if (loadingDownload || !canDownload) return;

    try {
      setLoadingDownload(true);

      const params = { ...buildParams(), format: "excel" as const };

      const blob =
        reportType === "dispatch"
          ? await getDispatch(params)
          : await getBalance(params);

      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const reportName =
        reportType === "dispatch" ? "reporte-salidas" : "reporte-balance-total";

      link.download = `${reportName}-${format(startDate!, "yyyyMMdd")}-${format(endDate!, "yyyyMMdd")}.xlsx`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } finally {
      setLoadingDownload(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-dashed h-8">
          Generar Reporte
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Centro de Reportes de Almacén</DialogTitle>
          <DialogDescription>
            Configura el rango de fechas y filtros para tu documento PDF.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="dispatch" className="flex gap-2 text-xs">
              <FileText className="w-3.5 h-3.5" />
              Reporte Salidas
            </TabsTrigger>

            <TabsTrigger value="balance" className="flex gap-2 text-xs">
              <Scale className="w-3.5 h-3.5" />
              Balance Total
            </TabsTrigger>
          </TabsList>

          <div className="space-y-4 py-2">
            {/* Rango de fechas */}
            <div className="w-full space-y-3 p-4 bg-muted/30 rounded-lg border">
              <label className="text-sm font-medium flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-primary" />
                Rango de Fechas Obligatorio
              </label>

              <div className="flex gap-2 justify-between">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full text-xs justify-start",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      {startDate
                        ? format(startDate, "dd/MM/yyyy", { locale: es })
                        : "Desde"}
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      locale={es}
                      disabled={date => date > today}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full text-xs justify-start",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      {endDate
                        ? format(endDate, "dd/MM/yyyy", { locale: es })
                        : "Hasta"}
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      locale={es}
                      disabled={date =>
                        date > today || (startDate ? date < startDate : false)
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {isDateRangeInvalid && (
                <div className="flex items-center gap-2 text-[10px] text-destructive mt-1 animate-pulse">
                  <AlertCircle className="w-3 h-3" />
                  La fecha final debe ser mayor a la inicial.
                </div>
              )}
            </div>

            {/* Filtro por Aeronave */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Aeronave (Opcional)
              </label>

              <Select
                onValueChange={value =>
                  setAircraft(value === "all" ? null : value)
                }
                value={aircraft || "all"}
              >
                <SelectTrigger disabled={isLoadingAircrafts}>
                  <SelectValue placeholder="Todas las aeronaves" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">Todas las aeronaves</SelectItem>

                  {aircrafts?.map(item => (
                    <SelectItem key={item.id} value={item.id.toString()}>
                      {item.acronym ?? `Aeronave #${item.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro por Departamento */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Departamento (Opcional)
              </label>

              <Select
                onValueChange={value =>
                  setDepartmentId(value === "all" ? null : value)
                }
                value={departmentId || "all"}
              >
                <SelectTrigger disabled={isLoadingDepartments}>
                  <SelectValue placeholder="Todos los departamentos" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">Todos los departamentos</SelectItem>

                  {departments?.map(dep => (
                    <SelectItem key={dep.id} value={dep.id.toString()}>
                      {dep.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro por Empresa (Empleado Autorizado) */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Empresa (Opcional)
              </label>

              <Select
                onValueChange={value =>
                  setAuthorizedEmployeeId(value === "all" ? null : value)
                }
                value={authorizedEmployeeId || "all"}
              >
                <SelectTrigger disabled={isLoadingEmployees}>
                  <SelectValue placeholder="Todas las empresas" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">Todas las empresas</SelectItem>

                  {authorizedEmployees?.map(emp => (
                    <SelectItem key={emp.id} value={emp.id.toString()}>
                      {emp.employee_name} — {emp.from_company_db}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro por Tercero */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Tercero (Opcional)
              </label>

              <Select
                onValueChange={value =>
                  setThirdPartyId(value === "all" ? null : value)
                }
                value={thirdPartyId || "all"}
              >
                <SelectTrigger disabled={isLoadingThirdParties}>
                  <SelectValue placeholder="Todos los terceros" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">Todos los terceros</SelectItem>

                  {thirdParties?.map(tp => (
                    <SelectItem key={tp.id} value={tp.id.toString()}>
                      {tp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <TabsContent value="dispatch">
              <div className="flex gap-2">
                <Button
                  className="w-full"
                  onClick={() => handleDownload("dispatch")}
                  disabled={loadingDownload || !canDownload}
                >
                  {loadingDownload
                    ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    : <Download className="mr-2 h-4 w-4" />}

                  Descargar Reporte de Salidas
                </Button>

                <TooltipProvider>
                  <Tooltip delayDuration={100}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => handleExcelDownload("dispatch")}
                        disabled={loadingDownload || !canDownload}
                        className="disabled:opacity-50"
                        aria-label="Descargar Excel"
                      >
                        {loadingDownload
                          ? <Loader2 className="size-5 animate-spin" />
                          : <RiFileExcel2Fill className="size-6 text-green-600/80 hover:scale-125 transition-transform" />}
                      </button>
                    </TooltipTrigger>

                    <TooltipContent>
                      {!selectedStation || !selectedCompany?.slug
                        ? "Selecciona ubicación y compañía"
                        : "Descargar Excel"}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </TabsContent>

            <TabsContent value="balance">
              <div className="flex gap-2">
                <Button
                  className="w-full"
                  onClick={() => handleDownload("balance")}
                  disabled={loadingDownload || !canDownload}
                >
                  {loadingDownload
                    ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    : <Download className="mr-2 h-4 w-4" />}

                  Descargar Balance Total
                </Button>

                <TooltipProvider>
                  <Tooltip delayDuration={100}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => handleExcelDownload("balance")}
                        disabled={loadingDownload || !canDownload}
                        className="disabled:opacity-50"
                        aria-label="Descargar Excel"
                      >
                        {loadingDownload
                          ? <Loader2 className="size-5 animate-spin" />
                          : <RiFileExcel2Fill className="size-6 text-green-600/80 hover:scale-125 transition-transform" />}
                      </button>
                    </TooltipTrigger>

                    <TooltipContent>
                      {!selectedStation || !selectedCompany?.slug
                        ? "Selecciona ubicación y compañía"
                        : "Descargar Excel"}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
