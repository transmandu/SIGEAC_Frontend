import { ElementType } from "react";
import { cn } from "@/lib/utils";

interface MetaItemProps {
  label: string;
  value?: string | null;
  icon?: ElementType;
  wrap?: boolean;
}

const MetaItem = ({ label, value, icon: Icon, wrap }: MetaItemProps) => {
  return (
    <div className={cn("flex flex-col gap-0.5", wrap && "min-w-0 max-w-65")}>
      <span className="text-xs font-medium text-muted-foreground select-none">
        {label}
      </span>
      <span
        className={cn(
          "text-sm font-medium flex gap-1.5",
          wrap ? "items-start text-wrap wrap-break-word" : "items-center",
        )}
      >
        {Icon && (
          <Icon className="size-3.5 text-muted-foreground/50 shrink-0 mt-0.5" />
        )}
        {value ?? "—"}
      </span>
    </div>
  );
};

export default MetaItem;
