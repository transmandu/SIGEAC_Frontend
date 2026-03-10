"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "next/navigation";
import { useGetSMSCoursesList, useGetEmployeesList } from "@/hooks/sms/useGetCertificates";
import { useUpdateSMSCertificate } from "@/actions/sms/certificates/actions";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, FileCheck, User, Check, ChevronsUpDown } from "lucide-react";
import { toast } from "sonner";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { CertificateColumn } from "@/app/[company]/sms/(employees)/certificados/columns";

interface EditFormValues {
  course_id: string;
  completion_date: string;
  document: FileList | null;
  employee_dni: string;
}

interface EditCertificateFormProps {
  onClose: () => void;
  certificate: CertificateColumn;
}

const EditCertificateForm = ({ onClose, certificate }: EditCertificateFormProps) => {
  const params = useParams();
  const companySlug = params.company as string;
  const { user } = useAuth();
  
  const { data: courses, isLoading: isLoadingCourses } = useGetSMSCoursesList(companySlug);
  const { data: employees, isLoading: isLoadingEmployees } = useGetEmployeesList(companySlug);
  const { mutateAsync: updateCertificate, isPending } = useUpdateSMSCertificate();

  const isDataLoading = isLoadingCourses || isLoadingEmployees;

  const [fileName, setFileName] = useState<string | null>("Archivo actual");
  const [openPopover, setOpenPopover] = useState(false);

  const isManagement = user?.roles?.some(role => 
    ['JEFE_SMS', 'ANALISTA_SMS', 'SUPERUSER'].includes(role.name.toUpperCase())
  );

  const { register, handleSubmit, setValue, watch } = useForm<EditFormValues>({
    defaultValues: {
      course_id: (certificate.course as any)?.id?.toString() || "",
      completion_date: certificate.completion_date || "",
      document: null,
      employee_dni: certificate.employee?.dni || ""
    }
  });

  const selectedDni = watch("employee_dni");

  const onSubmit = async (data: EditFormValues) => {
    const formData = new FormData();
    formData.append("_method", "PUT"); 
    formData.append("course_id", data.course_id);
    formData.append("completion_date", data.completion_date);
    formData.append("employee_dni", data.employee_dni);
    
    if (data.document && data.document.length > 0) {
      formData.append("document", data.document[0]);
    }

    try {
      await updateCertificate({ 
        company: companySlug, 
        id: certificate.id, 
        data: formData 
      });
      toast.success("Certificado actualizado correctamente");
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Error al actualizar");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
      {/* Selector de Empleado */}
      {isManagement && (
        <div className="grid gap-2 p-3 border rounded-lg bg-accent/20">
          <Label className="flex items-center gap-2 font-semibold text-xs uppercase text-muted-foreground">
            <User className="w-3 h-3" /> Empleado
          </Label>
          <Popover open={openPopover} onOpenChange={setOpenPopover}>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                role="combobox" 
                className="w-full justify-between bg-background text-left font-normal"
                disabled={isDataLoading}
              >
                {isDataLoading ? "Cargando empleados..." : (
                  selectedDni 
                  ? employees?.find((e: any) => e.dni === selectedDni) 
                    ? `${employees.find((e: any) => e.dni === selectedDni).last_name}, ${employees.find((e: any) => e.dni === selectedDni).first_name}`
                    : "Seleccionar empleado..."
                  : "Seleccionar empleado..."
                )}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
              <Command>
                <CommandInput placeholder="Buscar por DNI o nombre..." />
                <CommandList>
                  <CommandEmpty>No hay resultados.</CommandEmpty>
                  <CommandGroup>
                    {employees?.map((emp: any) => (
                      <CommandItem 
                        key={emp.dni} 
                        value={`${emp.first_name} ${emp.last_name} ${emp.dni}`}
                        onSelect={() => { setValue("employee_dni", emp.dni); setOpenPopover(false); }}
                      >
                        <Check className={cn("mr-2 h-4 w-4", selectedDni === emp.dni ? "opacity-100" : "opacity-0")} />
                        <div className="flex flex-col">
                           <span>{emp.last_name}, {emp.first_name}</span>
                           <span className="text-[10px] text-muted-foreground">{emp.dni}</span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      )}

      {/* Selector de Curso con Fecha Detallada */}
      <div className="grid gap-2">
        <Label>Curso / Capacitación</Label>
        <Select 
          onValueChange={(v) => setValue("course_id", v)} 
          defaultValue={watch("course_id")}
          disabled={isDataLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder={isDataLoading ? "Cargando cursos..." : "Seleccione el curso"} />
          </SelectTrigger>
          <SelectContent>
            {courses?.map((c: any) => (
              <SelectItem key={c.id} value={c.id.toString()}>
                <div className="flex items-center justify-between w-full gap-4">
                  <span>{c.name}</span>
                  <span className="text-[11px] italic text-muted-foreground ml-auto">
                    {c.start_date 
                      ? new Date(c.start_date + 'T00:00:00').toLocaleDateString('es-ES') 
                      : ''}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="completion_date">Fecha de Finalización</Label>
        <Input 
            type="date" 
            id="completion_date" 
            {...register("completion_date", { required: "La fecha es obligatoria" })} 
        />
      </div>

      <div className="grid gap-2">
        <Label className="text-blue-600 font-bold text-[10px] uppercase tracking-wider">
            ¿Desea reemplazar el archivo?
        </Label>
        <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-background hover:bg-accent/30 transition-colors border-slate-300">
          <div className="flex flex-col items-center justify-center text-center px-2">
            <FileCheck className={cn("w-6 h-6 mb-1", fileName !== "Archivo actual" ? "text-green-500" : "text-muted-foreground")} />
            <p className="text-[11px] font-medium truncate max-w-[250px]">{fileName}</p>
          </div>
          <input 
            type="file" 
            className="hidden" 
            accept=".pdf,.jpg,.jpeg,.png"
            {...register("document", { 
                onChange: (e) => setFileName(e.target.files[0]?.name || "Archivo actual") 
            })}
          />
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline" type="button" onClick={onClose} disabled={isPending || isDataLoading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending || isDataLoading} className="min-w-[140px]">
          {isDataLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
              Cargando datos...
            </>
          ) : isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
              Actualizando...
            </>
          ) : "Guardar Cambios"}
        </Button>
      </div>
    </form>
  );
};

export default EditCertificateForm;