  "use client";

  import { Button } from "@/components/ui/button";
  import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog";
  import { Card } from "@/components/ui/card";
  import { MitigationMeasure } from "@/types";
  import Link from "next/link";
  import { useCompanyStore } from "@/stores/CompanyStore";
  import { formatDate } from "date-fns";

  interface MeasuresCellProps {
    measures: MitigationMeasure[];
    planId?: string | number;
  }

  export const MeasuresCell = ({ measures, planId }: MeasuresCellProps) => {
    const { selectedCompany } = useCompanyStore();

    return (
      <div className="flex justify-center">
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="min-w-[100px] md:min-w-[120px]"
            >
              {measures?.length > 0 ? (
                <span className="flex items-center gap-1 md:gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="hidden sm:inline">
                    {measures.length} medida{measures.length !== 1 ? "s" : ""}
                  </span>
                  <span className="sm:hidden">{measures.length}</span>
                </span>
              ) : (
                <span className="truncate">Sin medidas</span>
              )}
            </Button>
          </DialogTrigger>

          <DialogContent className="w-[95vw] max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">
                Medidas de Mitigación
              </DialogTitle>
              <DialogDescription>
                Una lista de las medidas asociadas a este plan de mitigación.
              </DialogDescription>
            </DialogHeader>

            <Card className="p-4 rounded-lg shadow-sm transition-shadow hover:shadow-md">
              {/* ... resto del contenido igual ... */}
            </Card>
          </DialogContent>
        </Dialog>
      </div>
    );
  };
