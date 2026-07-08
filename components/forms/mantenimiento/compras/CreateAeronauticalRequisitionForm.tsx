"use client"
import { useCreateRequisition } from "@/actions/mantenimiento/compras/requisiciones/actions"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { useAuth } from "@/contexts/AuthContext"
import { useGetBatchesByLocationId } from "@/hooks/mantenimiento/almacen/renglones/useGetBatchesByLocationId"
import { useSearchBatchesWithArticles, type BatchWithArticles } from "@/hooks/mantenimiento/almacen/renglones/useSearchBatchesWithArticles"
import { useGetMaintenanceAircrafts } from '@/hooks/mantenimiento/planificacion/useGetMaintenanceAircrafts'
import { useGetWorkOrderEmployees } from "@/hooks/mantenimiento/planificacion/useGetWorkOrderEmployees"
import { useGetWorkOrders } from '@/hooks/mantenimiento/planificacion/useGetWorkOrders'
import { useCompanyStore } from "@/stores/CompanyStore"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Send } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useGetUnits } from "@/hooks/general/unidades/useGetPrimaryUnits"
import { useDebounce } from "@/lib/useDebounce"
import type { RequisitionBatchForm } from "@/types/purchase"
import type { Aircraft } from "@/types"
import { Separator } from "@/components/ui/separator"
import { RequisitionHeader } from "./_components/RequisitionHeader"
import { BatchArticlesSection } from "./_components/BatchArticlesSection"
import { AdditionalInfoSection } from "./_components/AdditionalInfoSection"
import { isHigherPriority, type Priority } from "./_components/priorityUtils"

const FormSchema = z.object({
  justification: z
    .string({ message: "La justificación debe ser válida." })
    .min(2, { message: "La justificación debe ser válida." }),
  company: z.string(),
  location_id: z.string(),
  created_by: z.string(),
  requested_by: z.string().min(1, "Debe ingresar quien lo solicita."),
  priority: z.enum(["HIGH", "MEDIUM", "LOW"]).optional(),
  work_order_id: z.string().optional(),
  aircraft_id: z.string().optional(),
  image: z
    .instanceof(File)
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
        batch_articles: z.array(
          z.object({
            part_number: z.string().min(1, "El número de parte es obligatorio"),
            alt_part_number: z.string().optional(),
            quantity: z.number().min(1, "Debe ingresar una cantidad válida"),
            unit: z.string().optional(),
            aircraft_id: z.string().optional(),
            priority: z.enum(["HIGH", "MEDIUM", "LOW"]).optional(),
            image: z.any().optional(),
            document_type_ids: z.array(z.number()).min(1, "Debe seleccionar al menos un tipo de documento"),
          })
        ),
      })
    )
    .min(1, "Debe agregar al menos un artículo"),
});

type FormSchemaType = z.infer<typeof FormSchema>;

interface FormProps {
  onClose: () => void;
}

