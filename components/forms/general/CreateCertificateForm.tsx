"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "next/navigation";
import { useGetSMSCoursesList } from "@/hooks/sms/useGetCertificates";
import { useCreateSMSCertificate } from "@/actions/sms/certificates/actions";
import { useAuth } from "@/contexts/AuthContext"; // Importante: tu hook de auth
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, UploadCloud, FileCheck } from "lucide-react";
import { toast } from "sonner";

interface CreateCertificateFormProps {
  onClose: () => void;
}

export const CreateCertificateForm = ({ onClose }: CreateCertificateFormProps) => {
  const params = useParams();
  const companySlug = params.company as string;
  
  // 1. Obtenemos el usuario y sus datos de empleado
  const { user } = useAuth();
  
  const { data: courses, isLoading: loadingCourses } = useGetSMSCoursesList(companySlug);
  const { mutateAsync: createCertificate, isPending } = useCreateSMSCertificate();

  const [fileName, setFileName] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // 2. Lógica de envío con el ID de empleado dinámico
  const onSubmit = async (data: any) => {
    if (!user || !user.employee || user.employee.length === 0) {
      toast.error("Error de perfil", { 
        description: "Tu sesión no tiene datos de empleado. Cierra sesión y vuelve a entrar." 
      });
      return;
    }

    // Buscamos el ID ( Richard es el 68 )
    const currentEmployeeProfile = user.employee.find(
      (emp: any) => emp.company?.toLowerCase() === companySlug.toLowerCase()
    );

    // Si no lo encuentra por empresa, forzamos el primero (ID 68)
    const employeeId = currentEmployeeProfile?.id || user.employee[0]?.id;

    if (!employeeId) {
      toast.error("Error", { description: "ID de empleado no encontrado." });
      return;
    }

    console.log("DEBUG: Enviando employee_id ->", employeeId); // Revisa esto en F12

    const formData = new FormData();
    formData.append("course_id", String(data.course_id));
    formData.append("completion_date", data.completion_date);
    formData.append("document", data.document[0]);
    formData.append("employee_id", String(employeeId)); // Forzamos a String para el Multipart

    try {
      await createCertificate({
        company: companySlug,
        data: formData,
      });
      toast.success("¡Certificado guardado con éxito!");
      onClose();
    } catch (error) {
      console.error("Error capturado:", error);
      toast.error("Error en el servidor", { description: "El ID enviado fue: " + employeeId });
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileName(e.target.files[0].name);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-2">
      <div className="grid gap-2">
        <Label htmlFor="course_id">Curso / Capacitación</Label>
        <select
          id="course_id"
          {...register("course_id", { required: "Debe seleccionar un curso" })}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">
            {loadingCourses ? "Cargando cursos..." : "Seleccione el curso realizado"}
          </option>
          {courses?.map((course: any) => (
            <option key={course.id} value={course.id}>
              {course.name}
            </option>
          ))}
        </select>
        {errors.course_id && (
          <p className="text-xs text-red-500 font-medium">{errors.course_id.message as string}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="completion_date">Fecha de Finalización</Label>
        <Input
          id="completion_date"
          type="date"
          {...register("completion_date", { required: "La fecha es obligatoria" })}
        />
        {errors.completion_date && (
          <p className="text-xs text-red-500 font-medium">{errors.completion_date.message as string}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label>Documento del Certificado (PDF, JPG, PNG)</Label>
        <div className="flex items-center justify-center w-full">
          <label
            htmlFor="dropzone-file"
            className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
              fileName 
                ? "border-green-400 bg-green-50/50" 
                : "border-gray-300 bg-gray-50 hover:bg-gray-100"
            }`}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-2">
              {fileName ? (
                <>
                  <FileCheck className="w-8 h-8 mb-2 text-green-500" />
                  <p className="text-xs text-green-600 font-medium truncate max-w-[200px]">{fileName}</p>
                </>
              ) : (
                <>
                  <UploadCloud className="w-8 h-8 mb-2 text-gray-400" />
                  <p className="text-xs text-gray-500">
                    <span className="font-semibold">Click para subir</span> o arrastra el archivo
                  </p>
                </>
              )}
            </div>
            <input
              id="dropzone-file"
              type="file"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png"
              {...register("document", { 
                required: "El archivo es obligatorio",
                onChange: handleFileChange 
              })}
            />
          </label>
        </div>
        {errors.document && (
          <p className="text-xs text-red-500 font-medium">{errors.document.message as string}</p>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button 
          variant="outline" 
          type="button" 
          onClick={onClose} 
          disabled={isPending}
        >
          Cancelar
        </Button>
        <Button 
          type="submit" 
          disabled={isPending || loadingCourses || !user}
          className="min-w-[120px]"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            "Guardar Certificado"
          )}
        </Button>
      </div>
    </form>
  );
};