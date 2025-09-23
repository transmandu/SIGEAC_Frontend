"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Plane, Wrench, Package, Settings, CheckCircle, AlertCircle } from "lucide-react";
import { useState } from "react";
import RegisterArticleForm from "@/components/forms/mantenimiento/almacen/RegisterArticleForm";
import CreateHardwareForm from "@/components/forms/mantenimiento/almacen/CreateHardwareForm";

const RegistroArticulosPage = () => {
  const { selectedCompany } = useCompanyStore();
  const [activeTab, setActiveTab] = useState("aeronautico");

  return (
    <ContentLayout title="Registro de Artículos">
      <div className="flex flex-col gap-6">
        {/* Breadcrumbs */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href={`/${selectedCompany?.slug}/dashboard`}>
                Inicio
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>Almacén</BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Registro de Artículos</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Package className="h-8 w-8" />
              Registro de Artículos
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              Registre artículos aeronáuticos y de ferretería en el sistema de inventario
            </p>
          </div>
        </div>

        {/* Información de los tipos de artículos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card className={`cursor-pointer transition-all duration-200 ${
            activeTab === "aeronautico" 
              ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30" 
              : "hover:shadow-md"
          }`}>
            <CardHeader className="flex flex-row items-center space-y-0 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Plane className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-lg">Artículos Aeronáuticos</CardTitle>
                  <CardDescription>
                    Componentes, herramientas y consumibles para aeronaves
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Certificaciones FAA/EASA</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Trazabilidad completa</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Documentación técnica</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <span>Cumplimiento normativo</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`cursor-pointer transition-all duration-200 ${
            activeTab === "ferreteria" 
              ? "border-orange-500 bg-orange-50 dark:bg-orange-950/30" 
              : "hover:shadow-md"
          }`}>
            <CardHeader className="flex flex-row items-center space-y-0 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <Wrench className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <CardTitle className="text-lg">Artículos de Ferretería</CardTitle>
                  <CardDescription>
                    Herramientas, materiales y suministros generales
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Especificaciones técnicas</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Categorización detallada</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Control de inventario</span>
                </div>
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-blue-500" />
                  <span>Gestión simplificada</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs para los tipos de artículos */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger 
              value="aeronautico" 
              className="flex items-center gap-2"
            >
              <Plane className="h-4 w-4" />
              Artículos Aeronáuticos
            </TabsTrigger>
            <TabsTrigger 
              value="ferreteria"
              className="flex items-center gap-2"
            >
              <Wrench className="h-4 w-4" />
              Artículos de Ferretería
            </TabsTrigger>
          </TabsList>

          <TabsContent value="aeronautico" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plane className="h-5 w-5 text-blue-600" />
                  Registro de Artículo Aeronáutico
                </CardTitle>
                <CardDescription>
                  Complete la información para registrar un artículo aeronáutico en el inventario.
                  Incluye campos específicos para cumplimiento normativo y trazabilidad.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RegisterArticleForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ferreteria" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-orange-600" />
                  Registro de Artículo de Ferretería
                </CardTitle>
                <CardDescription>
                  Complete la información para registrar un artículo de ferretería en el inventario.
                  Incluye especificaciones técnicas y características específicas para herramientas y materiales.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CreateHardwareForm />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Información adicional */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Información Importante</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Plane className="h-4 w-4 text-blue-600" />
                  Artículos Aeronáuticos
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Requieren certificaciones específicas (8130, fabricante, vendedor)</li>
                  <li>• Deben cumplir con regulaciones FAA/EASA</li>
                  <li>• Incluyen componentes, herramientas y consumibles</li>
                  <li>• Requieren trazabilidad completa del historial</li>
                  <li>• Documentación técnica obligatoria</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-orange-600" />
                  Artículos de Ferretería
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Incluyen herramientas manuales y eléctricas</li>
                  <li>• Materiales de construcción y suministros</li>
                  <li>• Especificaciones técnicas detalladas</li>
                  <li>• Categorización por tipo de uso</li>
                  <li>• Control de inventario simplificado</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ContentLayout>
  );
};

export default RegistroArticulosPage;
