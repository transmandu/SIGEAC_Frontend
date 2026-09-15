"use client";

import { ReactQRCode } from "@lglab/react-qr-code";
import { useRef } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  imageSrc?: string;
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
  imageSrc = "/aircraft.png",
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
    <div className="flex w-full min-w-0 flex-col items-center gap-4">
      {/* Mantenemos el div contenedor para que la lógica de descarga encuentre el SVG */}
      <div ref={qrRef} className="mx-auto w-full max-w-fit">
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
          svgProps={{ style: { maxWidth: "100%", height: "auto" } }}
          imageSettings={{
            src: imageSrc,
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
          className="min-w-0 max-w-full break-all text-center text-sm text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
          data-tour={linkDataTour}
        >
          {value}
        </a>
      )}

      {showDownloadButton && (
        <Button
          onClick={downloadQRCode}
          variant="outline"
          className="w-full gap-2 border-border/60 bg-card text-card-foreground transition-colors hover:border-primary/50 hover:bg-accent hover:text-accent-foreground"
          data-tour={buttonDataTour}
        >
          <Download className="h-4 w-4" />
          Descargar QR
        </Button>
      )}
    </div>
  );
};

export default QRGenerator;
