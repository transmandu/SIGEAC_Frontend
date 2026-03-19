import { useState } from "react";
import { 
  MoreVertical, Share2, Trash2, Loader2 
} from "lucide-react";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Props {
  doc: any;
  canManage: boolean;
  onDelete: (id: number | string) => Promise<void>;
}

export const LibraryDropdownActions = ({ doc, canManage, onDelete }: Props) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleShare = () => {
    const url = `${window.location.origin}/storage/${doc.document}`;
    navigator.clipboard.writeText(url);
    // Aquí podrías meter un toast de "Copiado"
  };

  const executeDelete = async () => {
    setLoading(true);
    await onDelete(doc.id);
    setLoading(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-gray-800 rounded-lg transition-all outline-none">
            <MoreVertical className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-48 dark:bg-[#0f1112] dark:border-gray-800">
          <DropdownMenuItem onClick={handleShare} className="gap-2 cursor-pointer">
            <Share2 className="h-4 w-4 text-blue-500" />
            <span className="text-xs">Compartir</span>
          </DropdownMenuItem>

          {canManage && (
            <>
              <div className="h-px bg-slate-100 dark:bg-gray-800 my-1" />
              <DialogTrigger asChild>
                <DropdownMenuItem className="gap-2 cursor-pointer text-red-600 dark:text-red-400">
                  <Trash2 className="h-4 w-4" />
                  <span className="text-xs font-bold">Eliminar</span>
                </DropdownMenuItem>
              </DialogTrigger>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <DialogContent className="dark:bg-[#0f1112] dark:border-gray-800">
        <DialogHeader>
          <DialogTitle>¿Eliminar documento?</DialogTitle>
          <DialogDescription>
            Estás a punto de eliminar <b>{doc.title}</b>. Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button 
            variant="destructive" 
            disabled={loading} 
            onClick={executeDelete}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Eliminar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};