"use client";

import { Check } from "lucide-react";
import { ReactNode } from "react";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

import { WorkflowTabValue } from "./evaluation-workflow-helpers";

type EvaluationWorkflowTabsProps = {
  defaultTab: WorkflowTabValue;
  hasPlanAndAnalysis: boolean;
  hasPostMitigationAnalysis: boolean;
  currentMeasuresCount: number;
  totalControls: number;
  hasMitigationPlan: boolean;
  children: ReactNode;
  notificationId: number;
};

function StepTrigger({
  value,
  step,
  label,
  done,
  count,
  disabled,
}: {
  value: WorkflowTabValue;
  step: number;
  label: string;
  done: boolean;
  count?: number;
  disabled?: boolean;
}) {
  return (
    <TabsTrigger
      value={value}
      disabled={disabled}
      className="group h-auto min-w-0 items-center justify-start gap-2.5 rounded-lg border bg-background/70 px-3 py-2.5 text-left whitespace-normal data-[state=active]:border-primary data-[state=active]:bg-primary/5 dark:bg-muted/20"
    >
      <span
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
          done
            ? "bg-emerald-600 text-white dark:bg-emerald-500"
            : "bg-muted text-muted-foreground group-data-[state=active]:bg-primary group-data-[state=active]:text-primary-foreground",
        )}
      >
        {done ? <Check className="h-3.5 w-3.5" /> : step}
      </span>

      <span className="min-w-0 flex-1 truncate text-sm font-medium">
        {label}
      </span>

      {typeof count === "number" ? (
        <span className="shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground tabular-nums">
          {count}
        </span>
      ) : null}
    </TabsTrigger>
  );
}

export function EvaluationWorkflowTabs({
  defaultTab,
  hasPlanAndAnalysis,
  hasPostMitigationAnalysis,
  currentMeasuresCount,
  totalControls,
  hasMitigationPlan,
  children,
  notificationId,
}: EvaluationWorkflowTabsProps) {
  return (
    <Tabs
      key={`workflow-tabs-${notificationId}`}
      defaultValue={defaultTab}
      className="space-y-5"
    >
      <TabsList className="grid h-auto w-full grid-cols-1 gap-2 bg-transparent p-0 sm:grid-cols-2 xl:grid-cols-4">
        <StepTrigger
          value="plan"
          step={1}
          label="Plan y análisis"
          done={hasPlanAndAnalysis}
        />
        <StepTrigger
          value="measures"
          step={2}
          label="Medidas"
          done={currentMeasuresCount > 0}
          count={currentMeasuresCount}
          disabled={!hasPlanAndAnalysis || !hasMitigationPlan}
        />
        <StepTrigger
          value="controls"
          step={3}
          label="Controles"
          done={totalControls > 0}
          count={totalControls}
          disabled={!hasPlanAndAnalysis || currentMeasuresCount === 0}
        />
        <StepTrigger
          value="post-analysis"
          step={4}
          label="Post mitigación"
          done={hasPostMitigationAnalysis}
          disabled={
            !hasPlanAndAnalysis || !hasMitigationPlan || !currentMeasuresCount
          }
        />
      </TabsList>

      {children}
    </Tabs>
  );
}
