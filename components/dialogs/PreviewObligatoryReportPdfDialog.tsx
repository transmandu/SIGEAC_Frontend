"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { useGetDangerIdentificationWithAllById } from "@/hooks/sms/useGetDangerIdentificationWithAllById";
import { ObligatoryReport } from "@/types";
import { PDFViewer } from "@react-pdf/renderer";
import { useState } from "react";
import ObligatoryReportPdf from "../pdf/sms/ObligatoryReportPdf";

interface PreviewProps {
  title: string;
  obligatoryReport: ObligatoryReport;
}

export default function PreviewVoluntaryReportPdfDialog({
  title,
  obligatoryReport,
}: PreviewProps) {
  const [open, setOpen] = useState(false);
  const { data: dangerIdentification } = useGetDangerIdentificationWithAllById(
    obligatoryReport.danger_identification.id
  );
  return (
    <>
      <Card className="flex">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => setOpen(true)}
              variant="outline"
              size="sm"
              className=" hidden h-8 lg:flex"
            >
              {title}
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[65%] max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Vista Previa del Reporte</DialogTitle>
              <DialogDescription>
                Revisa el reporte antes de descargarlo.
              </DialogDescription>
            </DialogHeader>
            <div className="w-full h-screen">
              {obligatoryReport &&
              dangerIdentification &&
              dangerIdentification.analysis &&
              dangerIdentification.mitigation_plan &&
              dangerIdentification.mitigation_plan.analysis ? (
                <>
                  <PDFViewer style={{ width: "100%", height: "60%" }}>
                    <ObligatoryReportPdf
                      report={obligatoryReport}
                      identification={dangerIdentification}
                    />
                  </PDFViewer>
                </>
              ) : (
                <>
                  <PDFViewer style={{ width: "100%", height: "60%" }}>
                    <ObligatoryReportPdf report={obligatoryReport} />
                  </PDFViewer>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </Card>
    </>
  );
}
