'use client';

import { memo, useState, useEffect, useRef } from 'react';
import { Folder, FolderOpen, ChevronRight, ChevronDown, MoreHorizontal, Pencil, Trash2, Loader2 } from 'lucide-react';
import { FolderNode } from '@/lib/libraryService';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

const departmentStyles = [
  { color: 'bg-blue-500', shape: 'rounded-full' },
  { color: 'bg-orange-500', shape: 'rounded-full' },
  { color: 'bg-green-500', shape: 'rounded-full' },
  { color: 'bg-yellow-500', shape: 'rounded-full' },
  { color: 'bg-amber-700', shape: 'rounded-full' },
  { color: 'bg-purple-500', shape: 'rounded-full' },
  { color: 'bg-pink-500', shape: 'rounded-full' },
  { color: 'bg-teal-500', shape: 'rounded-full' },
];

function getDeptShape(index: number) {
  const style = departmentStyles[index % departmentStyles.length];
  return <div className={`w-3.5 h-3.5 shrink-0 shadow-sm ${style.color} ${style.shape}`} />;
}

export interface DepartmentFolderGroup {
  departmentId: number;
  departmentName: string;
  folders: FolderNode[];
  department_parent_id?: number | null;
  decedent?: DepartmentFolderGroup[];
}

interface FolderTreeProps {
  departmentFolders: DepartmentFolderGroup[];
  isMultiDept: boolean;
  selectedDeptName: string | null;
  selectedFolderPath: string | null;
  onSelect: (folderPath: string, departmentName: string) => void;
  onRename: (folder: FolderNode, departmentId: number, departmentName: string) => void;
  onDelete: (folder: FolderNode, departmentId: number, departmentName: string) => void;
  onDropDocument: (documentId: number, folderPath: string, departmentName: string) => void;
  onToggleDept?: (departmentId: number) => void;
  companySlug: string;
  loadingDeptIds?: number[];
  canManage: boolean;
}

