// components/ui/custom-card.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface CustomCardProps {
  index?: number;
  icon?: LucideIcon;
  iconColor?: string;
  iconSize?: number;
  title?: string;
  description: string;
  actionLink?: {
    href: string;
    label: string;
    variant?:
      | "default"
      | "destructive"
      | "outline"
      | "secondary"
      | "ghost"
      | "link";
    size?: "default" | "sm" | "lg" | "icon";
    target?: "_blank" | "_self" | "_parent" | "_top";
  };
  className?: string;
  iconClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  buttonClassName?: string;
}

export function PolicyCard({
  index, // EN CASO DE QUE SE LLAME ESTE COMPONENTE EN UN BUCLE
  icon: Icon,
  iconColor = "currentColor",
  iconSize = 48,
  title,
  description,
  actionLink,
  className,
  iconClassName,
  titleClassName,
  descriptionClassName,
  buttonClassName,
}: CustomCardProps) {
  const getFlexDirection = () => {
    // En mobile: índice par -> flex-row, índice impar -> flex-row-reverse
    // En desktop: siempre flex-col
    if (index === undefined) return "flex-col sm:flex-col";
    
    const isEven = index % 2 === 0;
    return isEven 
      ? "flex-row sm:flex-col" 
      : "flex-row-reverse sm:flex-col";
  };
  return (
    <Card className={cn("w-full flex flex-col", className)}>
      <CardContent className="p-6 flex flex-col flex-grow">
        {/* Icono */}

        <div
          className={cn("flex items-center gap-4 sm:gap-2", getFlexDirection())}
        >
          <div>
            {Icon && (
              <div className="mb-4 flex justify-center">
                <div
                  className={cn(
                    "p-3 rounded-full bg-primary/10 flex items-center justify-center",
                    iconClassName
                  )}
                >
                  <Icon
                    size={iconSize}
                    color={iconColor}
                    className="text-primary"
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            {" "}
            {/* Título (opcional) */}
            {title && (
              <h3
                className={cn(
                  "text-lg font-semibold mb-2 text-center",
                  titleClassName
                )}
              >
                {title}
              </h3>
            )}
            {/* Descripción */}
            <p
              className={cn(
                "text-sm sm:text-base text-left sm:text-justify flex-grow",
                descriptionClassName
              )}
            >
              {description}
            </p>
          </div>
        </div>
        {/* Botón de acción (opcional) */}
        {actionLink && (
          <div className="mt-4 flex justify-center">
            <Button
              asChild
              variant={actionLink.variant || "outline"}
              size={actionLink.size || "sm"}
              className={cn("w-full max-w-40", buttonClassName)}
            >
              <Link
                href={actionLink.href}
                target={actionLink.target || "_self"}
              >
                {actionLink.label}
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
