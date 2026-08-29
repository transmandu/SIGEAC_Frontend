"use client";

import { Shirt } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UniformReportDialog } from "@/components/dialogs/aerolinea/administracion/UniformReportDialog";

function TintedCard({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: string;
}) {
  return (
    <Card
      className="relative w-full max-w-lg overflow-hidden rounded-3xl border bg-background/70 backdrop-blur-xl shadow-sm shadow-black/5"
      style={{
        borderColor: `rgba(${tone}, 0.18)`,
        backgroundImage: `linear-gradient(to bottom right, rgba(${tone}, 0.05), transparent 65%)`,
      }}
    >
      {children}
    </Card>
  );
}

export const ReporteUniformesTab = () => {
  const skyTone = "14,165,233";

  return (
    <div className="flex justify-center items-center py-10">
      <TintedCard tone={skyTone}>
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-28"
          style={{
            background:
              "radial-gradient(120% 80% at 50% 0%, rgba(14,165,233,0.08), transparent 72%)",
          }}
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-400/[0.02] via-transparent to-transparent" />

        <CardHeader className="relative text-center space-y-5 pb-6">
          <div className="flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500 dark:text-sky-300 ring-1 ring-sky-500/10">
              <Shirt className="h-5 w-5" />
            </div>
          </div>

          <div className="space-y-2">
            <CardTitle className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Reporte de Uniformes
            </CardTitle>

            <CardDescription className="mx-auto max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Genere un reporte PDF de los movimientos de dotación de uniformes por empleado o persona externa.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="relative flex justify-center pt-2 pb-8">
          <UniformReportDialog />
        </CardContent>
      </TintedCard>
    </div>
  );
};
