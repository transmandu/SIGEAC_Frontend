// components/ui/custom-card.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface CustomCardProps {
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
  return (
    <Card className={cn("w-full flex flex-col", className)}>
      <CardContent className="p-6 flex flex-col flex-grow">
        {/* Icono */}
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
            "text-sm sm:text-base text-center flex-grow",
            descriptionClassName
          )}
        >
          {description}
        </p>

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
