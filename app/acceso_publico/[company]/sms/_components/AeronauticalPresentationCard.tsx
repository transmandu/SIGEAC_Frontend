import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FileText, Shield } from 'lucide-react';
import { Card } from '@/components/ui/card'; // Ajusta la ruta según tu proyecto
import { Button } from '@/components/ui/button'; // Ajusta la ruta según tu proyecto

interface PresentationCardProps {
    company: string;
}

const AeronauticalPresentationCard = ({ company }: PresentationCardProps) => {
    const router = useRouter();
    const storageBaseUrl = process.env.NEXT_PUBLIC_STORAGE_BASE_URL;

    return (
        <div className="w-full mb-8">
            {/* CARTA DE PRESENTACIÓN CON IMAGEN Y BOTONES */}
            <Card className="overflow-hidden border-0 shadow-lg">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Sección de Imagen */}
                    <div className="relative h-64 lg:h-full min-h-[300px]">
                        <Image
                            src={`${storageBaseUrl}images/sms/h74_sms_logo.png`}
                            alt="Logo SMS Hangar 74"
                            fill
                            className="object-cover"
                            priority
                        />
                        {/* Overlay gradiente para legibilidad */}
                    </div>

                    {/* Contenido y botones */}
                    <div className="p-6 lg:p-8 flex flex-col justify-center">
                        <div className="space-y-4 mb-6">
                            <h2 className="text-xl lg:text-2xl font-semibold">
                                THIS IS FUCKING OMAC MF Bienvenido al Portal SMS
                            </h2>
                            <p className="text-sm lg:text-base text-muted-foreground">
                                Este sistema está diseñado para mantener los más altos
                                estándares de seguridad operacional en todas nuestras
                                actividades. Explora nuestras políticas, procedimientos y
                                recursos disponibles.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button
                                onClick={() =>
                                    router.push(`/acceso_publico/${company}/sms/crear_reporte/voluntario`)
                                }
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300"
                            >
                                <FileText className="w-4 h-4" />
                                Reporte Voluntario
                            </Button>

                            <Button
                                onClick={() =>
                                    router.push(`/acceso_publico/${company}/sms/crear_reporte/obligatorio`)
                                }
                                variant="outline"
                                className="flex items-center gap-2 border-blue-600 text-blue-600 hover:bg-blue-50 transition-all duration-300"
                            >
                                <Shield className="w-4 h-4" />
                                Reporte Obligatorio
                            </Button>
                        </div>

                        {/* Información adicional (Stats) */}
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div>
                                    <div className="text-2xl font-bold text-blue-600">6</div>
                                    <div className="text-xs text-muted-foreground">Planes de Emergencia</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-blue-600">4</div>
                                    <div className="text-xs text-muted-foreground">Áreas de Estrategia</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default AeronauticalPresentationCard;
