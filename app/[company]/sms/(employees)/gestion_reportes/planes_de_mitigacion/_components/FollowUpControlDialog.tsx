"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FollowUpControl } from "@/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "next-themes";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Button } from "@/components/ui/button";

interface FollowUpControlDialogProps {
  followUpControls: FollowUpControl[];
  planId: string | number;
  measureId: string | number;
  triggerElement?: React.ReactNode;
  showTrigger?: boolean;
}

const FollowUpControlDialog = ({
  followUpControls,
  planId,
  measureId,
  triggerElement,
  showTrigger = true,
}: FollowUpControlDialogProps) => {
  const { selectedCompany } = useCompanyStore();

  if (!showTrigger) {
    return (
      <DialogContent>
        <DialogHeader>
          <DialogDescription className={`font-semibold`}
          >
            Controles de Seguimiento de las Medidas
          </DialogDescription>
        </DialogHeader>

        <div className="border rounded-lg p-4 shadow-md">
          {followUpControls.length > 0 ? (
            <ul>
              {followUpControls.map((control, index) => (
                <li key={control.id} className="mb-2">
                  <ul className="font-semibold">
                    {++index} ) {control.description}
                  </ul>
                  <ul className="text-sm text-gray-600">
                    <p className="font-medium text-left">
                      {format(control.date, "PPP", {
                        locale: es,
                      })}
                    </p>
                  </ul>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500">
              No hay controles de seguimiento registrados
            </p>
          )}
        </div>

        <Link
          href={`/${selectedCompany?.slug}/sms/gestion_reportes/planes_de_mitigacion/${planId}/medidas/${measureId}/controles_de_seguimiento`}
        >
          <div className="flex justify-end mt-4">
            <Button className="w-1/3" variant="outline">
              Ver más
            </Button>
          </div>
        </Link>
      </DialogContent>
    );
  }

  const defaultTrigger = (
    <Badge className="flex flex-col justify-center h-8 bg-blue-300 rounded-full text-black cursor-pointer">
      {followUpControls.length ? (
        <span className="font-semibold">Controles de Seguimiento</span>
      ) : (
        <div className="flex flex-col justify-center text-center">
          Sin Control
        </div>
      )}
    </Badge>
  );

  return (
    <Dialog>
      <DialogTrigger asChild>{triggerElement || defaultTrigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogDescription className={`font-semibold`}>
            Controles de Seguimiento de las Medidas
          </DialogDescription>
        </DialogHeader>

        <div className="border rounded-lg p-4 shadow-md">
          {followUpControls.length > 0 ? (
            <ul>
              {followUpControls.map((control, index) => (
                <li key={control.id} className="mb-2">
                  <ul className="font-semibold">
                    {++index} ) {control.description}
                  </ul>
                  <ul className="text-sm text-gray-600">
                    <p className="font-medium text-left">
                      {format(control.date, "PPP", {
                        locale: es,
                      })}
                    </p>
                  </ul>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500">
              No hay controles de seguimiento registrados
            </p>
          )}
        </div>

        <Link
          href={`/${selectedCompany?.slug}/sms/gestion_reportes/planes_de_mitigacion/${planId}/medidas/${measureId}/controles_de_seguimiento`}
        >
          <div className="flex justify-end mt-4">
            <Button className="w-1/3 " variant="outline" >Ver más</Button>
          </div>
        </Link>
      </DialogContent>
    </Dialog>
  );
};

export default FollowUpControlDialog;
