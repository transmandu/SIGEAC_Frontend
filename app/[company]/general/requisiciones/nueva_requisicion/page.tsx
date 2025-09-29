"use client";

import { useCreateRequisition } from "@/actions/mantenimiento/compras/requisiciones/actions";
import { CreateBatchDialog } from "@/components/dialogs/mantenimiento/almacen/CreateBatchDialog";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useGetSecondaryUnits } from "@/hooks/general/unidades/useGetSecondaryUnits";
import { useGetBatchesByLocationId } from "@/hooks/mantenimiento/almacen/renglones/useGetBatchesByLocationId";
import { useGetMaintenanceAircrafts } from "@/hooks/mantenimiento/planificacion/useGetMaintenanceAircrafts";
import { useGetUserDepartamentEmployees } from "@/hooks/sistema/empleados/useGetUserDepartamentEmployees";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Check,
  ChevronsUpDown,
  Loader2,
  MinusCircle,
  PlusCircle,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import CertificatesCombobox from "./_components/TagCombobox";

interface Article {
  part_number: string;
  alt_part_number?: string;
  justification: string;
  manual: string;
  reference_cod: string;
  pma?: string;
  quantity: number;
  image?: File;
  unit?: string;
  certificates?: string[];
}

interface Batch {
  batch: string;
  category: string;
  batch_name: string;
  batch_articles: Article[];
}

const FormSchema = z.object({
  justification: z
    .string({ required_error: "La justificación es obligatoria" })
    .min(2, {
      message: "La justificación debe tener al menos 2 caracteres.",
    }),
  company: z.string(),
  aircraft_id: z.string({ message: "Debe elegir una aeronave." }),
  location_id: z.string(),
  type: z.string({
    required_error: "Debe seleccionar un tipo de requisición.",
  }),
  created_by: z.string(),
  requested_by: z.string({
    required_error: "Debe ingresar quien lo solicita.",
  }),
  image: z
    .instanceof(File, { message: "Debe ser un archivo válido" })
    .refine((file) => file.size <= 5 * 1024 * 1024, "Max 5MB")
    .refine(
      (file) => ["image/jpeg", "image/png"].includes(file.type),
      "Solo JPEG/PNG"
    )
    .optional(),
  articles: z
    .array(
      z.object({
        batch: z.string(),
        batch_name: z.string(),
        category: z.string(),
        batch_articles: z.array(
          z.object({
            part_number: z.string().optional(),
            alt_part_number: z.string().optional(),
            justification: z.string({
              required_error: "Debe ingresar una justificación.",
            }),
            manual: z.string({
              required_error: "Debe ingresar un manual de referencia.",
            }),
            reference_cod: z.string({
              required_error: "Debe ingresar el código de referencia.",
            }),
            pma: z.string().optional(),
            quantity: z.number().min(1, "Debe ingresar una cantidad válida"),
            image: z.instanceof(File).optional(),
            unit: z.string().optional(),
            certificates: z.array(z.string()).optional(),
          })
        ),
      })
    )
    .refine(
      (articles) =>
        articles.every((batch) =>
          batch.batch_articles.every(
            (article) => batch.category !== "consumible" || article.unit
          )
        ),
      {
        message: "La unidad secundaria es obligatoria para consumibles",
        path: ["articles"],
      }
    ),
});

type FormSchemaType = z.infer<typeof FormSchema>;

