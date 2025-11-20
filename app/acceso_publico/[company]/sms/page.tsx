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
import {
  emergencyPlans,
  policyCardsData,
  policyImages,
  smsConcepts,
} from "@/lib/contants/sms-data";
import {
  FileText,
  Shield
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

  // Elimina estas variables locales ya que ahora las importas desde constants
  // const emergencyActionSteps = [ ... ];
  // const SMSresponsibilities = [ ... ];

  const SMSresponsibilities = [
    {
      image:
        "https://ccvnd3lo965z.share.zrok.io/storage/sms/images/risk_icon.png",
      title: "Responsabilidades SMS Dueños de Proceso",
      items: [
        "Mitigar los Riesgos",
        "Participar en los Simulacros de Emergencias",
        "Participar en las Actividades de SMS",
        "Contar con los Conocimientos de las Politicas",
      ],
    },
    {
      image:
        "https://ccvnd3lo965z.share.zrok.io/storage/sms/images/caution.png",
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
        {/* CARTA DE PRESENTACIÓN CON IMAGEN Y BOTONES */}
        <div className="w-full mb-8">
          <Card className="overflow-hidden border-0 shadow-lg">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Imagen */}
              <div className="relative h-64 lg:h-full min-h-[300px]">
                <Image
                  src="https://ccvnd3lo965z.share.zrok.io/storage/sms/images/LOGO_TMD.png" // o la imagen que prefieras
                  alt="Logo Transmandu"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-transparent lg:bg-gradient-to-r lg:from-blue-900/70 lg:to-transparent" />
                <div className="absolute bottom-4 left-4 lg:bottom-8 lg:left-8 text-white">
                  <h1 className="text-2xl lg:text-3xl font-bold mb-2">
                    Sistema de Gestión de Seguridad Operacional
                  </h1>
                  <p className="text-sm lg:text-base opacity-90 max-w-md">
                    Comprometidos con la excelencia operacional y la seguridad
                    de nuestros procesos
                  </p>
                </div>
              </div>

              {/* Contenido y botones */}
              <div className="p-6 lg:p-8 flex flex-col justify-center">
                <div className="space-y-4 mb-6">
                  <h2 className="text-xl lg:text-2xl font-semibold">
                    Bienvenido al Portal SMS
                  </h2>
                  <p className="text-sm lg:text-base">
                    Este sistema está diseñado para mantener los más altos
                    estándares de seguridad operacional en todas nuestras
                    actividades. Explora nuestras políticas, procedimientos y
                    recursos disponibles.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={() =>
                      router.push(
                        `https://sigeac-one.vercel.app/acceso_publico/${company}/sms/crear_reporte/voluntario`
                      )
                    }
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300"
                  >
                    <FileText className="w-4 h-4" />
                    Reporte Voluntario
                  </Button>

                  <Button
                    onClick={() =>
                      router.push(
                        `https://sigeac-one.vercel.app/acceso_publico/${company}/sms/crear_reporte/obligatorio`
                      )
                    }
                    variant="outline"
                    className="flex items-center gap-2 border-blue-600 text-blue-600 hover:bg-blue-50 transition-all duration-300"
                  >
                    <Shield className="w-4 h-4" />
                    Reporte Obligatorio
                  </Button>
                </div>

                {/* Información adicional */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">6</div>
                      <div className="text-xs ">Planes de Emergencia</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">4</div>
                      <div className="text-xs ">Áreas de Estrategia</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* TABS (el contenido existente) */}
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
                {/* Aplicar la animación al contenedor grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-stretch transition-all duration-500 ease-out opacity-0 animate-fade-in">
                  {policyCardsData.map((policy, index) => (
                    <div
                      key={index}
                      className="h-full" // Solo mantener h-full aquí
                    >
                      <PolicyCard
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
                      src="https://ccvnd3lo965z.share.zrok.io/storage/sms/images/sms_airplane_page.jpg"
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch transition-all duration-900 ease-out opacity-0 animate-fade-in delay-200">
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
                  {emergencyPlans.map((plan, index) => (
                    <div key={index} className="flex items-stretch">
                      <ActionPlanDialog
                        title={`Plan de Acción - ${plan.cardData.description}`}
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
        </Tabs>
      </div>
    </GuestContentLayout>
  );
};

export default SMSPage;
