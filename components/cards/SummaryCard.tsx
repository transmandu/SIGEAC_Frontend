import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export const SummaryCard = ({
  title,
  value,
  description,
  icon,
  highlight,
}: {
  title: string;
  value: string;
  description: string;
  icon?: React.ReactNode;
  highlight?: boolean;
}) => (
  <Card className={`${highlight ? "border-purple-200 bg-purple-50/30" : ""}`}>
    <CardHeader className="pb-2 flex flex-row items-center justify-between">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </CardContent>
  </Card>
);