const CreateRequisitionPage = () => {
  const { user } = useAuth();
  const { mutate, data } = useGetBatchesByLocationId();
  const { selectedCompany, selectedStation } = useCompanyStore();
  const {
    data: employees,
    isPending: employeesLoading,
  } = useGetUserDepartamentEmployees(selectedCompany?.slug);
  const { data: secondaryUnits, isLoading: secondaryUnitLoading } =
    useGetSecondaryUnits(selectedCompany?.slug);
  const {
    data: aircrafts,
    isLoading: isAircraftsLoading,
  } = useGetMaintenanceAircrafts(selectedCompany?.slug);
  const { createRequisition } = useCreateRequisition();
  const [selectedBatches, setSelectedBatches] = useState<Batch[]>([]);
  const router = useRouter()

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      articles: [],
      justification: "",
      type: "",
      requested_by: "",
      image: undefined,
    },
  });

  useEffect(() => {
    if (user && selectedCompany && selectedStation) {
      form.setValue("created_by", user.id.toString());
      form.setValue("company", selectedCompany?.slug);
      form.setValue("location_id", selectedStation);
    }
  }, [user, form, selectedCompany, selectedStation]);

  useEffect(() => {
    if (selectedStation) {
      mutate({location_id: Number(selectedStation), company: selectedCompany!.slug})
    }
  }, [selectedStation, mutate, selectedCompany])

  useEffect(() => {
    form.setValue("articles", selectedBatches);
  }, [selectedBatches, form]);

  const handleBatchSelect = (
    batchName: string,
    batchId: string,
    batch_category: string
  ) => {
    setSelectedBatches((prev) => {
      const exists = prev.some((b) => b.batch === batchId);
      if (exists) {
        return prev.filter((b) => b.batch !== batchId);
      }
      return [
        ...prev,
        {
          batch: batchId,
          batch_name: batchName,
          category: batch_category,
          batch_articles: [
            {
              part_number: "",
              alt_part_number: "",
              justification: "",
              manual: "",
              reference_cod: "",
              quantity: 0,
            },
          ],
        },
      ];
    });
  };

  const handleArticleChange = (
    batchName: string,
    index: number,
    field: keyof Article,
    value: string | number | File | undefined | string[]
  ) => {
    setSelectedBatches((prev) =>
      prev.map((batch) =>
        batch.batch === batchName
          ? {
              ...batch,
              batch_articles: batch.batch_articles.map((article, i) =>
                i === index ? { ...article, [field]: value } : article
              ),
            }
          : batch
      )
    );
  };

  const addArticle = (batchName: string) => {
    setSelectedBatches((prev) =>
      prev.map((batch) =>
        batch.batch === batchName
          ? {
              ...batch,
              batch_articles: [
                ...batch.batch_articles,
                {
                  part_number: "",
                  alt_part_number: "",
                  justification: "",
                  manual: "",
                  reference_cod: "",
                  quantity: 0,
                },
              ],
            }
          : batch
      )
    );
  };

  const removeArticleFromBatch = (batchName: string, articleIndex: number) => {
    setSelectedBatches((prevBatches) =>
      prevBatches.map((batch) =>
        batch.batch === batchName
          ? {
              ...batch,
              batch_articles: batch.batch_articles.filter(
                (_, index) => index !== articleIndex
              ),
            }
          : batch
      )
    );
  };

  const removeBatch = (batchName: string) => {
    setSelectedBatches((prevBatches) =>
      prevBatches.filter((batch) => batch.batch !== batchName)
    );
  };

  const onSubmit = async (data: FormSchemaType) => {
    const formattedData = {
      ...data,
      type: "GENERAL",
    }
    await createRequisition.mutateAsync({data: formattedData, company: selectedCompany!.slug})
    router.push(`/${selectedCompany!.slug}/general/requisiciones`)
  }

  return (
    <ContentLayout title="Solicitud de Compra">
      <div className="space-y-6">
        <h1 className="text-5xl font-bold text-center">
          Crear Nueva Solicitud de Compra
        </h1>
        <p className="text-muted-foreground text-center italic">
          Ingrese la información para crear una solicitud de compra de uno o múltiples
          artículos.
        </p>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col space-y-3"
          >
            <div className="flex gap-2">
              <FormField
                control={form.control}
                name="requested_by"
                render={({ field }) => (
                  <FormItem className="w-full flex flex-col space-y-3 mt-1.5">
                    <FormLabel>Solicitante</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            disabled={employeesLoading}
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {employeesLoading && (
                              <Loader2 className="size-4 animate-spin mr-2" />
                            )}
                            {field.value
                              ? employees?.find(
                                  (employee) =>
                                    `${employee.dni}` ===
                                    field.value
                                )?.first_name +
                                " " +
                                employees?.find(
                                  (employee) =>
                                    `${employee.dni}` ===
                                    field.value
                                )?.last_name
                              : "Elige al solicitante..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="p-0">
                        <Command>
                          <CommandInput placeholder="Busque un empleado..." />
                          <CommandList>
                            <CommandEmpty className="text-sm p-2 text-center">
                              No se ha encontrado ningún empleado.
                            </CommandEmpty>
                            <CommandGroup>
                              {employees?.map((employee) => (
                                <CommandItem
                                  value={`${employee.dni}`}
                                  key={employee.id}
                                  onSelect={() => {
                                    form.setValue(
                                      "requested_by",
                                      `${employee.dni}`
                                    );
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      `${employee.dni}` ===
                                        field.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {employee.first_name} {employee.last_name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="aircraft_id"
                render={({ field }) => (
                  <FormItem className="w-full flex flex-col space-y-3 mt-1.5">
                    <FormLabel>Aeronave</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            disabled={isAircraftsLoading}
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {isAircraftsLoading && (
                              <Loader2 className="size-4 animate-spin mr-2" />
                            )}
                            {field.value
                              ? aircrafts?.find(
                                  (aircraft) =>
                                    aircraft.id.toString() === field.value
                                )?.acronym +
                                " - " +
                                aircrafts?.find(
                                  (aircraft) =>
                                    aircraft.id.toString() === field.value
                                )?.manufacturer.name
                              : "Selec. la aeronave..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="p-0">
                        <Command>
                          <CommandInput placeholder="Busque un empleado..." />
                          <CommandList>
                            <CommandEmpty className="text-sm p-2 text-center">
                              No se ha encontrado ninguna aeronave.
                            </CommandEmpty>
                            <CommandGroup>
                              {aircrafts?.map((aircraft) => (
                                <CommandItem
                                  value={aircraft.id.toString()}
                                  key={aircraft.id}
                                  onSelect={() => {
                                    form.setValue(
                                      "aircraft_id",
                                      aircraft.id.toString()
                                    );
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      aircraft.id.toString() === field.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {aircraft.acronym} -{" "}
                                  {aircraft.manufacturer.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="articles"
              render={() => (
                <FormItem className="flex flex-col">
                  <FormLabel>Artículos</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-[200px] justify-between",
                            selectedBatches.length === 0 &&
                              "text-muted-foreground"
                          )}
                        >
                          {selectedBatches.length > 0
                            ? `${selectedBatches.length} reng. seleccionados`
                            : "Selec. un renglón..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command>
                        <CommandInput placeholder="Buscar..." />
                        <CommandList>
                          <CommandEmpty>No existen renglones...</CommandEmpty>
                          <CommandGroup>
                            <div className="flex justify-center m-2">
                              <CreateBatchDialog />
                            </div>
                            {data &&
                              data.map((batch) => (
                                <CommandItem
                                  key={batch.name}
                                  value={batch.name}
                                  onSelect={() =>
                                    handleBatchSelect(
                                      batch.name,
                                      batch.id.toString(),
                                      batch.category
                                    )
                                  }
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      selectedBatches.some(
                                        (b) => b.batch === batch.id.toString()
                                      )
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {batch.name}
                                </CommandItem>
                              ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <div className="mt-4 space-y-4">
                    <ScrollArea
                      className={cn(
                        "pr-4",
                        selectedBatches.length > 2 ? "h-[300px]" : ""
                      )}
                    >
                      {selectedBatches.map((batch) => (
                        <div
                          key={batch.batch}
                          className="mb-6 p-4 bg-gray-50 rounded-lg border"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-lg text-gray-800">
                              {batch.batch_name}
                            </h4>
                            <Button
                              variant="ghost"
                              type="button"
                              size="sm"
                              onClick={() => removeBatch(batch.batch)}
                              className="text-red-500 hover:text-red-600"
                            >
                              <MinusCircle className="size-4 mr-1" />
                              Eliminar lote
                            </Button>
                          </div>

                          <ScrollArea
                            className={cn(
                              "pr-3",
                              batch.batch_articles.length > 2 ? "h-[550px]" : ""
                            )}
                          >
                            <div className="space-y-4">
                              {batch.batch_articles.map((article, index) => (
                                <div
                                  key={index}
                                  className="p-3 bg-white rounded-md border shadow-sm"
                                >
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                                    <div>
                                      <Label>Número de parte</Label>
                                      <Input
                                        placeholder="Ej: 12345-678"
                                        value={article.part_number}
                                        onChange={(e) =>
                                          handleArticleChange(
                                            batch.batch,
                                            index,
                                            "part_number",
                                            e.target.value
                                          )
                                        }
                                      />
                                    </div>
                                    <div>
                                      <Label>N/P Alterno</Label>
                                      <Input
                                        placeholder="Ej: ALT-123"
                                        value={article.alt_part_number || ""}
                                        onChange={(e) =>
                                          handleArticleChange(
                                            batch.batch,
                                            index,
                                            "alt_part_number",
                                            e.target.value
                                          )
                                        }
                                      />
                                    </div>
                                    <div>
                                      <Label>Manual</Label>
                                      <Input
                                        placeholder="Número de manual"
                                        value={article.manual}
                                        onChange={(e) =>
                                          handleArticleChange(
                                            batch.batch,
                                            index,
                                            "manual",
                                            e.target.value
                                          )
                                        }
                                      />
                                    </div>
                                    <div>
                                      <Label>Cod. Referencia</Label>
                                      <Input
                                        placeholder="Código interno"
                                        value={article.reference_cod}
                                        onChange={(e) =>
                                          handleArticleChange(
                                            batch.batch,
                                            index,
                                            "reference_cod",
                                            e.target.value
                                          )
                                        }
                                      />
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <div>
                                      <Label>PMA</Label>
                                      <Input
                                        placeholder="PMA del artículo"
                                        value={article.pma || ""}
                                        onChange={(e) =>
                                          handleArticleChange(
                                            batch.batch,
                                            index,
                                            "pma",
                                            e.target.value
                                          )
                                        }
                                      />
                                    </div>
                                    <div>
                                      <Label>Unidad Secundaria</Label>
                                      <Select
                                        disabled={secondaryUnitLoading}
                                        value={article.unit}
                                        onValueChange={(value) =>
                                          handleArticleChange(
                                            batch.batch,
                                            index,
                                            "unit",
                                            value
                                          )
                                        }
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Seleccionar unidad" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {secondaryUnits?.map((secU) => (
                                            <SelectItem
                                              key={secU.id}
                                              value={secU.id.toString()}
                                            >
                                              {secU.secondary_unit}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div>
                                      <Label>Cantidad</Label>
                                      <Input
                                        type="number"
                                        min="1"
                                        placeholder="Ej: 2"
                                        value={article.quantity}
                                        onChange={(e) =>
                                          handleArticleChange(
                                            batch.batch,
                                            index,
                                            "quantity",
                                            Number(e.target.value)
                                          )
                                        }
                                      />
                                    </div>
                                    <div>
                                      <Label>Imagen</Label>
                                      <Input
                                        type="file"
                                        accept="image/*"
                                        className="cursor-pointer"
                                        onChange={(e) =>
                                          handleArticleChange(
                                            batch.batch,
                                            index,
                                            "image",
                                            e.target.files?.[0]
                                          )
                                        }
                                      />
                                    </div>
                                    <div className="flex w-full gap-4 xl:col-span-4 col-span-2">
                                      <div className="w-full">
                                        <Label>Certificados</Label>
                                        <CertificatesCombobox
                                          selectedCertificates={
                                            article.certificates || []
                                          }
                                          onCertificatesChange={(selected) =>
                                            handleArticleChange(
                                              batch.batch,
                                              index,
                                              "certificates",
                                              selected
                                            )
                                          }
                                        />
                                      </div>
                                      <div className="w-full">
                                        <Label>Justificación</Label>
                                        <Textarea
                                          value={article.justification}
                                          onChange={(e) =>
                                            handleArticleChange(
                                              batch.batch,
                                              index,
                                              "justification",
                                              e.target.value
                                            )
                                          }
                                          placeholder="Justificación para este artículo"
                                        />
                                      </div>
                                    </div>
                                  </div>

                                  {form.formState.errors.articles?.[index]
                                    ?.batch_articles?.[index]?.unit && (
                                    <p className="text-red-500 text-xs mt-2">
                                      La unidad es obligatoria para consumibles.
                                    </p>
                                  )}

                                  <div className="flex justify-end mt-3">
                                    <Button
                                      variant="ghost"
                                      type="button"
                                      size="sm"
                                      onClick={() =>
                                        removeArticleFromBatch(
                                          batch.batch,
                                          index
                                        )
                                      }
                                      className="text-red-500 hover:text-red-600"
                                    >
                                      <MinusCircle className="size-4 mr-1" />
                                      Eliminar artículo
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>

                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => addArticle(batch.batch)}
                            className="mt-3 w-full"
                          >
                            <PlusCircle className="size-4 mr-2" />
                            Agregar artículo a este lote
                          </Button>
                        </div>
                      ))}
                    </ScrollArea>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="justification"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ej: Necesidad de la pieza X para instalación..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Imagen General</FormLabel>
                  <div className="flex items-center gap-4">
                    {field.value && (
                      <Image
                        src={URL.createObjectURL(field.value)}
                        alt="Preview"
                        className="h-16 w-16 rounded-md object-cover"
                        width={64}
                        height={64}
                      />
                    )}
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/jpeg, image/png"
                        onChange={(e) => field.onChange(e.target.files?.[0])}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-between items-center gap-x-4">
              <Separator className="flex-1" />
              <p className="text-muted-foreground">SIGEAC</p>
              <Separator className="flex-1" />
            </div>
            <Button disabled={createRequisition.isPending}>
              {createRequisition.isPending ? (
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              ) : (
                "Crear Solicitud de Compra"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </ContentLayout>
  );
};

export default CreateRequisitionPage;
