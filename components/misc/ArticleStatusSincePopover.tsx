"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatDistanceToNow, format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { ReactNode } from "react";

/**
 * El popover aplica a todo estado salvo los de reposo: en STORED e INTOOLBOX el
 * artículo está donde debe estar y su antigüedad no dice nada. En el resto sí
 * importa hace cuánto está ahí.
 */
const UNTRACKED_STATUSES = new Set(["STORED", "INTOOLBOX"]);

export const tracksStatusSince = (status?: string | null) => {
    const key = String(status ?? "").trim().toUpperCase();
    return key !== "" && !UNTRACKED_STATUSES.has(key);
};

const parseDate = (value: string) => {
    const date = parseISO(value);
    return isNaN(date.getTime()) ? null : date;
};

export default function ArticleStatusSincePopover({
    statusLabel,
    statusSince,
    children,
}: {
    statusLabel: string;
    statusSince?: string | null;
    children: ReactNode;
}) {
    const date = statusSince ? parseDate(statusSince) : null;

    return (
        <Popover>
            {/* Badge renderiza un div, que no puede ir dentro de un button:
                el trigger es un span con rol de botón para no anidar mal el HTML. */}
            <PopoverTrigger asChild>
                <span
                    role="button"
                    tabIndex={0}
                    className="cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                    {children}
                </span>
            </PopoverTrigger>

            <PopoverContent className="w-64" align="center">
                <div className="space-y-1.5 text-center">
                    <p className="text-sm font-semibold">{statusLabel}</p>

                    {date ? (
                        <>
                            <p className="text-sm">
                                Desde el {format(date, "dd/MM/yyyy", { locale: es })} a las{" "}
                                {format(date, "HH:mm", { locale: es })}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(date, { locale: es, addSuffix: true })}
                            </p>
                        </>
                    ) : (
                        <p className="text-xs text-muted-foreground">
                            Sin registro de cuándo entró a este estado.
                        </p>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
