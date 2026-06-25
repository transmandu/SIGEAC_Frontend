"use client"
import { useCreateRequisition } from "@/actions/mantenimiento/compras/requisiciones/actions"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { useAuth } from "@/contexts/AuthContext"
import { useGetBatchesByLocationId } from "@/hooks/mantenimiento/almacen/renglones/useGetBatchesByLocationId"
import { useGetMaintenanceAircrafts } from '@/hooks/mantenimiento/planificacion/useGetMaintenanceAircrafts'
import { useGetWorkOrders } from '@/hooks/mantenimiento/planificacion/useGetWorkOrders'
import { useGetUserDepartamentEmployees } from "@/hooks/sistema/empleados/useGetUserDepartamentEmployees"
import { useGetEmployeesByCompany } from "@/hooks/sistema/empleados/useGetEmployees"
import { useGetDepartments } from "@/hooks/sistema/departamento/useGetDepartment"
import { useGetThirdParties } from "@/hooks/general/terceros/useGetThirdParties"
import { useGetAuthorizedEmployees } from "@/hooks/sistema/autorizados/useGetAuthorizedEmployees"
import { useCompanyStore } from "@/stores/CompanyStore"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Send, Plane, Package } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useGetUnits } from "@/hooks/general/unidades/useGetPrimaryUnits"
import { cn } from "@/lib/utils"
import { useGetGeneralArticles } from "@/hooks/mantenimiento/almacen/almacen_general/useGetGeneralArticles"
import { format } from "date-fns"
import type { RequisitionBatchForm, RequisitionGeneralArticleForm } from "@/types/purchase"
import type { Aircraft, GeneralArticle } from "@/types"
import { Separator } from "@/components/ui/separator"
import { RequisitionHeader } from "./_components/RequisitionHeader"
import { BatchArticlesSection } from "./_components/BatchArticlesSection"
import { GeneralArticlesSection } from "./_components/GeneralArticlesSection"
import { AdditionalInfoSection } from "./_components/AdditionalInfoSection"
import { isHigherPriority, type Priority } from "./_components/priorityUtils"

type WarehouseRequisitionType = "AERONAUTICAL" | "GENERAL"

const FormSchema = z.object({
  justification: z
    .string({ message: "La justificación debe ser válida." })
    .min(2, { message: "La justificación debe ser válida." }),
  company: z.string(),
  location_id: z.string(),
  created_by: z.string(),
  requested_by: z.string().optional(),
  requested_by_authorized_employee_id: z.string().optional(),
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
          })
        ),
      })
    )
    .optional(),
  general_articles: z
    .array(
      z.object({
        description: z.string().min(1, "La descripción es obligatoria"),
        requested_date: z.string().optional(),
        variant_type: z.string().nullable().optional(),
        quantity: z.number().min(1, "La cantidad debe ser mayor a 0"),
        unit_id: z.string().optional(),
        priority: z.enum(["HIGH", "MEDIUM", "LOW"]).optional(),
        image: z.any().optional(),
        department_id: z.string().optional(),
        third_party_id: z.string().optional(),
        employee_id: z.string().optional(),
        authorized_employee_id: z.string().optional(),
      })
    )
    .optional(),
}).refine(
  (data) => {
    const hasArticles = data.articles && data.articles.length > 0;
    const hasGeneralArticles = data.general_articles && data.general_articles.length > 0;
    return hasArticles || hasGeneralArticles;
  },
  {
    message: "Debe agregar al menos un artículo",
    path: ["articles"],
  }
).refine(
  (data) => !!data.requested_by || !!data.requested_by_authorized_employee_id,
  {
    message: "Debe seleccionar un empleado o un empleado autorizado.",
    path: ["requested_by"],
  }
);

type FormSchemaType = z.infer<typeof FormSchema>;

interface FormProps {
  onClose: () => void;
}

