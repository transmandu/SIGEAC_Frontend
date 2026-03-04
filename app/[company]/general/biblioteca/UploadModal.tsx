"use client";

import { useState, DragEvent, ChangeEvent } from "react";
import { UploadCloud, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import axiosInstance from "@/lib/axios"; 
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";

export function UploadModal({ companySlug, onSuccess }: { companySlug: string, onSuccess: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // --- MANEJADORES DE ARCHIVOS ---
  
  // 1. Manejo cuando se suelta el archivo (Drop)
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) setFile(droppedFile);
  };

  // 2. Manejo cuando se selecciona desde el explorador (Click)
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file || !department || !title) return;
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("area", department);

    try {
      await axiosInstance.post(`/${companySlug}/library/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success("Documento cargado correctamente");
      setIsOpen(false);
      setTitle(""); 
      setDepartment(""); 
      setFile(null);
      onSuccess();
    } catch (e: any) {
      console.error("Error:", e.response?.data || e.message);
      toast.error(e.response?.data?.message || "Error al subir el archivo");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 flex gap-2 border-blue-600 text-blue-600 dark:text-blue-400">
          <UploadCloud className="size-4" /> Subir Documento
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader className="flex flex-col items-center">
          <DialogTitle className="text-3xl font-bold">Subir Documento</DialogTitle>
          <DialogDescription className="italic text-center">
            Selecciona el área y arrastra el archivo.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-4">
          <div className="flex flex-col gap-2">
            <Label className="text-xs font-bold uppercase ml-1">Nombre</Label>
            <Input 
              placeholder="Ej: Manual de SMS" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-xs font-bold uppercase ml-1">Área Destino</Label>
            <Select onValueChange={setDepartment}>
              <SelectTrigger><SelectValue placeholder="Seleccione área" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="SMS">SMS</SelectItem>
                <SelectItem value="MANTENIMIENTO">MANTENIMIENTO</SelectItem>
                <SelectItem value="OPERACIONES">OPERACIONES</SelectItem>
                <SelectItem value="RRHH">RRHH</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-xs font-bold uppercase ml-1">Archivo</Label>
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop} // <--- CORREGIDO: Usa el manejador de DragEvent
              className={cn(
                "relative border-2 border-dashed rounded-xl p-10 flex flex-col items-center gap-3 transition-all",
                isDragging ? "border-blue-500 bg-blue-500/10 scale-[1.01]" : "border-slate-300 dark:border-slate-800",
                file && "border-emerald-500 bg-emerald-500/5"
              )}
            >
              <input 
                type="file" 
                className="absolute inset-0 opacity-0 cursor-pointer" 
                onChange={handleFileChange} // <--- CORREGIDO: Usa el manejador de ChangeEvent
              />
              {file ? (
                <>
                  <FileText className="size-10 text-emerald-500" />
                  <p className="text-sm font-bold text-emerald-600 truncate max-w-xs">{file.name}</p>
                </>
              ) : (
                <>
                  <UploadCloud className="size-10 text-muted-foreground" />
                  <p className="text-sm">Arrastra o haz clic aquí</p>
                </>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button 
            onClick={handleUpload} 
            disabled={!file || isUploading || !department || !title} 
            className="w-full h-12 text-lg font-bold"
          >
            {isUploading ? <Loader2 className="animate-spin" /> : "Ejecutar Carga"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}