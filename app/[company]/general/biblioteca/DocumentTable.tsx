'use client';

import { FolderOpen } from 'lucide-react';
import DocumentRow from './documentRow';
import { Document } from '@/lib/libraryService';

interface DocumentTableProps {
  company: string;
  documents: Document[];
  onRefresh: () => Promise<void>;
  onView: (id: number) => void;
  onDelete: (id: number | string) => Promise<void>;
  canManage: boolean;
  isDipDirector: boolean;
  user: any;
}

export default function DocumentTable({ company, documents, onRefresh, onView, onDelete, canManage, isDipDirector, user }: DocumentTableProps) {
  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FolderOpen className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
        <p className="text-sm font-bold text-slate-400 dark:text-slate-500">
          No hay documentos en esta carpeta
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-slate-200 dark:divide-gray-800/10">
      {documents.map((doc) => (
        <DocumentRow
          key={doc.id}
          doc={doc}
          onView={onView}
          onDelete={onDelete}
          onRefresh={onRefresh}
          canManage={canManage}
          isDipDirector={isDipDirector}
          user={user}
        />
      ))}
    </div>
  );
}
