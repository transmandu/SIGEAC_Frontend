import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { Credit } from "@/types";
import { HandCoins, MoreHorizontal, } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, } from "../ui/dialog";
import { CreditPaymentForm } from "../forms/CreateCreditPaymentForm";

const CreditDropdownActions = ({ credit }: { credit: Credit }) => {
  const [openPayment, setOpenPayment] = useState<boolean>(false);
  const router = useRouter();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="center"
          className="flex gap-2 justify-center"
        >
          {credit.status === "PAGADO" ? (
            <DropdownMenuItem disabled>
              <span className="text-green-500">Pagado</span>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => setOpenPayment(true)}>
              <HandCoins className="size-5 text-green-500" />
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onClick={() => {
              router.push(`/administracion/credito/${credit}`);
            }}
          ></DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/*Dialog para registrar el pago de un credito*/}
      <Dialog open={openPayment} onOpenChange={setOpenPayment}>
        <DialogContent onInteractOutside={(e) => {
            e.preventDefault(); // Evita que el diálogo se cierre al hacer clic fuera
          }}>
          <DialogHeader className="text-center font-bold">
            Registrar Pago
          </DialogHeader>
          <CreditPaymentForm
            credit={credit}
            onClose={() => setOpenPayment(false)}
          />
        </DialogContent>
      </Dialog>

    
    </>
  );
};

export default CreditDropdownActions;
