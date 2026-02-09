export type ChecklistValue = boolean | "NA";

export type ChecklistDecision = "ACCEPTED" | "HOLD" | "REJECTED";

export type ChecklistItem = {
  key: string;
  label: string;
  hint?: string;
  requiredForAccept?: boolean;
};

export type ChecklistGroup = {
  title: string;
  icon: React.ReactNode;
  items: ChecklistItem[];
};

export type IncomingConfirmPayload = {
  decision: ChecklistDecision;
  checklist: Record<string, ChecklistValue>;
  notes?: string;
  final_zone?: string;
};
