import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Company } from "@/types";
import { Separator } from "../ui/separator";

const CompanyResumeDialog = ({ company }: { company: Company }) => {
  const [openCompany, setOpenCompany] = useState(false);
  return (
    <Dialog open={openCompany} onOpenChange={setOpenCompany}>
      <DialogTrigger className="flex justify-center">
        {company.name}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center font-bold">
          Resumen de la Empresa
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Cliente
            </h3>
            <p className="text-lg font-semibold">{company.name}</p>
            <Separator />
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">RIF</h3>
            <p className="text-lg font-semibold">{company.rif}</p>
            <Separator />
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Dirección Fiscal
            </h3>
            <p className="text-lg font-semibold">{company.fiscal_address}</p>
            <Separator />
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Número de Telefono
            </h3>
            <p className="text-lg font-semibold">{company.phone_number}</p>
            <Separator />
          </div>
        </div>
        <DialogFooter className="sm:justify-center">
          <Button onClick={() => setOpenCompany(false)}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CompanyResumeDialog;
