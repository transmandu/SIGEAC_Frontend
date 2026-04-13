'use client';

import { useMemo } from 'react';
import { FileText, Clock, AlertCircle, ExternalLink } from 'lucide-react';
import { LibraryDropdownActions } from "@/components/dropdowns/general/LibraryDropdownActions";

const fileTypeDetails: any = {
  pdf: { color: 'text-red-600', bgColor: 'bg-red-500/10', iconColor: 'text-red-700 dark:text-red-400', label: 'PDF' },
  excel: { color: 'text-emerald-700', bgColor: 'bg-emerald-500/10', iconColor: 'text-emerald-700 dark:text-emerald-400', label: 'EXCEL' },
  word: { color: 'text-blue-700', bgColor: 'bg-blue-500/10', iconColor: 'text-blue-700 dark:text-blue-400', label: 'WORD' },
  default: { color: 'text-slate-700', bgColor: 'bg-slate-500/10', iconColor: 'text-slate-600 dark:text-gray-400', label: 'ARCHIVO' },
};

const getStatusDetails = (status: string, expirationDate: string) => {
  if (!expirationDate || status?.toLowerCase() === 'no_aplica') {
    return { label: 'PERMANENTE', classes: 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-500/10 dark:border-blue-500/20', isWarning: false };
  }
  const now = new Date();
  const expDate = new Date(expirationDate);
  const diffTime = expDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffTime < 0) return { label: 'VENCIDO', classes: 'bg-red-50 text-red-700 border-red-100 dark:bg-red-500/10 dark:border-red-500/20', isWarning: false };
  if (diffDays <= 5) return { label: `VENCE EN ${diffDays} DÍAS`, classes: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20 animate-pulse', isWarning: true };
  return { label: 'VIGENTE', classes: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20', isWarning: false };
};

export default function DocumentRow({ doc, onView, columnVisibility, isSubItem, onDelete, onRefresh, canManage, user }: any) {
  
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

  return (
    <div className={`group flex items-center gap-4 p-3 transition-colors border-l-2 border-l-transparent hover:border-l-blue-600 border-b border-slate-100 dark:border-transparent
      ${isSubItem ? 'pl-14' : 'pl-3'} 
      bg-white hover:bg-slate-50/80 dark:bg-transparent dark:hover:bg-white/5`}>
      
      {columnVisibility.title && (
        <>
          <div className={`p-2 rounded-lg ${fileDetails.bgColor} shrink-0 border border-current/5`}>
            <FileText className={`h-5 w-5 ${fileDetails.iconColor}`} strokeWidth={2}/>
          </div>
          <div className="flex-1 min-w-0 flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <h4 className="text-[12px] font-semibold text-slate-900 dark:text-gray-100 truncate uppercase">
                {doc.title || "Sin título"}
                {latestVersion && (
                  <span className="ml-2 text-[9px] font-bold text-slate-400 dark:text-gray-500 bg-slate-100 dark:bg-gray-800 px-1.5 py-0.5 rounded tracking-wider border border-slate-200 dark:border-gray-700">
                    {latestVersion.version_number}
                  </span>
                )}
              </h4>
              {statusInfo.isWarning && <AlertCircle className="h-3.5 w-3.5 text-amber-600 animate-bounce" />}
            </div>
            <span className={`w-fit text-[8px] font-bold px-1.5 py-0.5 rounded border border-current/20 ${fileDetails.bgColor} ${fileDetails.color}`}>
              {fileDetails.label}
            </span>
          </div>
        </>
      )}

      {columnVisibility.expiry_date && (
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <Clock className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-[10px] text-slate-800 dark:text-gray-300 font-medium uppercase w-20 leading-none">
            {displayExpirationDate}
          </span>
        </div>
      )}

      {columnVisibility.status && (
        <div className="hidden md:block shrink-0 px-2 w-32 text-center">
          <span className={`px-2.5 py-1.5 rounded-full text-[8px] font-bold uppercase tracking-wider border ${statusInfo.classes} leading-none`}>
              {statusInfo.label}
          </span>
        </div>
      )}

      {columnVisibility.actions && (
        <div className="flex items-center gap-1 shrink-0 ml-2">
          <button 
            // ✅ LIMPIEZA: Solo enviamos el doc.id puro
            onClick={() => onView(doc.id)} 
            className="p-2 text-slate-400 hover:text-blue-700 dark:hover:text-white hover:bg-blue-50 dark:hover:bg-blue-600 rounded-lg transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
          </button>
          
          <LibraryDropdownActions 
            doc={doc} 
            user={user}
            canManage={canManage} 
            onDelete={onDelete} 
            onRefresh={onRefresh} 
          />
        </div>
      )}
    </div>
  );
}