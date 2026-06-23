import { useLinkBulletinToActivity } from "@/actions/sms/sms_actividades/actions";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useGetBulletinsWithoutActivity } from "@/hooks/sms/boletin/useGetBulletinsWithoutActivity";
import { SMSActivity } from "@/types";
import { Loader2 } from "lucide-react";
import { useState } from "react";

interface LinkBulletinToActivityFormProps {
  initialData: SMSActivity;
  onClose: () => void;
}

export const LinkBulletinToActivityForm = ({
  initialData,
  onClose,
}: LinkBulletinToActivityFormProps) => {
  const { selectedCompany } = useCompanyStore();
  const [selectedBulletinId, setSelectedBulletinId] = useState<string>("");

  const { data: bulletins, isLoading } = useGetBulletinsWithoutActivity(
    selectedCompany?.slug,
  );

  const { linkBulletinToActivity } = useLinkBulletinToActivity();

  const handleLink = async () => {
    if (!selectedBulletinId || !selectedCompany?.slug) return;

    await linkBulletinToActivity.mutateAsync({
      company: selectedCompany.slug,
      activity_id: initialData.id,
      bulletin_id: selectedBulletinId,
    });
    onClose();
  };

  return (
    <div className="flex flex-col gap-4 p-2">
      {isLoading ? (
        <div className="flex justify-center p-4">
          <Loader2 className="size-6 animate-spin" />
        </div>
      ) : bulletins && bulletins.length > 0 ? (
        <>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">
              Seleccionar Boletín
            </label>
            <Select
              value={selectedBulletinId}
              onValueChange={setSelectedBulletinId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione un boletín" />
              </SelectTrigger>
              <SelectContent>
                {bulletins.map((bulletin) => (
                  <SelectItem key={bulletin.id} value={bulletin.id}>
                    {bulletin.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col-reverse gap-2 md:flex-row md:justify-end">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              disabled={!selectedBulletinId || linkBulletinToActivity.isPending}
              className="hover:bg-white hover:text-black hover:border hover:border-black transition-all"
              onClick={handleLink}
            >
              {linkBulletinToActivity.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <p>Vincular</p>
              )}
            </Button>
          </div>
        </>
      ) : (
        <p className="text-center text-muted-foreground p-4">
          No hay boletines disponibles para vincular.
        </p>
      )}
    </div>
  );
};
