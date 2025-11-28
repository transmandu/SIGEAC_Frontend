"use client";

import { Badge } from "@/components/ui/badge";
import { getResult } from "@/lib/utils";

interface RiskAnalysisCellProps {
  analysis: any;
}

export const RiskAnalysisCell = ({ analysis }: RiskAnalysisCellProps) => {
  if (!analysis)
    return (
      <div className="text-center text-muted-foreground text-xs sm:text-sm">
        N/A
      </div>
    );

  const riskLevel = getResult(analysis.result);

  const badgeConfig = {
    INTOLERABLE: {
      className: "bg-red-600 hover:bg-red-500",
      label: "Intolerable",
    },
    TOLERABLE: {
      className: "bg-yellow-500 hover:bg-yellow-400",
      label: "Tolerable",
    },
    ACEPTABLE: {
      className: "bg-green-600 hover:bg-green-500",
      label: "Aceptable",
    },
  };

  const currentBadge = riskLevel ? badgeConfig[riskLevel] : null;

  return (
    <div className="space-y-1 sm:space-y-2 text-center">
      <div className="grid grid-cols-2 gap-1 text-xs sm:text-sm">
        <div className="rounded bg-muted p-1 truncate">Prob.</div>
        <div className="rounded bg-muted p-1 truncate">
          {analysis.probability}
        </div>
        <div className="rounded bg-muted p-1 truncate">Sev.</div>
        <div className="rounded bg-muted p-1 truncate">{analysis.severity}</div>
      </div>

      {currentBadge && (
        <Badge
          className={`${currentBadge.className} w-full justify-center text-xs sm:text-sm`}
        >
          {currentBadge.label}
        </Badge>
      )}
    </div>
  );
};
