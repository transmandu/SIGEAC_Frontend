import axiosInstance from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

interface UseGetImageProps {
  company?: string;
  origin: string;
  fileName?: string;
}

const fetchImage = async ({
  company,
  fileName,
  origin,
}: UseGetImageProps): Promise<string> => {
  if (!company || !fileName) {
    throw new Error("Compañía o nombre de archivo no proporcionado");
  }

  const encodedImagePath = btoa(fileName);

  const response = await axiosInstance.get(
    `${company}/${origin}/image/${encodedImagePath}`,
    {
      responseType: "blob",
      timeout: 30000,
    }
  );

  // Verificar que sea una imagen
  if (!response.data.type.startsWith("image/")) {
    throw new Error("El archivo no es una imagen válida");
  }

  const blob = new Blob([response.data], { type: response.data.type });
  return URL.createObjectURL(blob);
};

export const useGetImage = (props: UseGetImageProps) => {
  const { company, fileName, origin } = props;

  return useQuery<string, Error>({
    queryKey: ["image", company, origin, fileName],
    queryFn: () => fetchImage(props),
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos (cache)
    enabled: !!company && !!fileName,
  });
};
