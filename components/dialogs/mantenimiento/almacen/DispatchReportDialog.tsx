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
        <Button variant="outline">Generar Reporte</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Centro de Reportes de Almacén</DialogTitle>
          <DialogDescription>
            Configura filtros y genera reportes de operación.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="dispatch" className="flex gap-2 text-xs">
              <FileText className="w-3.5 h-3.5" />
              Salidas
            </TabsTrigger>

            <TabsTrigger value="balance" className="flex gap-2 text-xs">
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

            // 🔥 ARTÍCULOS UNIFICADOS
            articles={allArticles}
            isLoadingArticles={isLoadingArticles || isLoadingGeneralArticles}
            articleFilters={articleFilters}
            setArticleFilters={setArticleFilters}

            isDateRangeInvalid={isDateRangeInvalid}
          />

          <TabsContent value="dispatch" className="mt-4">
            <div className="flex gap-2">
              <Button
                className="w-full"
                onClick={() => handleDownload("dispatch")}
                disabled={!canDownload || loadingDownload}
              >
                {loadingDownload ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Descargar Reporte de  Salidas (PDF)
              </Button>

              <Button
                variant="outline"
                onClick={() => handleExcel("dispatch")}
                disabled={!canDownload || loadingDownload}
              >
                <RiFileExcel2Fill className="h-5 w-5 text-green-600" />
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="balance" className="mt-4">
            <div className="flex gap-2">
              <Button
                className="w-full"
                onClick={() => handleDownload("balance")}
                disabled={!canDownload || loadingDownload}
              >
                {loadingDownload ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Descargar Balance Total (PDF)
              </Button>

              <Button
                variant="outline"
                onClick={() => handleExcel("balance")}
                disabled={!canDownload || loadingDownload}
              >
                <RiFileExcel2Fill className="h-5 w-5 text-green-600" />
              </Button>
            </div>
          </TabsContent>

        </Tabs>
      </DialogContent>
    </Dialog>
  );
}