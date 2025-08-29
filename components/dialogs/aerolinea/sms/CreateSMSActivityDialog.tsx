"use client";
import CreateSMSActivityForm from "@/components/forms/aerolinea/sms/CreateSMSActivityForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SMSActivity } from "@/types";

interface FormProps {
  initialData?: SMSActivity;
  isEditing?: boolean;
  selectedDate?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateSMSActivityDialog({
  isEditing,
  initialData,
  open,
  onOpenChange,
  selectedDate,
}: FormProps) {
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="flex flex-col max-w-2xl m-2">
          <DialogHeader>
            <DialogTitle></DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>

          {isEditing && initialData ? (
            <CreateSMSActivityForm
              isEditing={true}
              initialData={initialData}
              onClose={onOpenChange}
            />
          ) : (
            <CreateSMSActivityForm
              onClose={onOpenChange}
              selectedDate={selectedDate}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
