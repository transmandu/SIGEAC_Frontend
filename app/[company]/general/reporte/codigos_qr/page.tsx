"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { QRCodeSVG } from "qrcode.react";
import { useParams } from "next/navigation";
import { useCompanyStore } from "@/stores/CompanyStore";
import Link from "next/link";

const QrCodePage = () => {
  const { selectedCompany } = useCompanyStore();

  //  const { company } = useParams<{ company: string }>();

  const qrValueVoluntary = `https://sigeac-one.vercel.app/acceso_publico/${selectedCompany?.slug}/sms/crear_reporte/voluntario`;

  const qrValueObligatory = `https://sigeac-one.vercel.app/acceso_publico/${selectedCompany?.slug}/sms/crear_reporte/obligatorio`;

  return (
    <ContentLayout title="Creación de Reporte Voluntario">
      <div className="flex flex-col w-full justify-center items-center gap-10 ">
        <div className="flex flex-col items-center">
          <h1 className="text-center font-bold text-xl">Reporte Voluntario</h1>
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
            imageSettings={{
              src: "/logo.png",
              height: 100,
              width: 200,
              excavate: false,
              opacity: 0.9,
            }}
          />
          <Link
            href={qrValueVoluntary}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline text-sm mt-2 break-all max-w-xs text-center"
          >
            {qrValueVoluntary}
          </Link>
        </div>
        <div className="flex flex-col items-center">
          <h1 className=" text-center font-bold text-xl ">
            Reporte Obligatorio{" "}
          </h1>
          <QRCodeSVG
            value={qrValueObligatory}
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
          <Link
            href={qrValueObligatory}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline text-sm mt-2 break-all max-w-xs text-center"
          >
            {qrValueObligatory}
          </Link>
        </div>
      </div>
    </ContentLayout>
  );
};

export default QrCodePage;
