"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import QRGenerator from "@/components/misc/QRGenerator";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useIsOmac } from "@/hooks/sistema/useIsOmac";
import { useEffect } from "react";
import { useTourContext } from "@/components/tour/TourProvider";
import { qrSteps } from "@/components/tour/steps/general/sms/qr";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const QrCodePage = () => {
  const { selectedCompany } = useCompanyStore();

  const qrValueReport = `${process.env.NEXT_PUBLIC_URL}acceso_publico/${selectedCompany?.slug}/sms/crear_reporte`;
  const qrSMSPage = `${process.env.NEXT_PUBLIC_URL}acceso_publico/${selectedCompany?.slug}/sms`;
  const { data: isOMAC } = useIsOmac(selectedCompany?.slug);
  const { registerTour, unregisterTour } = useTourContext();
  const qrColor = isOMAC ? "#FFC800" : "#1F7FDB";

  useEffect(() => {
    registerTour("codigos-qr", "Códigos QR", qrSteps);
    return () => unregisterTour("codigos-qr");
  }, [registerTour, unregisterTour]);

  return (
    <ContentLayout title="Códigos QR">
      <PageHeader className="mb-6" />

      <h1
        className="text-center text-base font-bold text-foreground sm:text-xl"
        data-tour="qr-header"
      >
        Códigos QR
      </h1>

      <div className="mt-10 flex w-full justify-center px-4 sm:px-6 lg:px-8">
        <div className="grid w-full max-w-4xl grid-cols-1 items-stretch justify-items-center gap-6 md:grid-cols-2">
          {/* QR Reporte Único */}
          <Card
            className="flex min-w-0 w-full max-w-sm flex-col border-border/60"
            data-tour="qr-reportes"
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-center text-base">
                Generar Reportes de SMS
              </CardTitle>
              <CardDescription className="text-center text-xs">
                Acceso directo para crear reportes de seguridad
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col items-center justify-center gap-4">
              <QRGenerator
                value={qrValueReport}
                fileName={`crear-reporte-sms-${selectedCompany?.slug}`}
                bgColor="#FFF"
                outerColor="#000000"
                innerColor={qrColor}
                moduleColor={qrColor}
                showLink={true}
                showDownloadButton={true}
                size={300}
                buttonDataTour="qr-reportes-download"
                linkDataTour="qr-reportes-link"
              />
            </CardContent>
          </Card>

          {/* QR Página SMS */}
          <Card
            className="flex min-w-0 w-full max-w-sm flex-col border-border/60"
            data-tour="qr-pagina-sms"
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-center text-base">
                Página de SMS
              </CardTitle>
              <CardDescription className="text-center text-xs">
                Acceso directo a la página de SMS de la empresa
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col items-center justify-center gap-4">
              <QRGenerator
                value={qrSMSPage}
                fileName={`pagina-sms-${selectedCompany?.slug}`}
                bgColor="#FFF"
                outerColor="#000000"
                innerColor={qrColor}
                moduleColor="#000000"
                showLink={true}
                showDownloadButton={true}
                size={300}
                buttonDataTour="qr-pagina-sms-download"
                linkDataTour="qr-pagina-sms-link"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </ContentLayout>
  );
};

export default QrCodePage;
