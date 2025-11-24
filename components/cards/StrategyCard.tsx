// components/ui/strategy-card.tsx
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StrategyCardProps {
  title: string;
  description: string;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  align?: "start" | "center" | "end";
  orientation?: "horizontal" | "vertical";
}

export function StrategyCard({
  title,
  description,
  className,
  titleClassName,
  descriptionClassName,
  align = "start",
  orientation = "horizontal",
}: StrategyCardProps) {
  return (
    <Card
      className={cn(
        "w-full transition-all duration-300 hover:shadow-md",
        // Responsive padding y márgenes
        "p-2 sm:p-4 md:p-6",
        className
      )}
    >
      <CardContent
        className={cn(
          "p-0", // Quitamos el padding porque lo manejamos en el Card
          orientation === "vertical" &&
            "flex flex-col items-center text-center",
          // Responsive para orientación vertical en mobile
          "sm:p-2 md:p-4"
        )}
      >
        <div
          className={cn(
            orientation === "horizontal"
              ? "text-left"
              : "flex flex-col items-center text-center",
            align === "center" && "text-center",
            align === "end" && "text-right",
            // Responsive alignment
            "sm:text-left md:text-left"
          )}
        >
          <h3
            className={cn(
              // Título responsive
              "text-sm font-semibold mb-2 text-foreground",
              "sm:text-base sm:mb-2.5",
              "md:text-lg md:mb-3",
              "lg:text-xl",
              titleClassName
            )}
          >
            {title}
          </h3>
          <p
            className={cn(
              // Descripción responsive
              "text-xs text-muted-foreground leading-relaxed",
              "sm:text-sm sm:leading-relaxed",
              "md:text-base md:leading-relaxed",
              "line-clamp-3 sm:line-clamp-4", // Limita líneas para mantener consistencia
              descriptionClassName
            )}
          >
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
