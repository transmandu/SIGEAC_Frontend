"use client";

import { useEffect, useState, useCallback } from "react";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useCompanyStore } from "@/stores/CompanyStore";

// 1. USA TU INSTANCIA PERSONALIZADA (Importante para Auth y baseURL)
import axiosInstance from "@/lib/axios"; 

import { UploadModal } from "./UploadModal";
import { DocumentList } from "./DocumentList";

const LibraryPage = () => {
  const { selectedCompany } = useCompanyStore();
  const [documents, setDocuments] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // 2. Usamos useCallback para que la función sea estable
  const fetchDocs = useCallback(async () => {
    if (!selectedCompany?.slug) return;
    
    setIsLoading(true);
    try {
      // 3. Usamos axiosInstance. La URL ya no necesita /api si está en la baseURL
      const res = await axiosInstance.get(`/${selectedCompany.slug}/library/my-documents`);
      
      // Ajustamos según si Laravel devuelve res.data o res.data.data
      const data = res.data.data || res.data;
      setDocuments(data);
    } catch (e) {
      console.error("Error cargando documentos:", e);
      setDocuments({}); // Limpiamos en caso de error
    } finally {
      setIsLoading(false);
    }
  }, [selectedCompany?.slug]);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  return (
    <ContentLayout title="Biblioteca Digital">
      <div className="flex flex-col gap-2 mb-4 mt-4">
        <h1 className="text-5xl font-bold text-center dark:text-white uppercase tracking-tighter">
          Biblioteca Digital
        </h1>
        <p className="text-sm italic text-muted-foreground text-center">
          Gestión y visualización de manuales y documentos técnicos de la compañía.
        </p>
      </div>

      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-2">
          {/* 4. El Modal ejecutará fetchDocs al terminar con éxito */}
          <UploadModal 
            companySlug={selectedCompany?.slug || ""} 
            onSuccess={fetchDocs} 
          />
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input 
            placeholder="Filtrar por nombre..." 
            className="h-8 pl-9 bg-background border-input focus-visible:ring-1 focus-visible:ring-blue-500 rounded-md text-sm shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <DocumentList 
        documents={documents} 
        searchTerm={searchTerm} 
        isLoading={isLoading} 
        companySlug={selectedCompany?.slug || ""}
      />
      
    </ContentLayout>
  );
};

export default LibraryPage;