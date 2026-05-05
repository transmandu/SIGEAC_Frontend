"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
    AlertTriangle,
    ArrowRight,
    BookOpen,
    Building2,
    ChevronLeft,
    ChevronRight,
    Eye,
    FileText,
    Shield,
    ShieldCheck,
    Target,
    Users,
} from "lucide-react";

import { CustomCard } from "@/components/cards/CustomCard";
import { PolicyCard } from "@/components/cards/PolicyCard";
import { StrategyCard } from "@/components/cards/StrategyCard";
import ActionPlanDialog from "@/components/dialogs/aerolinea/sms/ActionPlanDialog";
import FeaturesDialog from "@/components/dialogs/aerolinea/sms/FeaturedDialog";
import { SMSConceptsDialog } from "@/components/dialogs/aerolinea/sms/SMSConceptsDialog";
import { ImageGalleryDialog } from "@/components/dialogs/general/ImageGalleryDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
    AeronauticalpolicyImages,
    emergencyPlans,
    policyCardsData,
    smsConcepts,
} from "@/lib/constants/sms-data";

interface SMSTabsProps {
    company: string;
    surveyNumbers: any;
}

const tabItems = [
    { value: "empresa", label: "Empresa y políticas", icon: Building2 },
    { value: "estrategias", label: "Estrategias", icon: Target },
    { value: "plan-respuesta", label: "Plan de respuesta", icon: AlertTriangle },
    { value: "galeria", label: "Galería", icon: BookOpen },
    { value: "personal-clave", label: "Personal clave", icon: Users },
];

