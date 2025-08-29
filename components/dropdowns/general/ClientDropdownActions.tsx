import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Client } from "@/types";
import {
    EditIcon,
    EyeIcon,
    Loader2,
    MoreHorizontal,
    Plus,
    Trash2,
    TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AddClientBalanceForm from "../../forms/aerolinea/administracion/AddClientBalanceForm";
import { EditClientForm } from "../../forms/aerolinea/administracion/EditClientForm";
import { Avatar, AvatarFallback } from "../../ui/avatar";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../../ui/dialog";
import { useDeleteClient } from "@/actions/general/clientes/actions";
import { useCompanyStore } from "@/stores/CompanyStore";

const ClientDropdownActions = ({ client }: { client: Client }) => {
    const {selectedCompany} = useCompanyStore();
  const [openDelete, setOpenDelete] = useState<boolean>(false);
  const [openClient, setOpenClient] = useState<boolean>(false);
  const [openEdit, setOpenEdit] = useState<boolean>(false);
  const [openAddBalance, setOpenAddBalance] = useState<boolean>(false);
  const { deleteClient } = useDeleteClient();
  const router = useRouter();

  const handleViewStats = () => {
    router.push(
      `/ajustes/globales/clientes/${client.dni}`
    );
  };

  const handleDelete = (id: string) => {
    deleteClient.mutate({id: client.id.toString(), company: selectedCompany!.slug}, {
      onSuccess: () => setOpenDelete(false), // Cierra el modal solo si la eliminación fue exitosa
    });
  };

  const handleViewDetails = () => {
    setOpenClient(true);
  };

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
          <DropdownMenuItem onClick={() => setOpenDelete(true)}>
            <Trash2 className="size-5 text-red-500" />
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleViewDetails}>
            <EyeIcon className="size-5" />
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleViewStats}>
            <TrendingUp className="size-5 text-green-500" />
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenEdit(true)}>
            <EditIcon className="size-5 text-blue-500" />
          </DropdownMenuItem>
          {client.balance < 0 ? (
            <DropdownMenuItem disabled>
              <span className="text-red-500">Con Deuda</span>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => setOpenAddBalance(true)}>
              <Plus className="size-5 text-green-500" />
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onClick={() => {
              router.push(
                `/administracion/gestion_general/clientes/${client.dni}`
              );
            }}
          ></DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/*Dialog para eliminar un cliente*/}
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent
          onInteractOutside={(e) => {
            e.preventDefault(); // Evita que el diálogo se cierre al hacer clic fuera
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-center">
              ¿Seguro que desea eliminar al cliente?
            </DialogTitle>
            <DialogDescription className="text-center p-2 mb-0 pb-0">
              Esta acción es irreversible y estaría eliminando por completo el
              permiso seleccionado.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button
              className="bg-rose-400 hover:bg-white hover:text-black hover:border hover:border-black"
              onClick={() => setOpenDelete(false)}
              type="submit"
            >
              Cancelar
            </Button>
            <Button
              disabled={deleteClient.isPending}
              className="hover:bg-white hover:text-black hover:border hover:border-black transition-all"
              onClick={() => handleDelete(client.dni)}
            >
              {deleteClient.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <p>Confirmar</p>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/*Dialog para ver el resumen de un cliente*/}
      <Dialog open={openClient} onOpenChange={setOpenClient}>
        <DialogContent
          onInteractOutside={(e) => {
            e.preventDefault(); // Evita que el diálogo se cierre al hacer clic fuera
          }}
          aria-describedby={undefined}
          className="sm:max-w-lg"
        >
          <Card className="border-none shadow-none">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>
                    {client.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl">{client.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{client.dni}</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Teléfono
                  </h3>
                  <p className="font-medium">
                    {client.phone || "No especificado"}
                  </p>
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Días Crédito
                  </h3>
                  <p className="font-medium">
                    {client.pay_credit_days || "0"} días
                  </p>
                </div>

                <div className="space-y-1 col-span-2">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Dirección
                  </h3>
                  <p className="font-medium">
                    {client.address || "No especificada"}
                  </p>
                </div>
              </div>

              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Saldo Actual</span>
                    <span
                      className={`font-bold text-2xl ${
                        client.balance >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {client.balance >= 0 ? "+" : "-"} ${" "}
                      {Math.abs(client.balance).toLocaleString()}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {client.balance < 0 && (
                <Badge variant="destructive" className="w-fit">
                  Cliente con deuda
                </Badge>
              )}
            </CardContent>
          </Card>

          <DialogFooter className="sm:justify-start">
            <Button
              onClick={() => setOpenClient(false)}
              variant="outline"
              className="w-full"
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/*Dialog para editar un cliente*/}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent
          onInteractOutside={(e) => {
            e.preventDefault(); // Evita que el diálogo se cierre al hacer clic fuera
          }}
        >
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
          </DialogHeader>
          <EditClientForm client={client} onClose={() => setOpenEdit(false)} />
        </DialogContent>
      </Dialog>

      {/*Dialog para Registrar un saldo a favor para un cliente*/}
      <Dialog open={openAddBalance} onOpenChange={setOpenAddBalance}>
        <DialogContent
          onInteractOutside={(e) => {
            e.preventDefault(); // Evita que el diálogo se cierre al hacer clic fuera
          }}
        >
          <DialogHeader>
            <DialogTitle>Registrar Saldo a Favor</DialogTitle>
          </DialogHeader>
          <AddClientBalanceFworm
            id={client.id.toString()}
            onClose={() => setOpenAddBalance(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ClientDropdownActions;
