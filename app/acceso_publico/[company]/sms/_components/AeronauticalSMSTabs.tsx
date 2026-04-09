"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AlertTriangle, BookOpen, Building, Target } from "lucide-react";

import { CustomCard } from "@/components/cards/CustomCard";
import { PolicyCard } from "@/components/cards/PolicyCard";
import { StrategyCard } from "@/components/cards/StrategyCard";
import ActionPlanDialog from "@/components/dialogs/aerolinea/sms/ActionPlanDialog";
import FeaturesDialog from "@/components/dialogs/aerolinea/sms/FeaturedDialog";
import { SMSConceptsDialog } from "@/components/dialogs/aerolinea/sms/SMSConceptsDialog";
import { ImageGalleryDialog } from "@/components/dialogs/general/ImageGalleryDialog";
import { MissionVision } from "@/components/misc/MissionVision";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
    emergencyPlans,
    policyCardsData,
    policyImages,
    smsConcepts,
} from "@/lib/contants/sms-data";

interface SMSTabsProps {
    company: string;
    surveyNumbers: any; // Puedes tiparlo mejor si tienes la interfaz de tus settings, ej: { SMS_SURVEY: string, SMS_QUIZ: string }
}

export const AeronauticalSMSTabs = ({ company, surveyNumbers }: SMSTabsProps) => {
    const router = useRouter();
    const [isConceptOpen, setIsConceptOpen] = useState(false);

    const SMSresponsibilities = [
        {
            image: `${process.env.NEXT_PUBLIC_STORAGE_BASE_URL}images/sms/risk_icon.png`,
            title: "Responsabilidades SMS Dueños de Proceso",
            items: [
                "Mitigar los Riesgos",
                "Participar en los Simulacros de Emergencias",
                "Participar en las Actividades de SMS",
                "Contar con los Conocimientos de las Politicas",
            ],
        },
        {
            image: `${process.env.NEXT_PUBLIC_STORAGE_BASE_URL}images/sms/caution.png`,
            title: "Responsabilidades SMS Resto del Personal",
            items: [
                "Identificar Peligros",
                "Participar en los Simulacros de Emergencias",
                "Participar en las Actividades de SMS",
                "Contar con los Conocimientos de las Politicas",
            ],
        },
    ];

    return (
        <Tabs defaultValue="politicas" className="w-full">
            <TabsList className="pb-40 sm:pb-2 grid w-full grid-cols-2 gap-2 lg:grid-cols-4 items-center justify-center">
                <TabsTrigger
                    value="politicas"
                    className="flex-col sm:flex-row items-center justify-center gap-2 px-2 sm:px-4 mt-5 sm:mt-0"
                >
                    <div>
                        <BookOpen className="h-4 w-4 flex-shrink-0" />
                    </div>
                    <div>
                        <span className="truncate text-xs sm:text-sm">Políticas</span>
                    </div>
                </TabsTrigger>
                <TabsTrigger
                    value="empresa"
                    className="flex-col sm:flex-row items-center justify-center gap-2 px-2 sm:px-4 mt-5 sm:mt-0"
                >
                    <div>
                        <Building className="h-4 w-4 flex-shrink-0" />
                    </div>
                    <div>
                        <span className="truncate text-xs sm:text-sm">Empresa</span>
                    </div>
                </TabsTrigger>
                <TabsTrigger
                    value="estrategias"
                    className="flex-col sm:flex-row items-center justify-center gap-2 px-2 sm:px-4 mb-4 sm:mb-0"
                >
                    <div>
                        <Target className="h-4 w-4 flex-shrink-0" />
                    </div>
                    <div>
                        <span className="truncate text-xs sm:text-sm">Estrategias</span>
                    </div>
                </TabsTrigger>
                <TabsTrigger
                    value="plan-respuesta"
                    className="flex-col sm:flex-row items-center justify-center gap-2 px-2 sm:px-4 mb-4 sm:mb-0"
                >
                    <div>
                        <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                    </div>
                    <div>
                        <span className="truncate text-xs sm:text-sm">
                            Plan Respuesta
                        </span>
                    </div>
                </TabsTrigger>
            </TabsList>

            {/* CONTENIDO PARA POLÍTICAS */}
            <TabsContent value="politicas" className="space-y-4 mt-4 sm:mt-6">
                <Card className="min-h-[300px] sm:min-h-[400px]">
                    <CardHeader>
                        <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                            Políticas del Sistema de Gestión de Seguridad
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 sm:space-y-4 text-sm sm:text-base">
                        <div className="flex justify-center items-center">
                            <ImageGalleryDialog
                                images={policyImages}
                                trigger={
                                    <Button
                                        variant="link"
                                        className="text-xs sm:text-base p-1 h-auto hover:no-underline text-blue-600 hover:text-blue-800 transition-colors"
                                    >
                                        Ver Políticas Completas
                                    </Button>
                                }
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-stretch transition-all duration-500 ease-out opacity-0 animate-fade-in">
                            {policyCardsData.map((policy, index) => (
                                <div key={index} className="h-full">
                                    <PolicyCard
                                        index={index}
                                        icon={policy.icon}
                                        title=""
                                        description={policy.description}
                                        className="h-full"
                                    />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            {/* CONTENIDO PARA NUESTRA EMPRESA */}
            <TabsContent value="empresa" className="space-y-4 mt-4 sm:mt-6">
                <Card className="min-h-[300px] sm:min-h-[400px] transition-all duration-700 ease-out opacity-0 animate-fade-in">
                    <CardHeader>
                        <CardTitle className="text-lg sm:text-xl flex items-center gap-2 transition-all duration-800 ease-out opacity-0 animate-fade-in delay-100">
                            Nuestra Empresa
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 sm:space-y-4 text-sm sm:text-base">
                        <div className="transition-all duration-900 ease-out opacity-0 animate-fade-in delay-200">
                            <MissionVision />
                        </div>
                        <div className="pt-4 border-t transition-all duration-1000 ease-out opacity-0 animate-fade-in delay-300">
                            <div className="flex justify-center">
                                <Image
                                    src={`${process.env.NEXT_PUBLIC_STORAGE_BASE_URL}images/sms/sms_airplane_page.jpg`}
                                    alt="Nuestra empresa - instalaciones y equipo"
                                    width={600}
                                    height={400}
                                    className="rounded-lg max-w-full h-auto max-h-64 object-cover shadow-md transition-all duration-500 ease-out hover:shadow-xl hover:scale-105"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            {/* CONTENIDO PARA ESTRATEGIAS */}
            <TabsContent value="estrategias" className="space-y-4 mt-4 sm:mt-6">
                <Card className="min-h-[300px] sm:min-h-[400px]">
                    <CardHeader>
                        <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                            Estrategias de Seguridad Operacional
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 sm:space-y-4 text-sm sm:text-base">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch transition-all duration-900 ease-out opacity-0 animate-fade-in delay-200">
                            {/* Términos SMS */}
                            <div
                                className="border-l-4 border-l-blue-500 pl-4 flex flex-col cursor-pointer"
                                onClick={() => setIsConceptOpen(true)}
                            >
                                <StrategyCard
                                    title="Términos SMS"
                                    description="Lista de Conceptos Relacionados al SMS."
                                    className="h-full hover:scale-105 cursor-pointer"
                                />
                            </div>

                            <SMSConceptsDialog
                                concepts={smsConcepts}
                                title="Glosario de Términos SMS"
                                description="Definiciones esenciales para comprender el Sistema de Gestión de Seguridad"
                                open={isConceptOpen}
                                onOpenChange={setIsConceptOpen}
                            />

                            {/* Responsabilidades SMS */}
                            <FeaturesDialog features={SMSresponsibilities}>
                                <div className="border-l-4 border-l-blue-500 pl-4 flex flex-col">
                                    <StrategyCard
                                        title="Responsabilidades SMS"
                                        description="Responsabilidades del Personal en Materia de SMS"
                                        className="h-full hover:scale-105 cursor-pointer"
                                    />
                                </div>
                            </FeaturesDialog>

                            {/* Encuestas SMS */}
                            <div
                                className="border-l-4 border-l-blue-500 pl-4 cursor-pointer flex flex-col w-full"
                                onClick={() =>
                                    router.push(
                                        `/acceso_publico/${company}/sms/encuesta/${surveyNumbers?.SMS_SURVEY}`
                                    )
                                }
                            >
                                <StrategyCard
                                    title="Encuestas SMS"
                                    description="Evalúa tus conocimientos en SMS"
                                    className="hover:scale-105 h-full"
                                />
                            </div>

                            {/* Trivia SMS */}
                            <div
                                className="border-l-4 border-l-blue-500 pl-4 cursor-pointer flex flex-col w-full"
                                onClick={() =>
                                    router.push(
                                        `/acceso_publico/${company}/sms/encuesta/${surveyNumbers?.SMS_QUIZ}`
                                    )
                                }
                            >
                                <StrategyCard
                                    title="Trivia SMS"
                                    description="Pon a prueba tus conocimientos en materia de SMS"
                                    className="hover:scale-105 h-full"
                                />
                            </div>

                            {/* Comunicados SMS */}
                            <div
                                className="border-l-4 border-l-blue-500 pl-4 flex flex-col"
                                onClick={() =>
                                    router.push(`/acceso_publico/${company}/sms/comunicados`)
                                }
                            >
                                <StrategyCard
                                    title="Comunicados SMS"
                                    description="Información referente a los boletines de SMS"
                                    className="h-full hover:scale-105 cursor-pointer"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            {/* CONTENIDO PARA PLAN DE RESPUESTA */}
            <TabsContent
                value="plan-respuesta"
                className="space-y-4 mt-4 sm:mt-6"
            >
                <Card className="min-h-[300px] sm:min-h-[400px]">
                    <CardHeader>
                        <CardTitle className="text-sm sm:text-xl flex items-center gap-2">
                            Plan de Respuesta Ante la Emergencia de{" "}
                            {company.toUpperCase()}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 sm:space-y-4 text-sm sm:text-base">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
                            {emergencyPlans.map((plan, index) => (
                                <div key={index} className="flex items-stretch">
                                    <ActionPlanDialog
                                        title={`${plan.cardData?.stepsTitle}`}
                                        actionSteps={plan.actionSteps}
                                    >
                                        <CustomCard
                                            imageUrl={plan.cardData.imageUrl}
                                            imageAlt={plan.cardData.imageAlt}
                                            title={plan.cardData.title}
                                            description={plan.cardData.description}
                                            actionLink={plan.cardData.actionLink}
                                        />
                                    </ActionPlanDialog>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs >
    );
};
