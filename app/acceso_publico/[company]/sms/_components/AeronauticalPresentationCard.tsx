"use client";

import Image from "next/image";

interface PresentationCardProps {
    company: string;
}

const AeronauticalPresentationCard = ({ company }: PresentationCardProps) => {
    const storageBaseUrl = process.env.NEXT_PUBLIC_STORAGE_BASE_URL;

    return (
        <section className="mb-8 w-full">
            <div className="relative overflow-hidden rounded-[2rem] border border-border/60 shadow-2xl">
                <div className="relative h-[380px] w-full sm:h-[520px] lg:h-[700px]">
                    <Image
                        src={`${storageBaseUrl}images/sms/sms_airplane_page.png`}
                        alt="Portada del Sistema de Gestión de Seguridad Operacional"
                        fill
                        priority
                        className="object-cover object-center"
                    />

                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950/30 via-transparent to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-transparent" />

                    <div className="absolute left-5 top-5 sm:left-8 sm:top-8 lg:left-12 lg:top-12">
                        <div className="inline-flex items-center rounded-full border border-white/15 bg-slate-950/35 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.24em] text-white/90 backdrop-blur-md">
                            Portal SMS Aeronáutico
                        </div>
                    </div>

                    <div className="absolute bottom-5 left-5 right-5 sm:bottom-8 sm:left-8 sm:right-8 lg:bottom-12 lg:left-auto lg:right-12">
                        <div className="max-w-md rounded-[1.75rem] border border-white/12 bg-slate-950/40 p-5 text-white shadow-2xl backdrop-blur-md sm:p-6">
                            <p className="text-[11px] uppercase tracking-[0.22em] text-slate-200">
                                {company.toUpperCase()}
                            </p>
                            <h1 className="mt-2 text-2xl font-semibold leading-tight sm:text-3xl">
                                Sistema de Gestión de Seguridad Operacional
                            </h1>
                            <p className="mt-3 text-sm leading-6 text-slate-200">
                                Una presencia visual más limpia para que la portada sea el centro
                                de atención.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AeronauticalPresentationCard;