export const AeronauticalSMSTabs = ({ company, surveyNumbers }: SMSTabsProps) => {
    const router = useRouter();
    const [isConceptOpen, setIsConceptOpen] = useState(false);
    const [galleryIndex, setGalleryIndex] = useState(0);
    const storageBaseUrl = process.env.NEXT_PUBLIC_STORAGE_BASE_URL;

    const responsibilities = [
        {
            image: `${storageBaseUrl}images/sms/risk_icon.png`,
            title: "Responsabilidades SMS Dueños de Proceso",
            items: [
                "Mitigar los riesgos identificados.",
                "Participar en simulacros y actividades SMS.",
                "Aplicar y divulgar las políticas de seguridad.",
                "Promover acciones preventivas en su área.",
            ],
        },
        {
            image: `${storageBaseUrl}images/sms/caution.png`,
            title: "Responsabilidades SMS Resto del Personal",
            items: [
                "Identificar peligros y reportarlos oportunamente.",
                "Participar en simulacros y actividades SMS.",
                "Conocer y cumplir las políticas vigentes.",
                "Mantener una actuación segura y colaborativa.",
            ],
        },
    ];

    const companyGallery = useMemo(
        () => [
            {
                src: `${storageBaseUrl}images/sms/sms_airplane_page.jpg`,
                alt: "Operaciones aeronáuticas y cultura de seguridad",
            },
            ...AeronauticalpolicyImages,
            {
                src: `${storageBaseUrl}images/sms/h74_sms_logo.png`,
                alt: "Identidad visual del portal SMS aeronáutico",
            },
            {
                src: `${storageBaseUrl}images/sms/LOGO.png`,
                alt: "Imagen institucional del sistema SMS",
            },
        ],
        [storageBaseUrl]
    );

    const corporatePillars = [
        {
            icon: Building2,
            title: "Misión",
            description:
                "Proveer servicios de transporte aéreo de alta calidad, garantizando seguridad, puntualidad y excelencia operativa con impacto sostenible.",
        },
        {
            icon: Eye,
            title: "Visión",
            description:
                "Consolidarnos como referencia nacional e internacional en servicios aéreos, distinguidos por innovación, calidad y seguridad operacional.",
        },
        {
            icon: ShieldCheck,
            title: "Compromiso SMS",
            description:
                "Promovemos una cultura justa, no punitiva y enfocada en prevención, aprendizaje y mejora continua en todos los niveles.",
        },
    ];

    const reportActions = [
        {
            title: "Reporte voluntario",
            description:
                "Comunica situaciones, riesgos o hallazgos de forma preventiva.",
            icon: FileText,
            onClick: () =>
                router.push(`/acceso_publico/${company}/sms/crear_reporte/voluntario`),
            className: "bg-yellow-500 text-slate-950 hover:bg-yellow-400",
        },
        {
            title: "Reporte obligatorio",
            description:
                "Registra eventos que requieren trazabilidad formal y seguimiento.",
            icon: Shield,
            onClick: () =>
                router.push(`/acceso_publico/${company}/sms/crear_reporte/obligatorio`),
            className:
                "border border-yellow-500/40 bg-background hover:bg-yellow-500/10",
        },
    ];

    const keyPersonnel = [
        {
            initials: "DE",
            role: "Director de Emergencia",
            tag: "Coordinación crítica",
            description:
                "Coordina la respuesta integral, activa los protocolos y lidera la toma de decisiones durante eventos críticos.",
            image: `${storageBaseUrl}images/sms/h74_sms_logo.png`,
        },
        {
            initials: "SMS",
            role: "Responsable del Sistema SMS",
            tag: "Gestión del sistema",
            description:
                "Supervisa la cultura de reporte, el análisis de riesgos y la mejora continua de la seguridad operacional.",
            image: `${storageBaseUrl}images/sms/LOGO.png`,
        },
        {
            initials: "OPS",
            role: "Jefatura de Operaciones",
            tag: "Control operacional",
            description:
                "Asegura la ejecución segura de las operaciones y la alineación del personal con los estándares operacionales.",
            image: `${storageBaseUrl}images/sms/sms_airplane_page.jpg`,
        },
        {
            initials: "MNT",
            role: "Jefatura de Mantenimiento",
            tag: "Soporte técnico",
            description:
                "Garantiza la condición aeronavegable, la prevención técnica y la trazabilidad de las acciones correctivas.",
            image: `${storageBaseUrl}images/sms/risk_icon.png`,
        },
    ];

    const currentGalleryImage = companyGallery[galleryIndex];

    const previousGalleryImage = () => {
        setGalleryIndex((prev) => (prev - 1 + companyGallery.length) % companyGallery.length);
    };

    const nextGalleryImage = () => {
        setGalleryIndex((prev) => (prev + 1) % companyGallery.length);
    };

    return (
        <Tabs defaultValue="empresa" className="w-full">
            <TabsList className="grid h-auto w-full grid-cols-2 gap-2 rounded-3xl border border-border/60 bg-muted/50 p-2 lg:grid-cols-5">
                {tabItems.map((tab) => {
                    const Icon = tab.icon;

                    return (
                        <TabsTrigger
                            key={tab.value}
                            value={tab.value}
                            className="flex min-h-12 items-center justify-center gap-2 rounded-2xl px-3 py-3 text-xs sm:text-sm"
                        >
                            <Icon className="h-4 w-4 flex-shrink-0" />
                            <span>{tab.label}</span>
                        </TabsTrigger>
                    );
                })}
            </TabsList>

            <TabsContent value="empresa" className="mt-6 space-y-6">
                <div className="space-y-6">
                    <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
                        <Card className="overflow-hidden border-border/60 bg-background/95 shadow-lg">
                            <CardContent className="space-y-8 p-5 sm:p-6 lg:p-8">
                                <div className="space-y-5">
                                    <Badge
                                        variant="warning"
                                        className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.2em]"
                                    >
                                        Cultura organizacional
                                    </Badge>

                                    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
                                        <div className="space-y-4">
                                            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl xl:text-4xl">
                                                Identidad corporativa y lineamientos del sistema
                                            </h2>
                                            <p className="text-sm leading-7 text-muted-foreground sm:text-base">
                                                Una composición más amplia para presentar misión,
                                                visión y principios SMS con mejor lectura y mejor
                                                aprovechamiento del espacio horizontal.
                                            </p>
                                        </div>


                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-3">
                                    {corporatePillars.map((pillar) => {
                                        const Icon = pillar.icon;

                                        return (
                                            <Card
                                                key={pillar.title}
                                                className="border-border/60 bg-gradient-to-br from-background via-background to-muted/40"
                                            >
                                                <CardContent className="space-y-4 p-5">
                                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-yellow-500/15 text-yellow-600 dark:text-yellow-400">
                                                        <Icon className="h-5 w-5" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <h3 className="text-base font-semibold">
                                                            {pillar.title}
                                                        </h3>
                                                        <p className="text-sm leading-6 text-muted-foreground">
                                                            {pillar.description}
                                                        </p>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-border/60 bg-gradient-to-br from-muted/20 via-background to-background shadow-lg">
                            <CardHeader className="space-y-2">
                                <CardTitle className="text-xl">
                                    Reportes de seguridad
                                </CardTitle>
                                <p className="text-sm leading-6 text-muted-foreground">
                                    Accesos directos para iniciar reportes desde un bloque más
                                    compacto y equilibrado.
                                </p>
                            </CardHeader>
                            <CardContent className="grid gap-3">
                                {reportActions.map((action) => {
                                    const Icon = action.icon;

                                    return (
                                        <button
                                            key={action.title}
                                            type="button"
                                            onClick={action.onClick}
                                            className={`group rounded-2xl p-4 text-left transition-all ${action.className}`}
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="space-y-2">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950/10 text-current">
                                                        <Icon className="h-5 w-5" />
                                                    </div>
                                                    <p className="font-semibold">
                                                        {action.title}
                                                    </p>
                                                    <p className="text-sm leading-6 text-current/80">
                                                        {action.description}
                                                    </p>
                                                </div>
                                                <ArrowRight className="mt-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                            </div>
                                        </button>
                                    );
                                })}
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="border-border/60 bg-muted/20 shadow-lg">
                        <CardHeader className="space-y-2">
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <BookOpen className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                                Política de seguridad operacional
                            </CardTitle>
                            <p className="text-sm leading-6 text-muted-foreground">
                                Principios rectores de una operación segura, justa y enfocada
                                en la gestión de riesgos.
                            </p>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                                {policyCardsData.map((policy, index) => (
                                    <PolicyCard
                                        key={`${policy.description}-${index}`}
                                        index={index}
                                        icon={policy.icon}
                                        description={policy.description}
                                        className="h-full border border-border/60 bg-background/90 shadow-sm"
                                    />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>

            <TabsContent value="galeria" className="mt-6 space-y-4">
                <Card className="border-border/60 shadow-lg">
                    <CardHeader className="space-y-2">
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <BookOpen className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                            Galería institucional
                        </CardTitle>
                        <p className="text-sm leading-6 text-muted-foreground">
                            Un carrusel visual para recorrer la identidad del portal, su entorno
                            operativo y referencias institucionales.
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div className="overflow-hidden rounded-[1.75rem] border border-border/60 bg-muted/20">
                            <div className="relative h-[280px] sm:h-[380px] lg:h-[460px]">
                                <Image
                                    src={currentGalleryImage.src}
                                    alt={currentGalleryImage.alt}
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 text-white">
                                    <div className="max-w-2xl space-y-2">
                                        <p className="text-xs uppercase tracking-[0.2em] text-slate-200">
                                            {galleryIndex + 1} / {companyGallery.length}
                                        </p>
                                        <p className="text-lg font-semibold sm:text-2xl">
                                            {currentGalleryImage.alt}
                                        </p>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            size="icon"
                                            variant="secondary"
                                            className="h-10 w-10 rounded-full bg-white/15 text-white hover:bg-white/25"
                                            onClick={previousGalleryImage}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            size="icon"
                                            variant="secondary"
                                            className="h-10 w-10 rounded-full bg-white/15 text-white hover:bg-white/25"
                                            onClick={nextGalleryImage}
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-4 gap-3 p-3">
                                {companyGallery.map((image, index) => (
                                    <button
                                        key={`${image.alt}-${index}`}
                                        type="button"
                                        onClick={() => setGalleryIndex(index)}
                                        className={`relative h-16 overflow-hidden rounded-2xl border sm:h-20 ${index === galleryIndex
                                            ? "border-yellow-500 ring-2 ring-yellow-500/40"
                                            : "border-border/60 opacity-70 hover:opacity-100"
                                            }`}
                                    >
                                        <Image
                                            src={image.src}
                                            alt={image.alt}
                                            fill
                                            className="object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <ImageGalleryDialog
                            images={companyGallery}
                            trigger={
                                <Button className="w-full bg-yellow-500 text-slate-950 hover:bg-yellow-400 sm:w-auto">
                                    Ver galería completa
                                </Button>
                            }
                        />
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="personal-clave" className="mt-6 space-y-4">
                <Card className="border-border/60 shadow-lg">
                    <CardHeader className="space-y-2">
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <Users className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                            Personal clave
                        </CardTitle>
                        <p className="text-sm leading-6 text-muted-foreground">
                            Tarjetas preparadas para fotos de personas, con marco circular y una
                            presencia visual más ejecutiva.
                        </p>
                    </CardHeader>
                    <CardContent className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                        {keyPersonnel.map((person) => (
                            <Card
                                key={person.role}
                                className="border-border/60 bg-gradient-to-b from-background to-muted/30 shadow-sm"
                            >
                                <CardContent className="flex h-full flex-col items-start p-6">
                                    <div className="relative mb-5 self-center xl:self-start">
                                        <div className="absolute inset-0 rounded-full bg-yellow-500/20 blur-xl" />
                                        <div className="relative rounded-full border-4 border-yellow-500/25 p-1 shadow-lg">
                                            <Avatar className="h-28 w-28 border-4 border-background shadow-md">
                                                <AvatarImage
                                                    src={person.image}
                                                    alt={person.role}
                                                    className="object-cover"
                                                />
                                                <AvatarFallback className="bg-yellow-500/15 text-lg font-semibold text-yellow-700 dark:text-yellow-300">
                                                    {person.initials}
                                                </AvatarFallback>
                                            </Avatar>
                                        </div>
                                    </div>

                                    <Badge
                                        variant="outline"
                                        className="mb-3 rounded-full border-yellow-500/30 bg-yellow-500/10 px-3 py-1"
                                    >
                                        {person.tag}
                                    </Badge>

                                    <h3 className="text-base font-semibold">{person.role}</h3>
                                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                                        {person.description}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="estrategias" className="mt-6 space-y-4">
                <Card className="min-h-[300px] border-border/60 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-lg sm:text-xl">
                            Estrategias de seguridad operacional
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm sm:text-base">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div
                                className="flex cursor-pointer flex-col rounded-2xl border-l-4 border-l-yellow-500 pl-4"
                                onClick={() => setIsConceptOpen(true)}
                            >
                                <StrategyCard
                                    title="Términos SMS"
                                    description="Glosario esencial para comprender el lenguaje operativo y preventivo del sistema."
                                    className="h-full cursor-pointer border border-border/60 bg-background hover:scale-[1.02]"
                                />
                            </div>

                            <SMSConceptsDialog
                                concepts={smsConcepts}
                                title="Glosario de Términos SMS"
                                description="Definiciones esenciales para comprender el Sistema de Gestión de Seguridad"
                                open={isConceptOpen}
                                onOpenChange={setIsConceptOpen}
                            />

                            <FeaturesDialog features={responsibilities}>
                                <div className="flex flex-col rounded-2xl border-l-4 border-l-yellow-500 pl-4">
                                    <StrategyCard
                                        title="Responsabilidades SMS"
                                        description="Funciones clave del personal para sostener una operación segura y alineada con el SMS."
                                        className="h-full cursor-pointer border border-border/60 bg-background hover:scale-[1.02]"
                                    />
                                </div>
                            </FeaturesDialog>

                            <div
                                className="flex w-full cursor-pointer flex-col rounded-2xl border-l-4 border-l-yellow-500 pl-4"
                                onClick={() =>
                                    router.push(
                                        `/acceso_publico/${company}/sms/encuesta/${surveyNumbers?.SMS_SURVEY}`
                                    )
                                }
                            >
                                <StrategyCard
                                    title="Encuestas SMS"
                                    description="Evalúa conocimientos, percepción y madurez de la cultura de seguridad."
                                    className="h-full border border-border/60 bg-background hover:scale-[1.02]"
                                />
                            </div>

                            <div
                                className="flex w-full cursor-pointer flex-col rounded-2xl border-l-4 border-l-yellow-500 pl-4"
                                onClick={() =>
                                    router.push(
                                        `/acceso_publico/${company}/sms/encuesta/${surveyNumbers?.SMS_QUIZ}`
                                    )
                                }
                            >
                                <StrategyCard
                                    title="Trivia SMS"
                                    description="Pon a prueba conocimientos clave sobre prevención, reporte y respuesta."
                                    className="h-full border border-border/60 bg-background hover:scale-[1.02]"
                                />
                            </div>

                            <div
                                className="flex flex-col rounded-2xl border-l-4 border-l-yellow-500 pl-4 sm:col-span-2"
                                onClick={() =>
                                    router.push(`/acceso_publico/${company}/sms/comunicados`)
                                }
                            >
                                <StrategyCard
                                    title="Comunicados SMS"
                                    description="Accede a boletines, avisos y comunicaciones preventivas relevantes para toda la organización."
                                    className="h-full cursor-pointer border border-border/60 bg-background hover:scale-[1.02]"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="plan-respuesta" className="mt-6 space-y-4">
                <Card className="min-h-[300px] border-border/60 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-sm sm:text-xl">
                            Plan de respuesta ante la emergencia de {company.toUpperCase()}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm sm:text-base">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
        </Tabs>
    );
};
