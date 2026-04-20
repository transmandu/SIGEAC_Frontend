import CreateHazardNotification from "@/components/forms/mantenimiento/sms/CreateHazardNotification";
import axiosInstance from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface HazardNotificationData {
    company: string | null;
    id: string | number; // ID del reporte padre (Voluntario/Obligatorio)
    reportType: string;
    data: {
        reception_date: Date | string; // Fecha de recepción del reporte
        identification_area: string;   // Antes danger_area
        danger_type: string;
        information_source_id: string | number;
        description: string;
        possible_consequences: string; // String separado por comas
        consequence_to_evaluate: string;
        analysis_of_root_causes: string; // Antes root_cause_analysis
        report_type: string;            // El tipo de reporte padre
    };
}

interface UpdateHazardNotificationData {
    company: string | null;
    id: string | number; // ID de la identificación de peligro ya existente
    data: {
        reception_date: Date | string;
        identification_area: string;
        danger_type: string;
        information_source_id: string | number;
        description: string;
        possible_consequences: string;
        consequence_to_evaluate: string;
        analysis_of_root_causes: string;
        report_type: string;
    };


}export const useCreateHazardNotification = () => {
    const queryClient = useQueryClient();
    const createMutation = useMutation({
        mutationFn: async ({
            company,
            id,
            data,
        }: HazardNotificationData) => {
            const response = await axiosInstance.post(
                `/${company}/sms/aeronautical/hazard-notifications/${id}`,
                data,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            return response.data;
        },
        onSuccess: (_, data) => {
            queryClient.invalidateQueries({ queryKey: ["danger-identifications", data.company] });
            queryClient.invalidateQueries({ queryKey: ["voluntary-reports"] });
            queryClient.invalidateQueries({ queryKey: ["voluntary-report"] });
            queryClient.invalidateQueries({ queryKey: ["analysis"] });
            toast.success("¡Creado!", {
                description: ` La identificacion de peligro ha sido creado correctamente.`,
            });
        },
        onError: (error) => {
            toast.error("Oops!", {
                description: "No se pudo crear la identificacion de peligro...",
            });
            console.log(error);
        },
    });
    return {
        createHazardNotification: createMutation,
    };
};

export const useDeleteHazardNotification = () => {
    const queryClient = useQueryClient();
    const deleteMutation = useMutation({
        mutationFn: async ({
            company,
            id,
        }: {
            company: string | null;
            id: string;
        }) => {
            await axiosInstance.delete(
                `/${company}/sms/danger-identifications/${id}`
            );
        },
        onSuccess: (_, data) => {
            queryClient.invalidateQueries({ queryKey: ["danger-identifications", data.company] });
            queryClient.invalidateQueries({ queryKey: ["voluntary-reports"] });
            queryClient.invalidateQueries({
                queryKey: ["danger-identification-by-id"],
            });
            toast.success("¡Eliminado!", {
                description: `¡La identificacion de peligro ha sido eliminada correctamente!`,
            });
        },
        onError: (e) => {
            toast.error("Oops!", {
                description: "¡Hubo un error al eliminar la identificacion de peligro!",
            });
        },
    });

    return {
        deleteDangerIdentification: deleteMutation,
    };
};

export const UpdateHazardNotification = () => {
    const queryClient = useQueryClient();

    const updateDangerIdentificationtMutation = useMutation({
        mutationKey: ["hazard-notifications"],
        mutationFn: async ({ company, data, id }: UpdateHazardNotificationData) => {
            await axiosInstance.patch(
                `/${company}/sms/aeronautical/hazard-notifications/${id}`,
                data
            );
        },
        onSuccess: (_, data) => {
            queryClient.invalidateQueries({ queryKey: ["danger-identifications", data.company] });
            queryClient.invalidateQueries({ queryKey: ["danger-identification"] });
            toast.success("¡Actualizado!", {
                description: `La identificacion de peligro ha sido actualizada correctamente.`,
            });
        },
        onError: (error) => {
            toast.error("Oops!", {
                description: "No se pudo actualizar la identificacion de peligro...",
            });
            console.log(error);
        },
    });
    return {
        updateHazardNotification: updateDangerIdentificationtMutation,
    };
};
