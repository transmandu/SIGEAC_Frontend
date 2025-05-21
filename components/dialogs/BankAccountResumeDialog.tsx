import { useGetBankAccountById } from "@/hooks/administracion/useGetBankAccountById";
import { Banknote, CreditCard, Loader2, User, UserCircleIcon, Wallet } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTrigger, } from "../ui/dialog";

const BankAccountResumeDialog = ({ id }: { id: string }) => {
  const { data: bank_acc, isLoading } = useGetBankAccountById(id);
  const [openBankAcc, setOpenBankAcc] = useState(false);
  if (isLoading) {
    return <Loader2 className="animate-spin" />;
  }

  if (!bank_acc) {
    return <p>N/A</p>;
  }

  return (
    <Dialog open={openBankAcc} onOpenChange={setOpenBankAcc}>
      <DialogTrigger className="font-medium flex justify-center w-full hover:scale-110 transition-all ease-in">
        {bank_acc?.name}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="flex flex-col items-center space-y-2">
            <Banknote className="w-8 h-8 text-primary" />
            <h2 className="text-xl font-bold">Detalles de tu cuenta</h2>
            <p className="text-sm text-muted-foreground">
              Información de la cuenta bancaria
            </p>
          </div>
        </DialogHeader>

        <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-start gap-4">
            <User className="mt-1 h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Titular</p>
              <p className="font-medium">{bank_acc?.name}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <CreditCard className="mt-1 h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Número de cuenta</p>
              <p className="font-mono font-medium">
                {bank_acc?.account_number}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
          <UserCircleIcon className="mt-1 h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Tipo de titular</p>
              <p className="font-medium">{bank_acc?.account_owner}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <Wallet className="mt-1 h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Tipo de cuenta</p>
              <p className="font-medium">{bank_acc?.account_type}</p>
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-center">
          <Button variant="outline" onClick={() => setOpenBankAcc(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BankAccountResumeDialog;
