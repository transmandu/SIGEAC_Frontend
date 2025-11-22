// components/ui/custom-card.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

interface CustomCardProps {
  imageUrl?: string;
  imageAlt?: string;
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
  imageClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  buttonClassName?: string;
}

export function CustomCard({
  imageUrl,
  imageAlt = "Card image",
  title,
  description,
  actionLink,
  className,
  imageClassName,
  titleClassName,
  descriptionClassName,
  buttonClassName,
}: CustomCardProps) {
  return (
    <Card className={cn("w-full flex flex-col ", className)}>
      <CardContent className="p-6 flex flex-col flex-grow items-center">
        {/* Imagen */}
        {imageUrl && (
          <div className="mb-4 flex justify-center relative h-16 w-16 sm:h-32 sm:w-32">
            <Image
              src={imageUrl}
              alt={imageAlt}
              fill
              className={cn("object-cover", imageClassName)}
            />
          </div>
        )}

        {/* Título (opcional) */}
        {title && (
          <h3
            className={cn(
              "text-sm sm:text-lg font-semibold mb-2 text-center",
              titleClassName
            )}
          >
            {title}
          </h3>
        )}

        {/* Descripción */}
        <p
          className={cn(
            "text-xs sm:text-sm text-muted-foreground text-center flex-grow",
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
              className={cn("w-full max-w-20 sm:max-w-40", buttonClassName)}
            >
              <Link
                href={actionLink.href}
                target={actionLink.target || "_self"}
                className="text-xs sm:text-sm"
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
