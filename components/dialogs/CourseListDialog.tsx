"use client";

import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format, startOfMonth } from "date-fns";
import { PathParamsContext } from "next/dist/shared/lib/hooks-client-context.shared-runtime";
import { Params } from "next/dist/shared/lib/router/utils/route-matcher";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

interface FormProps {
  title: string;
}
export default function CourseListDialog({ title }: FormProps) {
  const searchParams = useSearchParams();

  const searchStatus = searchParams.get("searchStatus");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  console.log("searchParams", searchStatus, "from", from, "to", to);

  const [open, setOpen] = useState(true);
  return (
    <>
      <Card className="flex">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="flex flex-col max-w-2xl m-2">
            <DialogHeader>
              <DialogTitle></DialogTitle>
              <DialogDescription></DialogDescription>
            </DialogHeader>
            we need the action here or content {title}
          </DialogContent>
        </Dialog>
      </Card>
    </>
  );
}
