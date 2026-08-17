"use client";

import { ReactQRCode } from "@lglab/react-qr-code";
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
  innerColor?: string;
  outerColor?: string;
  moduleColor?: string;
  buttonDataTour?: string;
  linkDataTour?: string;
}

const QRGenerator = ({
  value,
  fileName = "qr-code",
  size = 256,
  innerColor = "#000000",
  outerColor = "#FFF",
  moduleColor = "#000000",
  bgColor = "#FFFFFF",
  showDownloadButton = true,
  showLink = false,
  buttonDataTour,
  linkDataTour,
}: QRGeneratorProps) => {
  const qrRef = useRef<HTMLDivElement>(null);

  const downloadQRCode = async () => {
    if (!qrRef.current) return;

    const svg = qrRef.current.querySelector("svg");
    if (!svg) return;

    const svgClone = svg.cloneNode(true) as SVGElement;

    const imageEl = svgClone.querySelector("image");
    if (imageEl) {
      const href = imageEl.getAttribute("href");
      if (href && !href.startsWith("data:")) {
        try {
          const response = await fetch(href);
          const blob = await response.blob();
          const dataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
          imageEl.setAttribute("href", dataUrl);
        } catch {
          console.error("Failed to embed image in QR download");
        }
      }
    }

    const svgData = new XMLSerializer().serializeToString(svgClone);
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
      {/* Mantenemos el div contenedor para que la lógica de descarga encuentre el SVG */}
      <div ref={qrRef}>
        <ReactQRCode
          finderPatternInnerSettings={{
            style: "outpoint-lg",
            color: innerColor,
          }}
          finderPatternOuterSettings={{
            style: "outpoint-lg",
            color: outerColor,
          }}
          dataModulesSettings={{
            style: "leaf",
            color: moduleColor,
            size: 0.9,
          }}
          value={value}
          size={size}
          background={bgColor}
          imageSettings={{
            src: "/aircraft.png",
            width: 60,
            height: 40,
            excavate: true,
            opacity: 0.9,
          }}
        />
      </div>

      {showLink && (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-sm break-all max-w-xs text-center hover:scale-105 transition-all"
          data-tour={linkDataTour}
        >
          {value}
        </a>
      )}

      {showDownloadButton && (
        <button
          onClick={downloadQRCode}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          data-tour={buttonDataTour}
        >
          <Download size={16} />
          Descargar QR
        </button>
      )}
    </div>
  );
};

export default QRGenerator;
