"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Loader2, Download, FileText, Scale } from "lucide-react";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";

import { RiFileExcel2Fill } from "react-icons/ri";

import { useCompanyStore } from "@/stores/CompanyStore";

import { useGetAircrafts } from "@/hooks/aerolinea/aeronaves/useGetAircrafts";
import { useGetDispatchReport } from "@/hooks/mantenimiento/almacen/reportes/useGetDispatchReport";
import { useGetBalanceAndTotalReport } from "@/hooks/mantenimiento/almacen/reportes/useGetBalanceAndTotalReport";
import { useGetAuthorizedEmployees } from "@/hooks/sistema/autorizados/useGetAuthorizedEmployees";
import { useGetThirdParties } from "@/hooks/general/terceros/useGetThirdParties";
import { useGetDepartments } from "@/hooks/sistema/departamento/useGetDepartment";

import { useGetArticlesByStatus } from "@/hooks/mantenimiento/almacen/articulos/useGetArticlesByStatus";
import { useGetGeneralArticles } from "@/hooks/mantenimiento/almacen/almacen_general/useGetGeneralArticles";

import { DispatchReportFilters } from "@/components/dialogs/mantenimiento/almacen/DispatchReportFilters";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type DispatchType = "aeronautical" | "general";

export function DispatchReportDialog() {
  const { selectedStation, selectedCompany } = useCompanyStore();

  const [activeTab, setActiveTab] = useState("dispatch");
  const [open, setOpen] = useState(false);
  const [loadingDownload, setLoadingDownload] = useState(false);

  // ===================== FECHAS =====================
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  // ===================== FILTROS BASE =====================
  const [aircraft, setAircraft] = useState<string | null>(null);
  const [departmentId, setDepartmentId] = useState<string | null>(null);
  const [authorizedEmployeeId, setAuthorizedEmployeeId] = useState<string | null>(null);
  const [thirdPartyId, setThirdPartyId] = useState<string | null>(null);

  // ===================== TIPO DE DESPACHO =====================
  const [dispatchType, setDispatchType] = useState<DispatchType | null>(null);

  // ===================== FILTROS ARTÍCULOS =====================
  const [articleFilters, setArticleFilters] = useState({
    part_number: "",
    alternative_part_number: "",
    description: "",
    batch_id: "",
    variant_type: "",
    brand_model: ""
  });

  const today = new Date();

  const { mutateAsync: getDispatch } = useGetDispatchReport();
  const { mutateAsync: getBalance } = useGetBalanceAndTotalReport();

  // ===================== DATA =====================
  const { data: aircrafts, isLoading: isLoadingAircrafts } =
    useGetAircrafts(selectedCompany?.slug);

  const { data: departments, isLoading: isLoadingDepartments } =
    useGetDepartments(selectedCompany?.slug);

  const { data: authorizedEmployees, isLoading: isLoadingEmployees } =
    useGetAuthorizedEmployees(selectedCompany?.slug);

  const { data: thirdParties, isLoading: isLoadingThirdParties } =
    useGetThirdParties();

  // ===================== ARTÍCULOS =====================
  const { data: articlesByStatus = [], isLoading: isLoadingArticles } =
    useGetArticlesByStatus("STORED");

  const { data: generalArticles = [], isLoading: isLoadingGeneralArticles } =
    useGetGeneralArticles();

  // 🔥 UNIFICACIÓN DE FUENTES
  const allArticles = [...articlesByStatus, ...generalArticles];

  // ===================== VALIDACIÓN FECHAS =====================
  const isDateRangeInvalid =
    !!startDate &&
    !!endDate &&
    endDate < startDate;

  const canDownload =
    !!selectedStation &&
    !!selectedCompany?.slug &&
    !!startDate &&
    !!endDate &&
    !isDateRangeInvalid;

  useEffect(() => {
    if (!open) {
      setStartDate(undefined);
      setEndDate(undefined);
      setAircraft(null);
      setDepartmentId(null);
      setAuthorizedEmployeeId(null);
      setThirdPartyId(null);
      setDispatchType(null);

      setArticleFilters({
        part_number: "",
        alternative_part_number: "",
        description: "",
        batch_id: "",
        variant_type: "",
        brand_model: ""
      });

      setActiveTab("dispatch");
    }
  }, [open]);

  // ===================== PARAMS =====================
  const buildParams = () => ({
    location_id: selectedStation!,
    company: selectedCompany!.slug,

    aircraft_id: aircraft || undefined,
    department_id: departmentId || undefined,
    authorized_employee_id: authorizedEmployeeId || undefined,
    third_party_id: thirdPartyId || undefined,
    type: dispatchType || undefined,

    from: format(startDate!, "yyyy-MM-dd"),
    to: format(endDate!, "yyyy-MM-dd"),

    // ===================== ARTÍCULOS =====================
    part_number: articleFilters.part_number || undefined,
    alternative_part_number: articleFilters.alternative_part_number || undefined,
    description: articleFilters.description || undefined,
    batch_id: articleFilters.batch_id || undefined,
    variant_type: articleFilters.variant_type || undefined,
    brand_model: articleFilters.brand_model || undefined
    
  });

  // ===================== DOWNLOAD =====================
  const handleDownload = async (type: "dispatch" | "balance") => {
    if (!canDownload || loadingDownload) return;

    try {
      setLoadingDownload(true);

      const params = buildParams();

      const blob =
        type === "dispatch"
          ? await getDispatch(params)
          : await getBalance({ ...params, format: "pdf" });

      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `${type}-report-${format(startDate!, "yyyyMMdd")}-${format(endDate!, "yyyyMMdd")}.pdf`;

      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 100);

      setOpen(false);
    } finally {
      setLoadingDownload(false);
    }
  };

  const handleExcel = async (type: "dispatch" | "balance") => {
    if (!canDownload || loadingDownload) return;

    try {
      setLoadingDownload(true);

      const params = { ...buildParams(), format: "excel" as const };

      const blob =
        type === "dispatch"
          ? await getDispatch(params)
          : await getBalance(params);

      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `${type}-report-${format(startDate!, "yyyyMMdd")}-${format(endDate!, "yyyyMMdd")}.xlsx`;

      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } finally {
      setLoadingDownload(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="relative overflow-hidden border border-dashed border-indigo-400/50 dark:border-indigo-300/30 bg-background/70 backdrop-blur text-indigo-700 dark:text-indigo-300 font-medium tracking-wide shadow-sm transition-all duration-200 hover:border-indigo-500/60 dark:hover:border-indigo-300/50 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 hover:shadow-md hover:-translate-y-[1px] active:translate-y-0 active:shadow-sm focus-visible:ring-2 focus-visible:ring-indigo-500/25 focus-visible:ring-offset-2">Generar Reporte</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[580px] p-0 overflow-visible">
        <div className="relative bg-gradient-to-br from-primary/5 via-background to-background px-6 pt-8 pb-1">
          <div className="absolute inset-0 bg-grid-white/[0.02]" />

          <DialogHeader className="relative">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl border bg-background shadow-sm">
                <FileText className="h-7 w-7 text-primary" />
              </div>

              <div className="space-y-1">
                <DialogTitle className="text-2xl font-bold tracking-tight leading-none">
                  Centro de Reportes
                </DialogTitle>

                <p className="text-sm font-medium text-primary/80">
                  Almacén e Inventario
                </p>

                <DialogDescription className="max-w-[430px] text-sm leading-relaxed">
                  Genera reportes operativos, balances e históricos de
                  solicitudes de salidas.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>
        <div className="px-6 py-5">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="dispatch" className=" flex gap-2 text-xs rounded-lg transition-all duration-200 data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:shadow-blue-500/10 data-[state=active]:ring-1 data-[state=active]:ring-blue-500/ data-[state=active]:text-blue-600">
                <FileText className="w-3.5 h-3.5" />
                Salidas
              </TabsTrigger>

              <TabsTrigger value="balance" className=" flex gap-2 text-xs rounded-lg transition-all duration-200 data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:shadow-blue-500/10 data-[state=active]:ring-1 data-[state=active]:ring-blue-500/ data-[state=active]:text-blue-600">
                <Scale className="w-3.5 h-3.5" />
                Balance
              </TabsTrigger>
            </TabsList>

            <DispatchReportFilters
              startDate={startDate}
              endDate={endDate}
              setStartDate={setStartDate}
              setEndDate={setEndDate}

              aircraft={aircraft}
              setAircraft={setAircraft}
              aircrafts={aircrafts}
              isLoadingAircrafts={isLoadingAircrafts}

              departmentId={departmentId}
              setDepartmentId={setDepartmentId}
              departments={departments}
              isLoadingDepartments={isLoadingDepartments}

              authorizedEmployeeId={authorizedEmployeeId}
              setAuthorizedEmployeeId={setAuthorizedEmployeeId}
              authorizedEmployees={authorizedEmployees}
              isLoadingEmployees={isLoadingEmployees}

              thirdPartyId={thirdPartyId}
              setThirdPartyId={setThirdPartyId}
              thirdParties={thirdParties}
              isLoadingThirdParties={isLoadingThirdParties}

              dispatchType={dispatchType}
              setDispatchType={setDispatchType}

              // 🔥 ARTÍCULOS UNIFICADOS
              articles={allArticles}
              isLoadingArticles={isLoadingArticles || isLoadingGeneralArticles}
              articleFilters={articleFilters}
              setArticleFilters={setArticleFilters}

              isDateRangeInvalid={isDateRangeInvalid}
            />

            <TabsContent value="dispatch" className="mt-8">
              <div className="grid grid-cols-[1fr_auto] gap-4 items-center">
                <Button
                  size="lg"
                  className="h-12 rounded-2xl font-medium shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
                  onClick={() => handleDownload("dispatch")}
                  disabled={!canDownload || loadingDownload}
                >
                  {loadingDownload ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <Download className="mr-2 h-5 w-5" />
                  )}

                  Descargar Reporte
                  <span className="ml-2 text-xs font-normal opacity-80">
                    PDF
                  </span>
                </Button>

                <TooltipProvider>
                  <Tooltip delayDuration={150}>
                    <TooltipTrigger asChild>
                      <Button
                        size="lg"
                        variant="outline"
                        className="h-12 px-4 rounded-2xl border-green-200 bg-green-50/80 text-green-700 shadow-sm transition-all hover:bg-green-100 hover:border-green-300 hover:shadow-md active:scale-[0.98] dark:border-green-900 dark:bg-green-950/30 dark:text-green-400 dark:hover:bg-green-950/50"
                        onClick={() => handleExcel("dispatch")}
                        disabled={!canDownload || loadingDownload}
                      >
                        <RiFileExcel2Fill className="h-6 w-6 shrink-0" />
                      </Button>
                    </TooltipTrigger>

                    <TooltipContent side="top" align="center" sideOffset={10} avoidCollisions={false} className="z-[9999] whitespace-nowrap rounded-xl px-3 py-1.5">
                      Descargar en Excel
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </TabsContent>

            <TabsContent value="balance" className="mt-8">
              <div className="grid grid-cols-[1fr_auto] gap-4 items-center">
                <Button
                  size="lg"
                  className="h-12 rounded-2xl font-medium shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
                  onClick={() => handleDownload("balance")}
                  disabled={!canDownload || loadingDownload}
                >
                  {loadingDownload ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <Download className="mr-2 h-5 w-5" />
                  )}

                  Descargar Balance
                  <span className="ml-2 text-xs font-normal opacity-80">
                    PDF
                  </span>
                </Button>

                <TooltipProvider>
                  <Tooltip delayDuration={150}>
                    <TooltipTrigger asChild>
                      <Button
                        size="lg"
                        variant="outline"
                        className="h-12 px-4 rounded-2xl border-green-200 bg-green-50/80 text-green-700 shadow-sm transition-all hover:bg-green-100 hover:border-green-300 hover:shadow-md active:scale-[0.98] dark:border-green-900 dark:bg-green-950/30 dark:text-green-400 dark:hover:bg-green-950/50"
                        onClick={() => handleExcel("balance")}
                        disabled={!canDownload || loadingDownload}
                      >
                        <RiFileExcel2Fill className="h-6 w-6 shrink-0" />
                      </Button>
                    </TooltipTrigger>

                    <TooltipContent  side="top" align="center" sideOffset={10} avoidCollisions={false} className="z-[9999] whitespace-nowrap rounded-xl px-3 py-1.5">
                      Descargar en Excel
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </TabsContent>

          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
