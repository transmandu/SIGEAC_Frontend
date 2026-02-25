"use client";

import { useState } from "react";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useGetSMSCertificates } from "@/hooks/sms/useGetCertificates";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, FileText, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreateCertificateForm } from "@/components/forms/general/CreateCertificateForm";
import { DataTableCertificates } from "./data-table"; 
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const CertificatesPage = () => {
  const { selectedCompany } = useCompanyStore();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  // 1. Obtenemos el ID del empleado
  const employeeId = user?.employee?.[0]?.id;

  // 2. Cargamos los certificados con los dos argumentos necesarios
  const { data: certificates, isLoading } = useGetSMSCertificates(
    selectedCompany?.slug, 
    employeeId
  );

  const columns: ColumnDef<any>[] = [
    { 
      accessorKey: "course.name", 
      header: "Curso / Capacitación" 
    },
    { 
      accessorKey: "completion_date", 
      header: "Fecha de Realización",
      cell: ({ row }) => {
        const date = row.getValue("completion_date");
        return date ? new Date(date as string).toLocaleDateString() : "N/A";
      }
    },
    {
      id: "actions",
      header: () => <div className="text-right">Documento</div>,
      cell: ({ row }) => {
        const cert = row.original;

        const handleViewFile = () => {
          if (!cert.document) {
            toast.error("No hay un documento asociado a este certificado.");
            return;
          }

          // 1. Codificación segura para URL (Base64 URL Safe)
          // Reemplazamos caracteres que Laravel/Nginx pueden malinterpretar
          const encodedPath = btoa(cert.document)
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');

          const companySlug = selectedCompany?.slug;
          
          // 2. Limpieza de la URL Base de la API
          const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api')
            .replace(/\/$/, "");

          if (!companySlug) return;

          // 3. Construcción de la URL final (Coincide con la ruta de Laravel)
          const finalUrl = `${apiBase}/${companySlug}/sms/certificates/serve/${encodedPath}`;
          
          console.log("Visualizando documento en:", finalUrl);
          
          // 4. Abrir en pestaña nueva (El navegador usará su visualizador de PDF)
          window.open(finalUrl, "_blank");
        };

        return (
          <div className="text-right">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleViewFile}
              className="hover:bg-primary/5 hover:border-primary transition-colors"
            >
              <FileText className="mr-2 h-4 w-4 text-blue-500" /> 
              Ver Archivo
              <ExternalLink className="ml-2 h-3 w-3 opacity-50" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <ContentLayout title="Carga de Certificados">
      <div className="flex flex-col gap-2 mb-6 mt-4 text-center">
        <h1 className="text-5xl font-bold tracking-tight">
          Carga de Certificados
        </h1>
        <p className="text-sm italic text-muted-foreground max-w-2xl mx-auto">
          Gestiona y visualiza tus certificados de cursos realizados.
        </p>
      </div>

      <div className="flex flex-col gap-y-4">
        {isLoading ? (
          <div className="flex w-full justify-center py-10">
            <Loader2 className="size-24 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <DataTableCertificates 
            columns={columns} 
            data={certificates || []} 
            onOpenModal={() => setOpen(true)} 
          />
        )}

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle className="text-center">Subir Certificado</DialogTitle>
            </DialogHeader>
            <CreateCertificateForm onClose={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
    </ContentLayout>
  );
};

export default CertificatesPage;