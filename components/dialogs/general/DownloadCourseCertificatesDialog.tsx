"use client";

import { useMemo, useState } from "react";
import { Download, FileArchive, FileText, Loader2 } from "lucide-react";
import {
  downloadCourseCertificatesBatch,
  downloadUploadedCourseCertificates,
} from "@/actions/general/cursos/certificates";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetCourseUploadedCertificates } from "@/hooks/curso/useGetCourseUploadedCertificates";
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
  focusDni?: string | null;
}

type TabValue = "generated" | "uploaded";

export function DownloadCourseCertificatesDialog({
  open,
  onOpenChange,
  course,
  company,
  employees,
  focusDni,
}: Props) {
  const [tab, setTab] = useState<TabValue>("generated");
  const [pending, setPending] = useState<"all" | "selected" | null>(null);

  const visibleEmployees = useMemo(
    () =>
      focusDni
        ? employees.filter((employee) => employee.dni === focusDni)
        : employees,
    [employees, focusDni],
  );

  const allDnis = useMemo(
    () => visibleEmployees.map((employee) => employee.dni),
    [visibleEmployees],
  );

  const [selected, setSelected] = useResettingState<string[]>(
    () => (open ? allDnis : []),
    [open, allDnis],
  );

  const uploadedQuery = useGetCourseUploadedCertificates(
    company,
    course.id,
    open && tab === "uploaded",
  );

  const uploadedCertificates = useMemo(
    () => uploadedQuery.data ?? [],
    [uploadedQuery.data],
  );
  const visibleUploadedCertificates = useMemo(
    () =>
      focusDni
        ? uploadedCertificates.filter(
            (certificate) => certificate.employee_dni === focusDni,
          )
        : uploadedCertificates,
    [uploadedCertificates, focusDni],
  );
  const uploadedIds = useMemo(
    () => visibleUploadedCertificates.map((certificate) => certificate.id),
    [visibleUploadedCertificates],
  );

  const [selectedUploaded, setSelectedUploaded] = useResettingState<number[]>(
    () => (open && tab === "uploaded" ? uploadedIds : []),
    [open, tab, uploadedIds],
  );

  const allSelected = allDnis.length > 0 && selected.length === allDnis.length;
  const allUploadedSelected =
    uploadedIds.length > 0 && selectedUploaded.length === uploadedIds.length;

  const toggleAll = (checked: boolean) => {
    if (tab === "generated") {
      setSelected(checked ? allDnis : []);
    } else {
      setSelectedUploaded(checked ? uploadedIds : []);
    }
  };

  const toggleEmployee = (dni: string, checked: boolean) => {
    setSelected((current) =>
      checked
        ? Array.from(new Set([...current, dni]))
        : current.filter((item) => item !== dni),
    );
  };

  const toggleUploaded = (id: number, checked: boolean) => {
    setSelectedUploaded((current) =>
      checked
        ? Array.from(new Set([...current, id]))
        : current.filter((item) => item !== id),
    );
  };

  const download = async (mode: "all" | "selected") => {
    setPending(mode);

    try {
      if (tab === "generated") {
        await downloadCourseCertificatesBatch({
          company,
          courseId: course.id,
          dnis: mode === "all" ? undefined : selected,
        });
      } else {
        await downloadUploadedCourseCertificates({
          company,
          courseId: course.id,
          certificateIds: mode === "all" ? uploadedIds : selectedUploaded,
        });
      }
    } finally {
      setPending(null);
    }
  };

  const totalSelected =
    tab === "generated" ? selected.length : selectedUploaded.length;
  const totalAvailable =
    tab === "generated" ? allDnis.length : uploadedIds.length;
  const allCurrentSelected =
    tab === "generated" ? allSelected : allUploadedSelected;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Certificados del curso</DialogTitle>
          <DialogDescription>
            Descarga el certificado generado con la plantilla o el certificado
            cargado que tenga asociado cada empleado en este curso.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(value) => setTab(value as TabValue)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="generated" className="gap-2">
              <FileText className="h-4 w-4" />
              Generados
            </TabsTrigger>
            <TabsTrigger value="uploaded" className="gap-2">
              <FileArchive className="h-4 w-4" />
              Cargados
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generated" className="space-y-3">
            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="text-sm font-medium">{course.name}</p>
                <p className="text-xs text-muted-foreground">
                  {visibleEmployees.length} empleado(s) inscrito(s)
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
              {visibleEmployees.length === 0 ? (
                <p className="p-4 text-center text-sm text-muted-foreground">
                  El curso no tiene empleados inscritos.
                </p>
              ) : (
                visibleEmployees.map((employee) => {
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
          </TabsContent>

          <TabsContent value="uploaded" className="space-y-3">
            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="text-sm font-medium">Certificados cargados</p>
                <p className="text-xs text-muted-foreground">
                  {uploadedIds.length} archivo(s) asociado(s) al curso
                </p>
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox
                  checked={allUploadedSelected}
                  onCheckedChange={(checked) => toggleAll(checked === true)}
                  disabled={uploadedIds.length === 0}
                />
                Todos
              </label>
            </div>

            <div className="max-h-80 overflow-y-auto rounded-md border">
              {uploadedQuery.isLoading ? (
                <div className="flex items-center justify-center gap-2 p-6 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cargando certificados...
                </div>
              ) : uploadedQuery.isError ? (
                <p className="p-4 text-center text-sm text-destructive">
                  No se pudieron cargar los certificados del curso.
                </p>
              ) : visibleUploadedCertificates.length === 0 ? (
                <p className="p-4 text-center text-sm text-muted-foreground">
                  Este curso no tiene certificados cargados.
                </p>
              ) : (
                visibleUploadedCertificates.map((certificate) => {
                  const checked = selectedUploaded.includes(certificate.id);
                  const employee = certificate.employee;

                  return (
                    <label
                      key={certificate.id}
                      className="flex cursor-pointer items-center gap-3 border-b px-3 py-2 last:border-b-0 hover:bg-muted/40"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(value) =>
                          toggleUploaded(certificate.id, value === true)
                        }
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm">
                          {employee
                            ? `${employee.first_name} ${employee.last_name}`
                            : certificate.employee_dni}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {certificate.employee_dni} · Cargado:{" "}
                          {certificate.completion_date}
                        </span>
                      </span>
                      <span className="max-w-40 truncate text-xs text-muted-foreground">
                        {certificate.document.split("/").pop()}
                      </span>
                    </label>
                  );
                })
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
          <p className="mr-auto self-center text-xs text-muted-foreground">
            {totalSelected} de {totalAvailable} seleccionado(s)
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => download("all")}
            disabled={pending !== null || totalAvailable === 0}
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
            disabled={pending !== null || totalSelected === 0}
          >
            {pending === "selected" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Descargar seleccionados
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
