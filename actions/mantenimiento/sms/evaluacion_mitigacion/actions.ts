"use client";

import axiosInstance from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface CreateMitigationPlanData {
    company: string | null;
    data: {
        hazard_notification_id: string;
        area_responsible: string;
        possible_consequences: string;
        consequence_to_evaluate: string;
        description: string;
        analysis: {
            probability: string;
            severity: string;
            result: string;
        };
    };
}

interface UpdateMitigationPlanData {
    company: string | null;
    id: number | string;
    data: {
        area_responsible: string;
        possible_consequences: string;
        consequence_to_evaluate: string;
        description: string;
    };
}

interface CreateMitigationAnalysisData {
    company: string | null;
    data: {
        probability: string;
        severity: string;
        result: string;
        mitigation_plan_id: string;
    };
}

interface UpdateMitigationAnalysisData {
    company: string | null;
    id: number | string;
    data: {
        probability: string;
        severity: string;
        result: string;
    };
}

interface CreateMitigationMeasureData {
    company: string | null;
    data: {
        description: string;
        implementation_supervisor: string;
        implementation_responsible: string;
        estimated_date: string;
        execution_date?: string;
        mitigation_plan_id: string;
    };
}

interface CreateFollowUpControlData {
    company: string | null;
    data: {
        description: string;
        date: string;
        mitigation_measure_id: string;
        image?: File;
        document?: File;
    };
}

const invalidateWorkflowQueries = (
    queryClient: ReturnType<typeof useQueryClient>,
    company: string | null
) => {
    queryClient.invalidateQueries({ queryKey: ["hazard-notifications", company] });
};

export const useCreateMitigationPlan = () => {
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: async ({ company, data }: CreateMitigationPlanData) => {
            const response = await axiosInstance.post(
                `/${company}/sms/aeronautical/mitigation-plans`,
                data,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            return response.data;
        },
        onSuccess: (_, variables) => {
            invalidateWorkflowQueries(queryClient, variables.company);
            queryClient.invalidateQueries({ queryKey: ["analysis"] });
            toast.success("Plan creado", {
                description: "El plan de mitigación fue registrado correctamente.",
            });
        },
        onError: (error) => {
            toast.error("No se pudo crear el plan", {
                description: "Verifique los datos del plan de mitigación.",
            });
            console.log(error);
        },
    });

    return {
        createMitigationPlan: createMutation,
    };
};

export const useUpdateMitigationPlan = () => {
    const queryClient = useQueryClient();

    const updateMutation = useMutation({
        mutationFn: async ({ company, data, id }: UpdateMitigationPlanData) => {
            const response = await axiosInstance.patch(
                `/${company}/sms/aeronautical/mitigation-plans/${id}`,
                data
            );

            return response.data;
        },
        onSuccess: (_, variables) => {
            invalidateWorkflowQueries(queryClient, variables.company);
            toast.success("Plan actualizado", {
                description: "El plan de mitigación fue actualizado correctamente.",
            });
        },
        onError: (error) => {
            toast.error("No se pudo actualizar el plan", {
                description: "Ocurrió un error al actualizar el plan de mitigación.",
            });
            console.log(error);
        },
    });

    return {
        updateMitigationPlan: updateMutation,
    };
};

export const useCreateMitigationAnalysis = () => {
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: async ({ company, data }: CreateMitigationAnalysisData) => {
            const response = await axiosInstance.post(
                `/${company}/sms/aeronautical/analysis`,
                data,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            return response.data;
        },
        onSuccess: (_, variables) => {
            invalidateWorkflowQueries(queryClient, variables.company);
            toast.success("Análisis creado", {
                description: "El análisis de riesgo fue registrado correctamente.",
            });
        },
        onError: (error) => {
            toast.error("No se pudo crear el análisis", {
                description: "Ocurrió un error al registrar el análisis.",
            });
            console.log(error);
        },
    });

    return {
        createMitigationAnalysis: createMutation,
    };
};

export const useUpdateMitigationAnalysis = () => {
    const queryClient = useQueryClient();

    const updateMutation = useMutation({
        mutationFn: async ({ company, data, id }: UpdateMitigationAnalysisData) => {
            const response = await axiosInstance.patch(
                `/${company}/sms/aeronautical/analysis/${id}`,
                data
            );

            return response.data;
        },
        onSuccess: (_, variables) => {
            invalidateWorkflowQueries(queryClient, variables.company);
            toast.success("Análisis actualizado", {
                description: "El análisis de riesgo fue actualizado correctamente.",
            });
        },
        onError: (error) => {
            toast.error("No se pudo actualizar el análisis", {
                description: "Ocurrió un error al actualizar el análisis.",
            });
            console.log(error);
        },
    });

    return {
        updateMitigationAnalysis: updateMutation,
    };
};

export const useCreateMitigationMeasure = () => {
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: async ({ company, data }: CreateMitigationMeasureData) => {
            const response = await axiosInstance.post(
                `/${company}/sms/aeronautical/mitigation-measures`,
                data,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            return response.data;
        },
        onSuccess: (_, variables) => {
            invalidateWorkflowQueries(queryClient, variables.company);
            toast.success("Medida agregada", {
                description: "La medida de mitigación fue registrada correctamente.",
            });
        },
        onError: (error) => {
            toast.error("No se pudo crear la medida", {
                description: "Ocurrió un error al registrar la medida.",
            });
            console.log(error);
        },
    });

    return {
        createMitigationMeasure: createMutation,
    };
};

export const useCreateFollowUpControl = () => {
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: async ({ company, data }: CreateFollowUpControlData) => {
            const response = await axiosInstance.post(
                `/${company}/sms/aeronautical/follow-up-controls`,
                data,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            return response.data;
        },
        onSuccess: (_, variables) => {
            invalidateWorkflowQueries(queryClient, variables.company);
            toast.success("Control agregado", {
                description: "El control de seguimiento fue registrado correctamente.",
            });
        },
        onError: (error) => {
            toast.error("No se pudo crear el control", {
                description: "Ocurrió un error al registrar el control de seguimiento.",
            });
            console.log(error);
        },
    });

    return {
        createFollowUpControl: createMutation,
    };
};
