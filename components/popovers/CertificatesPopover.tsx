"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, FileDown, File } from "lucide-react";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CertificatesPopoverProps {
  certificates?: string[];
  hasDocumentation: boolean;
}

const CERTIFICATE_TYPES = [
  { key: "8130", label: "Certificado 8130", index: 0 },
  { key: "vendor", label: "Certificado Vendedor", index: 1 },
  { key: "fabricant", label: "Certificado Fabricante", index: 2 },
];

const handleDownload = async (url: string) => {
  if (!url) return;
  
  try {
    const response = await axiosInstance.get(`/warehouse/download-certificate/${url}`, {
      responseType: 'blob',
    });
    
    const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', url);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
    
    toast.success("Certificado descargado correctamente");
  } catch (error) {
    console.error('Error descargando el archivo:', error);
    toast.error("Error al descargar el certificado");
  }
};

const CertificatesPopover = ({ certificates, hasDocumentation }: CertificatesPopoverProps) => {
  if (!hasDocumentation) {
    return (
      <div className="flex justify-center">
        <Badge variant="outline" className="flex items-center gap-1 w-fit">
          <XCircle className="h-3 w-3" />
          No
        </Badge>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm"
            className="h-auto p-0 hover:bg-transparent"
          >
            <Badge 
              variant="default" 
              className="flex items-center gap-1 w-fit cursor-pointer hover:bg-primary/80 transition-colors"
            >
              <CheckCircle2 className="h-3 w-3" />
              Sí
            </Badge>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="center">
          <div className="space-y-3">
            <div className="space-y-1">
              <h4 className="font-semibold text-sm">Documentación del Artículo</h4>
              <p className="text-xs text-muted-foreground">
                Haz clic en un certificado para descargarlo
              </p>
            </div>
            <div className="space-y-2">
              {CERTIFICATE_TYPES.map((certType) => {
                const certFile = certificates?.[certType.index];
                const isAvailable = certFile && certFile.trim() !== "";

                return (
                  <div
                    key={certType.key}
                    className={cn(
                      "flex items-center justify-between p-2 rounded-md border transition-colors",
                      isAvailable
                        ? "bg-green-50 border-green-200 hover:bg-green-100 cursor-pointer"
                        : "bg-gray-50 border-gray-200 cursor-not-allowed"
                    )}
                    onClick={() => isAvailable && handleDownload(certFile)}
                  >
                    <div className="flex items-center gap-2">
                      {isAvailable ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-gray-400" />
                      )}
                      <span className={cn(
                        "text-sm font-medium",
                        isAvailable ? "text-green-900" : "text-gray-500"
                      )}>
                        {certType.label}
                      </span>
                    </div>
                    {isAvailable ? (
                      <FileDown className="h-4 w-4 text-green-600 hover:animate-pulse" />
                    ) : (
                      <File className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                );
              })}
            </div>
            {certificates && certificates.every(cert => !cert || cert.trim() === "") && (
              <p className="text-xs text-center text-muted-foreground mt-2">
                No hay certificados disponibles
              </p>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default CertificatesPopover;

