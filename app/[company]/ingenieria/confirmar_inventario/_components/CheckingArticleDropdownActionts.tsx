import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";
import type { CheckingScope } from "@/hooks/mantenimiento/almacen/inventario/useCheckingArticles";
import { useCompanyStore } from "@/stores/CompanyStore";
import { BadgeCheck, MoreHorizontal, SquarePen, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ApproveArticlesDialog } from "./ApproveArticlesDialog";
import { RejectArticleDialog } from "./RejectArticleDialog";

const CheckingArticleDropdownActions = ({
  id,
  partNumber,
  scope,
  canApprove,
}: {
  id: number;
  partNumber: string;
  scope: CheckingScope;
  /** Un artículo ya aprobado por ingeniería no se vuelve a aprobar. */
  canApprove: boolean;
}) => {
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const router = useRouter();
  const { selectedCompany } = useCompanyStore();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            className="cursor-pointer gap-2"
            onClick={() =>
              router.push(
                `/${selectedCompany?.slug}/ingenieria/confirmar_inventario/editar_articulo/${id}`,
              )
            }
          >
            <SquarePen className="size-4" />
            Editar
          </DropdownMenuItem>
          {canApprove && (
            <DropdownMenuItem
              className="cursor-pointer gap-2"
              onClick={() => setApproveOpen(true)}
            >
              <BadgeCheck className="size-4 text-green-600/80" />
              Aprobar
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer gap-2 text-red-600 focus:text-red-600"
            onClick={() => setRejectOpen(true)}
          >
            <Trash2 className="size-4" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ApproveArticlesDialog
        open={approveOpen}
        onOpenChange={setApproveOpen}
        ids={[id]}
        scope={scope}
      />
      <RejectArticleDialog
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        articleId={id}
        partNumber={partNumber}
      />
    </>
  );
};

export default CheckingArticleDropdownActions;