export function CreateAeronauticalRequisitionForm({
  onClose,
}: FormProps) {
  const { user } = useAuth();

  const { mutate, mutateAsync, data: batches, isPending: isBatchesLoading } = useGetBatchesByLocationId();

  const { selectedCompany, selectedStation } = useCompanyStore();

  const { data: employees, isLoading: employeesLoading } = useGetWorkOrderEmployees({
    company: selectedCompany?.slug,
    location_id: selectedStation ?? undefined,
    acronym: "MANP",
  });

  const { data: units, isLoading: isUnitsLoading } = useGetUnits(selectedCompany?.slug);

  const { data: maintenanceAircrafts, isLoading: isAircraftsLoading } = useGetMaintenanceAircrafts(selectedCompany?.slug);

  const aircrafts: Aircraft[] | undefined = maintenanceAircrafts?.map((ac) => ({
    id: ac.id,
    acronym: ac.acronym,
    serial: ac.serial,
    model: ac.model,
    fabricant: ac.manufacturer?.name ?? "",
    brand: "",
    client: ac.client as any,
    location: ac.location,
    is_external: false,
    flight_hours: typeof ac.flight_hours === "number" ? ac.flight_hours : parseFloat(String(ac.flight_hours)) || 0,
    cycles: typeof ac.flight_cycles === "number" ? ac.flight_cycles : parseFloat(String(ac.flight_cycles)) || 0,
    fabricant_date: new Date(ac.fabricant_date),
    owner: "",
    aircraft_operator: "",
    type_engine: "",
    number_engine: "",
    comments: ac.comments ?? "",
    status: "EN POSESION" as const,
  }));

  const { data: workOrders, isLoading: isWorkOrdersLoading, isError: isWorkOrdersError } = useGetWorkOrders(selectedStation, selectedCompany?.slug);

  const { createRequisition } = useCreateRequisition();

  const [selectedBatches, setSelectedBatches] = useState<RequisitionBatchForm[]>([]);

  // Local search state for each searchable selector (keeps filtering stable during typing)
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [aircraftSearch, setAircraftSearch] = useState("");
  const [workOrderSearch, setWorkOrderSearch] = useState("");
  const [batchSearch, setBatchSearch] = useState("");
  const [articleSearch, setArticleSearch] = useState("");
  const debouncedArticleSearch = useDebounce(articleSearch, 300);

  const { data: articleResults, isFetching: isArticleResultsLoading } = useSearchBatchesWithArticles(
    selectedCompany?.slug,
    selectedStation ?? undefined,
    debouncedArticleSearch || undefined
  );

  // Memoized filtered lists for each searchable selector
  const filteredEmployees = useMemo(() => {
    if (!employees) return [];
    const query = employeeSearch.toLowerCase().trim();
    if (!query) return employees;
    return employees.filter((emp) => {
      const searchText = `${emp.first_name} ${emp.last_name} ${emp.dni}`.toLowerCase();
      return searchText.includes(query);
    });
  }, [employees, employeeSearch]);

  const filteredAircrafts = useMemo(() => {
    if (!aircrafts) return [];
    const query = aircraftSearch.toLowerCase().trim();
    if (!query) return aircrafts;
    return aircrafts.filter((ac) => {
      const searchText = `${ac.acronym} ${ac.fabricant} ${ac.model ?? ""} ${ac.serial ?? ""}`.toLowerCase();
      return searchText.includes(query);
    });
  }, [aircrafts, aircraftSearch]);

  const filteredWorkOrders = useMemo(() => {
    if (!workOrders) return [];
    const query = workOrderSearch.toLowerCase().trim();
    if (!query) return workOrders;
    return workOrders.filter((wo) => {
      const searchText = `${wo.order_number} ${wo.aircraft?.acronym ?? ""} ${wo.description ?? ""}`.toLowerCase();
      return searchText.includes(query);
    });
  }, [workOrders, workOrderSearch]);

  const filteredBatches = useMemo(() => {
    if (!batches) return [];
    const query = batchSearch.toLowerCase().trim();
    if (!query) return batches;
    return batches.filter((batch) => {
      const searchText = `${batch.name} ${batch.category ?? ""}`.toLowerCase();
      return searchText.includes(query);
    });
  }, [batches, batchSearch]);

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      articles: [],
      priority: "MEDIUM",
    },
  });

  const getDefaultUnit = (category: string) => {
    const unidadUnit = units?.find(
      (u) => u.label.toUpperCase() === "UNIDAD" || u.value.toUpperCase() === "UNIDAD"
    );
    return (category === "componente" || category === "herramienta") && unidadUnit
      ? unidadUnit.id.toString()
      : undefined;
  };

  useEffect(() => {
    if (user && selectedCompany && selectedStation) {
      form.setValue("created_by", user.id.toString());
      form.setValue("company", selectedCompany.slug);
      form.setValue("location_id", selectedStation);
    }
  }, [user, form, selectedCompany, selectedStation]);

  useEffect(() => {
    if (selectedStation) {
      mutate({ location_id: Number(selectedStation), company: selectedCompany?.slug });
    }
  }, [selectedStation, mutate, selectedCompany]);

  useEffect(() => {
    form.setValue("articles", selectedBatches, { shouldValidate: form.formState.isSubmitted });
  }, [selectedBatches, form]);

  // Aircraft Sync: the header aircraft is the default for batch items. We only
  // propagate it to items that were still following the header's previous
  // value (or had none), so manual per-item overrides are never clobbered.
  const headerAircraftId = form.watch("aircraft_id");
  const previousHeaderAircraftId = useRef<string | undefined>(undefined);

  useEffect(() => {
    const previous = previousHeaderAircraftId.current;
    if (headerAircraftId !== previous) {
      setSelectedBatches((prev) =>
        prev.map((batch) => ({
          ...batch,
          batch_articles: batch.batch_articles.map((article) =>
            article.aircraft_id === previous || !article.aircraft_id
              ? { ...article, aircraft_id: headerAircraftId }
              : article
          ),
        }))
      );
      previousHeaderAircraftId.current = headerAircraftId;
    }
  }, [headerAircraftId]);

  // Priority Escalation: an item's priority can only raise the header's
  // priority, never lower it, and never touches other items.
  const escalateHeaderPriority = (priority?: Priority) => {
    const currentPriority = form.getValues("priority") as Priority | undefined;
    if (isHigherPriority(priority, currentPriority)) {
      form.setValue("priority", priority);
    }
  };

  // Batch handlers
  const handleBatchSelect = (batchName: string, batchId: string, batch_category: string) => {
    setSelectedBatches((prev) => {
      if (prev.some((b) => b.batch === batchId)) {
        return prev.filter((b) => b.batch !== batchId);
      }
      return [
        ...prev,
        {
          batch: batchId,
          batch_name: batchName,
          batch_articles: [{ part_number: "", quantity: 1, unit: getDefaultUnit(batch_category), priority: "MEDIUM", aircraft_id: headerAircraftId, document_type_ids: [] }],
        },
      ];
    });
  };

  // Article search handler: selecting an article by part_number loads its
  // associated batch (adding it if not already selected) and fills the
  // part_number/alt_part_number/unit into an empty row, or appends a new one.
  const handleArticleSelect = (
    batch: BatchWithArticles["batch"],
    article: BatchWithArticles["articles"][number]
  ) => {
    const batchId = batch.id.toString();
    const altPartNumber = article.alternative_part_number?.[0] ?? "";
    const unit = getDefaultUnit(batch.category);

    // Pre-selección: los documentos que el inventario ya espera para este
    // artículo se marcan como documentación a solicitar al vendedor.
    const documentTypeIds =
      article.document_requirements
        ?.map((req) => req.document_type?.id)
        .filter((id): id is number => typeof id === "number") ?? [];

    setSelectedBatches((prev) => {
      const existingBatch = prev.find((b) => b.batch === batchId);

      if (!existingBatch) {
        return [
          ...prev,
          {
            batch: batchId,
            batch_name: batch.name,
            batch_articles: [
              {
                part_number: article.part_number,
                alt_part_number: altPartNumber,
                quantity: 1,
                unit,
                priority: "MEDIUM",
                aircraft_id: headerAircraftId,
                document_type_ids: documentTypeIds,
              },
            ],
          },
        ];
      }

      return prev.map((b) => {
        if (b.batch !== batchId) return b;
        const emptyIndex = b.batch_articles.findIndex((a) => !a.part_number);
        if (emptyIndex === -1) {
          return {
            ...b,
            batch_articles: [
              ...b.batch_articles,
              {
                part_number: article.part_number,
                alt_part_number: altPartNumber,
                quantity: 1,
                unit,
                priority: "MEDIUM",
                aircraft_id: headerAircraftId,
                document_type_ids: documentTypeIds,
              },
            ],
          };
        }
        return {
          ...b,
          batch_articles: b.batch_articles.map((a, i) =>
            i === emptyIndex
              ? { ...a, part_number: article.part_number, alt_part_number: altPartNumber, unit, document_type_ids: documentTypeIds }
              : a
          ),
        };
      });
    });
  };

  const handleBatchArticleChange = (
    batchId: string,
    index: number,
    field: string,
    value: string | number | number[] | File | undefined
  ) => {
    if (field === "priority") {
      escalateHeaderPriority(value as Priority);
    }
    setSelectedBatches((prev) =>
      prev.map((batch) =>
        batch.batch === batchId
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

  const addBatchArticle = (batchId: string) => {
    setSelectedBatches((prev) =>
      prev.map((batch) => {
        if (batch.batch !== batchId) return batch;
        return {
          ...batch,
          batch_articles: [
            ...batch.batch_articles,
            { part_number: "", quantity: 1, unit: getDefaultUnit(batch.batch_name), priority: "MEDIUM", aircraft_id: headerAircraftId, document_type_ids: [] },
          ],
        };
      })
    );
  };

  const removeBatchArticle = (batchId: string, articleIndex: number) => {
    setSelectedBatches((prev) =>
      prev.map((batch) =>
        batch.batch === batchId
          ? { ...batch, batch_articles: batch.batch_articles.filter((_, i) => i !== articleIndex) }
          : batch
      )
    );
  };

  const removeBatch = (batchId: string) => {
    setSelectedBatches((prev) => prev.filter((batch) => batch.batch !== batchId));
  };

  const handleBatchCreated = async (batchName: string) => {
    if (!selectedStation) return;
    const updatedBatches = await mutateAsync({ location_id: Number(selectedStation), company: selectedCompany?.slug });
    const newBatch = updatedBatches.find((b) => b.name === batchName);
    if (newBatch) {
      handleBatchSelect(newBatch.name, newBatch.id.toString(), newBatch.category ?? "");
    }
  };

  const onSubmit = async (data: FormSchemaType) => {
    const formattedData = {
      ...data,
      type: "AERONAUTICAL" as const,
      work_order_id: data.work_order_id ? Number(data.work_order_id) : undefined,
      aircraft_id: data.aircraft_id ? Number(data.aircraft_id) : undefined,
    };

    await createRequisition.mutateAsync({ data: formattedData, company: selectedCompany!.slug });
    onClose();
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col space-y-3"
      >
        <RequisitionHeader
          form={form}
          employees={employees}
          employeesLoading={employeesLoading}
          filteredEmployees={filteredEmployees}
          employeeSearch={employeeSearch}
          setEmployeeSearch={setEmployeeSearch}
          workOrders={workOrders}
          isWorkOrdersLoading={isWorkOrdersLoading}
          isWorkOrdersError={isWorkOrdersError}
          filteredWorkOrders={filteredWorkOrders}
          workOrderSearch={workOrderSearch}
          setWorkOrderSearch={setWorkOrderSearch}
          aircrafts={aircrafts}
          isAircraftsLoading={isAircraftsLoading}
          filteredAircrafts={filteredAircrafts}
          aircraftSearch={aircraftSearch}
          setAircraftSearch={setAircraftSearch}
          aircraftPlaceholder="Seleccione la aeronave..."
        />

        <BatchArticlesSection
          form={form}
          batches={batches}
          isBatchesLoading={isBatchesLoading}
          selectedBatches={selectedBatches}
          filteredBatches={filteredBatches}
          batchSearch={batchSearch}
          setBatchSearch={setBatchSearch}
          units={units}
          isUnitsLoading={isUnitsLoading}
          aircrafts={aircrafts}
          isAircraftsLoading={isAircraftsLoading}
          filteredAircrafts={filteredAircrafts}
          aircraftSearch={aircraftSearch}
          setAircraftSearch={setAircraftSearch}
          handleBatchSelect={handleBatchSelect}
          handleBatchArticleChange={handleBatchArticleChange}
          addBatchArticle={addBatchArticle}
          removeBatchArticle={removeBatchArticle}
          removeBatch={removeBatch}
          enableCreateBatch
          onBatchCreated={handleBatchCreated}
          filteredArticleResults={articleResults}
          isArticleResultsLoading={isArticleResultsLoading}
          articleSearch={articleSearch}
          setArticleSearch={setArticleSearch}
          handleArticleSelect={handleArticleSelect}
        />

        <AdditionalInfoSection form={form} />

        <div className="flex justify-between items-center gap-x-4">
          <Separator className="flex-1" />
          <p className="text-muted-foreground text-xs select-none">SIGEAC</p>
          <Separator className="flex-1" />
        </div>

        <Button disabled={createRequisition.isPending} className="gap-2">
          <><Send className="size-4" /> Generar Requisición</>
          {createRequisition.isPending && (
            <Loader2 className="size-4 animate-spin" />
          )}
        </Button>
      </form>
    </Form>
  );
}
