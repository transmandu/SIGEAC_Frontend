// components/ui/button-link.tsx
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ButtonLinkProps {
  href: string;
  children: React.ReactNode;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  target?: "_blank" | "_self" | "_parent" | "_top";
  rel?: string;
}

export function ButtonLink({
  href,
  children,
  variant = "default",
  size = "default",
  className,
  target = "_self",
  rel,
}: ButtonLinkProps) {
  return (
    <Button
      variant={variant}
      size={size}
      className={cn("hover:no-underline", className)}
      asChild
    >
      <Link href={href} target={target} rel={rel}>
        {children}
      </Link>
    </Button>
  );
}
