"use client";

import { FileText, FileSpreadsheet, Download, FolderOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileData {
  name: string;
  full_path: string;
  extension: string;
  size: string;
}

interface DocumentListProps {
  documents: Record<string, FileData[]>;
  searchTerm: string;
  isLoading: boolean;
  companySlug: string;
}

export function DocumentList({ documents, searchTerm, isLoading, companySlug }: DocumentListProps) {
  
  const filtered = Object.entries(documents).reduce((acc: any, [role, files]) => {
    const matches = files.filter((f) => f.name.toLowerCase().includes(searchTerm.toLowerCase()));
    if (matches.length > 0) acc[role] = matches;
    return acc;
  }, {});

  if (isLoading) return (
    <div className="flex justify-center py-20 text-muted-foreground italic text-sm">
      <Loader2 className="size-6 animate-spin mr-2" /> Cargando archivos...
    </div>
  );

  if (Object.keys(filtered).length === 0) return (
    <div className="rounded-md border h-48 flex flex-col items-center justify-center text-muted-foreground italic border-dashed">
       <FolderOpen className="size-10 mb-2 opacity-20" />
       No se han encontrado documentos...
    </div>
  );

  return (
    <div className="space-y-10 mb-10">
      {Object.entries(filtered).map(([role, files]: any) => (
        <div key={role} className="space-y-4">
          <div className="flex items-center gap-x-3 border-b pb-1 dark:border-slate-800">
            <div className="h-5 w-1 bg-blue-600 rounded-full" />
            <h2 className="text-lg font-bold uppercase text-slate-700 dark:text-slate-200 italic">
              Acceso: {role.replace("_", " ")}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map((file: any) => (
              <div key={file.full_path} className="group flex flex-col p-4 bg-card border rounded-md hover:border-blue-500 transition-all shadow-sm">
                <div className="flex items-center gap-x-3 mb-3">
                  <div className={file.extension === 'pdf' ? "text-red-500" : "text-emerald-500"}>
                    {file.extension === 'pdf' ? <FileText className="size-6" /> : <FileSpreadsheet className="size-6" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{file.name}</p>
                    <p className="text-[10px] text-muted-foreground font-mono uppercase">{file.size}</p>
                  </div>
                </div>
                <Button 
                  onClick={() => window.open(`/api/${companySlug}/library/download?path=${file.full_path}`, "_blank")}
                  variant="outline" size="sm" className="w-full h-8 text-xs font-bold hover:bg-blue-600 hover:text-white"
                >
                  <Download className="size-3.5 mr-2" /> Descargar
                </Button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}