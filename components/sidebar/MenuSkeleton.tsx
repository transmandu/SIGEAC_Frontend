import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// Anchos de la etiqueta de cada fila, variados para que no parezca una rejilla.
const GROUPS = [
  { header: "w-16", rows: ["w-28", "w-36", "w-24"] },
  { header: "w-12", rows: ["w-32", "w-24", "w-36", "w-28"] },
  { header: "w-20", rows: ["w-36", "w-28", "w-32"] },
];

/**
 * Marcador del menú mientras no se sabe qué opciones le tocan al usuario.
 * Comparte la geometría de `Menu` (filas de h-11, icono de 32 px a pl-4) para
 * que al llegar los datos las opciones aparezcan donde estaba su sombra.
 */
export function MenuSkeleton({ isOpen }: { isOpen: boolean | undefined }) {
  const collapsed = isOpen === false;

  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Cargando menú"
      className="flex-1 overflow-hidden"
    >
      <div className="mt-6 w-full">
        <ul className="flex flex-col items-start gap-2 px-1 pb-4">
          {GROUPS.map(({ header, rows }, groupIndex) => (
            <li key={groupIndex} className="w-full pt-3">
              <div className="mx-2 mb-2 flex h-7 items-center gap-3">
                {collapsed ? (
                  <Skeleton className="mx-auto h-px w-8 motion-reduce:animate-none" />
                ) : (
                  <>
                    <Skeleton
                      className={cn("h-2.5 motion-reduce:animate-none", header)}
                    />
                    <span className="h-px flex-1 bg-border/60" />
                  </>
                )}
              </div>

              {rows.map((width, rowIndex) => (
                <div
                  key={rowIndex}
                  className="my-0.5 flex h-11 w-full items-center pl-4 pr-2"
                >
                  <Skeleton className="size-8 shrink-0 rounded-lg motion-reduce:animate-none" />
                  {!collapsed && (
                    <Skeleton
                      className={cn(
                        "ml-3 h-3 motion-reduce:animate-none",
                        width,
                      )}
                    />
                  )}
                </div>
              ))}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
