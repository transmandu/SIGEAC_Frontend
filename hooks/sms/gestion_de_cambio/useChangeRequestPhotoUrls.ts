import { useEffect, useState } from "react";
import axios from "axios";

import { fetchFileBlobUrl } from "@/lib/file-server";
import { ChangePhotographicRecord } from "@/types";

// El detalle necesita todas las fotos resueltas a la vez (la galería navega entre
// ellas), así que no sirve un <FileServer> por imagen: se piden en paralelo y se
// devuelve un mapa record.id -> blob URL. Los paths crudos del backend no sirven
// como src de <Image> porque no son públicos.
export const useChangeRequestPhotoUrls = (
  records: ChangePhotographicRecord[],
  company: string,
): Record<number, string> => {
  const [urls, setUrls] = useState<Record<number, string>>({});
  const pathsKey = records.map((r) => `${r.id}:${r.image_url}`).join("|");

  useEffect(() => {
    const abortController = new AbortController();
    const objectUrls: string[] = [];
    let isActive = true;

    const loadUrls = async () => {
      const entries = await Promise.all(
        records.map(async (record) => {
          try {
            const url = await fetchFileBlobUrl(
              record.image_url,
              company,
              "document",
              abortController.signal,
            );
            objectUrls.push(url);
            return [record.id, url] as const;
          } catch (e) {
            if (axios.isCancel(e)) return null;
            console.error("Error loading file:", e);
            return null;
          }
        }),
      );

      if (isActive) {
        setUrls(Object.fromEntries(entries.filter((entry) => entry !== null)));
      }
    };

    loadUrls();

    return () => {
      isActive = false;
      abortController.abort();
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [company, pathsKey]);

  return urls;
};
