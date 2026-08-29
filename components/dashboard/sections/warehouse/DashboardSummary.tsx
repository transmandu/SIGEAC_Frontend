"use client";

import { BarChart3 } from "lucide-react";
import {
  Card,
  CardHeader,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { ActionTriggerButton } from "@/components/misc/ActionTriggerButton";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface DashboardSummaryProps {
  companySlug: string;
}

/* =========================
   CARD TINTADO (BLUE)
   ========================= */
function TintedCard({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: string;
}) {
  return (
    <Card
      className="relative overflow-hidden rounded-2xl sm:rounded-3xl border bg-background/70 backdrop-blur-xl shadow-sm"
      style={{
        borderColor: `rgba(${tone}, 0.22)`,
        backgroundImage: `linear-gradient(to bottom right, rgba(${tone}, 0.06), transparent 60%)`,
      }}
    >
      {children}
    </Card>
  );
}

export default function DashboardSummary({
  companySlug,
}: DashboardSummaryProps) {
  const router = useRouter();

  const blueTone = "37,99,235";



  return (
    <div className="mt-10 sm:mt-16">
      {/* ================= BIENVENIDA ================= */}
      <div className="text-center mb-10 sm:mb-16 px-2">
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 leading-tight">
          Bienvenido a{" "}
          <span className="text-blue-600 block italic">SIGEAC</span>
        </h1>

        <p className="text-sm sm:text-lg max-w-xl sm:max-w-3xl mx-auto leading-relaxed text-slate-600 dark:text-slate-300">
          Plataforma integral enfocada en la gestión operativa del inventario
          aeronáutico y el control estructurado de recursos críticos dentro del
          sistema.
        </p>
      </div>

      {/* ================= CTA ================= */}
      <div className="flex justify-center mb-12 sm:mb-16 px-2">
        <div className="w-full max-w-md sm:max-w-lg">
          <TintedCard tone={blueTone}>
            <CardHeader className="pb-4 text-center space-y-3 sm:space-y-4">

              <div className="flex justify-center">
                <div className="p-2 sm:p-2.5 rounded-xl bg-blue-500/10 text-blue-600">
                  <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
              </div>

              <CardTitle className="text-lg sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                Consulta de Inventario
              </CardTitle>

              <CardDescription className="mx-auto max-w-xs sm:max-w-md text-xs sm:text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                Acceda al sistema completo de gestión de inventario aeronáutico
              </CardDescription>

            </CardHeader>

            <CardContent className="flex justify-center pb-6 sm:pb-8">

              <ActionTriggerButton className="w-full sm:w-auto px-5 sm:px-6 min-w-0 sm:min-w-[220px]">
                Ver Inventario Completo
              </ActionTriggerButton>

            </CardContent>
          </TintedCard>
        </div>
      </div>
    </div>
  );
}