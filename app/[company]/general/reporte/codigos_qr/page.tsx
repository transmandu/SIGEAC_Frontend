"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { QRCodeSVG } from "qrcode.react";
import { useCompanyStore } from "@/stores/CompanyStore";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useRef } from "react";

const QrCodePage = () => {
  const { selectedCompany } = useCompanyStore();
  const { theme } = useTheme();
  const qrRefVoluntary = useRef<HTMLDivElement>(null);
  const qrRefObligatory = useRef<HTMLDivElement>(null);
  const qrRefSMSPage = useRef<HTMLDivElement>(null);

  const qrValueVoluntary = `https://sigeac-one.vercel.app/acceso_publico/${selectedCompany?.slug}/sms/crear_reporte/voluntario`;
  const qrValueObligatory = `https://sigeac-one.vercel.app/acceso_publico/${selectedCompany?.slug}/sms/crear_reporte/obligatorio`;
  const qrSMSPage = `https://sigeac-one.vercel.app/acceso_publico/${selectedCompany?.slug}/sms`;

  const downloadQRCode = (
    qrRef: React.RefObject<HTMLDivElement>,
    fileName: string
  ) => {
    if (!qrRef.current) return;

    const svg = qrRef.current.querySelector("svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);

      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `${fileName}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src =
      "data:image/svg+xml;base64," +
      btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <ContentLayout title="Códigos QR de Reportes">
      {/* CONTENEDOR PRINCIPAL RESPONSIVE Y CENTRADO */}
      <div className="flex justify-center items-center w-full px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl justify-items-center">
          {/* QR Voluntario */}
          <div className="flex flex-col items-center gap-4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 min-h-[500px] w-full max-w-sm">
            <h1 className="text-center font-bold text-xl">
              Reporte Voluntario
            </h1>
            <div ref={qrRefVoluntary} className="flex justify-center">
              <QRCodeSVG
                value={qrValueVoluntary}
                size={256}
                bgColor="#3088FF"
                level="H"
                fgColor="#FFF"
                marginSize={1}
                title="sigeac"
                height={256}
                width={256}
              />
            </div>
            <Link
              href={qrValueVoluntary}
              target="_blank"
              rel="noopener noreferrer"
              className={`underline text-sm mt-2 break-all text-center max-w-full px-2 line-clamp-3 ${
                theme === "light"
                  ? "text-purple-600 hover:text-blue-800"
                  : "text-white hover:text-gray-300"
              }`}
            >
              {qrValueVoluntary}
            </Link>

            <div className="mt-auto w-full">
              <button
                onClick={() =>
                  downloadQRCode(
                    qrRefVoluntary,
                    `qr-voluntario-${selectedCompany?.slug}`
                  )
                }
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Descargar QR Voluntario
              </button>
            </div>
          </div>

          {/* QR Obligatorio */}
          <div className="flex flex-col items-center gap-4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 min-h-[500px] w-full max-w-sm">
            <h1 className="text-center font-bold text-xl">
              Reporte Obligatorio
            </h1>
            <div ref={qrRefObligatory} className="flex justify-center">
              <QRCodeSVG
                value={qrValueObligatory}
                size={256}
                bgColor="#FF1900"
                level="H"
                fgColor="#FFF"
                marginSize={1}
                title="sigeac"
                height={256}
                width={256}
              />
            </div>
            <Link
              href={qrValueObligatory}
              target="_blank"
              rel="noopener noreferrer"
              className={`underline text-sm mt-2 break-all text-center max-w-full px-2 line-clamp-3 ${
                theme === "light"
                  ? "text-purple-600 hover:text-blue-800"
                  : "text-white hover:text-gray-300"
              }`}
            >
              {qrValueObligatory}
            </Link>
            <div className="mt-auto w-full">
              <button
                onClick={() =>
                  downloadQRCode(
                    qrRefObligatory,
                    `qr-obligatorio-${selectedCompany?.slug}`
                  )
                }
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Descargar QR Obligatorio
              </button>
            </div>
          </div>

          {/* QR Página SMS */}
          <div className="flex flex-col items-center gap-4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 min-h-[500px] w-full max-w-sm">
            <h1 className="text-center font-bold text-xl">Página de SMS</h1>
            <div ref={qrRefSMSPage} className="flex justify-center">
              <QRCodeSVG
                value={qrSMSPage}
                size={256}
                bgColor="#FF6900"
                level="H"
                fgColor="#FFF"
                marginSize={1}
                title="sigeac"
                height={256}
                width={256}
              />
            </div>
            <Link
              href={qrSMSPage}
              target="_blank"
              rel="noopener noreferrer"
              className={`underline text-sm mt-2 break-all text-center max-w-full px-2 line-clamp-3 ${
                theme === "light"
                  ? "text-purple-600 hover:text-blue-800"
                  : "text-white hover:text-gray-300"
              }`}
            >
              {qrSMSPage}
            </Link>
            <div className="mt-auto w-full">
              <button
                onClick={() =>
                  downloadQRCode(
                    qrRefSMSPage,
                    `qr-sms-page-${selectedCompany?.slug}`
                  )
                }
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Descargar QR Página SMS
              </button>
            </div>
          </div>
        </div>
      </div>
    </ContentLayout>
  );
};

export default QrCodePage;
