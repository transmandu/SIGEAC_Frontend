"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { useRouter } from "next/navigation"; // Importa useRouter

const Indicators = () => {
  const [open, setOpen] = useState(true);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const router = useRouter(); // Inicializa useRouter

  const handleCloseDialog = () => {
    setOpen(false);
  };

  const handleOptionChange = (value: string) => {
    setSelectedOption(value);
  };

  const getLinkHref = (option: string | null) => {
    if (option === "voluntario") {
      return "/transmandu/sms/estadisticas/indicadores_riesgo/reportes_voluntarios";
    } else if (option === "obligatorio") {
      return "/transmandu/sms/estadisticas/indicadores_riesgo/reportes_obligatorios";
    }
    return "";
  };

  const handleDialogChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      router.push("/transmandu/sms/estadisticas/general"); // Redirige cuando el diálogo se cierra
    }
  };

  return (
    <>
      <ContentLayout title="Seleccion de Indicador">
        <Dialog open={open} onOpenChange={handleDialogChange}>
          <DialogContent className="sm:max-w-[420px] h-[200px]">
            <DialogHeader>
              <DialogTitle>Seleccion de Indicador de Riesgo</DialogTitle>
              <DialogDescription>
                Seleccione el tipo de indicador que desea visualizar.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col justify-center items-center gap-6">
              <Select onValueChange={handleOptionChange}>
                <SelectTrigger className="w-[300px]">
                  <SelectValue placeholder="Seleccionar Indicador" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="voluntario">Indicador de Reporte Voluntario</SelectItem>
                  <SelectItem value="obligatorio">Indicador de Reporte Obligatorio</SelectItem>
                </SelectContent>
              </Select>

              {selectedOption && (
                <Link href={getLinkHref(selectedOption)} onClick={handleCloseDialog}>
                  <Button type="button">Ir al Indicador</Button>
                </Link>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </ContentLayout>
    </>
  );
};

export default Indicators;