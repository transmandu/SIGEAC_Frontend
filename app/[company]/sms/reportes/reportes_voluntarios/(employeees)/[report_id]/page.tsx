"use client";
import CreateDangerIdentificationDialog from "@/components/dialogs/aerolinea/sms/CreateDangerIdentificationDialog";
import CreateVoluntaryReportDialog from "@/components/dialogs/aerolinea/sms/CreateVoluntaryReportDialog";
import DeleteVoluntaryReportDialog from "@/components/dialogs/aerolinea/sms/DeleteVoluntaryReportDialog";
import PreviewVoluntaryReportPdfDialog from "@/components/dialogs/aerolinea/sms/PreviewVoluntaryReportPdfDialog";
import CreateAnalysesDialog from "@/components/dialogs/aerolinea/sms/CreateAnalysesDialog";
import DeleteDangerIdentificationDialog from "@/components/dialogs/aerolinea/sms/DeleteDangerIdentificationDialog";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetVoluntaryReportById } from "@/hooks/sms/useGetVoluntaryReportById";
import { useGetDangerIdentificationById } from "@/hooks/sms/useGetDangerIdentificationById";
import { useGetMitigationTable } from "@/hooks/sms/useGetMitigationTable";
import { dateFormat } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  ChevronRight,
  FileText,
  Loader2,
  Mail,
  MapPin,
  Phone,
  User,
  File,
  Info,
  Layers,
  List,
  Shield,
  ClipboardList,
  Activity,
} from "lucide-react";
import Image from "next/image";
import ImageZoom from "@/components/ui/ImageZoom";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import RiskMatrix from "@/components/misc/RiskMatrix";

