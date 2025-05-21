"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function CreditFlightDialog({ id }: { id?: string }) {
  const [openActions, setOpenActions] = useState(false);

  const router = useRouter();

  const handleViewStats = () => {
    router.push(
      "/transmandu/administracion/creditos/credito_vuelo/resumen_credito"
    );
  };

  return (
    <>
      {/*Dialogo para ver el resumen de ingresos*/}
      <Dialog open={openActions} onOpenChange={setOpenActions}>
        <DialogTrigger asChild>
          <Button
            onClick={handleViewStats}
            variant={"outline"}
            className="flex items-center justify-center gap-2 h-8 border-dashed"
          >
            Resumen de Crédito
          </Button>
        </DialogTrigger>
      </Dialog> 
    </>
  );
}