export function CreateWarehouseRequisitionForm({
  onClose,
}: FormProps) {
  const { user } = useAuth();

  const { mutate, data: batches, isPending: isBatchesLoading } = useGetBatchesByLocationId();

  const { selectedCompany, selectedStation } = useCompanyStore();

  const { data: employees, isPending: employeesLoading } = useGetUserDepartamentEmployees(selectedCompany?.slug);

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

  const { data: generalArticles, isLoading: isGeneralArticlesLoading } = useGetGeneralArticles();

  const { data: departments, isLoading: isDepartmentsLoading } = useGetDepartments(selectedCompany?.slug);

  const { data: thirdParties, isLoading: isThirdPartiesLoading } = useGetThirdParties();

  const { data: destinationEmployees, isLoading: isDestinationEmployeesLoading } = useGetEmployeesByCompany(selectedCompany?.slug);

  const { data: authorizedEmployees, isLoading: isAuthorizedEmployeesLoading } = useGetAuthorizedEmployees(selectedCompany?.slug);

  const { createRequisition } = useCreateRequisition();

  const [requisitionType, setRequisitionType] = useState<WarehouseRequisitionType>("AERONAUTICAL");

  const [selectedBatches, setSelectedBatches] = useState<RequisitionBatchForm[]>([]);
  const [selectedGeneralArticles, setSelectedGeneralArticles] = useState<RequisitionGeneralArticleForm[]>([]);

  // Local search state for each searchable selector (keeps filtering stable during typing)
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [aircraftSearch, setAircraftSearch] = useState("");
  const [workOrderSearch, setWorkOrderSearch] = useState("");
  const [batchSearch, setBatchSearch] = useState("");
  const [generalArticleSearch, setGeneralArticleSearch] = useState("");

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

  const filteredGeneralArticles = useMemo(() => {
    if (!generalArticles) return [];
    const query = generalArticleSearch.toLowerCase().trim();
    if (!query) return generalArticles;
    return generalArticles.filter((article) => {
      const searchText = `${article.description} ${article.variant_type ?? ""}`.toLowerCase();
      return searchText.includes(query);
    });
  }, [generalArticles, generalArticleSearch]);

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      articles: [],
      general_articles: [],
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
    form.setValue("articles", selectedBatches.length > 0 ? selectedBatches : undefined, { shouldValidate: form.formState.isSubmitted });
    form.setValue("general_articles", selectedGeneralArticles.length > 0 ? selectedGeneralArticles : undefined, { shouldValidate: form.formState.isSubmitted });
  }, [selectedBatches, selectedGeneralArticles, form]);

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

  // Switching the requisition type clears the other side's selection, so a
  // user can never submit a requisition mixing batch and general articles.
  const handleRequisitionTypeChange = (next: WarehouseRequisitionType) => {
    setRequisitionType(next);
    if (next === "AERONAUTICAL") {
      setSelectedGeneralArticles([]);
    } else {
      setSelectedBatches([]);
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
          batch_articles: [{ part_number: "", quantity: 1, unit: getDefaultUnit(batch_category), priority: "MEDIUM", aircraft_id: headerAircraftId }],
        },
      ];
    });
  };

  const handleBatchArticleChange = (
    batchId: string,
    index: number,
    field: string,
    value: string | number | File | undefined
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
            { part_number: "", quantity: 1, unit: getDefaultUnit(batch.batch_name), priority: "MEDIUM", aircraft_id: headerAircraftId },
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

  // General article handlers. Two articles can share a description but
  // differ by variant_type, so identity (and toggle-off matching) must
  // always compare both fields together, never description alone.
  const isSameGeneralArticle = (
    a: { description: string; variant_type?: string | null },
    b: { description: string; variant_type?: string | null }
  ) => a.description === b.description && (a.variant_type ?? "") === (b.variant_type ?? "");

  const handleGeneralArticleSelect = (article: GeneralArticle) => {
    setSelectedGeneralArticles((prev) => {
      if (prev.some((a) => isSameGeneralArticle(a, article))) {
        return prev.filter((a) => !isSameGeneralArticle(a, article));
      }
      return [
        ...prev,
        {
          description: article.description,
          requested_date: format(new Date(), "yyyy-MM-dd"),
          variant_type: article.variant_type,
          quantity: 0,
          unit_id: undefined,
          priority: "MEDIUM",
        },
      ];
    });
  };

  const handleGeneralArticleChange = (
    index: number,
    field: keyof RequisitionGeneralArticleForm,
    value: any
  ) => {
    if (field === "priority") {
      escalateHeaderPriority(value as Priority);
    }
    setSelectedGeneralArticles((prev) =>
      prev.map((article, i) =>
        i === index ? { ...article, [field]: value } : article
      )
    );
  };

  const removeGeneralArticle = (index: number) => {
    setSelectedGeneralArticles((prev) => prev.filter((_, i) => i !== index));
  };

  const addManualGeneralArticle = () => {
    setSelectedGeneralArticles((prev) => [
      ...prev,
      {
        description: "",
        requested_date: format(new Date(), "yyyy-MM-dd"),
        variant_type: "",
        quantity: 0,
        unit_id: undefined,
        priority: "MEDIUM",
      },
    ]);
  };

  const onSubmit = async (data: FormSchemaType) => {
    const formattedData = {
      ...data,
      type: requisitionType,
      work_order_id: data.work_order_id ? Number(data.work_order_id) : undefined,
      aircraft_id: data.aircraft_id ? Number(data.aircraft_id) : undefined,
      requested_by_authorized_employee_id: data.requested_by_authorized_employee_id
        ? Number(data.requested_by_authorized_employee_id)
        : undefined,
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
          authorizedEmployees={authorizedEmployees}
          isAuthorizedEmployeesLoading={isAuthorizedEmployeesLoading}
          allowAuthorizedEmployees
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
        />

        {/* ───────── Selector de tipo de requisición ───────── */}
        <div className="flex justify-center w-full py-1">
          <div className="relative flex items-center w-full max-w-md h-8">
            <Separator className="flex-1" />
            <div className="flex items-center mx-3 rounded-full border border-border/60 bg-muted/40 p-0.5">
              <button
                type="button"
                onClick={() => handleRequisitionTypeChange("AERONAUTICAL")}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium transition-colors duration-200",
                  requisitionType === "AERONAUTICAL"
                    ? "bg-background text-blue-600 shadow-sm"
                    : "text-muted-foreground hover:text-blue-600"
                )}
              >
                <Plane className="w-3.5 h-3.5 shrink-0" />
                Aeronáutica
              </button>
              <button
                type="button"
                onClick={() => handleRequisitionTypeChange("GENERAL")}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium transition-colors duration-200",
                  requisitionType === "GENERAL"
                    ? "bg-background text-blue-600 shadow-sm"
                    : "text-muted-foreground hover:text-blue-600"
                )}
              >
                <Package className="w-3.5 h-3.5 shrink-0" />
                General
              </button>
            </div>
            <Separator className="flex-1" />
          </div>
        </div>

        {requisitionType === "AERONAUTICAL" ? (
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
          />
        ) : (
          <GeneralArticlesSection
            form={form}
            generalArticles={generalArticles}
            isGeneralArticlesLoading={isGeneralArticlesLoading}
            selectedGeneralArticles={selectedGeneralArticles}
            filteredGeneralArticles={filteredGeneralArticles}
            generalArticleSearch={generalArticleSearch}
            setGeneralArticleSearch={setGeneralArticleSearch}
            units={units}
            isUnitsLoading={isUnitsLoading}
            departments={departments}
            isDepartmentsLoading={isDepartmentsLoading}
            destinationEmployees={destinationEmployees}
            isDestinationEmployeesLoading={isDestinationEmployeesLoading}
            thirdParties={thirdParties}
            isThirdPartiesLoading={isThirdPartiesLoading}
            authorizedEmployees={authorizedEmployees}
            isAuthorizedEmployeesLoading={isAuthorizedEmployeesLoading}
            showDestinationFields
            handleGeneralArticleSelect={handleGeneralArticleSelect}
            handleGeneralArticleChange={handleGeneralArticleChange}
            removeGeneralArticle={removeGeneralArticle}
            enableCreateGeneralArticle
            addManualGeneralArticle={addManualGeneralArticle}
          />
        )}

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
