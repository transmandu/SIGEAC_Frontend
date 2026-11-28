import axiosInstance from "@/lib/axios";

/** Qué se sabe dibujar en el navegador; el resto muestra el icono de su tipo. */
export type ThumbnailKind = "pdf" | "image";

const IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "webp", "gif"];

export const thumbnailKindOf = (
  extension?: string | null,
): ThumbnailKind | null => {
  const ext = String(extension ?? "").toLowerCase();
  if (ext === "pdf") return "pdf";
  return IMAGE_EXTENSIONS.includes(ext) ? "image" : null;
};

/** Ancho de la miniatura: el doble de lo que se muestra, para pantallas de alta densidad. */
const TARGET_WIDTH = 360;
const JPEG_QUALITY = 0.82;

// Cada miniatura nueva baja el archivo entero (descarga y dibujo van juntos en
// la cola): se limitan a dos a la vez para no acaparar la conexión ni la
// memoria de quien abre una carpeta grande.
const MAX_CONCURRENT = 2;
let running = 0;
const waiting: (() => void)[] = [];

export async function limitThumbnailWork<T>(
  task: () => Promise<T>,
): Promise<T> {
  if (running >= MAX_CONCURRENT) {
    await new Promise<void>((resolve) => waiting.push(resolve));
  }
  running += 1;
  try {
    return await task();
  } finally {
    running -= 1;
    waiting.shift()?.();
  }
}

const toJpeg = (canvas: HTMLCanvasElement) =>
  new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY),
  );

function paintWhite(canvas: HTMLCanvasElement) {
  const context = canvas.getContext("2d");
  if (!context) return null;
  // Un PDF o un PNG transparente se vería negro al pasar a JPEG.
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  return context;
}

async function renderPdfFirstPage(file: Blob): Promise<Blob | null> {
  // Se importa al usarlo: pdfjs necesita el navegador y no debe cargarse en
  // el servidor ni en quien nunca abre la cuadrícula.
  const { pdfjs } = await import("react-pdf");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();

  const task = pdfjs.getDocument({
    data: new Uint8Array(await file.arrayBuffer()),
  });

  try {
    const pdf = await task.promise;
    const page = await pdf.getPage(1);
    const base = page.getViewport({ scale: 1 });
    const viewport = page.getViewport({ scale: TARGET_WIDTH / base.width });

    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const context = paintWhite(canvas);
    if (!context) return null;

    await page.render({ canvas, canvasContext: context, viewport }).promise;
    return await toJpeg(canvas);
  } finally {
    await task.destroy();
  }
}

async function renderImage(file: Blob): Promise<Blob | null> {
  const bitmap = await createImageBitmap(file);
  try {
    const ratio = Math.min(1, TARGET_WIDTH / bitmap.width);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * ratio));
    canvas.height = Math.max(1, Math.round(bitmap.height * ratio));
    const context = paintWhite(canvas);
    if (!context) return null;

    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return await toJpeg(canvas);
  } finally {
    bitmap.close();
  }
}

/** Dibuja la miniatura de un archivo ya descargado; `null` si no se pudo. */
export const renderThumbnail = (kind: ThumbnailKind, file: Blob) =>
  kind === "pdf" ? renderPdfFirstPage(file) : renderImage(file);

/** Miniatura guardada en el servidor, o `null` si todavía no existe. */
export async function fetchStoredThumbnail(
  company: string,
  documentId: number,
  versionId: number | string,
): Promise<Blob | null> {
  try {
    const response = await axiosInstance.get(
      `/${company}/library/documents/${documentId}/thumbnail`,
      { params: { v: versionId }, responseType: "blob" },
    );
    return response.data as Blob;
  } catch (error) {
    if ((error as { response?: { status?: number } })?.response?.status === 404)
      return null;
    throw error;
  }
}

/**
 * Sube la miniatura recién dibujada para que nadie más tenga que bajar el
 * archivo. Es una cortesía: si falla, la cuadrícula ya tiene la imagen.
 */
export async function storeThumbnail(
  company: string,
  documentId: number,
  thumbnail: Blob,
): Promise<void> {
  const body = new FormData();
  body.append("thumbnail", thumbnail, "thumbnail.jpg");
  try {
    await axiosInstance.post(
      `/${company}/library/documents/${documentId}/thumbnail`,
      body,
    );
  } catch {
    // Se reintenta la próxima vez que alguien abra la carpeta.
  }
}

/** El archivo vigente tal cual, para dibujarlo en el navegador. */
export async function fetchDocumentFile(
  company: string,
  documentId: number,
): Promise<Blob> {
  const response = await axiosInstance.get(
    `/${company}/library/view/${documentId}`,
    { responseType: "blob" },
  );
  return response.data as Blob;
}
