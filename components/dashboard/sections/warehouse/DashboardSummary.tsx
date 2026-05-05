"use client";

import { BarChart3 } from "lucide-react";
import {
  Card,
  CardHeader,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [hovered, setHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!hovered) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPos({ x, y });
  };

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

              <Button
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                onMouseMove={handleMouseMove}
                onClick={() =>
                  router.push(
                    `/${companySlug}/almacen/inventario_articulos`
                  )
                }
                className="
                  relative overflow-hidden
                  w-full sm:w-auto
                  px-5 sm:px-6
                  h-10 sm:h-auto
                  min-w-0 sm:min-w-[220px]
                  border border-dashed border-blue-400/50 dark:border-blue-300/30
                  bg-background/70 backdrop-blur
                  text-blue-700 dark:text-blue-300
                  text-sm sm:text-base
                  font-medium tracking-wide
                  shadow-sm transition-all duration-200
                  hover:border-blue-500/60 dark:hover:border-blue-300/50
                  hover:bg-blue-50/40 dark:hover:bg-blue-950/20
                  hover:shadow-md hover:-translate-y-[1px]
                  active:translate-y-0 active:shadow-sm
                  focus-visible:ring-2 focus-visible:ring-blue-500/25 focus-visible:ring-offset-2
                  hover:text-slate-900 dark:hover:text-white
                  before:absolute before:inset-0 before:pointer-events-none
                  before:transition-opacity before:duration-300
                "
                style={{
                  backgroundImage: hovered
                    ? `radial-gradient(circle at ${pos.x}% ${pos.y}%, rgba(59,130,246,0.10), transparent 65%)`
                    : "none",
                }}
              >
                Ver Inventario Completo
              </Button>

            </CardContent>
          </TintedCard>
        </div>
      </div>
    </div>
  );
}