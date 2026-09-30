"use client";

import { Button } from "@/components/ui/button";
import { PdfEndpointPreviewDialog } from "@/components/dialogs/shared/PdfEndpointPreviewDialog";
import { FileDown } from "lucide-react";
import { useState } from "react";

interface PdfDownloadButtonProps {
  endpoint: string;
  fileName: string;
  title: string;
  description?: string;
  label: string;
  className?: string;
  icon?: React.ReactNode;
}

export function PdfDownloadButton({
  endpoint,
  fileName,
  title,
  description,
  label,
  className,
  icon,
}: PdfDownloadButtonProps) {
  const [open, setOpen] = useState(false);

  if (!endpoint) return null;

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className={className ?? "h-9 w-full"}
        onClick={() => setOpen(true)}
      >
        {icon ?? <FileDown className="w-4 h-4" />}
        {label}
      </Button>

      <PdfEndpointPreviewDialog
        open={open}
        onOpenChange={setOpen}
        endpoint={endpoint}
        fileName={fileName}
        title={title}
        description={description}
      />
    </>
  );
}

export default PdfDownloadButton;
