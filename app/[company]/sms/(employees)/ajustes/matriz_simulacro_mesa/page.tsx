"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { DrillMatrixCriteriaManager } from "@/components/forms/aerolinea/sms/DrillMatrixCriteriaManager";

const DrillMatrixCriteriaPage = () => (
  <ContentLayout title="Matriz de evaluación – Simulacro de mesa">
    <PageHeader className="mb-6" />

    <DrillMatrixCriteriaManager />
  </ContentLayout>
);

export default DrillMatrixCriteriaPage;
