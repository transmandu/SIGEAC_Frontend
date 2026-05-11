import axiosInstance from "@/lib/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface VoluntaryReportData {
    company: string | null;
    reportData: {
        report_number?: string;
        identification_date: Date;
        report_date: Date;
        location_id: string;
        identification_area: string;
        description: string;
        possible_consequences: string;
        status: string;
        reporter_name?: string;
        reporter_last_name?: string;
        reporter_phone?: string;
        reporter_email?: string;
        image?: File | string;
        document?: File | string;
    };
}
interface UpdateVoluntaryReportData {
    company: string | null;
    id: string;
    data: {
        report_number?: string;
        report_date: Date;
        identification_date: Date;
        location_id: string;
        description: string;
        possible_consequences: string;
        status: string;
        reporter_name?: string;
        reporter_last_name?: string;
        reporter_phone?: string;
        reporter_email?: string;
        image?: File | string;
        document?: File | string;
    };
}
interface CloseVoluntaryReportData {
    company: string | null;
    id: string | number;
    data: {
        close_date: string;
        document: File;
    };
}
interface NextNumberResponse {
    next_number: string;
}

export const useCreateVoluntaryReport = () => {
    const queryClient = useQueryClient();
    const createMutation = useMutation({
        mutationKey: ["voluntary-reports"],
        mutationFn: async ({ company, reportData }: VoluntaryReportData) => {
            const response = await axiosInstance.post(
                `/${company}/aeronautical/sms/voluntary-reports`,
                reportData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                },
            );
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["voluntary-reports"] });
            toast.success("¡Creado!", {
                description: `El reporte voluntario ha sido creado correctamente.`,
            });
        },
        onError: (error) => {
            toast.error("Oops!", {
                description: "No se pudo crear el reporte...",
            });
            console.log(error);
        },
    });
    return {
        createVoluntaryReport: createMutation,
    };
};

export const useDeleteVoluntaryReport = () => {
    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationKey: ["voluntary-reports"],
        mutationFn: async ({
            company,
            id,
        }: {
            company: string | null;
            id: string | number;
        }) => {
            await axiosInstance.delete(`/${company}/aeronautical/sms/voluntary-reports/${id}`);
        },
        onSuccess: (_, data) => {
            queryClient.invalidateQueries({
                queryKey: ["danger-identifications", data.company],
            });
            queryClient.invalidateQueries({ queryKey: ["voluntary-reports"] });
            queryClient.invalidateQueries({ queryKey: ["analysis"] });
            toast.success("¡Eliminado!", {
                description: `¡El reporte ha sido eliminada correctamente!`,
            });
        },
        onError: (e) => {
            toast.error("Oops!", {
                description: "¡Hubo un error al eliminar el reporte!",
            });
        },
    });

    return {
        deleteVoluntaryReport: deleteMutation,
    };
};

export const useUpdateVoluntaryReport = () => {
    const queryClient = useQueryClient();

    const updateVoluntaryReportMutation = useMutation({
        mutationKey: ["voluntary-reports"],
        mutationFn: async ({ company, id, data }: UpdateVoluntaryReportData) => {
            const response = await axiosInstance.post(
                `/${company}/aeronautical/sms/update-voluntary-reports/${id}`,
                data,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                },
            );
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["voluntary-reports"] });
            queryClient.invalidateQueries({ queryKey: ["voluntary-report"] });
            toast.success("¡Actualizado!", {
                description: `El reporte voluntario ha sido actualizado correctamente.`,
            });
        },
        onError: (error) => {
            toast.error("Oops!", {
                description: "No se pudo actualizar el reporte voluntario...",
            });
            console.log(error);
        },
    });
    return {
        updateVoluntaryReport: updateVoluntaryReportMutation,
    };
};



export const useGetNextReportNumber = (company: string | null) => {
    return useQuery<NextNumberResponse>({
        queryKey: ["next-voluntary-report-number", company],
        queryFn: async () => {
            const { data } = await axiosInstance.get(
                `/${company}/sms/next-voluntary-report-number`,
            );
            return data;
        },
        enabled: !!company,
        staleTime: 5000,
        retry: 1,
    });
};



// En tu archivo de actions.ts
export const useAcceptVoluntaryReport = () => {
    const queryClient = useQueryClient();

    const acceptMutation = useMutation({
        mutationKey: ["accept-rvp"],
        mutationFn: async ({
            company,
            id,
        }: {
            company: string | null;
            id: string | number;
        }) => {
            // Asegúrate de que el endpoint sea el correcto
            await axiosInstance.patch(`/${company}/sms/aeronautical/accept-report/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["voluntary-reports"] });
            toast.success("¡Aceptado!", {
                description: `¡El reporte ha sido aceptado correctamente!`,
            });
        },
        onError: () => {
            toast.error("Oops!", {
                description: "¡Hubo un error al aceptar el reporte!",
            });
        },
    });

    return {
        // CAMBIA ESTO:
        acceptVoluntaryReport: acceptMutation,
    };
};

export const useCloseVoluntaryReport = () => {
    const queryClient = useQueryClient();

    const closeMutation = useMutation({
        mutationKey: ["close-voluntary-report"],
        mutationFn: async ({ company, id, data }: CloseVoluntaryReportData) => {
            await axiosInstance.post(`/${company}/sms/aeronautical/close-rvp/${id}`, data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["voluntary-reports"] });
            queryClient.invalidateQueries({ queryKey: ["voluntary-report"] });
            toast.success("¡Reporte cerrado!", {
                description: "El reporte voluntario ha sido cerrado correctamente.",
            });
        },
        onError: (error: any) => {
            // Extraemos el mensaje directamente de la respuesta del backend
            const serverMessage = error.response?.data?.error || "Error al cerrar el reporte";

            toast.error("Oops", {
                description: serverMessage,
            });

            console.log(error);
        },
    });

    return {
        closeVoluntaryReport: closeMutation,
    };
};