const ShowVoluntaryReport = () => {
  const { report_id } = useParams<{ report_id: string }>();
  const { selectedCompany } = useCompanyStore();

  // Fetch report data
  const {
    data: voluntaryReport,
    isLoading: reportLoading,
    isError: reportError,
  } = useGetVoluntaryReportById({
    id: report_id,
    company: selectedCompany?.slug,
  });

  // Fetch danger identification data if it exists
  const {
    data: dangerIdentification,
    isLoading: dangerLoading,
  } = useGetDangerIdentificationById({
    company: selectedCompany?.slug,
    id: voluntaryReport?.danger_identification_id?.toString() || "",
  });

  // Fetch mitigation table to find related mitigation plan
  const { data: mitigationTableData } = useGetMitigationTable(
    selectedCompany?.slug
  );

  // Find mitigation plan for this danger identification
  const mitigationPlan = useMemo(() => {
    if (!dangerIdentification?.id || !mitigationTableData) return null;
    return mitigationTableData.find(
      (item) => item.id === dangerIdentification.id
    );
  }, [dangerIdentification?.id, mitigationTableData]);

  const isLoading = reportLoading;

  // ==========================================================
  // ACCIONES
  // ==========================================================
  const renderActionButtons = () => {
    if (!voluntaryReport) return null;

    return (
      <div className="flex flex-wrap gap-3 justify-center mb-6">
        {voluntaryReport.status === "ABIERTO" && (
          <>
            <CreateVoluntaryReportDialog
              initialData={voluntaryReport}
              isEditing={true}
              title="Editar Reporte"
            />

            <DeleteVoluntaryReportDialog
              company={selectedCompany!.slug}
              id={voluntaryReport.id.toString()}
            />
          </>
        )}

        <PreviewVoluntaryReportPdfDialog
          title="Descargar PDF"
          voluntaryReport={voluntaryReport}
        />
      </div>
    );
  };

  // ==========================================================
  // TAB 1: REPORT DETAILS
  // ==========================================================
  const renderReportDetailsTab = () => (
    <div className="space-y-6">
      {/* PRIMER BLOQUE: Info General + Ubicación + Fecha */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {renderBasicInfo()}
        {renderLocationInfo()}
        {renderIdentificationDate()}
      </div>

      {/* SEGUNDO BLOQUE: Descripción + Consecuencias */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderDescription()}
        {renderConsequences()}
      </div>

      {/* TERCER BLOQUE: Reportero */}
      {renderReporterInfo()}

      {/* CUARTO BLOQUE: Adjuntos */}
      {renderAttachments()}
    </div>
  );

  const renderBasicInfo = () => (
    <Card>
      <CardHeader className="pb-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Información General
        </h3>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium">Número de Reporte</p>
            <p className="font-semibold">
              {voluntaryReport?.report_number
                ? `RVP-${voluntaryReport.report_number}`
                : "N/A"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium">Fecha del Reporte</p>
            <p className="font-medium">
              {dateFormat(voluntaryReport?.report_date || "", "PPP")}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">Estado</span>
          </div>
          <Badge
            variant={
              voluntaryReport?.status === "CERRADO" ? "default" : "secondary"
            }
            className={
              voluntaryReport?.status === "CERRADO"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }
          >
            {voluntaryReport?.status}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );

  const renderLocationInfo = () => (
    <Card>
      <CardHeader className="pb-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Ubicación del Peligro
        </h3>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-sm font-medium mb-1">Área</p>
          <p className="font-medium">{voluntaryReport?.danger_area || "N/A"}</p>
        </div>
        <div>
          <p className="text-sm font-medium mb-1">Base</p>
          <p className="font-medium">
            {voluntaryReport?.danger_location || "N/A"}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium mb-1">Localización exacta</p>
          <p className="font-medium">
            {voluntaryReport?.airport_location || "N/A"}
          </p>
        </div>
      </CardContent>
    </Card>
  );

  const renderIdentificationDate = () => (
    <Card>
      <CardHeader className="pb-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Fecha de Identificación
        </h3>
      </CardHeader>
      <CardContent>
        <p className="font-medium">
          {dateFormat(voluntaryReport?.identification_date || "", "PPP")}
        </p>
      </CardContent>
    </Card>
  );

  const renderDescription = () => (
    <Card>
      <CardHeader className="pb-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Descripción
        </h3>
      </CardHeader>
      <CardContent>
        <p className="leading-relaxed ">
          {voluntaryReport?.description || "N/A"}
        </p>
      </CardContent>
    </Card>
  );

  const renderConsequences = () => (
    <Card>
      <CardHeader className="pb-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Posibles Consecuencias
        </h3>
      </CardHeader>
      <CardContent>
        {voluntaryReport?.possible_consequences ? (
          <ul className="space-y-2">
            {voluntaryReport.possible_consequences.split(",").map(
              (consequence, index) =>
                consequence.trim() && (
                  <li key={index} className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-1 flex-shrink-0" />
                    <span className="">{consequence.trim()}</span>
                  </li>
                )
            )}
          </ul>
        ) : (
          <p className="">N/A</p>
        )}
      </CardContent>
    </Card>
  );

  const renderReporterInfo = () => {
    const isAnonymous =
      !voluntaryReport?.reporter_phone &&
      !voluntaryReport?.reporter_email &&
      !voluntaryReport?.reporter_name &&
      !voluntaryReport?.reporter_last_name;

    return (
      <Card>
        <CardHeader className="pb-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <User className="w-5 h-5" />
            Información del Reportero
          </h3>
        </CardHeader>
        <CardContent>
          {isAnonymous ? (
            <p>
              Reportado por: <span className="font-medium">Anónimo</span>
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium flex items-center gap-2 mb-1">
                  <User className="w-4 h-4" /> Nombre
                </p>
                <p className="font-medium">
                  {voluntaryReport.reporter_name || "N/A"}{" "}
                  {voluntaryReport.reporter_last_name}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium flex items-center gap-2 mb-1">
                  <Mail className="w-4 h-4" /> Email
                </p>
                <p className="font-medium">
                  {voluntaryReport.reporter_email || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium flex items-center gap-2 mb-1">
                  <Phone className="w-4 h-4" /> Teléfono
                </p>
                <p className="font-medium">
                  {voluntaryReport.reporter_phone || "N/A"}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderAttachments = () => (
    <div className="space-y-4">
      {voluntaryReport?.imageUrl && (
        <Card>
          <CardHeader className="pb-3">
            <h3 className="text-lg font-semibold">Imagen Adjunta</h3>
          </CardHeader>
          <CardContent>
            <Dialog>
              <DialogTrigger asChild>
                <div className="relative group w-full max-w-sm h-64 mx-auto cursor-pointer">
                  <Image
                    src={voluntaryReport.imageUrl}
                    alt="Imagen del reporte"
                    fill
                    crossOrigin="use-credentials"
                    className="w-full h-full object-contain rounded-md border group-hover:border-gray-400 transition-all"
                    onError={(e) => {
                      console.error("Error cargando imagen:", e);
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 transition-opacity rounded-md">
                    <span className="text-white bg-black/70 px-3 py-2 rounded-md text-sm">
                      Ver imagen
                    </span>
                  </div>
                </div>
              </DialogTrigger>

              <DialogContent className="max-w-4xl max-h-[90vh] w-[95vw]">
                <DialogHeader>
                  <DialogTitle>Imagen del Reporte</DialogTitle>
                </DialogHeader>
                <div className="relative h-[60vh] flex justify-center" onClick={(e) => e.stopPropagation()}>
                  <ImageZoom
                    src={voluntaryReport.imageUrl}
                    alt="Imagen completa del reporte"
                    width="auto"
                    height="100%"
                    initialZoom={2}
                    maxZoom={3}
                    className="max-w-full max-h-full"
                  />
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}

      {voluntaryReport?.documentUrl && (
        <div className="border border-gray-300 dark:border-gray-600 p-6 rounded-lg text-center">
          <h3 className="text-xl font-semibold mb-4">Documento Adjunto</h3>
          <a
            href={`${voluntaryReport.documentUrl}`}
            download={`RVP-${voluntaryReport.report_number}.pdf`}
            className="inline-flex items-center px-5 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <File className="w-5 h-5 mr-2" />
            Descargar Documento Adjunto
          </a>
        </div>
      )}
    </div>
  );

  // ==========================================================
  // TAB 2: DANGER IDENTIFICATION
  // ==========================================================
  const renderDangerIdentificationTab = () => {
    if (!voluntaryReport?.danger_identification_id) {
      return (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
              <h3 className="text-xl font-semibold mb-2">
                No hay identificación de peligro
              </h3>
              <p className="text-muted-foreground mb-4">
                Este reporte aún no tiene una identificación de peligro asociada.
              </p>
              {voluntaryReport?.status === "ABIERTO" && (
                <CreateDangerIdentificationDialog
                  title="Crear Identificación de Peligro"
                  id={voluntaryReport.id}
                  reportType="RVP"
                />
              )}
            </div>
          </CardContent>
        </Card>
      );
    }

    if (dangerLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      );
    }

    if (!dangerIdentification) {
      return (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <p>Error al cargar la identificación de peligro</p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        {/* Action buttons */}
        {voluntaryReport?.status === "ABIERTO" && (
          <div className="flex justify-end flex-wrap gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Editar Identificación
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader></DialogHeader>
                <CreateDangerIdentificationDialog
                  title="Editar Identificación"
                  id={voluntaryReport.id}
                  isEditing={true}
                  initialData={dangerIdentification}
                  reportType="RVP"
                />
              </DialogContent>
            </Dialog>

            <DeleteDangerIdentificationDialog
              id={dangerIdentification.id}
              company={selectedCompany!.slug}
            />
          </div>
        )}

        {/* Información básica del peligro */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium mb-1">Peligro</p>
                  <p className="font-semibold">{dangerIdentification.danger}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Layers className="w-6 h-6 text-blue-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium mb-1">Área de Peligro</p>
                  <p className="font-semibold">{dangerIdentification.danger_area}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-purple-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium mb-1">Tipo de Peligro</p>
                  <p className="font-semibold">{dangerIdentification.danger_type}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Fuente de información */}
          {dangerIdentification.information_source && (
            <Card>
              <CardHeader className="pb-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Fuente de Información
                </h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium mb-1">Nombre</p>
                  <p>{dangerIdentification.information_source.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Método de identificación</p>
                  <Badge
                    className={`text-sm px-3 py-1 ${
                      dangerIdentification.information_source.type === "PROACTIVO"
                        ? "bg-green-200 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                    }`}
                  >
                    {dangerIdentification.information_source.type}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Descripción */}
          <Card>
            <CardHeader className="pb-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Descripción
              </h3>
            </CardHeader>
            <CardContent>
              <p className="leading-relaxed">
                {dangerIdentification.description || "N/A"}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Consecuencias */}
          {dangerIdentification.possible_consequences && (
            <Card>
              <CardHeader className="pb-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <List className="w-5 h-5" />
                  Posibles Consecuencias
                </h3>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {dangerIdentification.possible_consequences
                    .split(",")
                    .map((consequence, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <ChevronRight className="w-4 h-4 mt-1 flex-shrink-0" />
                        <span>{consequence.trim()}</span>
                      </li>
                    ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Defensas actuales */}
          {dangerIdentification.current_defenses && (
            <Card>
              <CardHeader className="pb-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Defensas Actuales
                </h3>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {dangerIdentification.current_defenses
                    .split(",")
                    .map((defense, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <ChevronRight className="w-4 h-4 mt-1 flex-shrink-0" />
                        <span>{defense.trim()}</span>
                      </li>
                    ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Análisis de causa raíz */}
        <Card>
          <CardHeader className="pb-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Análisis de Causa Raíz (5 Why's)
            </h3>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {dangerIdentification.root_cause_analysis
                .split(",")
                .map((analysis, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-1 flex-shrink-0" />
                    <span>
                      <strong>{index === 0 ? "¿Por qué Sucedió?" : "¿Por qué?"}</strong>{" "}
                      {analysis.trim()}
                    </span>
                  </li>
                ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    );
  };

  // ==========================================================
  // TAB 3: RISK ANALYSIS
  // ==========================================================
  const renderRiskAnalysisTab = () => {
    if (!dangerIdentification) {
      return (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Activity className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">
                Análisis no disponible
              </h3>
              <p className="text-muted-foreground">
                Primero debe crear una identificación de peligro.
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (!dangerIdentification.analysis) {
      return (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Activity className="w-16 h-16 mx-auto mb-4 text-blue-500" />
              <h3 className="text-xl font-semibold mb-2">
                No hay análisis de riesgo
              </h3>
              <p className="text-muted-foreground mb-4">
                Este peligro aún no tiene un análisis de riesgo.
              </p>
              {voluntaryReport?.status === "ABIERTO" && (
                <CreateAnalysesDialog
                  buttonTitle="Crear Análisis"
                  name="identification"
                  id={dangerIdentification.id}
                />
              )}
            </div>
          </CardContent>
        </Card>
      );
    }

    const analysis = dangerIdentification.analysis;

    return (
      <div className="space-y-6">
        {/* Action buttons */}
        {voluntaryReport?.status === "ABIERTO" && (
          <div className="flex justify-end">
            <CreateAnalysesDialog
              buttonTitle="Editar Análisis"
              name="identification"
              id={dangerIdentification.id}
              isEditing={true}
              initialData={analysis}
            />
          </div>
        )}

        {/* Analysis results */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm font-medium mb-2">Probabilidad</p>
                <div className="text-3xl font-bold text-blue-600">
                  {analysis.probability}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {analysis.probability === "5" && "FRECUENTE"}
                  {analysis.probability === "4" && "OCASIONAL"}
                  {analysis.probability === "3" && "REMOTO"}
                  {analysis.probability === "2" && "IMPROBABLE"}
                  {analysis.probability === "1" && "EXTREMADAMENTE IMPROBABLE"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm font-medium mb-2">Severidad</p>
                <div className="text-3xl font-bold text-orange-600">
                  {analysis.severity}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {analysis.severity === "A" && "CATASTRÓFICO"}
                  {analysis.severity === "B" && "PELIGROSO"}
                  {analysis.severity === "C" && "GRAVE"}
                  {analysis.severity === "D" && "LEVE"}
                  {analysis.severity === "E" && "INSIGNIFICANTE"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm font-medium mb-2">Resultado</p>
                <div className="text-3xl font-bold text-red-600">
                  {analysis.result}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Nivel de Riesgo</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Risk Matrix */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Matriz de Riesgo</h3>
          </CardHeader>
          <CardContent>
            <RiskMatrix
              onCellClick={() => {}}
              selectedProbability={analysis.probability}
              selectedSeverity={analysis.severity}
            />
          </CardContent>
        </Card>
      </div>
    );
  };

  // ==========================================================
  // TAB 4: MITIGATION PLAN
  // ==========================================================
  const renderMitigationPlanTab = () => {
    if (!dangerIdentification?.analysis) {
      return (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <ClipboardList className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">
                Plan de mitigación no disponible
              </h3>
              <p className="text-muted-foreground">
                Primero debe crear un análisis de riesgo.
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (!mitigationPlan) {
      return (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <ClipboardList className="w-16 h-16 mx-auto mb-4 text-orange-500" />
              <h3 className="text-xl font-semibold mb-2">
                No hay plan de mitigación
              </h3>
              <p className="text-muted-foreground">
                Este análisis aún no tiene un plan de mitigación asociado.
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        {/* Plan details */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <ClipboardList className="w-5 h-5" />
              Información del Plan
            </h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-1">Descripción</p>
              <p>{mitigationPlan.mitigation_plan?.description || "N/A"}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium mb-1">Responsable</p>
                <p>{mitigationPlan.mitigation_plan?.responsible || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Fecha de inicio</p>
                <p>
                  {mitigationPlan.mitigation_plan?.start_date
                    ? dateFormat(mitigationPlan.mitigation_plan.start_date, "PPP")
                    : "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Measures */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <List className="w-5 h-5" />
              Medidas de Mitigación
            </h3>
          </CardHeader>
          <CardContent>
            {mitigationPlan.mitigation_plan?.measures &&
            mitigationPlan.mitigation_plan.measures.length > 0 ? (
              <div className="space-y-4">
                {mitigationPlan.mitigation_plan.measures.map((measure, index) => (
                  <Card key={measure.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-semibold mb-2">
                              Medida #{index + 1}
                            </p>
                            <p className="text-sm mb-3">{measure.description}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-muted-foreground">Supervisor de implementación</p>
                            <p className="font-medium">{measure.implementation_supervisor}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Responsable de implementación</p>
                            <p className="font-medium">{measure.implementation_responsible}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Fecha estimada</p>
                            <p className="font-medium">
                              {dateFormat(measure.estimated_date, "PPP")}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Fecha de ejecución</p>
                            <p className="font-medium">
                              {measure.execution_date
                                ? dateFormat(measure.execution_date, "PPP")
                                : "Pendiente"}
                            </p>
                          </div>
                        </div>
                        {measure.follow_up_control && measure.follow_up_control.length > 0 && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-sm font-medium mb-2">
                              Controles de seguimiento: {measure.follow_up_control.length}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No hay medidas de mitigación registradas
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  // ==========================================================
  // TAB 5: FOLLOW-UP CONTROLS
  // ==========================================================
  const renderFollowUpControlsTab = () => {
    if (!mitigationPlan?.mitigation_plan?.measures) {
      return (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Activity className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">
                Controles no disponibles
              </h3>
              <p className="text-muted-foreground">
                Primero debe crear medidas de mitigación.
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    const allControls = mitigationPlan.mitigation_plan.measures.flatMap(
      (measure) =>
        measure.follow_up_control?.map((control) => ({
          ...control,
          measure: measure,
        })) || []
    );

    if (allControls.length === 0) {
      return (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Activity className="w-16 h-16 mx-auto mb-4 text-green-500" />
              <h3 className="text-xl font-semibold mb-2">
                No hay controles de seguimiento
              </h3>
              <p className="text-muted-foreground">
                Aún no se han registrado controles de seguimiento para las medidas.
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Todos los Controles de Seguimiento
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {allControls.map((control) => (
                <Card key={control.id} className="border-l-4 border-l-green-500">
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground mb-1">
                            Medida: {control.measure.description}
                          </p>
                          <p className="font-semibold mb-2">
                            Control #{control.id}
                          </p>
                          <p className="text-sm">{control.description}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">Fecha</p>
                          <p className="font-medium">
                            {dateFormat(control.date, "PPP")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // ==========================================================
  // RETURN PRINCIPAL
  // ==========================================================
  return (
    <ContentLayout title="Detalles del Reporte Voluntario">
      {renderActionButtons()}

      {/* LOADING */}
      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      )}

      {/* CONTENIDO CON TABS */}
      {voluntaryReport && (
        <Tabs defaultValue="report" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="report" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Reporte</span>
            </TabsTrigger>
            <TabsTrigger value="danger" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="hidden sm:inline">Peligro</span>
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Análisis</span>
            </TabsTrigger>
            <TabsTrigger value="mitigation" className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4" />
              <span className="hidden sm:inline">Mitigación</span>
            </TabsTrigger>
            <TabsTrigger value="controls" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Controles</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="report">{renderReportDetailsTab()}</TabsContent>
          <TabsContent value="danger">{renderDangerIdentificationTab()}</TabsContent>
          <TabsContent value="analysis">{renderRiskAnalysisTab()}</TabsContent>
          <TabsContent value="mitigation">{renderMitigationPlanTab()}</TabsContent>
          <TabsContent value="controls">{renderFollowUpControlsTab()}</TabsContent>
        </Tabs>
      )}

      {/* ERROR */}
      {reportError && (
        <Card className="border-red-200 mt-4">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <p>Ha ocurrido un error al cargar el reporte voluntario...</p>
            </div>
          </CardContent>
        </Card>
      )}
    </ContentLayout>
  );
};

export default ShowVoluntaryReport;