function FolderNodeRow({
  node,
  selectedFolderPath,
  onSelect,
  onRename,
  onDelete,
  onDropDocument,
  canManage,
  departmentId,
  departmentName,
  level = 0,
  isExpanded,
  onToggleFolder,
  expandedFolders,
}: {
  node: FolderNode;
  selectedFolderPath: string | null;
  onSelect: (path: string, deptName: string) => void;
  onRename: (folder: FolderNode, deptId: number, deptName: string) => void;
  onDelete: (folder: FolderNode, deptId: number, deptName: string) => void;
  onDropDocument: (documentId: number, folderPath: string, deptName: string) => void;
  canManage: boolean;
  departmentId: number;
  departmentName: string;
  level: number;
  isExpanded: boolean;
  onToggleFolder: (path: string) => void;
  expandedFolders: Record<string, boolean>;
}) {
  const [dragOver, setDragOver] = useState(false);
  const hasChildren = node.children.length > 0;
  const isSelected = selectedFolderPath === node.path;

  const handleDrop = (e: React.DragEvent) => {
    if (!canManage) return;
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const docId = e.dataTransfer.getData('text/plain');
    const deptName = e.dataTransfer.getData('text/dept-name');
    if (docId) {
      onDropDocument(parseInt(docId, 10), node.path, deptName || '');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!canManage) return;
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!canManage) return;
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const isRoot = node.id === 'root';

  return (
    <div>
      <div
        className={`group flex items-center gap-1.5 px-2 py-1.5 rounded-lg cursor-pointer transition-all text-[13.5px] font-medium tracking-tight
          ${isSelected
            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
            : dragOver
              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 ring-2 ring-blue-400 ring-dashed'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50'
          }`}
        style={{ paddingLeft: `${12 + level * 16}px` }}
        onClick={() => onSelect(node.path, departmentName)}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {hasChildren ? (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleFolder(node.path); }}
            className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
          >
            {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </button>
        ) : (
          <span className="w-4" />
        )}

        {isExpanded ? <FolderOpen className="h-3.5 w-3.5 shrink-0" /> : <Folder className="h-3.5 w-3.5 shrink-0" />}

        <span className="truncate flex-1">{node.name}</span>

        {canManage && !isRoot && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className="p-0.5 opacity-0 group-hover:opacity-100 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
              >
                <MoreHorizontal className="h-3 w-3" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[140px] bg-white dark:bg-[#1a1c1e] border-slate-200 dark:border-gray-700">
              <DropdownMenuItem onClick={() => onRename(node, departmentId, departmentName)} className="gap-2 cursor-pointer text-xs">
                <Pencil className="h-3.5 w-3.5 text-blue-500" /> Renombrar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(node, departmentId, departmentName)} className="gap-2 cursor-pointer text-xs text-red-500 focus:text-red-500">
                <Trash2 className="h-3.5 w-3.5" /> Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {hasChildren && isExpanded && (
        <div>
          {node.children.map((child) => (
            <FolderNodeRow
              key={child.id}
              node={child}
              selectedFolderPath={selectedFolderPath}
              onSelect={onSelect}
              onRename={onRename}
              onDelete={onDelete}
              onDropDocument={onDropDocument}
              canManage={canManage}
              departmentId={departmentId}
              departmentName={departmentName}
              level={level + 1}
              isExpanded={!!expandedFolders[`${departmentId}:${child.path}`]}
              onToggleFolder={onToggleFolder}
              expandedFolders={expandedFolders}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FolderTree({
  departmentFolders,
  isMultiDept,
  selectedDeptName,
  selectedFolderPath,
  onSelect,
  onRename,
  onDelete,
  onDropDocument,
  onToggleDept,
  loadingDeptIds = [],
  canManage,
  companySlug,
}: FolderTreeProps) {
  const [expandedDepts, setExpandedDepts] = useState<number[]>(
    isMultiDept ? [] : departmentFolders.map(d => d.departmentId)
  );

  const STORAGE_KEY = `biblioteca_expanded_folders_` + companySlug;

  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const handleToggleFolder = (deptId: number, path: string) => {
    const key = `${deptId}:${path}`;
    setExpandedFolders(prev => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const toggledDepts = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (!isMultiDept && departmentFolders.length > 0) {
      const ids = departmentFolders.map(d => d.departmentId);
      const same = ids.length === expandedDepts.length && ids.every((v, i) => v === expandedDepts[i]);
      if (!same) {
        setExpandedDepts(ids);
      }

      departmentFolders.forEach(d => {
        if (d.folders.length === 0 && !toggledDepts.current.has(d.departmentId)) {
          toggledDepts.current.add(d.departmentId);
          onToggleDept?.(d.departmentId);
        }
      });
    }
  }, [departmentFolders, isMultiDept, onToggleDept, expandedDepts]);

  const toggleDept = (id: number, name: string) => {
    setExpandedDepts(prev => {
      const isExpanding = !prev.includes(id);
      if (isExpanding) {
        onToggleDept?.(id);
        return [...prev, id];
      }
      return prev.filter(n => n !== id);
    });
  };

  const renderDept = (dept: DepartmentFolderGroup, idx: number, depth = 0) => {
    const isDeptExpanded = expandedDepts.includes(dept.departmentId);
    const isLoading = loadingDeptIds.includes(dept.departmentId);
    const isSelected = selectedDeptName === dept.departmentName && selectedFolderPath === '/';

    return (
      <div key={dept.departmentId}>
        <div className={`flex items-center gap-1 w-full p-1 rounded-lg transition-all ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-slate-100 dark:hover:bg-slate-800/50'} ${!isSelected && isDeptExpanded ? 'bg-slate-50 dark:bg-slate-800/30' : ''}`}>
          {isMultiDept && (
            <button
              onClick={(e) => { e.stopPropagation(); toggleDept(dept.departmentId, dept.departmentName); }}
              className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md shrink-0 text-slate-500"
            >
              {isDeptExpanded || (dept.folders.length > 0 && !isLoading) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          )}
          <button
            onClick={() => onSelect('/', dept.departmentName)}
            className={`flex items-center gap-2.5 flex-1 p-1.5 text-[14px] font-semibold text-left truncate ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-200'}`}
          >
            {getDeptShape(idx + depth)}
            <span className="truncate" title={dept.departmentName}>{dept.departmentName}</span>
            {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0 ml-1 text-blue-500" />}
          </button>
        </div>

        {isDeptExpanded && (
          <div className="ml-2.5 pl-2.5 border-l-[1.5px] border-slate-200 dark:border-slate-700 mt-1 mb-2">
            {isLoading && dept.folders.length === 0 ? (
              <div className="flex items-center gap-2 px-2 py-1.5 text-[12px] text-slate-400 font-medium">
                <Loader2 className="h-3 w-3 animate-spin" />
                Cargando...
              </div>
            ) : (
              <FolderNodeRow
                node={{ id: 'root', name: 'Raíz', path: '/', children: dept.folders }}
                selectedFolderPath={selectedFolderPath}
                onSelect={onSelect}
                onRename={onRename}
                onDelete={onDelete}
                onDropDocument={onDropDocument}
                canManage={canManage}
                departmentId={dept.departmentId}
                departmentName={dept.departmentName}
                level={0}
                isExpanded={!!expandedFolders[`${dept.departmentId}:/`]}
                onToggleFolder={(path: string) => handleToggleFolder(dept.departmentId, path)}
                expandedFolders={expandedFolders}
              />
            )}

            {Array.isArray(dept.decedent) && dept.decedent.map((childDept, ci) => (
              <div key={childDept.departmentId} className="mt-2">
                {renderDept(childDept, idx + ci + 1, depth + 1)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-0.5">
      {departmentFolders.map((d, i) => renderDept(d, i, 0))}
    </div>
  );
}

export default memo(FolderTree);