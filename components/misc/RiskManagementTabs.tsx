"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CreateDangerIdentificationForm from "../forms/sms/CreateIdentificationForm";
// Importa tus otros formularios aquí:
// import RiskEvaluationForm from "./RiskEvaluationForm";
// import MitigationForm from "./MitigationForm";

interface RiskManagementTabsProps {
    reporteId: string;
    isOmac: boolean;
}

export default function RiskManagementTabs({ reporteId, isOmac }: RiskManagementTabsProps) {
    // Estado para controlar la pestaña activa si necesitas cambiarla programáticamente (ej. botón "Siguiente")
    const [activeTab, setActiveTab] = useState<string>("identificacion");

    // Definimos las pestañas dinámicamente basándonos en si es OMAC
    const tabs = isOmac
        ? [
            {
                id: "notification",
                label: "1. Notificación de Peligros",
                component: <CreateDangerIdentificationForm id={Number(reporteId)} reportType="RVP" />,
            },
            {
                id: "analysis",
                label: "2. Analisis de los 5 Porqués",
                component: <div className="p-4 border rounded-lg mt-4">Aquí va tu formulario de Evaluación OMAC</div>,
            }, {
                id: "risk_management",
                label: "3. Gestion de Riesgo",
                component: <div className="p-4 border rounded-lg mt-4">Aquí va tu formulario de Evaluación OMAC</div>,
            },
        ]
        : [
            {
                id: "notification",
                label: "1. Notificación de Peligro",
                component: <CreateDangerIdentificationForm id={Number(reporteId)} reportType="RVP" />,
            },
            {
                id: "risk_management",
                label: "2. Gestion de Riesgo",
                component: <div className="p-4 border rounded-lg mt-4">Aquí va el formulario de defensas extra</div>,
            },
            {
                id: "follow_up_controls",
                label: "3. Controles de Seguimiento",
                component: <div className="p-4 border rounded-lg mt-4">Aquí va el formulario de Mitigación estándar</div>,
            },
            {
                id: "close",
                label: "4. Cierre del Reporte",
                component: <div className="p-4 border rounded-lg mt-4">Aquí va el formulario de Mitigación estándar</div>,
            },
        ];

    return (
        <div className="w-full space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                {/* Renderizado de los botones de las pestañas */}
                <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>
                    {tabs.map((tab) => (
                        <TabsTrigger key={tab.id} value={tab.id}>
                            {tab.label}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {/* Renderizado del contenido de cada pestaña */}
                {tabs.map((tab) => (
                    <TabsContent key={tab.id} value={tab.id} className="mt-6">
                        {tab.component}
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}
