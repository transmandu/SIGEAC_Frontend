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
import { useGetCompanies } from "@/hooks/administracion/useGetCompanies";
import { useGetModulesByCompanyId } from "@/hooks/administracion/useGetModulesByCompanyId";
import { useGetPermissions } from "@/hooks/sistema/usuario/useGetPermissions";
import { Company, Module } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";

const formSchema = z.object({
  name: z.string().min(3, {
    message: "El nombre debe tener al menos 3 carácters.",
  }),
  company: z.string(),
  permissions: z.array(z.number()).optional(),
})

interface FormProps {
  onClose: () => void,
}

export default function CreateRoleForm({ onClose }: FormProps) {

  const [selectedCompany, setSelectedCompany] = useState<Company>();

  const [selectedModule, setSelectedModule] = useState<Module | null>(null);

  const { createRole } = useCreateRole();

  const { data: companies, isLoading, isError: isCompaniesError } = useGetCompanies();

  const { data: permissions, isLoading: isPermissionLoading, isError: isPermissionError } = useGetPermissions();

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
      permissions: [],
    },
  })

  const { control } = form;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {

    const data = {
      name: values.name,
      company: parseInt(values.company),
      permissions: values.permissions
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
        <FormField
          control={control}
          name="permissions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Permisos</FormLabel>
              <FormControl>
                {
                  selectedCompany ? (
                    <>
                      <Tabs onValueChange={handleModuleChange}>
                        <TabsList className="grid w-full grid-cols-1 md:grid-cols-2">
                          {isPending && <Loader className="size-4 animate-spin" />}
                          {modules?.map((m) => (
                            <TabsTrigger value={m.name} key={m.id}>{m.name}</TabsTrigger>
                          ))}
                        </TabsList>
                        {selectedModule && (
                          <TabsContent value={selectedModule.name}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                              {
                                isPermissionLoading && <Loader2 className="size-4 animate-spin" />
                              }
                              {permissions?.filter(permission =>
                                permission.modules.some(mod => mod.id === selectedModule.id)
                              ).map(permission => (
                                <div key={permission.id} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={permission.name}
                                    value={permission.id}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value!, permission.id])
                                        : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== permission.id
                                          )
                                        )
                                    }}
                                  />
                                  <label className='text-sm text-center' htmlFor={permission.name}>{permission.label}</label>
                                </div>
                              ))}
                              {
                                isPermissionError && <p className="text-sm text-muted-foreground text-center">Ha ocurrido un error al cargar los permisos...</p>
                              }
                            </div>
                          </TabsContent>
                        )}
                      </Tabs>
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground">Esperando eleccion...</p>
                  )
                }
              </FormControl>
              <FormDescription>
                {
                  selectedCompany && <p>Estos serán los permisos asignados al rol.</p>
                }
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
