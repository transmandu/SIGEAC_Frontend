"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, } from "@/components/ui/dialog";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function CreditRentingDialog() {
  const [openActions, setOpenActions] = useState(false);
  const {selectedCompany} = useCompanyStore();
  const router = useRouter();

  const handleViewStats = () => {
    router.push(
      `/${selectedCompany?.slug}/administracion/creditos/credito_arrendamiento/resumen_credito`
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
