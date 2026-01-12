// components/ui/SectionCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SectionCardProps {
    title: string;
    children: React.ReactNode;
    className?: string;
    headerClassName?: string;
    contentClassName?: string;
}
export function SectionCard({
  title,
  children,
  className,
  headerClassName,
  contentClassName,
}: SectionCardProps) {
  return (
    <Card className={className}>
      <CardHeader className={`pb-3 ${headerClassName || ""}`}>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className={contentClassName || ""}>{children}</CardContent>
    </Card>
  );
}
