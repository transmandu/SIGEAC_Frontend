import { useEffect, useEffectEvent } from "react";

interface Entry {
  url: string;
  refs: number;
  timer: ReturnType<typeof setTimeout> | null;
}

// Cuánto se espera para liberar un URL que nadie está usando. Cubre el desmontaje
// y remontaje simulado de StrictMode (y un render que React descarta): revocarlo
// al instante dejaba la miniatura rota.
const RELEASE_DELAY_MS = 5000;

const entries = new WeakMap<Blob, Entry>();

function scheduleRelease(blob: Blob, entry: Entry) {
  if (entry.timer) clearTimeout(entry.timer);
  entry.timer = setTimeout(() => {
    if (entry.refs > 0) return;
    URL.revokeObjectURL(entry.url);
    entries.delete(blob);
  }, RELEASE_DELAY_MS);
}

function urlFor(blob: Blob): string {
  let entry = entries.get(blob);
  if (!entry) {
    entry = { url: URL.createObjectURL(blob), refs: 0, timer: null };
    entries.set(blob, entry);
    scheduleRelease(blob, entry);
  }
  return entry.url;
}

// Marca el URL de un archivo como en uso hasta que se llame a lo que devuelve.
function acquire(blob: Blob): (() => void) | null {
  const entry = entries.get(blob);
  if (!entry) return null;

  entry.refs += 1;
  if (entry.timer) {
    clearTimeout(entry.timer);
    entry.timer = null;
  }

  return () => {
    entry.refs -= 1;
    if (entry.refs === 0) scheduleRelease(blob, entry);
  };
}

/**
 * URL de vista previa de un archivo local (`blob:`), o `null` sin archivo.
 *
 * El URL sale en el mismo render en que llega el archivo, sin pasar por un
 * estado ni un efecto, y se libera cuando deja de usarse. Un mismo archivo
 * comparte un único URL entre todos los que lo muestran.
 */
export function useObjectUrl(file: Blob | null | undefined): string | null {
  const url = file ? urlFor(file) : null;

  useEffect(() => {
    if (!file) return;
    return acquire(file) ?? undefined;
  }, [file]);

  return url;
}

let nextBlobId = 0;
const blobIds = new WeakMap<Blob, number>();
const blobId = (blob: Blob) => {
  let id = blobIds.get(blob);
  if (id === undefined) {
    id = nextBlobId++;
    blobIds.set(blob, id);
  }
  return id;
};

/**
 * Lo mismo para varios archivos, en el mismo orden. Quien llama puede pasar un
 * arreglo nuevo en cada render: lo que cuenta es qué archivos lo componen.
 */
export function useObjectUrls(files: readonly Blob[]): string[] {
  const urls = files.map(urlFor);
  const key = files.map(blobId).join(",");

  const current = useEffectEvent(() => files);

  useEffect(() => {
    const releases = current().map(acquire);
    return () => releases.forEach((release) => release?.());
  }, [key]);

  return urls;
}

const pendingRelease = new Map<string, ReturnType<typeof setTimeout>>();

/**
 * Revoca un `blob:` URL cuando el componente deja de usarlo (porque cambió por
 * otro o porque se desmontó). La revocación se difiere un instante para no
 * romper la imagen con el desmontaje y remontaje simulado de StrictMode.
 */
export function useReleaseUrl(url: string | null | undefined): void {
  useEffect(() => {
    if (!url) return;

    const pending = pendingRelease.get(url);
    if (pending) {
      clearTimeout(pending);
      pendingRelease.delete(url);
    }

    return () => {
      pendingRelease.set(
        url,
        setTimeout(() => {
          URL.revokeObjectURL(url);
          pendingRelease.delete(url);
        }, 0),
      );
    };
  }, [url]);
}
