import {
  File,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileType2,
  type LucideIcon,
} from "lucide-react";
import type { Document } from "@/lib/libraryService";
import type { TagTone } from "@/components/misc/TagBadge";
import { companyNow, formatCalendarDate, parseCalendarDate } from "@/lib/date";
import { extensionOf } from "@/lib/Library/preview";

/** Documento tal como llega del listado: la versión vigente y la miniatura vienen aparte. */
export type LibraryDocument = Document & {
  latest_version?: any;
  versions?: any[];
  expiry_status?: string;
  file_type?: string;
  has_thumbnail?: boolean;
};

export interface FileKind {
  label: string;
  icon: LucideIcon;
  /** Fondo y color del icono del tipo: la misma identidad en lista, cuadrícula y visor. */
  iconClass: string;
}

const KINDS = {
  pdf: {
    label: "PDF",
    icon: FileText,
    iconClass: "bg-red-500/10 text-red-600 dark:text-red-400",
  },
  excel: {
    label: "Excel",
    icon: FileSpreadsheet,
    iconClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  word: {
    label: "Word",
    icon: FileType2,
    iconClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  image: {
    label: "Imagen",
    icon: FileImage,
    iconClass: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  },
  other: {
    label: "Archivo",
    icon: File,
    iconClass: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
  },
} satisfies Record<string, FileKind>;

/** El listado trae el departamento como relación; `department_name` es el atajo que añade el servidor. */
export const departmentNameOf = (doc: Document): string | undefined =>
  doc.department_name ?? (doc as { department?: { name?: string } }).department?.name;

export const fileKindOf = (extension: string): FileKind => {
  if (extension === "pdf") return KINDS.pdf;
  if (["xls", "xlsx", "csv"].includes(extension)) return KINDS.excel;
  if (["doc", "docx"].includes(extension)) return KINDS.word;
  if (["png", "jpg", "jpeg", "webp", "gif"].includes(extension))
    return KINDS.image;
  return KINDS.other;
};

export interface ExpiryStatus {
  label: string;
  tone: TagTone;
  /** Por vencer: se señala también con un icono. */
  warning: boolean;
}

const DAY_MS = 1000 * 60 * 60 * 24;
/** Con cuántos días de margen se avisa que un documento está por vencer. */
const WARNING_DAYS = 5;

export const expiryStatusOf = (
  status: string | null | undefined,
  expirationDate: string | null | undefined,
): ExpiryStatus => {
  if (!expirationDate || status?.toLowerCase() === "no_aplica") {
    return { label: "Permanente", tone: "blue", warning: false };
  }

  // La hora de la empresa, no la del equipo, define si ya venció.
  const expiresAt =
    parseCalendarDate(expirationDate) ?? new Date(expirationDate);
  const remaining = expiresAt.getTime() - companyNow().getTime();
  const days = Math.ceil(remaining / DAY_MS);

  if (remaining < 0) return { label: "Vencido", tone: "rose", warning: false };
  if (days <= WARNING_DAYS) {
    return {
      label: `Vence en ${days} ${days === 1 ? "día" : "días"}`,
      tone: "amber",
      warning: true,
    };
  }
  return { label: "Vigente", tone: "emerald", warning: false };
};

export const normalizeFolderPath = (path?: string | null): string => {
  const normalized = (path || "").replace(/[\\/]+$/, "");
  return normalized === "" ? "/" : normalized;
};

/** Lo que cada vista (lista y cuadrícula) necesita saber de un documento. */
export function describeDocument(doc: LibraryDocument, folderPath?: string) {
  const latestVersion = doc.latest_version ?? doc.versions?.[0] ?? null;

  const filePath: string = latestVersion?.file_path ?? doc.document ?? "";
  const extension = filePath
    ? extensionOf(filePath)
    : extensionOf(doc.file_type);

  const expirationDate: string | null = latestVersion
    ? latestVersion.expiration_date
    : (doc.expiration_date ?? null);
  const rawStatus: string = latestVersion
    ? latestVersion.expiry_status
    : (doc.expiry_status ?? "no_aplica");

  // Marca si aparece en varias carpetas y si esta es donde vive el original.
  const hasReplicas = (doc.folder_paths?.length ?? 0) > 1;
  const isPrimaryHere =
    hasReplicas &&
    !!folderPath &&
    !!doc.folder_path &&
    normalizeFolderPath(folderPath) === normalizeFolderPath(doc.folder_path);

  return {
    latestVersion,
    versionLabel: (latestVersion?.version_label ||
      latestVersion?.version_number ||
      null) as string | null,
    extension,
    kind: fileKindOf(extension),
    expirationDate,
    expiryStatus: rawStatus,
    status: expiryStatusOf(rawStatus, expirationDate),
    /** Fecha de calendario tal cual la manda el backend, sin convertir. */
    expirationText: expirationDate
      ? formatCalendarDate(expirationDate, "date", "Permanente")
      : "Permanente",
    hasReplicas,
    isPrimaryHere,
    /** Ruta legible de la carpeta donde vive, para los resultados de búsqueda. */
    locationText:
      normalizeFolderPath(doc.folder_path) === "/"
        ? "Raíz"
        : normalizeFolderPath(doc.folder_path)
            .replace(/^\//, "")
            .split("/")
            .join(" / "),
  };
}

/** Documento con la vigencia de su versión vigente, como lo esperan los menús de acciones. */
export function withVersionData(
  doc: LibraryDocument,
  info: ReturnType<typeof describeDocument>,
) {
  return {
    ...doc,
    expiry_status: info.expiryStatus,
    expiration_date: info.expirationDate,
    requires_expiry: info.expirationDate ? 1 : 0,
    latest_version: info.latestVersion,
  };
}
