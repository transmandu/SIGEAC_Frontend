"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { CreateVoluntaryReportForm } from "../forms/CreateVoluntaryReportForm";
import CreateMitigationMeasureForm from "../forms/CreateMitigationMeasureForm";
import { useRouter } from "next/router";
import { useParams } from "next/navigation";

export default function CreateMitigationMeasureDialog() {
  const { plan_id } = useParams<{ plan_id: string }>();  
  const [open, setOpen] = useState(false);
  return (
    <>
      <Card className="flex">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => setOpen(true)}
              variant="outline"
              size="sm"
              className=" hidden h-8 lg:flex"
            >
              Nueva medida
            </Button>
          </DialogTrigger>
          <DialogContent className="flex flex-col max-w-2xl m-2">
            <DialogHeader>
              <DialogTitle></DialogTitle>
              <DialogDescription></DialogDescription>
            </DialogHeader>

            <CreateMitigationMeasureForm
              onClose={() => setOpen(false)}
              id={plan_id}
            />
          </DialogContent>
        </Dialog>
      </Card>
    </>
  );
}
