"use client";

import { useState, useMemo } from "react";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useGetSMSCertificates } from "@/hooks/sms/useGetCertificates";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreateCertificateForm } from "@/components/forms/general/CreateCertificateForm";
import { DataTableCertificates } from "./data-table"; 
import { getColumns, CertificateColumn } from "./columns";

const CertificatesPage = () => {
  const { selectedCompany } = useCompanyStore();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  // 1. Lógica de gestión
  const isManagement = user?.roles?.some(role => 
    ['JEFE_SMS', 'ANALISTA_SMS', 'SUPERUSER'].includes(role.name.toUpperCase())
  );

  // 2. Generar columnas
  const tableColumns = useMemo(() => {
    return getColumns(selectedCompany?.slug || "transmandu");
  }, [selectedCompany?.slug]);

  // 3. Obtención del DNI
  const employeeDni = isManagement 
    ? undefined 
    : user?.employee?.find(
        (emp: any) => emp.company?.toLowerCase() === selectedCompany?.slug?.toLowerCase()
      )?.dni || user?.employee?.[0]?.dni;

  const { data: rawCertificates, isLoading, isError } = useGetSMSCertificates(
    selectedCompany?.slug, 
    employeeDni 
  );

  const certificates: CertificateColumn[] = useMemo(() => {
    if (!rawCertificates) return [];
    return rawCertificates.map((cert: any) => ({
      ...cert,
      course: cert.course || { name: "Sin nombre" }
    }));
  }, [rawCertificates]);

  return (
    <ContentLayout title="Certificados">
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
              data={certificates} 
              onOpenModal={() => setOpen(true)} 
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
          <DialogContent className="sm:max-w-[480px] bg-background border-border shadow-lg">
            <DialogHeader>
              <DialogTitle className="text-center text-xl font-bold text-foreground">
                {isManagement ? "Cargar Certificado a Empleado" : "Subir mi Certificado"}
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
      </div>
    </ContentLayout>
  );
};

export default CertificatesPage;