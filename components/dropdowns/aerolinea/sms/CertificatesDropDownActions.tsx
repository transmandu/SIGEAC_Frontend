"use client";

import { useState } from "react";
import { MoreHorizontal, Eye, Edit, Trash2, Loader2, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { type CertificateColumn } from "@/app/[company]/sms/(employees)/certificados/columns";
import { useDeleteSMSCertificate } from "@/actions/sms/certificates/actions";
import { useAuth } from "@/contexts/AuthContext";

import EditCertificateForm from "@/components/forms/general/EditCertificateForm";
import { cn } from "@/lib/utils";

interface CertificatesDropDownActionsProps {
  certificate: CertificateColumn;
  companySlug: string;
}

const CertificatesDropDownActions = ({ 
  certificate, 
  companySlug 
}: CertificatesDropDownActionsProps) => {
  const { user } = useAuth();
  const [openDelete, setOpenDelete] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  
  const { mutateAsync: deleteCertificate, isPending } = useDeleteSMSCertificate();

  const isManagement = user?.roles?.some(role => 
    ['JEFE_SMS', 'ANALISTA_SMS', 'SUPERUSER'].includes(role.name.toUpperCase())
  );

  const handleView = () => {
    if (!certificate.document || !companySlug) return;
    const encodedPath = btoa(certificate.document)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const url = `${apiUrl}/${companySlug}/sms/certificates/serve/${encodedPath}`;
    window.open(url, "_blank");
  };

  const handleDelete = async () => {
    try {
      await deleteCertificate({ 
        id: certificate.id, 
        company: companySlug 
      });
      setOpenDelete(false);
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted rounded-full">
            <span className="sr-only">Abrir menú</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem onClick={handleView} className="cursor-pointer gap-2">
            <Eye className="h-4 w-4 text-blue-500" />
            <span>Ver Archivo</span>
          </DropdownMenuItem>
          
          {isManagement && (
            <>
              <DropdownMenuItem onClick={() => setOpenEdit(true)} className="cursor-pointer gap-2">
                <Edit className="h-4 w-4 text-amber-500" />
                <span>Editar</span>
              </DropdownMenuItem>

              <DropdownMenuItem 
                onClick={() => setOpenDelete(true)} 
                className="cursor-pointer gap-2 text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30"
              >
                <Trash2 className="h-4 w-4" />
                <span>Eliminar</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {isManagement && (
        <>
          {/* DIALOGO DE EDITAR */}
          <Dialog open={openEdit} onOpenChange={setOpenEdit}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-center font-bold text-xl">
                  Editar Certificado
                </DialogTitle>
                <DialogDescription className="text-center">
                  Modifica la información del certificado seleccionado.
                </DialogDescription>
              </DialogHeader>
              <EditCertificateForm 
                certificate={certificate}
                onClose={() => setOpenEdit(false)}
              />
            </DialogContent>
          </Dialog>

        {/* DIALOGO DE ELIMINAR */}
        <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent className="max-w-[400px] p-8 border-t-4 border-t-red-500">
            <DialogHeader className="flex flex-col items-center justify-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center dark:bg-red-900/20">
                <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>

            <DialogTitle className="text-xl font-bold text-center">
                ¿Eliminar certificado?
            </DialogTitle>
            
            <DialogDescription className="text-center text-sm leading-relaxed">
                Estás a punto de eliminar el certificado de:
                <div className="mt-2 mb-1 text-foreground">
                <span className="font-bold italic">
                    {certificate.course?.name}
                </span>
                {certificate.course?.start_date && (
                    <span className="text-[11px] text-muted-foreground ml-2 italic">
                    ({new Date(certificate.course.start_date + 'T00:00:00').toLocaleDateString('es-ES')})
                    </span>
                )}
                </div>
                de 
                <span className="font-bold text-foreground block mt-1">
                {certificate.employee?.last_name}, {certificate.employee?.first_name}
                </span>
                <span className="block mt-4 text-red-500 font-semibold bg-red-50 dark:bg-red-950/20 py-1 rounded-md">
                Esta acción es irreversible.
                </span>
            </DialogDescription>
            </DialogHeader>

            <DialogFooter className="flex-row sm:justify-center gap-3 pt-4">
            <Button
                variant="outline"
                onClick={() => setOpenDelete(false)}
                disabled={isPending}
                className="flex-1 sm:flex-none sm:w-32 border-slate-200 hover:bg-slate-50 transition-all"
            >
                Cancelar
            </Button>
            <Button
                onClick={handleDelete}
                disabled={isPending}
                className="flex-1 sm:flex-none sm:w-32 bg-red-600 hover:bg-red-700 text-white shadow-sm shadow-red-200 transition-all"
            >
                {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                "Eliminar"
                )}
            </Button>
            </DialogFooter>
        </DialogContent>
        </Dialog>
        </>
      )}
    </>
  );
};

export default CertificatesDropDownActions;
