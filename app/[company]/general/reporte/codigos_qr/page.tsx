"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import QRGenerator from "@/components/misc/QRGenerator";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useTheme } from "next-themes";

const QrCodePage = () => {
  const { selectedCompany } = useCompanyStore();
  const { theme } = useTheme();

  const qrValueReport = `https://sigeac-one.vercel.app/acceso_publico/${selectedCompany?.slug}/sms/crear_reporte`;
  const qrSMSPage = `https://sigeac-one.vercel.app/acceso_publico/${selectedCompany?.slug}/sms`;

  return (
    <ContentLayout title="Códigos QR">
      {/* CONTENEDOR PRINCIPAL RESPONSIVE Y CENTRADO */}
      <h1 className="text-center font-bold sm:text-xl text-base">Codigos QR</h1>
      <div className="flex justify-center items-center w-full px-4 sm:px-6 lg:px-8 mt-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl justify-items-center">
          {/* QR Reporte Único */}
          <div className="flex flex-col items-center gap-4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 min-h-[500px] w-full max-w-sm">
            <h1 className="text-center font-bold text-base">Generar Reportes de SMS</h1>
            <QRGenerator
              value={qrValueReport}
              fileName={`crear-reporte-sms-${selectedCompany?.slug}`}
              bgColor="#3088FF"
              showLink={true}
              showDownloadButton={true}
              size={300}
            />
          </div>

          {/* QR Página SMS */}
          <div className="flex flex-col items-center gap-4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 min-h-[500px] w-full max-w-sm">
            <h1 className="text-center font-bold text-base">Página de SMS</h1>
            <QRGenerator
              value={qrSMSPage}
              fileName={`pagina-sms-${selectedCompany?.slug}`}
              bgColor="#00000"
              showLink={true}
              showDownloadButton={true}
              size={300}
            />
          </div>
        </div>
      </div>
    </ContentLayout>
  );
};

export default QrCodePage;
