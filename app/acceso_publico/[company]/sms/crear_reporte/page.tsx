"use client";

import { CreateGeneralVoluntaryReportForm } from "@/components/forms/aerolinea/sms/CreateGeneralVoluntaryReportForm";
import { GuestContentLayout } from "@/components/layout/GuestContentLayout";
import { Button } from "@/components/ui/button";

const SelectReportType = () => {
  return (
    <GuestContentLayout title="Seleccionar tipo de reporte">
      <div className="flex flex-col justify-center items-center gap-4">
        <h2 className="font-bold text-base">Selecciona el tipo de reporte que deseas crear</h2>
        <div className="flex flex-col gap-2">
          <Button variant={"outline"} className="w-full hover:scale-105 transition-all">
            Reporte Voluntario
          </Button>
        </div>
        <div className="flex flex-col gap-2">
          <Button variant={"outline"} className="w-full hover:scale-105 transition-all">
            Reporte Obligatorio
          </Button>
        </div>
      </div>
    </GuestContentLayout>
  );
};

export default SelectReportType;
