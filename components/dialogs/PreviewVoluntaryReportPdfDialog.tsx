"use client";

import { useDeleteVoluntaryReport } from "@/actions/sms/reporte_voluntario/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import VoluntaryReportPdf from "../pdf/sms/VoluntaryReportPdf";
import { DangerIdentification, VoluntaryReport } from "@/types";
import { format } from "date-fns";
import { useGetDangerIdentificationWithAllById } from "@/hooks/sms/useGetDangerIdentificationWithAllById";

interface PreviewProps {
  title: string;
  voluntaryReport: VoluntaryReport;
}

export default function PreviewVoluntaryReportPdfDialog({
  title,
  voluntaryReport,
}: PreviewProps) {
  const [open, setOpen] = useState(false);
  const { data: dangerIdentification } = useGetDangerIdentificationWithAllById(
    voluntaryReport.danger_identification_id
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
              {voluntaryReport &&
              dangerIdentification &&
              dangerIdentification.analysis &&
              dangerIdentification.mitigation_plan &&
              dangerIdentification.mitigation_plan.analysis ? (
                <>
                  <PDFViewer style={{ width: "100%", height: "60%" }}>
                    <VoluntaryReportPdf
                      report={voluntaryReport}
                      identification={dangerIdentification}
                    />
                  </PDFViewer>
                </>
              ) : (
                <>
                  <PDFViewer style={{ width: "100%", height: "60%" }}>
                    <VoluntaryReportPdf report={voluntaryReport} />
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
