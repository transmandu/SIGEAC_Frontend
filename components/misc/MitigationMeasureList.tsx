import { MitigationMeasure } from "@/types";
import { Dialog } from "@radix-ui/react-dialog";
import React from "react";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

interface MitigationMeasuresListProps {
  measures: MitigationMeasure[];
}

const MitigationMeasureList = (props: MitigationMeasuresListProps) => {
  return (
    <Dialog>
      <DialogTrigger>Open</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </DialogDescription>
        </DialogHeader>

        <ul>
          {props.measures.map((measure) => (
            <li key={measure.id}>{measure.description}</li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
};

export default MitigationMeasureList;
