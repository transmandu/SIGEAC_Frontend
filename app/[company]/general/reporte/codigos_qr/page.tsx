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

  const qrValueVoluntary = `https://sigeac-one.vercel.app/acceso_publico/${selectedCompany?.slug}/sms/crear_reporte/voluntario`;
  const qrValueObligatory = `https://sigeac-one.vercel.app/acceso_publico/${selectedCompany?.slug}/sms/crear_reporte/obligatorio`;

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
      <div className="flex w-full justify-center items-center gap-10">
        {/* QR Voluntario */}
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-center font-bold text-xl">Reporte Voluntario</h1>
          <div ref={qrRefVoluntary}>
            <QRCodeSVG
              value={qrValueVoluntary}
              size={256}
              bgColor="#3088FF"
              level="H"
              fgColor="#FFF"
              marginSize={1}
              title="sigeac"
              height={300}
              width={300}
            />
          </div>
          <Link
            href={qrValueVoluntary}
            target="_blank"
            rel="noopener noreferrer"
            className={`underline text-sm mt-2 break-all max-w-xs text-center ${
              theme === "light"
                ? "text-purple-600 hover:text-blue-800"
                : "text-white hover:text-gray-300"
            }`}
          >
            {qrValueVoluntary}
          </Link>

          <button
            onClick={() =>
              downloadQRCode(
                qrRefVoluntary,
                `qr-voluntario-${selectedCompany?.slug}`
              )
            }
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Descargar QR Voluntario
          </button>
        </div>

        {/* QR Obligatorio */}
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-center font-bold text-xl">Reporte Obligatorio</h1>
          <div ref={qrRefObligatory}>
            <QRCodeSVG
              value={qrValueObligatory}
              size={256}
              bgColor="#FF1900"
              level="H"
              fgColor="#FFF"
              marginSize={1}
              title="sigeac"
              height={300}
              width={300}
            />
          </div>
          <Link
            href={qrValueObligatory}
            target="_blank"
            rel="noopener noreferrer"
            className={`underline text-sm mt-2 break-all max-w-xs text-center ${
              theme === "light"
                ? "text-purple-600 hover:text-blue-800"
                : "text-white hover:text-gray-300"
            }`}
          >
            {qrValueObligatory}
          </Link>
          <button
            onClick={() =>
              downloadQRCode(
                qrRefObligatory,
                `qr-obligatorio-${selectedCompany?.slug}`
              )
            }
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Descargar QR Obligatorio
          </button>
        </div>
      </div>
    </ContentLayout>
  );
};

export default QrCodePage;
