import React from "react";
import { useRouter } from "next/navigation";
import {
    BookText,
    ClipboardCheck,
    Trophy,
    Newspaper,
    Users,
    ArrowRight
} from "lucide-react"; // Importa los iconos
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { StrategyCard } from "@/components/cards/StrategyCard";
import { SMSConceptsDialog } from "@/components/dialogs/aerolinea/sms/SMSConceptsDialog";
import FeaturesDialog from "@/components/dialogs/aerolinea/sms/FeaturedDialog";

interface AeronauticalStrategiesTabProps {
    company: string;
    isConceptOpen: boolean;
    setIsConceptOpen: (open: boolean) => void;
    smsConcepts: any[];
    responsibilities: any[];
    surveyNumbers: {
        SMS_SURVEY?: string;
        SMS_QUIZ?: string;
    };
}

const AeronauticalStrategiesTab = ({
    company,
    isConceptOpen,
    setIsConceptOpen,
    smsConcepts,
    responsibilities,
    surveyNumbers,
}: AeronauticalStrategiesTabProps) => {
    const router = useRouter();

    // Configuración de las tarjetas para evitar repetición de código
    const strategies = [
        {
            title: "Glosario de Términos",
            description: "Glosario esencial para comprender el lenguaje operativo y preventivo del sistema.",
            icon: <BookText className="w-6 h-6 text-yellow-600" />,
            onClick: () => setIsConceptOpen(true),
            className: "sm:col-span-1",
        },
        {
            title: "Responsabilidades SMS",
            description: "Funciones clave del personal para sostener una operación segura.",
            icon: <Users className="w-6 h-6 text-yellow-600" />,
            isDialog: true, // Para manejar el FeaturesDialog
            className: "sm:col-span-1",
        },
        {
            title: "Encuestas SMS",
            description: "Evalúa conocimientos y madurez de la cultura de seguridad.",
            icon: <ClipboardCheck className="w-6 h-6 text-yellow-600" />,
            onClick: () => router.push(`/acceso_publico/${company}/sms/encuesta/${surveyNumbers?.SMS_SURVEY}`),
            className: "sm:col-span-1",
        },
        {
            title: "Trivia SMS",
            description: "Pon a prueba conocimientos clave sobre prevención y respuesta.",
            icon: <Trophy className="w-6 h-6 text-yellow-600" />,
            onClick: () => router.push(`/acceso_publico/${company}/sms/encuesta/${surveyNumbers?.SMS_QUIZ}`),
            className: "sm:col-span-1",
        },
        {
            title: "Boletines SMS",
            description: "Accede a boletines, avisos y comunicaciones preventivas relevantes para toda la organización.",
            icon: <Newspaper className="w-6 h-6 text-yellow-600" />,
            onClick: () => router.push(`/acceso_publico/${company}/sms/comunicados`),
            className: "sm:col-span-2", // Ocupa dos columnas
        },
    ];

    return (
        <TabsContent value="estrategias" className="mt-6 space-y-4">
            <Card className="min-h-[300px] border-border/60 shadow-lg bg-gradient-to-b from-background to-muted/20">
                <CardHeader>
                    <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                        <span className="w-2 h-8 bg-yellow-500 rounded-full mr-2" />
                        Estrategias de seguridad operacional
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        {strategies.map((item, index) => {
                            const content = (
                                <div
                                    key={index}
                                    className={`group relative flex cursor-pointer flex-col rounded-2xl border-l-4 border-l-yellow-500 bg-background p-1 transition-all hover:shadow-md ${item.className}`}
                                    onClick={item.onClick}
                                >
                                    <StrategyCard
                                        title={
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-yellow-50 rounded-lg group-hover:bg-yellow-100 transition-colors">
                                                    {item.icon}
                                                </div>
                                                <span>{item.title}</span>
                                            </div>
                                        }
                                        description={item.description}
                                        className="h-full border-none bg-transparent shadow-none"
                                    />
                                    <ArrowRight className="absolute bottom-4 right-4 w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                                </div>
                            );

                            // Envolver en FeaturesDialog si es el de responsabilidades
                            if (item.isDialog) {
                                return (
                                    <FeaturesDialog key={index} features={responsibilities}>
                                        {content}
                                    </FeaturesDialog>
                                );
                            }

                            return content;
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Dialogos que se activan por estado externo */}
            <SMSConceptsDialog
                concepts={smsConcepts}
                title="Glosario de Términos SMS"
                description="Definiciones esenciales para comprender el Sistema de Gestión de Seguridad"
                open={isConceptOpen}
                onOpenChange={setIsConceptOpen}
            />
        </TabsContent>
    );
};

export default AeronauticalStrategiesTab;
