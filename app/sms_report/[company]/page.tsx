"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { QRCodeSVG } from "qrcode.react";
import { useParams } from "next/navigation";

const CreateVoluntaryReport = () => {
  const { company } = useParams<{ company: string }>();

  const qrValue = `https://sigeac-one.vercel.app/acceso_publico/${company}/sms/crear_reporte/voluntario`;

  return (
    <ContentLayout title="Creación de Reporte Voluntario">
      <div className="flex flex-col justify-center items-center">
        <QRCodeSVG
          value={qrValue}
          size={256}
          bgColor="#3088FF"
          level="H"
          fgColor="#FFF"
          marginSize={1}
          title="sigeac"
          height={300}
          width={300}
          imageSettings={{
            src: "/logo.png",
            height: 100,
            width: 200,
            excavate: false,
            opacity: 0.9,
          }}
        />
        <p className="mt-4 text-sm text-gray-600">Company: {company}</p>
      </div>
    </ContentLayout>
  );
};

export default CreateVoluntaryReport;
