import axiosInstance from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface HazardNotificationData {
    company?: string;
    data: {
        report_number: string;
        reception_date?: Date;
        danger_type: string;
        description: string;
        identification_area: string;
        location_id: string;
        information_source_id: string | number;
        report_type: string;
        analysis_of_root_causes: string;
        voluntary_report_id?: string;
        obligatory_report_id?: string;
    };
}

interface UpdateHazardNotificationData {
    company?: string;
    id: string;
    data: {
        report_number: string;
        reception_date?: Date;
        danger_type: string;
        description: string;
        identification_area: string;
        location_id: string;
        information_source_id: string | number;
        report_type: string;
        analysis_of_root_causes: string;
    };


}export const useCreateHazardNotification = () => {
    const queryClient = useQueryClient();
    const createMutation = useMutation({
        mutationFn: async ({
            company,
            data,
        }: HazardNotificationData) => {
            const response = await axiosInstance.post(
                `/${company}/sms/aeronautical/hazard-notifications`,
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

export const UpdateHazardNotification = () => {
    const queryClient = useQueryClient();

    const updateHazardNotificationMutation = useMutation({
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
        updateHazardNotification: updateHazardNotificationMutation,
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

