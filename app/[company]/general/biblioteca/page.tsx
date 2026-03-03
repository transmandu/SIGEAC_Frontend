"use client";

import { useEffect, useState } from "react";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useCompanyStore } from "@/stores/CompanyStore";
import axios from "axios";

// IMPORTANTE: Rutas relativas para evitar el error ts(2307)
import { UploadModal } from "./UploadModal";
import { DocumentList } from "./DocumentList";

const LibraryPage = () => {
  const { selectedCompany } = useCompanyStore();
  const [documents, setDocuments] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchDocs = async () => {
    if (!selectedCompany?.slug) return;
    setIsLoading(true);
    try {
      // Ajusta la URL según tu estructura de API en Laravel
      const res = await axios.get(`/api/${selectedCompany.slug}/library/my-documents`);
      setDocuments(res.data.data);
    } catch (e) {
      console.error("Error cargando documentos:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [selectedCompany?.slug]);

  return (
    <ContentLayout title="Biblioteca Digital">
      {/* CABECERA CENTRADA (Clon de Actividades) */}
      <div className="flex flex-col gap-2 mb-4 mt-4">
        <h1 className="text-5xl font-bold text-center dark:text-white">
          Biblioteca Digital
        </h1>
        <p className="text-sm italic text-muted-foreground text-center">
          Aquí se pueden visualizar los manuales y documentos de la compañía planificados y ejecutados hasta el momento
        </p>
      </div>

      {/* BARRA DE HERRAMIENTAS */}
      <div className="flex items-center justify-between py-4">
        {/* LADO IZQUIERDO: Botón de Subida (Componente separado) */}
        <div className="flex items-center gap-2">
          <UploadModal 
            companySlug={selectedCompany?.slug || ""} 
            onSuccess={fetchDocs} 
          />
        </div>

        {/* LADO DERECHO: Buscador (Integrado aquí mismo) */}
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

      {/* LISTADO DE DOCUMENTOS (Componente separado para limpieza visual) */}
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