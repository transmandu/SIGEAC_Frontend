"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCompanyStore } from "@/stores/CompanyStore";
import { MitigationMeasure } from "@/types";
import Link from "next/link";

interface MeasuresCellProps {
  measures: MitigationMeasure[];
  planId?: string | number;
}

// MeasuresCell.tsx - VERSIÓN CORREGIDA
export const MeasuresCell = ({ measures, planId }: MeasuresCellProps) => {
  const { selectedCompany } = useCompanyStore();
  const safeMeasures = measures || [];

  // Solo renderizar si hay medidas
  if (safeMeasures.length === 0) {
    return (
      <div className="flex justify-center">
        <span className="text-gray-500 text-sm">Sin medidas</span>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="min-w-[100px] md:min-w-[120px]"
          >
            <span className="flex items-center gap-1 md:gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              <span className="hidden sm:inline">
                {safeMeasures.length} medida
                {safeMeasures.length !== 1 ? "s" : ""}
              </span>
              <span className="sm:hidden">{safeMeasures.length}</span>
            </span>
          </Button>
        </DialogTrigger>

        <DialogContent className="w-[95vw] max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              Medidas de Mitigación ({safeMeasures.length})
            </DialogTitle>
            <DialogDescription>
              Lista de medidas asociadas a este plan.
            </DialogDescription>
          </DialogHeader>

          <Card className="p-4 rounded-lg shadow-sm">
            <div className="space-y-3">
              {safeMeasures.map((measure) => (
                <div key={measure.id} className="p-3 ">
                  <p className="font-medium">{measure.description}</p>
                  <p className="text-sm text-gray-600">
                    Supervisor: {measure.implementation_supervisor}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <Button className=" w-1/6" variant="outline">
                <Link
                  href={`/${selectedCompany?.slug}/sms/gestion_reportes/planes_de_mitigacion/${planId}/medidas`}
                >
                  Ver mas
                </Link>
              </Button>
            </div>
          </Card>
        </DialogContent>
      </Dialog>
    </div>
  );
};
