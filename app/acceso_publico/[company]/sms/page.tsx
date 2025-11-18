"use client";
import { CustomCard } from "@/components/cards/CustomCard";
import { PolicyCard } from "@/components/cards/PolicyCard";
import { StrategyCard } from "@/components/cards/StrategyCard";
import ActionPlanDialog from "@/components/dialogs/aerolinea/sms/ActionPlanDialog";
import FeaturesDialog from "@/components/dialogs/aerolinea/sms/FeaturedDialog";
import { SMSConceptsDialog } from "@/components/dialogs/aerolinea/sms/SMSConceptsDialog";
import { ImageGalleryDialog } from "@/components/dialogs/general/ImageGalleryDialog";
import { GuestContentLayout } from "@/components/layout/GuestContentLayout";
import { MissionVision } from "@/components/misc/MissionVision";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetSurveySettingNumbers } from "@/hooks/sms/survey/useGetSurveySettingNumbers";
import { emergencyPlans, policyImages, smsConcepts } from "@/lib/contants/sms-data";
import {
  Building2,
  Gavel,
  GitFork,
  Handshake,
  NotepadText,
  Users
} from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

const SMSPage = () => {
  const params = useParams();
  const company = params.company as string;
  const router = useRouter();
  const [isConceptOpen, setIsConceptOpen] = useState(false);
  const { data: surveyNumbers } = useGetSurveySettingNumbers(company);
  // TODAS LAS VARIABLES DEBERIAN SER DINAMICAS PARA QUE EL USUARIO DE MANTENIMIENTO O MODIFIQUE LO QUE QUIERA QUE SEA VEA EN EL SMS PUBLIC PAGE

  
  const emergencyActionSteps = [
    {
      title: "Activación del Protocolo de Emergencia",
      items: [
        "Activar la alarma de incendio inmediatamente",
        "Notificar al jefe de bomberos del aeropuerto",
        "Comunicar la situación al control de tráfico aéreo",
        "Iniciar evacuación del área afectada",
      ],
    },
    {
      title: "Control y Extinción del Incendio",
      items: [
        "Utilizar extintores tipo ABC para incendios eléctricos",
        "Aplicar espuma antiincendios para combustibles",
        "Establecer perímetro de seguridad de 50 metros",
        "Coordinar con brigada de bomberos externa",
      ],
    },
    {
      title: "Protección de la Aeronave",
      items: [
        "Desconectar sistemas eléctricos de la aeronave",
        "Remover combustible cercano si es posible",
        "Cubrir motores y áreas críticas con mantas ignífugas",
        "Preparar equipo de remolque para evacuación",
      ],
    },
    {
      title: "Evaluación Post-Emergencia",
      items: [
        "Realizar inspección completa de daños",
        "Documentar todo el incidente para reportes",
        "Coordinar con mantenimiento para evaluaciones",
        "Actualizar protocolos basado en lecciones aprendidas",
      ],
    },
  ];

  const SMSresponsibilities = [
    {
      image: "/LOGO.png",
      title: "Responsabilidades SMS Dueños de Proceso",
      items: [
        "Mitigar los Riesgos",
        "Participar en los Simulacros de Emergencias",
        "Participar en las Actividades de SMS",
        "Contar con los Conocimientos de las Politicas",
      ],
    },
    {
      image: "/LOGO.png",
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
    <GuestContentLayout title="Seguridad Operacional SMS">
      <div className="flex flex-col justify-center items-center w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Tabs defaultValue="politicas" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-1 sm:gap-2">
            <TabsTrigger
              value="politicas"
              className="text-xs sm:text-sm py-2 sm:py-3 px-2 sm:px-4 truncate"
            >
              Políticas
            </TabsTrigger>
            <TabsTrigger
              value="empresa"
              className="text-xs sm:text-sm py-2 sm:py-3 px-2 sm:px-4 truncate"
            >
              Nuestra Empresa
            </TabsTrigger>
            <TabsTrigger
              value="estrategias"
              className="text-xs sm:text-sm py-2 sm:py-3 px-2 sm:px-4 truncate"
            >
              Estrategias
            </TabsTrigger>
            <TabsTrigger
              value="plan-respuesta"
              className="text-xs sm:text-sm py-2 sm:py-3 px-2 sm:px-4 truncate"
            >
              Plan de Respuesta
            </TabsTrigger>
          </TabsList>

          {/* CONTENIDO PARA POLÍTICAS */}
          <TabsContent value="politicas" className="space-y-4 mt-4 sm:mt-6">
            <Card className="min-h-[300px] sm:min-h-[400px]">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">
                  <ImageGalleryDialog
                    images={policyImages}
                    trigger={
                      <Button
                        variant="link"
                        className="text-xs sm:text-base p-1 h-auto hover:no-underline text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        Ver Políticas
                      </Button>
                    }
                  />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 text-sm sm:text-base">
                <div className="flex justify-center items-center"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-stretch">
                  <div className="transition-all duration-500 ease-out opacity-0 animate-fade-in delay-100 h-full">
                    <PolicyCard
                      icon={Building2}
                      title=""
                      description="La Organización se compromete a no aplicar acciones punitivas"
                      className="h-full"
                    />
                  </div>
                  <div className="transition-all duration-500 ease-out opacity-0 animate-fade-in delay-150 h-full">
                    <PolicyCard
                      icon={Handshake}
                      title=""
                      description="Apoyar la Gestión del SMS a traves de la asignación de recursos"
                      className="h-full"
                    />
                  </div>
                  <div className="transition-all duration-500 ease-out opacity-0 animate-fade-in delay-200 h-full">
                    <PolicyCard
                      icon={GitFork}
                      title=""
                      description="Diseñar Procesos & Sistemas para la Identificación de Peligros & Gestión de Riesgos"
                      className="h-full"
                    />
                  </div>
                  <div className="transition-all duration-500 ease-out opacity-0 animate-fade-in delay-250 h-full">
                    <PolicyCard
                      icon={Gavel}
                      title=""
                      description="Cumplir con las Normas Nacionales e Internacionales aplicables a nuestros servicios"
                      className="h-full"
                    />
                  </div>
                  <div className="transition-all duration-500 ease-out opacity-0 animate-fade-in delay-300 h-full">
                    <PolicyCard
                      icon={NotepadText}
                      title=""
                      description="Definir las líneas de responsabilidades para el personal en materia SMS"
                      className="h-full"
                    />
                  </div>
                  <div className="transition-all duration-500 ease-out opacity-0 animate-fade-in delay-350 h-full">
                    <PolicyCard
                      icon={Users}
                      title=""
                      description="Capacitar a todos los empleados en materia de Seguridad Operacional"
                      className="h-full"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CONTENIDO PARA NUESTRA EMPRESA */}
          <TabsContent value="empresa" className="space-y-4 mt-4 sm:mt-6">
            <Card className="min-h-[300px] sm:min-h-[400px] transition-all duration-700 ease-out opacity-0 animate-fade-in">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl transition-all duration-800 ease-out opacity-0 animate-fade-in delay-100">
                  Nuestra Empresa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 text-sm sm:text-base">
                <div className="transition-all duration-900 ease-out opacity-0 animate-fade-in delay-200">
                  <MissionVision />
                </div>
                {/* Imagen con next/image */}
                <div className="pt-4 border-t transition-all duration-1000 ease-out opacity-0 animate-fade-in delay-300">
                  <div className="flex justify-center">
                    <Image
                      src="/estelar_sms.png"
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
                <CardTitle className="text-lg sm:text-xl">
                  Estrategias
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 text-sm sm:text-base">
                {/* Agrega items-stretch aquí */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch transition-all duration-900 ease-out opacity-0 animate-fade-in delay-200">
                  <div
                    className="border-l-4 border-l-blue-500 pl-4 cursor-pointer flex flex-col"
                    onClick={() =>
                      router.push(
                        `/acceso_publico/${company}/sms/encuesta/${surveyNumbers?.OMA_QUIZ}`
                      )
                    }
                  >
                    <StrategyCard
                      title="Trivia OMA"
                      description="Pon a prueba tus conocimientos en materia de Mantenimiento Aeronáutico."
                      className="hover:scale-105 h-full"
                    />
                  </div>

                  <div
                    className="border-l-4 border-l-blue-500 pl-4 flex flex-col cursor-pointer"
                    onClick={() => setIsConceptOpen(true)}
                  >
                    <StrategyCard
                      title="Terminos SMS"
                      description="Encontraras una Listas de Conceptos Relacionados al SMS."
                      className="h-full hover:scale-105 cursor-pointer"
                    />
                  </div>

                  {/* Diálogo Fuera del div clickeable */}
                  <SMSConceptsDialog
                    concepts={smsConcepts}
                    title="Glosario de Términos SMS"
                    description="Definiciones esenciales para comprender el Sistema de Gestión de Seguridad"
                    open={isConceptOpen}
                    onOpenChange={setIsConceptOpen}
                  />

                  <FeaturesDialog features={SMSresponsibilities}>
                    <div className="border-l-4 border-l-blue-500 pl-4 flex flex-col">
                      <StrategyCard
                        title="Responsabilidades SMS"
                        description="Responsabilidades del Personal en Materia de SMS"
                        className="h-full hover:scale-105 cursor-pointer"
                      />
                    </div>
                  </FeaturesDialog>

                  <div
                    className="border-l-4 border-l-blue-500 pl-4 cursor-pointer flex flex-col"
                    onClick={() =>
                      router.push(
                        `/acceso_publico/${company}/sms/encuesta/${surveyNumbers?.SMS_SURVEY}`
                      )
                    }
                  >
                    <StrategyCard
                      title="Encuestas SMS"
                      description="Tiene por objeto evaluar tus conocimientos en SMS"
                      className="hover:scale-105 h-full"
                    />
                  </div>

                  <div
                    className="border-l-4 border-l-blue-500 pl-4 cursor-pointer flex flex-col"
                    onClick={() =>
                      router.push(
                        `/acceso_publico/${company}/sms/encuesta/${surveyNumbers?.SMS_QUIZ}`
                      )
                    }
                  >
                    <StrategyCard
                      title="Trivia SMS"
                      description="Pon aprueba tus conocimientos en materia de SMS"
                      className="hover:scale-105 h-full"
                    />
                  </div>

                  <div
                    className="border-l-4 border-l-blue-500 pl-4 flex flex-col"
                    onClick={() =>
                      router.push(`/acceso_publico/${company}/sms/comunicados`)
                    }
                  >
                    <StrategyCard
                      title="Comunicados SMS"
                      description="Encontraras información referente a los boletines de SMS."
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
                <CardTitle className="text-lg sm:text-xl">
                  Plan de Respuesta Ante la Emergencia de{" "}
                  {company.toUpperCase()}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 text-sm sm:text-base">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
                  {emergencyPlans.map(
                    (
                      plan,
                      index // Quita el tipado : EmergencyPlan ya que TypeScript lo infiere
                    ) => (
                      <div
                        key={index}
                        className={`transition-all duration-500 ease-out opacity-0 animate-fade-in delay-${250 + index * 50}`}
                      >
                        <ActionPlanDialog
                          title={`Plan de Acción - ${plan.cardData.description.split(" ").slice(0, 3).join(" ")}`}
                          actionSteps={plan.actionSteps}
                        >
                          <CustomCard
                            imageUrl={plan.cardData.imageUrl}
                            imageAlt={plan.cardData.imageAlt}
                            title={plan.cardData.title}
                            description={plan.cardData.description}
                            actionLink={plan.cardData.actionLink}
                            className="h-full w-full"
                          />
                        </ActionPlanDialog>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </GuestContentLayout>
  );
};

export default SMSPage;
