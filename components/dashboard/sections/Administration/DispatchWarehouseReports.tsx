"use client";

import { FileBarChart2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DispatchReportDialog } from "@/components/dialogs/mantenimiento/almacen/DispatchReportDialog";

interface DispatchWarehouseReportsProps {
  companySlug: string;
  location_id: string;
  user: any;
  roleNames: string[];
}

export default function DispatchWarehouseReports({
  companySlug,
}: DispatchWarehouseReportsProps) {
  return (
    <div className="flex justify-center items-center py-10">
      <Card className="w-full max-w-md shadow-sm">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <FileBarChart2 className="h-5 w-5 text-white" />
            </div>
          </div>

          <CardTitle className="text-lg">
            Reporte de Salidas de Almacén
          </CardTitle>

          <CardDescription>
            Genera reportes generales o filtrados por aeronave según el rango
            de fechas seleccionado.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex justify-center pt-4">
          <DispatchReportDialog />
        </CardContent>
      </Card>
    </div>
  );
}