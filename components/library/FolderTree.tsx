'use client';

import { memo, useState, useEffect } from 'react';
import { Folder, FolderOpen, ChevronRight, ChevronDown, MoreHorizontal, Pencil, Trash2, Building2, Loader2 } from 'lucide-react';
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
}) {
  const [expanded, setExpanded] = useState(false);
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
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
          >
            {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </button>
        ) : (
          <span className="w-4" />
        )}

        {expanded ? <FolderOpen className="h-3.5 w-3.5 shrink-0" /> : <Folder className="h-3.5 w-3.5 shrink-0" />}

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

      {hasChildren && expanded && (
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
}: FolderTreeProps) {
  const [expandedDepts, setExpandedDepts] = useState<string[]>(
    isMultiDept ? [] : departmentFolders.map(d => d.departmentName)
  );

  useEffect(() => {
    if (!isMultiDept && departmentFolders.length > 0) {
      setExpandedDepts(departmentFolders.map(d => d.departmentName));
      departmentFolders.forEach(d => {
        if (d.folders.length === 0) {
          onToggleDept?.(d.departmentId);
        }
      });
    }
  }, [departmentFolders, isMultiDept, onToggleDept]);

  const toggleDept = (name: string, id: number) => {
    setExpandedDepts(prev => {
      const isExpanding = !prev.includes(name);
      if (isExpanding) {
        onToggleDept?.(id);
        return [...prev, name];
      }
      return prev.filter(n => n !== name);
    });
  };

  return (
    <div className="space-y-0.5">
      {departmentFolders.map((dept, index) => {
        const isDeptExpanded = expandedDepts.includes(dept.departmentName);
        const isLoading = loadingDeptIds.includes(dept.departmentId);
        const isSelected = selectedDeptName === dept.departmentName && selectedFolderPath === '/';

        return (
          <div key={dept.departmentId}>
            <div className={`flex items-center gap-1 w-full p-1 rounded-lg transition-all ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-slate-100 dark:hover:bg-slate-800/50'} ${!isSelected && isDeptExpanded ? 'bg-slate-50 dark:bg-slate-800/30' : ''}`}>
              {isMultiDept && (
                <button
                  onClick={(e) => { e.stopPropagation(); toggleDept(dept.departmentName, dept.departmentId); }}
                  className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md shrink-0 text-slate-500"
                >
                  {isDeptExpanded || (dept.folders.length > 0 && !isLoading) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
              )}
              <button
                onClick={() => onSelect('/', dept.departmentName)}
                className={`flex items-center gap-2.5 flex-1 p-1.5 text-[14px] font-semibold text-left truncate ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-200'}`}
              >
                {getDeptShape(index)}
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
                  />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default memo(FolderTree);
