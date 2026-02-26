"use client";

import { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "next/navigation";
import { useGetSMSCoursesList, useGetEmployeesList } from "@/hooks/sms/useGetCertificates";
import { useCreateSMSCertificate } from "@/actions/sms/certificates/actions";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Loader2, 
  UploadCloud, 
  FileCheck, 
  User, 
  Check, 
  ChevronsUpDown 
} from "lucide-react";
import { toast } from "sonner";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { cn } from "@/lib/utils";

interface CreateCertificateFormProps {
  onClose: () => void;
}

export const CreateCertificateForm = ({ onClose }: CreateCertificateFormProps) => {
  const params = useParams();
  const companySlug = params.company as string;
  
  const { user } = useAuth();
  
  const { data: courses, isLoading: loadingCourses } = useGetSMSCoursesList(companySlug);
  const { data: employees, isLoading: loadingEmployees } = useGetEmployeesList(companySlug);
  const { mutateAsync: createCertificate, isPending } = useCreateSMSCertificate();

  const [fileName, setFileName] = useState<string | null>(null);
  const [openPopover, setOpenPopover] = useState(false);

  // Lógica de Roles
  const isManagement = user?.roles?.some(role => 
    ['JEFE_SMS', 'ANALISTA_SMS', 'SUPERUSER'].includes(role.name.toUpperCase())
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      course_id: "",
      completion_date: "",
      document: null,
      employee_dni: ""
    }
  });

  const selectedDni = watch("employee_dni");

  const onSubmit = async (data: any) => {
    const formData = new FormData();
    formData.append("course_id", String(data.course_id));
    formData.append("completion_date", data.completion_date);
    formData.append("document", data.document[0]);
    
    let finalDni: string = "";

    if (isManagement) {
      finalDni = String(data.employee_dni || "");
    } else {
      const currentProfile = user?.employee?.find(
        (emp: any) => emp.company?.toLowerCase() === companySlug.toLowerCase()
      );
      finalDni = currentProfile?.dni || user?.employee?.[0]?.dni || "";
    }

    if (!finalDni) {
      toast.error("Error de identificación", { 
        description: "No se encontró un DNI válido para procesar." 
      });
      return;
    }

    formData.append("employee_dni", finalDni); 

    try {
      await createCertificate({
        company: companySlug,
        data: formData,
      });
      toast.success("¡Certificado guardado con éxito!");
      onClose();
    } catch (error: any) {
      const serverMessage = error.response?.data?.message || "Error en el servidor";
      toast.error("No se pudo guardar", { description: serverMessage });
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileName(e.target.files[0].name);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-2">
      
      {isManagement ? (
        <div className="grid gap-2 p-3 border rounded-lg bg-accent/20">
          <Label htmlFor="employee_dni" className="flex items-center gap-2 font-semibold">
            <User className="w-4 h-4 text-blue-600" /> Asignar a Empleado
          </Label>
          
          <Popover open={openPopover} onOpenChange={setOpenPopover}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openPopover}
                className="w-full justify-between bg-background font-normal"
              >
                {selectedDni
                  ? employees?.find((emp: any) => emp.dni === selectedDni)
                    ? `${employees.find((emp: any) => emp.dni === selectedDni).last_name}, ${employees.find((emp: any) => emp.dni === selectedDni).first_name}`
                    : "Seleccionar empleado..."
                  : "Seleccionar empleado..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
              <Command className="w-full">
                <CommandInput placeholder="Buscar por nombre o DNI..." />
                <CommandList>
                  <CommandEmpty>No se encontraron resultados.</CommandEmpty>
                  <CommandGroup>
                    {employees?.map((emp: any) => (
                      <CommandItem
                        key={emp.dni}
                        value={`${emp.first_name} ${emp.last_name} ${emp.dni}`}
                        onSelect={() => {
                          setValue("employee_dni", emp.dni);
                          setOpenPopover(false);
                        }}
                        className="cursor-pointer"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedDni === emp.dni ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex flex-col">
                          <span>{emp.last_name}, {emp.first_name}</span>
                          <span className="text-[10px] text-muted-foreground font-mono">{emp.dni}</span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <input type="hidden" {...register("employee_dni", { required: isManagement })} />

          {errors.employee_dni && (
            <p className="text-xs text-red-500 font-medium">Debe seleccionar un empleado</p>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-3 p-3 border rounded-lg bg-blue-50/50 border-blue-100 dark:bg-blue-950/20 dark:border-blue-900/30">
           <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
              <User className="h-4 w-4" />
           </div>
           <div className="text-sm">
              <p className="text-muted-foreground text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">Certificado para:</p>
              <p className="font-bold text-blue-900 dark:text-blue-100 leading-none">
                {(user as any)?.first_name} {(user as any)?.last_name}
              </p>
           </div>
        </div>
      )}

      <div className="grid gap-2">
          <Label>Curso / Capacitación</Label>
          <Select 
            onValueChange={(value) => setValue("course_id", value)} 
            defaultValue={watch("course_id")}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccione el curso realizado" />
            </SelectTrigger>
            <SelectContent>
              {courses?.map((course: any) => (
                <SelectItem key={course.id} value={course.id.toString()}>
                  <div className="flex items-center gap-2">
                    <span>{course.name}</span>
                    <span className="text-[11px] italic text-muted-foreground ml-auto">
                      {course.start_date 
                        ? new Date(course.start_date + 'T00:00:00').toLocaleDateString('es-ES') 
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
          id="completion_date"
          type="date"
          className="bg-background"
          {...register("completion_date", { required: "La fecha es obligatoria" })}
        />
        {errors.completion_date && <p className="text-xs text-red-500">{errors.completion_date.message as string}</p>}
      </div>

      <div className="grid gap-2">
        <Label>Documento</Label>
        <label
          htmlFor="dropzone-file"
          className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
            fileName 
              ? "border-green-500/50 bg-green-50/10 dark:bg-green-950/10" 
              : "border-muted hover:border-blue-500/50 hover:bg-accent/50 bg-background"
          }`}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-2">
            {fileName ? (
              <>
                <FileCheck className="w-8 h-8 mb-2 text-green-500" />
                <p className="text-xs text-green-600 dark:text-green-400 font-medium truncate max-w-[250px]">{fileName}</p>
              </>
            ) : (
              <>
                <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                <p className="text-xs text-muted-foreground font-medium">Subir archivo</p>
                <p className="text-[10px] text-muted-foreground/60 mt-1">PDF, JPG o PNG (Max. 10MB)</p>
              </>
            )}
          </div>
          <input
            id="dropzone-file"
            type="file"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png"
            {...register("document", { required: "Archivo obligatorio", onChange: handleFileChange })}
          />
        </label>
        {errors.document && <p className="text-xs text-red-500">{errors.document.message as string}</p>}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button variant="outline" type="button" onClick={onClose} disabled={isPending}>
          Cancelar
        </Button>
        <Button 
          type="submit" 
          disabled={isPending || loadingCourses || (isManagement && loadingEmployees)}
          className="min-w-[140px]"
        >
          {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</> : "Guardar Certificado"}
        </Button>
      </div>
    </form>
  );
};