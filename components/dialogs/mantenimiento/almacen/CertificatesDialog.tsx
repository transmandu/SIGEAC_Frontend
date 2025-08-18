'use client'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import axiosInstance from "@/lib/axios"
import { FileDown } from "lucide-react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface DialogProps {
  certificates?: string[],
  serial?: string,
}

const handleDownload = async (url: string) => {
  const fileUrl = url;
  try {
    const response = await axiosInstance.get(`/hangar74/articles/certificates/${fileUrl}`, {
      responseType: 'blob', // Necesario para manejar la descarga de archivos
    });
    // Crear una URL para el blob y hacer que el navegador lo descargue
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${fileUrl}`); // Nombre del archivo para descargar
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error('Error descargando el archivo:', error);
  }
};

const CertificatesDialog = ({ certificates, serial }: DialogProps) => {
  return (
    <Dialog>
      <DialogTrigger>
        <Button variant='outline'>Ver Certificados</Button>
      </DialogTrigger>
      <DialogContent>
        <div className="mx-auto w-full max-w-md">
          <DialogHeader className="flex flex-row justify-between items-center">
            <div className="flex flex-col gap-1">
              <DialogTitle>Certificados para: {serial ? serial : "N/A"}</DialogTitle>
              <DialogDescription>Aquí puede ver los permisos asignados al rol.</DialogDescription>
            </div>
            <Image src={'/LOGO_TRD.png'} className="w-[70px] h-[70px]" width={70} height={70} alt="logo" />
          </DialogHeader>
          <div className="p-4 pb-0">
            <div className="flex flex-col items-center gap-2 p-2">
              {
                certificates && certificates.map(certificate => (
                  <div onClick={() => handleDownload(certificate)} className="w-[200px] group cursor-pointer" key={certificate}>
                    <Badge className="flex gap-2 items-center group-hover:bg-white group-hover:border-black group-hover:text-black"><FileDown className="group-hover:animate-pulse" /> {certificate?.includes("8130") ? "Certificado - 8130" : certificate?.includes("vendor") ? "Certificado - Vendedor" : "Certificado - Fabricante"}</Badge>
                  </div>
                ))
              }
            </div>
          </div>
          <DialogFooter>
            <DialogClose>
              <Button variant="outline">Cerrar</Button>
            </DialogClose>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CertificatesDialog;
