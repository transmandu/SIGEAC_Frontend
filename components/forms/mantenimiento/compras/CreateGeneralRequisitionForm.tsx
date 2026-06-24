"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useCreateRequisition,
  useUpdateRequisition,
} from "@/actions/mantenimiento/compras/requisiciones/actions";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useGetUserDepartamentEmployees } from "@/hooks/sistema/empleados/useGetUserDepartamentEmployees";
import { useGetEmployeesByCompany } from "@/hooks/sistema/empleados/useGetEmployees";
import { useGetUnits } from "@/hooks/general/unidades/useGetPrimaryUnits";
import { useGetDepartments } from "@/hooks/sistema/departamento/useGetDepartment";
import { useGetThirdParties } from "@/hooks/general/terceros/useGetThirdParties";
import { useGetAuthorizedEmployees } from "@/hooks/sistema/autorizados/useGetAuthorizedEmployees";
import { useGetGeneralArticles } from "@/hooks/mantenimiento/almacen/almacen_general/useGetGeneralArticles";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, Pencil, Send } from "lucide-react";
import type { RequisitionGeneralArticleForm } from "@/types/purchase";
import type { GeneralArticle } from "@/types";
import { RequisitionHeader } from "./_components/RequisitionHeader";
import { GeneralArticlesSection } from "./_components/GeneralArticlesSection";
import { AdditionalInfoSection } from "./_components/AdditionalInfoSection";
import { isHigherPriority, type Priority } from "./_components/priorityUtils";

/* -------------------------------------------------------------------------- */
/*                                   SCHEMA                                   */
/* -------------------------------------------------------------------------- */

const FormSchema = z.object({
  justification: z.string().min(2, "La justificación es obligatoria"),
  company: z.string(),
  location_id: z.string(),
  created_by: z.string(),
  requested_by: z.string(),
  priority: z.enum(["HIGH", "MEDIUM", "LOW"]).optional(),
  department_id: z.string().optional(),
  third_party_id: z.string().optional(),
  image: z
    .instanceof(File)
    .refine((f) => f.size <= 5 * 1024 * 1024, "Máx 5MB")
    .refine(
      (f) => ["image/jpeg", "image/png"].includes(f.type),
      "Solo JPG o PNG"
    )
    .optional(),
  general_articles: z.array(
    z.object({
      description: z.string().min(1, "La descripción es obligatoria"),
      variant_type: z.string().optional(),
      quantity: z.number().min(1, "La cantidad debe ser mayor a 0"),
      unit_id: z.string().optional(),
      priority: z.enum(["HIGH", "MEDIUM", "LOW"]).optional(),
      image: z.any().optional(),
      department_id: z.string().optional(),
      third_party_id: z.string().optional(),
      employee_id: z.string().optional(),
      authorized_employee_id: z.string().optional(),
    })
  ).min(1, "Debe agregar al menos un artículo general"),
});

type FormSchemaType = z.infer<typeof FormSchema>;

interface Props {
  onClose: () => void;
  initialData?: FormSchemaType;
  isEditing?: boolean;
  id?: number | string;
}

/* -------------------------------------------------------------------------- */
/*                                 COMPONENT                                  */
/* -------------------------------------------------------------------------- */

