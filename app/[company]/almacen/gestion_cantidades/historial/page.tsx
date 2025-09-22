"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useCompanyStore } from "@/stores/CompanyStore";
import { History, Calendar, User, Package, FileText } from "lucide-react";
import React, { useState } from "react";
import { ChangesHistoryTable } from "./_components/ChangesHistoryTable";
import { ChangesFilters, FilterState } from "./_components/ChangesFilters";

// Mock data - En producción esto vendría del backend
const mockChangesHistory = [
  {
    id: 1,
    date: "2024-01-15T10:30:00Z",
    user: {
      name: "Hugo Guzmán",
      email: "hguzman@empresa.com",
      avatar: "HG"
    },
    type: "bulk_update",
    justification: "Inventario físico mensual - ajustes encontrados durante reconteo",
    articlesModified: [
      {
        id: 123,
        partNumber: "310126-1",
        description: "1 STAGE TURBINE ROTOR BLADE",
        changes: {
          quantity: { from: 18, to: 20, unit: "UNIDADES" },
          zone: { from: "1-B PZO", to: "1-D PZO" }
        }
      },
      {
        id: 456,
        partNumber: "PORTA-CARNETS",
        description: "100 SOPORTES PARA INSIGNIA DE BRAZO CON CORREA AJUSTABLE",
        changes: {
          zone: { from: "1-C PZO", to: "1-F PZO" }
        }
      }
    ],
    totalArticles: 2,
    status: "completed"
  },
  {
    id: 2,
    date: "2024-01-14T15:45:00Z",
    user: {
      name: "María García",
      email: "mgarcia@empresa.com",
      avatar: "MG"
    },
    type: "single_update",
    justification: "Corrección de error en ubicación tras reorganización de almacén",
    articlesModified: [
      {
        id: 789,
        partNumber: "FLT-001",
        description: "Filtro de combustible principal",
        changes: {
          quantity: { from: 25, to: 23, unit: "UNIDADES" },
          zone: { from: "A-01", to: "A-03" }
        }
      }
    ],
    totalArticles: 1,
    status: "completed"
  },
  {
    id: 3,
    date: "2024-01-13T09:15:00Z",
    user: {
      name: "Carlos López",
      email: "clopez@empresa.com",
      avatar: "CL"
    },
    type: "bulk_update",
    justification: "Transferencia masiva por reorganización de zonas de almacenamiento",
    articlesModified: [
      {
        id: 101,
        partNumber: "BRK-002",
        description: "Pastillas de freno delanteras",
        changes: {
          zone: { from: "B-01", to: "C-01" }
        }
      },
      {
        id: 102,
        partNumber: "BRK-003",
        description: "Pastillas de freno traseras",
        changes: {
          zone: { from: "B-02", to: "C-02" }
        }
      },
      {
        id: 103,
        partNumber: "ENG-001",
        description: "Kit de mantenimiento de motor",
        changes: {
          quantity: { from: 5, to: 8, unit: "KITS" },
          zone: { from: "D-01", to: "D-05" }
        }
      }
    ],
    totalArticles: 3,
    status: "completed"
  }
];

const HistorialCambiosPage = () => {
  const { selectedCompany } = useCompanyStore();
  const [filters, setFilters] = useState<FilterState>({
    dateRange: { from: null, to: null },
    user: "",
    changeType: "",
    articleFilter: ""
  });

  // Filtrar datos basado en los filtros aplicados
  const filteredHistory = mockChangesHistory.filter(record => {
    // Filtro por rango de fechas
    if (filters.dateRange.from || filters.dateRange.to) {
      const recordDate = new Date(record.date);
      if (filters.dateRange.from && recordDate < filters.dateRange.from) return false;
      if (filters.dateRange.to && recordDate > filters.dateRange.to) return false;
    }

    // Filtro por usuario
    if (filters.user && !record.user.name.toLowerCase().includes(filters.user.toLowerCase())) {
      return false;
    }

    // Filtro por tipo de cambio
    if (filters.changeType && record.type !== filters.changeType) {
      return false;
    }

    // Filtro por artículo
    if (filters.articleFilter) {
      const hasMatchingArticle = record.articlesModified.some(article => 
        article.partNumber.toLowerCase().includes(filters.articleFilter.toLowerCase()) ||
        article.description.toLowerCase().includes(filters.articleFilter.toLowerCase())
      );
      if (!hasMatchingArticle) return false;
    }

    return true;
  });

  return (
    <ContentLayout title="Historial de Cambios - Gestión de Cantidades">
      <div className="flex flex-col gap-6">
        {/* Breadcrumbs */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href={`/${selectedCompany?.slug}/dashboard`}>Inicio</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>Almacén</BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>Inventario</BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/${selectedCompany?.slug}/almacen/gestion_cantidades`}>
                Gestión de Cantidades
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Historial de Cambios</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <History className="h-8 w-8" />
              Historial de Cambios
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              Registro completo de todas las modificaciones realizadas en cantidades y ubicaciones
            </p>
          </div>
          <Button variant="outline" asChild>
            <a href={`/${selectedCompany?.slug}/almacen/gestion_cantidades`}>
              Volver a Gestión
            </a>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Total Registros</span>
            </div>
            <div className="text-2xl font-bold text-blue-900 mt-1">
              {filteredHistory.length}
            </div>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-700">Artículos Afectados</span>
            </div>
            <div className="text-2xl font-bold text-green-900 mt-1">
              {filteredHistory.reduce((total, record) => total + record.totalArticles, 0)}
            </div>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">Usuarios Activos</span>
            </div>
            <div className="text-2xl font-bold text-purple-900 mt-1">
              {new Set(filteredHistory.map(record => record.user.email)).size}
            </div>
          </div>

          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-orange-600" />
              <span className="text-sm font-medium text-orange-700">Últimos 30 días</span>
            </div>
            <div className="text-2xl font-bold text-orange-900 mt-1">
              {filteredHistory.filter(record => {
                const recordDate = new Date(record.date);
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                return recordDate >= thirtyDaysAgo;
              }).length}
            </div>
          </div>
        </div>

        {/* Filters */}
        <ChangesFilters 
          filters={filters}
          onFiltersChange={setFilters}
          totalRecords={mockChangesHistory.length}
          filteredRecords={filteredHistory.length}
        />

        {/* Changes Table */}
        <ChangesHistoryTable changes={filteredHistory} />
      </div>
    </ContentLayout>
  );
};

export default HistorialCambiosPage;
