import Link from "next/link";
import { UserCog } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { manageUserHref } from "@/app/[company]/supervisor/usuarios/_lib/activity";

/** Lleva a Sistema → Usuarios y Permisos, donde se edita la cuenta; aquí solo se supervisa. */
export function ManageUserLink({ userId }: { userId: number }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" asChild>
          <Link
            href={manageUserHref(userId)}
            aria-label="Administrar la cuenta"
          >
            <UserCog className="size-4" />
          </Link>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top" className="px-2 py-1 text-xs">
        Administrar la cuenta
      </TooltipContent>
    </Tooltip>
  );
}
