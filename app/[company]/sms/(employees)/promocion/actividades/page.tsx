"use client";

import { useState } from "react";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { Loader2 } from "lucide-react";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { useGetSMSActivities } from "@/hooks/sms/useGetSMSActivities";
import { useCompanyStore } from "@/stores/CompanyStore";

const SMSActivitiesPage = () => {
  const { selectedCompany } = useCompanyStore();
  
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  const {
    data: activities,
    isLoading,
    isError,
  } = useGetSMSActivities(selectedCompany?.slug, fromDate, toDate);

  return (
    <ContentLayout title="Actividades de SMS">
      <div className="flex flex-col gap-y-4">
        
        {/* EL TÍTULO ÚNICO SE QUEDA AQUÍ */}
        <div className="flex flex-col gap-2 mb-2">
          <h1 className="text-5xl font-bold text-center">
            Actividades de SMS
          </h1>
          <p className="text-sm italic text-muted-foreground text-center">
            Aquí se pueden visualizar las actividades de SMS planificadas y ejecutadas hasta el momento
          </p>
        </div>

        {/* FILTROS JUSTO DEBAJO */}
        <div className="flex flex-col items-center justify-center gap-4 py-6 border-b">
          {/* Mensaje superior */}
          <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Seleccionar Rango de Fechas:
          </span>

          {/* Contenedor de inputs */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Desde:</span>
              <input 
                type="date" 
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="bg-background border rounded-md px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Hasta:</span>
              <input 
                type="date" 
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="bg-background border rounded-md px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            
            {(fromDate || toDate) && (
              <button 
                onClick={() => { setFromDate(""); setToDate(""); }}
                className="text-xs font-semibold text-destructive hover:opacity-80 transition-opacity border border-destructive/20 rounded-full px-3 py-1"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

        {/* TABLA LIMPIA (Sin títulos internos) */}
        <div className="flex flex-col gap-y-2">
          {isLoading && (
            <div className="flex w-full h-full justify-center items-center py-20">
              <Loader2 className="size-24 animate-spin text-muted-foreground" />
            </div>
          )}
          
          {activities && <DataTable columns={columns} data={activities} />}
          
          {isError && (
            <p className="text-sm text-muted-foreground text-center py-10">
              Ha ocurrido un error al cargar las actividades...
            </p>
          )}
        </div>
      </div>
    </ContentLayout>
  );
};

export default SMSActivitiesPage;