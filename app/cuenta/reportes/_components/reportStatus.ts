import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  type LucideIcon,
} from "lucide-react";

import type { TagTone } from "@/components/misc/TagBadge";
import type { ErrorReport } from "@/types";

export const REPORT_STATUS: Record<
  ErrorReport["status"],
  { label: string; tone: TagTone; icon: LucideIcon; hint: string }
> = {
  OPEN: {
    label: "Abierto",
    tone: "rose",
    icon: AlertTriangle,
    hint: "Su reporte fue recibido y está en espera de ser revisado por el equipo.",
  },
  IN_PROGRESS: {
    label: "En progreso",
    tone: "amber",
    icon: Clock,
    hint: "El equipo está trabajando en su reporte.",
  },
  RESOLVED: {
    label: "Resuelto",
    tone: "emerald",
    icon: CheckCircle2,
    hint: "El equipo resolvió su reporte.",
  },
};
