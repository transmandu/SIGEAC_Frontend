"use client";

import { Mail, Phone } from "lucide-react";

import { ContactSubRow } from "@/components/tables/ContactSubRow";
import { formatPhone } from "@/lib/phone";
import type { Pilot } from "@/types";

/** Cómo contactar al piloto: datos de su ficha de empleado. */
export function PilotExpandedRow({ pilot }: { pilot: Pilot }) {
  return (
    <ContactSubRow
      items={[
        {
          icon: Phone,
          label: "Teléfono",
          value: formatPhone(pilot.employee?.phone),
        },
        { icon: Mail, label: "Correo", value: pilot.employee?.email },
      ]}
    />
  );
}
