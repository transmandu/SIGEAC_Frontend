import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, } from "../ui/dialog";
import { Cash } from "@/types";
import { WalletIcon } from "lucide-react";
import { getCurrencySymbol } from "@/lib/utils";

const CashResumeDialog = ({ cash }: { cash: Cash }) => {
  const [openCash, setOpenCash] = useState(false);

  return (
    <Dialog open={openCash} onOpenChange={setOpenCash}>
      <DialogTrigger className="flex justify-center">{cash.name}</DialogTrigger>
      <DialogContent
        className="sm:max-w-md"
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <div className="flex flex-col items-center space-y-2">
            <div className="bg-primary/10 p-3 rounded-full">
              <WalletIcon className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-xl font-bold text-white-800">
              Detalles de la Caja
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Información completa de la cuenta
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-500">Nombre</p>
              <p className="text-lg font-semibold text-gray-800">{cash.name}</p>
            </div>
            <div className="bg-primary/10 px-3 py-1 rounded-full">
              <p className="text-sm font-medium text-primary">{cash.coin}</p>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-green-600">Saldo Total</p>
              <p className="text-xl font-bold text-green-800">
                {getCurrencySymbol(cash.coin)} {cash.total_amount}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CashResumeDialog;
