"use client";

import { Button } from "@/components/ui/button";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Hand, Loader, Loader2 } from "lucide-react";
import Link from "next/link";

export default function NotAuthorized() {
  const { selectedCompany } = useCompanyStore();
  return (
    <div className="h-dvh w-dvw flex flex-col items-center justify-center">
      <div className="flex flex-col justify-center items-center max-w-3xl gap-y-4">
        <Hand className="size-[110px] text-rose-600" />
        <h1 className="font-bold text-7xl text-center">¡Acceso Denegado!</h1>
        <p className="text-lg text-muted-foreground text-center">
          Lo sentimos, pero no puedes acceder a esta página en este momento. Es
          posible que necesites permisos especiales o que hayas introducido una
          dirección web incorrecta.
        </p>
        {!selectedCompany ? (
          <Loader2 className="animate-spin" />
        ) : (
          <Link href={`/${selectedCompany.slug}/dashboard`}>
            <Button className="bg-primary text-white hover:bg-transparent hover:text-black hover:border hover:border-black">
              Volver
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
