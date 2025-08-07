'use client';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}

export default function ConfirmCreateActivityReportDialog({
  open,
  onClose,
  onConfirm,
  loading
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="space-y-4 text-center">
        <p>No se encontró un registro de actividades para esta fecha. ¿Desea crear uno?</p>
        <div className="flex justify-center gap-2">
          <Button
            disabled={loading}
            onClick={onConfirm}
            className="min-w-[100px]"
          >
            {loading ? 'Creando...' : 'Crear'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}