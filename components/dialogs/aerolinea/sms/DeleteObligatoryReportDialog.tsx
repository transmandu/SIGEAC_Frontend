"use client";

import { useDeleteObligatoryReport } from "@/actions/sms/reporte_obligatorio/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface data {
  company: string | null;
  id: string;
}

export default function DeleteObligatoryReportDialog(data: data) {
  const [open, setOpen] = useState(false);
  const { deleteObligatoryReport } = useDeleteObligatoryReport();
  const router = useRouter();
  const handleDelete = async () => {
    try {
      await deleteObligatoryReport.mutateAsync(data);
      router.push(`/${data.company}/sms/reportes/reportes_obligatorios`);
    } catch (error) {
      console.error("No se pudo eliminar el reportes", error);
    }
    setOpen(false);
  };

  return (
    <>
      <Card className="flex">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => setOpen(true)}
              variant="outline"
              size="sm"
              className=" hidden h-8 lg:flex"
            >
              Eliminar
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-center">
                ¿Seguro que desea eliminar el reporte??
              </DialogTitle>
              <DialogDescription className="text-center p-2 mb-0 pb-0">
                Esta acción es irreversible y estaría eliminando por completo el
                reporte seleccionado.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="flex flex-col-reverse gap-2 md:gap-0">
              <Button
                className="bg-rose-400 hover:bg-white hover:text-black hover:border hover:border-black"
                onClick={() => setOpen(false)}
                type="submit"
              >
                Cancelar
              </Button>

              <Button
                disabled={deleteObligatoryReport.isPending}
                className="hover:bg-white hover:text-black hover:border hover:border-black transition-all"
                onClick={() => handleDelete()}
              >
                {deleteObligatoryReport.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <p>Confirmar</p>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>
    </>
  );
}
