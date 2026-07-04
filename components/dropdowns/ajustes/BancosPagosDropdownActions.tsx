"use client";

import { useDeleteBank } from "@/actions/general/banco_cuentas/bancos/actions";
import { useDeleteBankAccount } from "@/actions/general/banco_cuentas/cuentas/actions";
import { useDeleteCard } from "@/actions/general/banco_cuentas/tarjetas/actions";
import CreateBankAccountForm from "@/components/forms/ajustes/CreateBankAccountForm";
import CreateBankForm from "@/components/forms/ajustes/CreateBankForm";
import CreateCardForm from "@/components/forms/ajustes/CreateCardForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { Bank, BankAccount, Card } from "@/types";
import { Loader2, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import type { UseMutationResult } from "@tanstack/react-query";

/**
 * Acciones (editar / eliminar) para las filas de bancos, cuentas, métodos de
 * pago y tarjetas. La gestión de estas entidades es exclusiva de SUPERUSER
 * (el backend además la restringe por rol), por lo que el menú se oculta
 * para el resto de los usuarios.
 */
interface EntityActionsProps {
  deleteMutation: UseMutationResult<void, Error, string | number, unknown>;
  deleteLabel: string;
  editTitle: string;
  entityId: number;
  renderEditForm: (onClose: () => void) => React.ReactNode;
}

function EntityActions({ deleteMutation, deleteLabel, editTitle, entityId, renderEditForm }: EntityActionsProps) {
  const { user } = useAuth();
  const [openDelete, setOpenDelete] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

  const ALLOWED_ROLES = ["SUPERUSER", "JEFE_ADMINISTRACION", "ANALISTA_ADMINISTRACION"];

  const hasAccess = user?.roles?.some((role) => ALLOWED_ROLES.includes(role.name));

  if (!hasAccess) {
    return null;
  }

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(entityId);
    setOpenDelete(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menú</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="flex gap-2 justify-center">
          <DropdownMenuItem className="cursor-pointer" onClick={() => setOpenEdit(true)}>
            <Pencil className="size-5" />
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" onClick={() => setOpenDelete(true)}>
            <Trash2 className="size-5 text-red-500" />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>{editTitle}</DialogTitle>
            <DialogDescription>
              Modifique la información y guarde los cambios.
            </DialogDescription>
          </DialogHeader>
          {renderEditForm(() => setOpenEdit(false))}
        </DialogContent>
      </Dialog>

      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center">{deleteLabel}</DialogTitle>
            <DialogDescription className="text-center p-2 mb-0 pb-0">
              Esta acción es irreversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2 md:gap-0">
            <Button
              className="bg-rose-400 hover:bg-white hover:text-black hover:border hover:border-black"
              onClick={() => setOpenDelete(false)}
              type="button"
            >
              Cancelar
            </Button>
            <Button
              disabled={deleteMutation.isPending}
              className="hover:bg-white hover:text-black hover:border hover:border-black transition-all"
              onClick={handleDelete}
            >
              {deleteMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <p>Confirmar</p>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function BankDropdownActions({ bank }: { bank: Bank }) {
  const { deleteBank } = useDeleteBank();
  return (
    <EntityActions
      deleteMutation={deleteBank}
      deleteLabel="¿Seguro que desea eliminar este banco?"
      editTitle="Editar Banco"
      entityId={bank.id}
      renderEditForm={(onClose) => <CreateBankForm onClose={onClose} bank={bank} />}
    />
  );
}

export function BankAccountDropdownActions({ account }: { account: BankAccount }) {
  const { deleteBankAccount } = useDeleteBankAccount();
  return (
    <EntityActions
      deleteMutation={deleteBankAccount}
      deleteLabel="¿Seguro que desea eliminar esta cuenta? Se eliminarán también sus métodos de pago y tarjetas."
      editTitle="Editar Cuenta Bancaria"
      entityId={account.id}
      renderEditForm={(onClose) => <CreateBankAccountForm onClose={onClose} account={account} />}
    />
  );
}

export function CardDropdownActions({ card }: { card: Card }) {
  const { deleteCard } = useDeleteCard();
  return (
    <EntityActions
      deleteMutation={deleteCard}
      deleteLabel="¿Seguro que desea eliminar esta tarjeta?"
      editTitle="Editar Tarjeta"
      entityId={card.id}
      renderEditForm={(onClose) => <CreateCardForm onClose={onClose} card={card} />}
    />
  );
}
