"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import QRGenerator from "@/components/misc/QRGenerator";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useEffect } from "react";
import { useTourContext } from "@/components/tour/TourProvider";
import { qrSteps } from "@/components/tour/steps/general/sms/qr";

const QrCodePage = () => {
  const { selectedCompany } = useCompanyStore();

  const qrValueReport = `${process.env.NEXT_PUBLIC_URL}acceso_publico/${selectedCompany?.slug}/sms/crear_reporte`;
  const qrSMSPage = `${process.env.NEXT_PUBLIC_URL}acceso_publico/${selectedCompany?.slug}/sms`;
  const { registerTour, unregisterTour } = useTourContext();

  useEffect(() => {
    registerTour("codigos-qr", "Códigos QR", qrSteps);
    return () => unregisterTour("codigos-qr");
  }, [registerTour, unregisterTour]);

  return (
    <ContentLayout title="Códigos QR">
      {/* CONTENEDOR PRINCIPAL RESPONSIVE Y CENTRADO */}
      <h1
        className="text-center font-bold sm:text-xl text-base"
        data-tour="qr-header"
      >
        Códigos QR
      </h1>
      <div className="flex justify-center items-center w-full px-4 sm:px-6 lg:px-8 mt-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl justify-items-center">
          {/* QR Reporte Único */}
          <div
            className="flex flex-col items-center gap-4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 min-h-[500px] w-full max-w-sm"
            data-tour="qr-reportes"
          >
            <h1 className="text-center font-bold text-base">
              Generar Reportes de SMS
            </h1>
            <QRGenerator
              value={qrValueReport}
              fileName={`crear-reporte-sms-${selectedCompany?.slug}`}
              bgColor="#FFF"
              outerColor="#000000"
              innerColor="#1F7FDB"
              moduleColor="#1F7FDB"
              showLink={true}
              showDownloadButton={true}
              size={300}
              buttonDataTour="qr-reportes-download"
              linkDataTour="qr-reportes-link"
            />
          </div>

          {/* QR Página SMS */}
          <div
            className="flex flex-col items-center gap-4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 min-h-[500px] w-full max-w-sm"
            data-tour="qr-pagina-sms"
          >
            <h1 className="text-center font-bold text-base">Página de SMS</h1>
            <QRGenerator
              value={qrSMSPage}
              fileName={`pagina-sms-${selectedCompany?.slug}`}
              showLink={true}
              bgColor="#FFF"
              outerColor="#000000"
              innerColor="#1F7FDB"
              moduleColor="#000000"
              showDownloadButton={true}
              size={300}
              buttonDataTour="qr-pagina-sms-download"
              linkDataTour="qr-pagina-sms-link"
            />
          </div>
        </div>
      </div>
    </ContentLayout>
  );
};

export default QrCodePage;
