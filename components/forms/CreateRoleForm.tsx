'use client';
import { useCreateRole } from "@/actions/aerolinea/roles/actions";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { useGetPermissions } from "@/hooks/sistema/usuario/useGetPermissions";
import { Company, Module } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { useGetCompanies } from "@/hooks/sistema/useGetCompanies";
import { useGetModulesByCompanyId } from "@/hooks/sistema/useGetModulesByCompanyId";

const formSchema = z.object({
  name: z.string().min(3, {
    message: "El nombre debe tener al menos 3 carácters.",
  }),
  label: z.string({
    message: "Debe especificar un nombre para el rol.",
  }),
  company: z.string(),
})

interface FormProps {
  onClose: () => void,
}

export default function CreateRoleForm({ onClose }: FormProps) {

  const [selectedCompany, setSelectedCompany] = useState<Company>();

  const [selectedModule, setSelectedModule] = useState<Module | null>(null);

  const { createRole } = useCreateRole();

  const { data: companies, isLoading, isError: isCompaniesError } = useGetCompanies();

  const { mutate: fetchModules, data: modules, isPending } = useGetModulesByCompanyId();

  useEffect(() => {
    if (selectedCompany) {
      fetchModules(selectedCompany.id);
    }
  }, [selectedCompany, fetchModules]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      company: "",

    },
  })

  const { control } = form;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {

    const data = {
      name: values.name,
      company: parseInt(values.company),
      label: values.label,
    }
    createRole.mutate(data);
    if (createRole.isSuccess) {
      onClose();
    }
  }

  const onValueChange = (value: string) => {
    const company = companies?.find(company => company.id.toString() === value);
    setSelectedCompany(company)
  }

  const handleModuleChange = (moduleName: string) => {
    const moduleSelected = modules?.find(m => m.name === moduleName) || null;
    setSelectedModule(moduleSelected);
  }


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input placeholder="EJ: Admin..." {...field} />
              </FormControl>
              <FormDescription>
                Este será el nombre del rol.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="label"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Etiqueta</FormLabel>
              <FormControl>
                <Input placeholder="EJ: Jef. de X" {...field} />
              </FormControl>
              <FormDescription>
                Este será la etiqueta del rol.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="company"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Compañía</FormLabel>
              <Select onValueChange={(event) => {
                field.onChange(event)
                onValueChange(event)
              }}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione la compañia..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {
                    isLoading && <div>Cargando...</div>
                  }
                  {
                    companies && companies.map(company => (
                      <SelectItem key={company.id} value={company.id.toString()}>
                        {company.description}
                      </SelectItem>
                    ))
                  }
                  {
                    isCompaniesError && <p className="text-muted-foreground text-center text-sm">Ha ocurrido un error al cargar las compañías...</p>
                  }
                </SelectContent>
              </Select>
              <FormDescription>
                Especifíque la compañía a la que pertenecerá el permiso.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="bg-primary mt-2 text-white hover:bg-blue-900 disabled:bg-primary/70" disabled={createRole?.isPending} type="submit">
          {createRole?.isPending ? <Loader2 className="size-4 animate-spin" /> : <p>Crear</p>}
        </Button>
      </form>
    </Form>
  )
}
