"use client";
import { CreateCourseForm } from "@/components/forms/aerolinea/sms/CreateCourseForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface FormProps {
  selectedDate?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateCourseCalendarDialog({
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

          <CreateCourseForm
            onClose={onOpenChange}
            selectedDate={selectedDate}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
