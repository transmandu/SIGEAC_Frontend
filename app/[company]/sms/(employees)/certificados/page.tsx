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
import { getColumns, CertificateColumn } from "./columns"; // Importamos getColumns

const CertificatesPage = () => {
  const { selectedCompany } = useCompanyStore();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  // 1. Lógica de gestión
  const isManagement = user?.roles?.some(role => 
    ['JEFE_SMS', 'ANALISTA_SMS', 'SUPERUSER'].includes(role.name.toUpperCase())
  );

  // 2. Generar columnas inyectando el slug actual de la empresa
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
        <div className="flex flex-col gap-y-2">
          {isLoading && (
            <div className="flex w-full h-full justify-center items-center py-20">
              <Loader2 className="size-24 animate-spin text-muted-foreground" />
            </div>
          )}
          
          {certificates && (
            <DataTableCertificates 
              columns={tableColumns} // Pasamos las columnas generadas
              data={certificates} 
              onOpenModal={() => setOpen(true)} 
              user={user} 
            />
          )}
          
          {isError && (
            <p className="text-sm text-muted-foreground text-center py-10">
              Ha ocurrido un error al cargar los certificados...
            </p>
          )}
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-[480px] bg-slate-900 border-slate-800">
            <DialogHeader>
              <DialogTitle className="text-center text-xl font-bold text-white">
                {isManagement ? "Cargar Certificado a Personal" : "Subir mi Certificado"}
              </DialogTitle>
            </DialogHeader>
            {isManagement ? (
              <CreateCertificateForm onClose={() => setOpen(false)} />
            ) : (
              <p className="text-white text-center py-4">No tienes permisos para esta acción.</p>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </ContentLayout>
  );
};

export default CertificatesPage;