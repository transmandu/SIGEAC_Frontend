"use client";

import { ChangeRequest } from "@/types/sms/aeronautical/change-request";
import { CreateChangeRequestForm } from "./CreateChangeRequestForm";

export function EditChangeRequestForm({
  changeRequest,
}: {
  changeRequest: ChangeRequest;
}) {
  return <CreateChangeRequestForm initialData={changeRequest} />;
}
