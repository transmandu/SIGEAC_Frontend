'use client';

import { useMemo, useCallback } from 'react';
import { FileText, Clock, AlertCircle, Eye } from 'lucide-react';
import { LibraryDropdownActions } from "@/components/dropdowns/general/LibraryDropdownActions";
import { Document } from '@/lib/libraryService';

const fileTypeDetails: any = {
  pdf: { color: 'text-red-600', bgColor: 'bg-red-500/10', iconColor: 'text-red-700 dark:text-red-400', label: 'PDF' },
  excel: { color: 'text-emerald-700', bgColor: 'bg-emerald-500/10', iconColor: 'text-emerald-700 dark:text-emerald-400', label: 'EXCEL' },
  word: { color: 'text-blue-700', bgColor: 'bg-blue-500/10', iconColor: 'text-blue-700 dark:text-blue-400', label: 'WORD' },
  default: { color: 'text-slate-700', bgColor: 'bg-slate-500/10', iconColor: 'text-slate-600 dark:text-gray-400', label: 'ARCHIVO' },
};

const getStatusDetails = (status: string, expirationDate: string) => {
  if (!expirationDate || status?.toLowerCase() === 'no_aplica') {
    return { label: 'PERMANENTE', classes: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/30', isWarning: false };
  }
  const now = new Date();
  const expDate = new Date(expirationDate);
  const diffTime = expDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffTime < 0) return { label: 'VENCIDO', classes: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:border-red-500/30', isWarning: false };
  if (diffDays <= 5) return { label: `VENCE EN ${diffDays} DÍAS`, classes: 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-500/10 dark:border-amber-500/30 animate-pulse', isWarning: true };
  return { label: 'VIGENTE', classes: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/30', isWarning: false };
};

interface DocumentRowProps {
  doc: Document & { latest_version?: any; versions?: any[]; expiry_status?: string; file_type?: string };
  onView: (id: number) => void;
  onDelete: (id: number | string) => Promise<void>;
  onRefresh: () => Promise<void>;
  canManage: boolean;
  isDipDirector: boolean;
  user: any;
}

export default function DocumentRow({ doc, onView, onDelete, onRefresh, canManage, isDipDirector, user }: DocumentRowProps) {

  const latestVersion = useMemo(() => {
    if (doc?.latest_version) return doc.latest_version;
    if (!doc?.versions || doc.versions.length === 0) return null;
    return doc.versions[0];
  }, [doc?.latest_version, doc?.versions]);

  const activeFilePath = useMemo(() => {
    return latestVersion ? latestVersion.file_path : (doc?.document || '');
  }, [latestVersion, doc?.document]);

  const activeFileType = useMemo(() => {
    if (activeFilePath) return activeFilePath.split('.').pop()?.toLowerCase();
    return doc?.file_type?.toLowerCase() || 'default';
  }, [activeFilePath, doc?.file_type]);

  const activeExpirationDate = useMemo(() => {
    return latestVersion ? latestVersion.expiration_date : (doc?.expiration_date || null);
  }, [latestVersion, doc?.expiration_date]);

  const activeExpiryStatus = useMemo(() => {
    return latestVersion ? latestVersion.expiry_status : (doc?.expiry_status || 'no_aplica');
  }, [latestVersion, doc?.expiry_status]);

  const docWithVersionData = useMemo(() => ({
    ...doc,
    expiry_status: activeExpiryStatus,
    expiration_date: activeExpirationDate,
    requires_expiry: activeExpirationDate ? 1 : 0,
    latest_version: latestVersion
  }), [doc, activeExpiryStatus, activeExpirationDate, latestVersion]);

  const getFileDetails = (type: any, title: any) => {
    const t = String(type || "").toLowerCase();
    const name = String(title || "").toLowerCase();
    if (t.includes('pdf') || name.includes('.pdf')) return fileTypeDetails.pdf;
    if (t.includes('xls') || t.includes('xlsx') || name.includes('.xls') || name.includes('.xlsx')) return fileTypeDetails.excel;
    if (t.includes('doc') || name.includes('.doc')) return fileTypeDetails.word;
    return fileTypeDetails.default;
  };

  const fileDetails = getFileDetails(activeFileType, doc?.title);
  const statusInfo = getStatusDetails(activeExpiryStatus, activeExpirationDate);

  let displayExpirationDate = 'Permanente';
  if (activeExpirationDate) {
    const datePart = String(activeExpirationDate).substring(0, 10);
    const [year, month, day] = datePart.split('-');
    displayExpirationDate = `${day}-${month}-${year}`;
  }

  const handleDragStart = useCallback((e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', doc.id.toString());
    e.dataTransfer.setData('text/dept-name', doc.department_name || '');
    e.dataTransfer.effectAllowed = 'move';
    const el = e.currentTarget as HTMLElement;
    el.classList.add('opacity-40');
  }, [doc.id, doc.department_name]);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    const el = e.currentTarget as HTMLElement;
    el.classList.remove('opacity-40');
  }, []);

  return (
    <div
      draggable={canManage}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className="group flex items-center gap-4 p-3 transition-colors border-l-2 border-l-transparent hover:border-l-blue-600 border-b border-slate-200 dark:border-transparent bg-white hover:bg-slate-100 dark:bg-transparent dark:hover:bg-white/5 cursor-grab active:cursor-grabbing"
      data-tour="biblioteca-doc-row"
    >
      <div className={`p-2 rounded-lg ${fileDetails.bgColor} shrink-0 border border-current/10`}>
        <FileText className={`h-5 w-5 ${fileDetails.iconColor}`} strokeWidth={2}/>
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-0.5" data-tour="biblioteca-doc-title">
        <div className="flex items-center gap-2">
          <h4 className="text-[12px] font-semibold text-slate-950 dark:text-gray-100 truncate uppercase">
            {doc.title || "Sin título"}
            {latestVersion && (
              <span className="ml-2 text-[9px] font-bold text-slate-500 dark:text-gray-400 bg-slate-100 dark:bg-gray-800 px-1.5 py-0.5 rounded tracking-wider border border-slate-300 dark:border-gray-600">
                    {latestVersion.version_label || latestVersion.version_number}
              </span>
            )}
          </h4>
          {statusInfo.isWarning && <AlertCircle className="h-3.5 w-3.5 text-amber-600 animate-bounce" />}
        </div>
        <span className={`w-fit text-[8px] font-bold px-1.5 py-0.5 rounded border border-current/30 ${fileDetails.bgColor} ${fileDetails.color}`}>
          {fileDetails.label}
        </span>
      </div>

      <div className="hidden sm:flex items-center gap-2 shrink-0">
        <Clock className="h-3.5 w-3.5 text-slate-400" />
        <span className="text-[10px] text-slate-500 dark:text-gray-400 font-bold uppercase w-20 leading-none">
          {displayExpirationDate}
        </span>
      </div>

      <div className="hidden md:block shrink-0 px-2 w-32 text-center" data-tour="biblioteca-doc-status">
        <span className={`px-2.5 py-1.5 rounded-full text-[8px] font-bold uppercase tracking-wider border ${statusInfo.classes} leading-none`}>
          {statusInfo.label}
        </span>
      </div>

      <div className="flex items-center gap-1 shrink-0 ml-2" data-tour="biblioteca-doc-actions">
        <button
          data-tour="biblioteca-doc-view-btn"
          onClick={() => onView(doc.id)}
          aria-label="Ver documento"
          title="Ver documento"
          className="p-2 text-slate-400 hover:text-blue-700 dark:hover:text-white hover:bg-blue-50 dark:hover:bg-blue-600 rounded-lg transition-colors"
        >
          <Eye className="h-4 w-4" />
        </button>

          <LibraryDropdownActions
            doc={docWithVersionData}
            user={user}
            canManage={canManage}
            isDipDirector={isDipDirector}
            onDelete={onDelete}
            onRefresh={onRefresh}
          />
      </div>
    </div>
  );
}
