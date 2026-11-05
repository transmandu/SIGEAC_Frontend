"use client";

import { useMemo, useState } from "react";
import { Download, FileArchive, Loader2 } from "lucide-react";
import { downloadCourseCertificatesBatch } from "@/actions/general/cursos/certificates";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useResettingState } from "@/hooks/useResettingState";
import { Course } from "@/types";

interface EmployeeOption {
  dni: string;
  first_name: string;
  last_name: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: Course;
  company: string;
  employees: EmployeeOption[];
}

export function DownloadCourseCertificatesDialog({
  open,
  onOpenChange,
  course,
  company,
  employees,
}: Props) {
  const [pending, setPending] = useState<"all" | "selected" | null>(null);

  const allDnis = useMemo(
    () => employees.map((employee) => employee.dni),
    [employees],
  );

  const [selected, setSelected] = useResettingState<string[]>(
    () => (open ? allDnis : []),
    [open, allDnis],
  );

  const allSelected = allDnis.length > 0 && selected.length === allDnis.length;

  const toggleAll = (checked: boolean) => {
    setSelected(checked ? allDnis : []);
  };

  const toggleEmployee = (dni: string, checked: boolean) => {
    setSelected((current) =>
      checked
        ? Array.from(new Set([...current, dni]))
        : current.filter((item) => item !== dni),
    );
  };

  const download = async (mode: "all" | "selected") => {
    setPending(mode);

    try {
      await downloadCourseCertificatesBatch({
        company,
        courseId: course.id,
        dnis: mode === "all" ? undefined : selected,
      });
    } finally {
      setPending(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Certificados del curso</DialogTitle>
          <DialogDescription>
            Descarga todos los certificados o selecciona quiénes deben incluirse
            en el ZIP.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-md border p-3">
            <div>
              <p className="text-sm font-medium">{course.name}</p>
              <p className="text-xs text-muted-foreground">
                {employees.length} empleado(s) inscrito(s)
              </p>
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox
                checked={allSelected}
                onCheckedChange={(checked) => toggleAll(checked === true)}
              />
              Todos
            </label>
          </div>

          <div className="max-h-80 overflow-y-auto rounded-md border">
            {employees.length === 0 ? (
              <p className="p-4 text-center text-sm text-muted-foreground">
                El curso no tiene empleados inscritos.
              </p>
            ) : (
              employees.map((employee) => {
                const checked = selected.includes(employee.dni);

                return (
                  <label
                    key={employee.dni}
                    className="flex cursor-pointer items-center gap-3 border-b px-3 py-2 last:border-b-0 hover:bg-muted/40"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(value) =>
                        toggleEmployee(employee.dni, value === true)
                      }
                    />
                    <span className="min-w-0 flex-1 text-sm">
                      {employee.first_name} {employee.last_name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {employee.dni}
                    </span>
                  </label>
                );
              })
            )}
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => download("all")}
            disabled={pending !== null || employees.length === 0}
          >
            {pending === "all" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileArchive className="mr-2 h-4 w-4" />
            )}
            Descargar todos
          </Button>
          <Button
            type="button"
            onClick={() => download("selected")}
            disabled={pending !== null || selected.length === 0}
          >
            {pending === "selected" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Descargar seleccionados ({selected.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
