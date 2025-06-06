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
import CreateFollowUpControlForm from "../forms/CreateFollowUpControlForm";
import { useParams } from "next/navigation";

export default function CreateFollowUpControlDialog() {
  const { plan_id, medida_id } = useParams<{
    plan_id: string;
    medida_id: string;
  }>();
  console.log("PLAN ID",plan_id);
  console.log("MEASURE ID",medida_id);
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
              Nuevo Control
            </Button>
          </DialogTrigger>
          <DialogContent className="flex flex-col max-w-2xl m-2">
            <DialogHeader>
              <DialogTitle></DialogTitle>
              <DialogDescription></DialogDescription>
            </DialogHeader>
            {medida_id && (
              <CreateFollowUpControlForm
                onClose={() => setOpen(false)}
                id={medida_id}
              />
            )}
          </DialogContent>
        </Dialog>
      </Card>
    </>
  );
}