export function CreateGeneralRequisitionForm({
  onClose,
  initialData,
  isEditing,
  id,
}: Props) {
  const { user } = useAuth();
  const { selectedCompany, selectedStation } = useCompanyStore();

  const { data: employees, isPending: employeesLoading } =
    useGetUserDepartamentEmployees(selectedCompany?.slug);

  const { data: units, isLoading: isUnitsLoading } =
    useGetUnits(selectedCompany?.slug);

  const { data: departments, isLoading: isDepartmentsLoading } =
    useGetDepartments(selectedCompany?.slug);

  const { data: thirdParties, isLoading: isThirdPartiesLoading } =
    useGetThirdParties();

  const { data: destinationEmployees, isLoading: isDestinationEmployeesLoading } =
    useGetEmployeesByCompany(selectedCompany?.slug);

  const { data: authorizedEmployees, isLoading: isAuthorizedEmployeesLoading } =
    useGetAuthorizedEmployees(selectedCompany?.slug);

  const { data: generalArticles, isLoading: isGeneralArticlesLoading } =
    useGetGeneralArticles();

  const { createRequisition } = useCreateRequisition();
  const { updateRequisition } = useUpdateRequisition();

  const [selectedGeneralArticles, setSelectedGeneralArticles] = useState<RequisitionGeneralArticleForm[]>([]);

  // Local search state for searchable selectors
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [generalArticleSearch, setGeneralArticleSearch] = useState("");

  const filteredEmployees = useMemo(() => {
    if (!employees) return [];
    const query = employeeSearch.toLowerCase().trim();
    if (!query) return employees;
    return employees.filter((emp) => {
      const searchText = `${emp.first_name} ${emp.last_name} ${emp.dni}`.toLowerCase();
      return searchText.includes(query);
    });
  }, [employees, employeeSearch]);

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
      general_articles: [],
      priority: "MEDIUM",
    },
  });

  /* ------------------------------- EFFECTS -------------------------------- */

  useEffect(() => {
    if (user && selectedCompany && selectedStation) {
      form.setValue("created_by", user.id.toString());
      form.setValue("company", selectedCompany.slug);
      form.setValue("location_id", selectedStation);
    }
    if (initialData) {
      form.reset(initialData);
      if (initialData.general_articles?.length) {
        setSelectedGeneralArticles(initialData.general_articles as RequisitionGeneralArticleForm[]);
      }
    }
  }, [user, selectedCompany, selectedStation, initialData, form]);

  useEffect(() => {
    form.setValue("general_articles", selectedGeneralArticles);
  }, [selectedGeneralArticles, form]);

  /* ------------------------------- HANDLERS ------------------------------- */

  // Two articles can share a description but differ by variant_type, so
  // identity (and toggle-off matching) must always compare both fields
  // together, never description alone.
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
      const currentPriority = form.getValues("priority") as Priority | undefined;
      if (isHigherPriority(value as Priority, currentPriority)) {
        form.setValue("priority", value);
      }
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
        variant_type: "",
        quantity: 0,
        unit_id: undefined,
        priority: "MEDIUM",
      },
    ]);
  };

  /* ------------------------------- SUBMIT --------------------------------- */

  const onSubmit = async (data: FormSchemaType) => {
    if (!selectedCompany) return;

    const formattedData = {
      ...data,
      type: "GENERAL" as const,
      department_id: data.department_id ? Number(data.department_id) : undefined,
      third_party_id: data.third_party_id ? Number(data.third_party_id) : undefined,
    };

    if (isEditing) {
      await updateRequisition.mutateAsync({ id: id!, data: formattedData, company: selectedCompany.slug });
    } else {
      await createRequisition.mutateAsync({ data: formattedData, company: selectedCompany.slug });
    }

    onClose();
  };

  const isPending = createRequisition.isPending || updateRequisition.isPending;

  /* -------------------------------------------------------------------------- */

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
          showAircraftWorkOrder={false}
          departments={departments}
          isDepartmentsLoading={isDepartmentsLoading}
          thirdParties={thirdParties}
          isThirdPartiesLoading={isThirdPartiesLoading}
        />

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
          handleGeneralArticleSelect={handleGeneralArticleSelect}
          handleGeneralArticleChange={handleGeneralArticleChange}
          removeGeneralArticle={removeGeneralArticle}
          enableCreateGeneralArticle
          addManualGeneralArticle={addManualGeneralArticle}
        />

        <AdditionalInfoSection form={form} />

        <div className="flex justify-between items-center gap-x-4">
          <Separator className="flex-1" />
          <p className="text-muted-foreground text-xs select-none">SIGEAC</p>
          <Separator className="flex-1" />
        </div>

        <Button disabled={isPending} className="gap-2">
          {isEditing
            ? <><Pencil className="size-4" /> Editar Requisición</>
            : <><Send className="size-4" /> Generar Requisición</>}
          {isPending && <Loader2 className="size-4 animate-spin" />}
        </Button>
      </form>
    </Form>
  );
}
