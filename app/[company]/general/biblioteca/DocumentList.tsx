"use client";

import { useState, useEffect } from "react";
import { FileText, FileSpreadsheet, Eye, Loader2, ChevronDown, ChevronRight, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/lib/axios"; 
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import SecureVisualizer from "@/components/library/SecureVisualizer";

export function DocumentList({ documents, searchTerm, isLoading, companySlug }: any) {
  const [viewingFile, setViewingFile] = useState<string | null>(null);
  const [isGeneratingView, setIsGeneratingView] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (documents) {
      const initial: Record<string, boolean> = {};
      Object.keys(documents).forEach(key => initial[key] = true);
      setExpandedSections(initial);
    }
  }, [documents]);

  const handleViewFile = async (fullPath: string) => {
    if (isGeneratingView) return;
    setIsGeneratingView(true);
    try {
      const response = await axiosInstance.get(`/${companySlug}/library/view`, {
        params: { path: fullPath },
        responseType: 'blob' 
      });
      const url = URL.createObjectURL(new Blob([response.data], { type: response.headers['content-type'] }));
      setViewingFile(url);
    } catch (error) {
      toast.error("Error al cargar el visor.");
    } finally {
      setIsGeneratingView(false);
    }
  };

  const getAreaColor = (area: string) => {
    const colors: Record<string, string> = {
      SMS: "bg-blue-600 border-blue-500",
      MANTENIMIENTO: "bg-emerald-600 border-emerald-500",
      OPERACIONES: "bg-amber-600 border-amber-500",
      CALIDAD: "bg-purple-600 border-purple-500",
      ADMINISTRACION: "bg-slate-600 border-slate-500",
    };
    return colors[area.toUpperCase()] || "bg-indigo-600 border-indigo-500";
  };

  const filtered = Object.entries(documents || {}).reduce((acc: any, [role, files]: any) => {
    const matches = files.filter((f: any) => 
      (f.title || f.display_name || f.name).toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (matches.length > 0) acc[role] = matches;
    return acc;
  }, {});

  return (
    <div className="space-y-8 mb-20 mt-12">
      {Object.entries(filtered).map(([role, files]: any) => {
        const areaName = role.replace("_", " ").toUpperCase();
        const colorClass = getAreaColor(areaName);

        return (
          <div key={role} className="flex flex-col">
            <div className="relative flex items-end mb-4">
              <button 
                onClick={() => setExpandedSections(prev => ({ ...prev, [role]: !prev[role] }))}
                className={cn(
                  "relative z-10 flex items-center gap-x-2.5 px-5 py-2 rounded-t-xl shadow-md",
                  colorClass,
                  "border-t-2 border-l-2 border-r-2 border-white/20"
                )}
              >
                <Folder className="size-4 text-white" />
                <h2 className="text-[13px] font-bold text-white uppercase tracking-widest flex items-center gap-2">
                  {areaName}
                  <span className="text-[10px] bg-black/30 px-2 py-0.5 rounded text-white font-black">
                    {files.length}
                  </span>
                </h2>
                <ChevronDown className={cn("size-4 text-white transition-transform", !expandedSections[role] && "-rotate-90")} />
              </button>
              <div className={cn("flex-1 h-[2px]", colorClass.split(" ")[0])} />
            </div>

            <div className={cn(
              "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4",
              expandedSections[role] ? "opacity-100 h-auto" : "opacity-0 h-0 overflow-hidden"
            )}>
              {files.map((file: any) => (
                <div 
                  key={file.full_path} 
                  className="relative group flex flex-col p-3 bg-slate-50 dark:bg-[#0b1120] border-[3px] border-slate-300 dark:border-slate-800 rounded-2xl shadow-lg hover:border-blue-500 transition-all duration-300 w-full max-w-[170px] mx-auto min-h-[210px]"
                >
                  {/* ICONO GRANDE (size-16) PARA CERRAR EL ESPACIO */}
                  <div className="relative z-10 flex justify-center mt-1">
                    {file.extension === 'pdf' ? (
                      <FileText className="size-16 text-red-500 drop-shadow-md" strokeWidth={1.5} />
                    ) : (
                      <FileSpreadsheet className="size-16 text-emerald-500 drop-shadow-md" strokeWidth={1.5} />
                    )}
                  </div>

                  {/* CONTENIDO MUY JUNTO */}
                  <div className="relative z-10 flex flex-col flex-1 text-center mt-1">
                    <p className="text-[11px] font-bold text-slate-900 dark:text-slate-100 line-clamp-2 leading-tight h-7 mb-1">
                      {file.title || file.display_name || file.name}
                    </p>
                    
                    <div className="mt-auto flex flex-col items-center gap-2">
                      <span className="text-[9px] font-black px-2 py-0.5 bg-slate-200 dark:bg-slate-900 text-slate-700 dark:text-slate-400 rounded border-[2px] border-slate-400 dark:border-slate-800 uppercase tracking-tighter">
                        {file.extension}
                      </span>
                      
                      <Button 
                        onClick={() => handleViewFile(file.full_path)}
                        disabled={isGeneratingView}
                        className="w-full h-8 text-[10px] font-black uppercase tracking-tighter border-[1px] border-blue-600 text-blue-600 dark:text-blue-400 bg-transparent hover:bg-blue-600 hover:text-white transition-all rounded-xl shadow-sm"
                      >
                        {isGeneratingView ? <Loader2 className="size-3 animate-spin mr-1" /> : <Eye className="size-3 mr-1" />}
                        Ver
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <SecureVisualizer 
        isOpen={!!viewingFile} 
        onClose={() => setViewingFile(null)} 
        fileUrl={viewingFile} 
      />
    </div>
  );
}