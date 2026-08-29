"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

/**
 * Casilla con rótulo y explicación.
 *
 * Existe para que los checkbox dejen de desalinearse contra los campos: en los
 * formularios de artículo cada uno traía su propio `rounded-md border p-4`, con
 * alturas distintas según el largo de su descripción.
 */
export const CheckboxCard = ({
    id,
    checked,
    onCheckedChange,
    label,
    description,
    disabled,
    className,
}: {
    id: string;
    checked?: boolean;
    onCheckedChange: (checked: boolean) => void;
    label: string;
    description?: string;
    disabled?: boolean;
    className?: string;
}) => (
    <label
        htmlFor={id}
        className={cn(
            "flex min-h-11 items-start gap-3 rounded-lg px-3.5 py-3",
            "border border-slate-400/60 bg-background/40 dark:border-slate-600/60",
            "transition-colors duration-200",
            disabled
                ? "cursor-not-allowed opacity-50"
                : "cursor-pointer hover:border-blue-400/40 hover:bg-primary/[0.03]",
            checked && !disabled && "border-primary/50 bg-primary/[0.06]",
            className,
        )}
    >
        <Checkbox
            id={id}
            checked={checked}
            onCheckedChange={(value) => onCheckedChange(value === true)}
            disabled={disabled}
            className="mt-0.5 h-[18px] w-[18px]"
        />
        <span className="min-w-0 space-y-1">
            <span className="block text-sm font-medium leading-tight">{label}</span>
            {description && (
                <span className="block text-[13px] leading-snug text-muted-foreground">
                    {description}
                </span>
            )}
        </span>
    </label>
);
