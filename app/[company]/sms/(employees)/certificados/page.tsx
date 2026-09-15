"use client";

import { useState, useMemo, useEffect } from "react";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useGetSMSCertificates } from "@/hooks/sms/useGetCertificates";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreateCertificateForm } from "@/components/forms/general/CreateCertificateForm";
import { DataTableCertificates } from "./data-table";
import { getColumns, CertificateColumn, CertificateGroup } from "./columns";
import { useTourContext } from "@/components/tour/TourProvider";
import { certificadosCrearSteps } from "@/components/tour/steps/general/cursos/certificados/certificados-crear";
import { PageHeader } from "@/components/layout/PageHeader";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatCalendarDate } from "@/lib/date";
import CertificatesDropDownActions from "@/components/dropdowns/aerolinea/sms/CertificatesDropDownActions";

const CertificatesPage = () => {
  const { selectedCompany } = useCompanyStore();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] =
    useState<CertificateGroup | null>(null);
  const { registerTour, unregisterTour } = useTourContext();

  useEffect(() => {
    if (open) {
      registerTour(
        "certificados-crear",
        "Certificados - Crear",
        certificadosCrearSteps,
      );
      return () => {
        unregisterTour("certificados-crear");
      };
    }
  }, [open, registerTour, unregisterTour]);

  // 1. Lógica de gestión
  const isManagement = user?.roles?.some((role) =>
    ["JEFE_SMS", "ANALISTA_SMS", "SUPERUSER"].includes(role.name.toUpperCase()),
  );

  // 2. Generar columnas
  const tableColumns = useMemo(() => {
    return getColumns(selectedCompany?.slug || "transmandu");
  }, [selectedCompany?.slug]);

  // 3. Obtención del DNI
  const employeeDni = isManagement
    ? undefined
    : user?.employee?.find(
        (emp: any) =>
          emp.company?.toLowerCase() === selectedCompany?.slug?.toLowerCase(),
      )?.dni || user?.employee?.[0]?.dni;

  const {
    data: rawCertificates,
    isLoading,
    isError,
  } = useGetSMSCertificates(selectedCompany?.slug, employeeDni);

  const certificates: CertificateColumn[] = useMemo(() => {
    if (!rawCertificates) return [];
    return rawCertificates.map((cert: any) => ({
      ...cert,
      course: cert.course || { name: "Sin nombre" },
    }));
  }, [rawCertificates]);

  // Agrupa por empleado (DNI) para que cada persona aparezca una sola vez
  // y sus certificados queden como sub-filas expandibles.
  const certificatesByEmployee: CertificateGroup[] = useMemo(() => {
    const groups = new Map<string, CertificateGroup>();
    for (const cert of certificates) {
      const dni = cert.employee?.dni;
      if (!dni) continue;
      let group = groups.get(dni);
      if (!group) {
        group = {
          __isGroup: true,
          id: dni,
          employee: cert.employee!,
          certificates: [],
          subRows: [],
        };
        groups.set(dni, group);
      }
      group.certificates.push(cert);
      group.subRows.push(cert);
    }
    return Array.from(groups.values()).sort((a, b) =>
      `${a.employee.last_name} ${a.employee.first_name}`.localeCompare(
        `${b.employee.last_name} ${b.employee.first_name}`,
      ),
    );
  }, [certificates]);

  return (
    <ContentLayout title="Certificados">
      <PageHeader className="mb-6" />

      <div className="flex flex-col gap-y-4">
        {isLoading && (
          <div className="flex w-full h-full justify-center items-center py-20">
            <Loader2 className="size-24 animate-spin text-muted-foreground" />
          </div>
        )}

        {!isLoading && !isError && (
          <div className="animate-in fade-in duration-500">
            <DataTableCertificates
              columns={tableColumns}
              data={certificatesByEmployee}
              onOpenModal={() => setOpen(true)}
              onEmployeeClick={setSelectedEmployee}
              user={user}
            />
          </div>
        )}

        {isError && !isLoading && (
          <p className="text-sm text-muted-foreground text-center py-10">
            Ha ocurrido un error al cargar los certificados...
          </p>
        )}

        {/* DIALOG DE CARGA CORREGIDO */}
        <Dialog open={open} onOpenChange={setOpen}>
          {/* Eliminamos bg-slate-900 y border-slate-800 para usar variables del tema */}
          <DialogContent
            className="sm:max-w-[480px] bg-background border-border shadow-lg"
            data-tour="cert-create-dialog"
          >
            <DialogHeader>
              <DialogTitle className="text-center text-xl font-bold text-foreground">
                {isManagement
                  ? "Cargar Certificado a Empleado"
                  : "Subir mi Certificado"}
              </DialogTitle>
            </DialogHeader>

            {isManagement ? (
              <CreateCertificateForm onClose={() => setOpen(false)} />
            ) : (
              <p className="text-muted-foreground text-center py-4 text-sm">
                No tienes permisos para realizar esta acción.
              </p>
            )}
          </DialogContent>
        </Dialog>

        {/* DIALOG DE CERTIFICADOS DEL EMPLEADO */}
        <Dialog
          open={!!selectedEmployee}
          onOpenChange={(open) => {
            if (!open) setSelectedEmployee(null);
          }}
        >
          <DialogContent className="sm:max-w-[560px] bg-background border-border shadow-lg">
            <DialogHeader className="pb-2 border-b border-border/60">
              <div className="flex items-center gap-3">
                {selectedEmployee && (
                  <Avatar className="h-9 w-9 border border-blue-200 shadow-xs shrink-0">
                    <AvatarImage
                      src={selectedEmployee.employee?.photo_url ?? ""}
                      alt="Avatar"
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-blue-500 text-white font-bold text-xs">
                      {selectedEmployee.employee?.first_name?.[0]}
                      {selectedEmployee.employee?.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div>
                  <DialogTitle className="text-base font-semibold leading-tight">
                    {selectedEmployee
                      ? `${selectedEmployee.employee.last_name}, ${selectedEmployee.employee.first_name}`
                      : ""}
                  </DialogTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {selectedEmployee?.employee.dni} —{" "}
                    <Badge
                      variant="outline"
                      className="text-[10px] font-medium ml-1"
                    >
                      {selectedEmployee?.certificates.length}{" "}
                      {selectedEmployee?.certificates.length === 1
                        ? "certificado"
                        : "certificados"}
                    </Badge>
                  </p>
                </div>
              </div>
            </DialogHeader>

            <ScrollArea className="h-[360px] pr-2">
              <div className="flex flex-col gap-2 py-1">
                {selectedEmployee?.certificates.map((cert) => (
                  <div
                    key={cert.id}
                    className="flex items-center justify-between gap-3 px-3 py-3 border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors rounded-md"
                  >
                    <div className="flex flex-col gap-1 min-w-0">
                      <span className="font-semibold text-sm uppercase text-blue-700 dark:text-blue-400 truncate">
                        {cert.course?.name || "Sin Nombre"}
                      </span>
                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                        {cert.course?.start_date && (
                          <span>
                            <span className="font-bold text-green-600 dark:text-green-500 uppercase">
                              Inicio:{" "}
                            </span>
                            {formatCalendarDate(
                              cert.course.start_date,
                              "date",
                              "---",
                            )}
                          </span>
                        )}
                        {cert.course?.end_date && (
                          <span>
                            <span className="font-bold text-red-600 dark:text-red-500 uppercase">
                              Fin:{" "}
                            </span>
                            {formatCalendarDate(
                              cert.course.end_date,
                              "date",
                              "---",
                            )}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
                        <Calendar className="h-3 w-3 opacity-60" />
                        <span>
                          Cargado: {formatCalendarDate(cert.completion_date)}
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0">
                      <CertificatesDropDownActions
                        certificate={cert}
                        companySlug={selectedCompany?.slug || "transmandu"}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </ContentLayout>
  );
};

export default CertificatesPage;
