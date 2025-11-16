"use client";

import { QRCodeSVG } from "qrcode.react";
import { useRef } from "react";
import { Download } from "lucide-react";

interface QRGeneratorProps {
  value: string;
  fileName?: string;
  size?: number;
  bgColor?: string;
  fgColor?: string;
  showDownloadButton?: boolean;
  showLink?: boolean;
}

const QRGenerator = ({
  value,
  fileName = "qr-code",
  size = 256,
  bgColor = "#000000",
  fgColor = "#FFFFFF",
  showDownloadButton = true,
  showLink = false,
}: QRGeneratorProps) => {
  const qrRef = useRef<HTMLDivElement>(null);

  const downloadQRCode = () => {
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
    <div className="flex flex-col items-center gap-4">
      <div ref={qrRef}>
        <QRCodeSVG
          value={value}
          size={size}
          bgColor={bgColor}
          level="H"
          fgColor={fgColor}
          marginSize={1}
          height={size}
          width={size}
        />
      </div>

      {showLink && (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-sm break-all max-w-xs text-center text-blue-600 hover:text-blue-800"
        >
          {value}
        </a>
      )}

      {showDownloadButton && (
        <button
          onClick={downloadQRCode}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          <Download size={16} />
          Descargar QR
        </button>
      )}
    </div>
  );
};

export default QRGenerator;
