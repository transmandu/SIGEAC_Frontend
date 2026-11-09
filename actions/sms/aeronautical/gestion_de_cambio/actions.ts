import axiosInstance from "@/lib/axios";
import {
  ChangeStatus,
  StoreChangeRequestPayload,
  UpdateChangeRequestPayload,
} from "@/types/sms/aeronautical/change-request";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { notifyError } from "@/lib/notify-error";

interface CreateChangeRequestData {
  company: string;
  data: StoreChangeRequestPayload;
  beforeImages?: File[];
  afterImages?: File[];
  document?: File;
  libraryFolderPaths?: string[];
}

interface UpdateChangeRequestData {
  company: string;
  id: number;
  data: UpdateChangeRequestPayload;
  beforeImages?: File[];
  afterImages?: File[];
  deleteRecordIds?: number[];
  document?: File;
  libraryFolderPaths?: string[];
}

function appendNestedFormData(
  formData: FormData,
  data: Record<string, unknown>,
  prefix = "",
) {
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) continue;

    const fullKey = prefix ? `${prefix}[${key}]` : key;

    if (value === null) {
      formData.append(fullKey, "");
      continue;
    }

    if (value instanceof File) {
      formData.append(fullKey, value);
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (item instanceof File) {
          formData.append(`${fullKey}[${index}]`, item);
        } else if (typeof item === "object" && item !== null) {
          appendNestedFormData(
            formData,
            item as Record<string, unknown>,
            `${fullKey}[${index}]`,
          );
        } else {
          formData.append(`${fullKey}[${index}]`, String(item));
        }
      });
    } else if (typeof value === "object") {
      appendNestedFormData(formData, value as Record<string, unknown>, fullKey);
    } else {
      formData.append(fullKey, String(value));
    }
  }
}

function buildPayloadFormData(
  data: StoreChangeRequestPayload | UpdateChangeRequestPayload,
  document?: File,
  libraryFolderPaths: string[] = [],
): FormData {
  const formData = new FormData();

  const {
    document: _document,
    library_folder_paths: _folders,
    ...rest
  } = data as Record<string, unknown>;

  appendNestedFormData(formData, rest);
  libraryFolderPaths.forEach((path) =>
    formData.append("library_folder_paths[]", path),
  );

  if (document instanceof File) {
    formData.append("document", document);
  }

  return formData;
}

async function uploadPhotos(
  company: string,
  changeRequestId: number,
  stage: "before" | "after",
  images: File[],
) {
  for (const image of images) {
    const formData = new FormData();
    formData.append("stage", stage);
    formData.append("image", image);
    await axiosInstance.post(
      `/${company}/sms/aeronautical/change-requests/${changeRequestId}/photographic-records`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
  }
}

export const useCreateChangeRequest = () => {
  const queryClient = useQueryClient();
  const createMutation = useMutation({
    mutationFn: async ({
      data,
      company,
      beforeImages = [],
      afterImages = [],
      document,
      libraryFolderPaths = [],
    }: CreateChangeRequestData) => {
      const formData = buildPayloadFormData(data, document, libraryFolderPaths);

      const response = await axiosInstance.post(
        `/${company}/sms/aeronautical/change-requests`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      const id = response.data?.data?.id as number | undefined;

      if (id) {
        await uploadPhotos(company, id, "before", beforeImages);
        await uploadPhotos(company, id, "after", afterImages);
      }

      return response.data;
    },
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({
        queryKey: ["change-requests", data.company],
      });
      toast.success("¡Creada!", {
        description: "La solicitud de cambio ha sido creada correctamente.",
      });
    },
    onError: (error) => {
      notifyError(error, { action: "crear la solicitud de cambio" });
      console.error(error);
    },
  });
  return {
    createChangeRequest: createMutation,
  };
};

export const useUpdateChangeRequest = () => {
  const queryClient = useQueryClient();
  const updateMutation = useMutation({
    mutationFn: async ({
      company,
      data,
      id,
      beforeImages = [],
      afterImages = [],
      deleteRecordIds = [],
      document,
      libraryFolderPaths = [],
    }: UpdateChangeRequestData) => {
      const formData = buildPayloadFormData(data, document, libraryFolderPaths);
      formData.append("_method", "PATCH");

      await axiosInstance.post(
        `/${company}/sms/aeronautical/change-requests/${id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      for (const recordId of deleteRecordIds) {
        await axiosInstance.delete(
          `/${company}/sms/aeronautical/change-requests/${id}/photographic-records/${recordId}`,
        );
      }

      await uploadPhotos(company, id, "before", beforeImages);
      await uploadPhotos(company, id, "after", afterImages);
    },
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({
        queryKey: ["change-requests", data.company],
      });
      queryClient.invalidateQueries({
        queryKey: ["change-request", data.company],
      });
      toast.success("¡Actualizada!", {
        description:
          "La solicitud de cambio ha sido actualizada correctamente.",
      });
    },
    onError: (error) => {
      notifyError(error, { action: "actualizar la solicitud de cambio" });
      console.error(error);
    },
  });
  return {
    updateChangeRequest: updateMutation,
  };
};

interface ApproveChangeRequestData {
  company: string;
  id: number;
  data: {
    status: ChangeStatus;
    approved_by: number;
  };
}

export const useApproveChangeRequest = () => {
  const queryClient = useQueryClient();
  const approveMutation = useMutation({
    mutationFn: async ({ company, id, data }: ApproveChangeRequestData) => {
      await axiosInstance.patch(
        `/${company}/sms/aeronautical/change-requests/${id}`,
        data,
      );
    },
    onSuccess: (_, { company }) => {
      queryClient.invalidateQueries({ queryKey: ["change-requests", company] });
      queryClient.invalidateQueries({ queryKey: ["change-request", company] });
      toast.success("¡Aprobada!", {
        description: "La solicitud de cambio fue aprobada correctamente.",
      });
    },
    onError: (error) => {
      notifyError(error, { action: "aprobar la solicitud de cambio" });
      console.error(error);
    },
  });
  return {
    approveChangeRequest: approveMutation,
  };
};

export const useDeleteChangeRequest = () => {
  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: async ({ company, id }: { company: string; id: number }) => {
      await axiosInstance.delete(
        `/${company}/sms/aeronautical/change-requests/${id}`,
      );
    },
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({
        queryKey: ["change-requests", data.company],
      });
      toast.success("¡Eliminada!", {
        description: "La solicitud de cambio ha sido eliminada correctamente.",
      });
    },
    onError: (error) => {
      notifyError(error, { action: "eliminar la solicitud de cambio" });
    },
  });
  return {
    deleteChangeRequest: deleteMutation,
  };
};
