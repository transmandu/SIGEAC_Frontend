"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { dateFormat } from "@/lib/utils";
import { trainingEventLabelEs } from "@/lib/cursos/statuses";
import { SMSTraining, SMSTrainingHistoryEntry } from "@/types";
import { History } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

function EventBadge({ event }: { event: string }) {
  const tone =
    event === "EXPIRED"
      ? "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400"
      : event === "INITIAL_TAKEN"
        ? "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400"
        : "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400";

  return (
    <span
      className={`inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${tone}`}
    >
      {trainingEventLabelEs(event)}
    </span>
  );
}

export function TrainingHistoryDialog({ training }: { training: SMSTraining }) {
  const history: SMSTrainingHistoryEntry[] = training.history ?? [];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          type="button"
          disabled={history.length === 0}
        >
          <History className="h-4 w-4 mr-1" />
          Historial
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Historial de capacitación —{" "}
            {training.employee?.first_name ?? ""} {training.employee?.last_name ?? ""}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-3">
          <div className="space-y-3">
            {history.map((h) => (
              <div
                key={h.id}
                className="rounded-lg border bg-background/60 p-3 text-sm space-y-1"
              >
                <div className="flex items-center justify-between">
                  <EventBadge event={h.event_type} />
                  <span className="text-xs text-muted-foreground">
                    {h.created_at
                      ? new Date(h.created_at).toLocaleDateString("es-VE", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })
                      : ""}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mt-2">
                  <div>
                    <span className="text-muted-foreground">Curso inicial: </span>
                    <span className="font-medium">
                      {h.base_course?.end_date
                        ? dateFormat(h.base_course.end_date, "dd/MM/yyyy")
                        : "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Último curso: </span>
                    <span className="font-medium">
                      {h.course?.end_date
                        ? dateFormat(h.course.end_date, "dd/MM/yyyy")
                        : "N/A"}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Expiración: </span>
                    <span className="font-medium">
                      {h.expiration
                        ? dateFormat(h.expiration, "dd/MM/yyyy")
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
