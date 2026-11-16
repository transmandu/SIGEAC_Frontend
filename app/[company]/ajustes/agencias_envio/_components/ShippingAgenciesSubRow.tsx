"use client";

import { Mail, Phone } from "lucide-react";

import { ContactSubRow } from "@/components/tables/ContactSubRow";
import { formatPhone } from "@/lib/phone";
import type { ShippingAgency } from "@/types";

export default function ShippingAgenciesSubRow({
  agency,
}: {
  agency: ShippingAgency;
}) {
  return (
    <ContactSubRow
      items={[
        { icon: Phone, label: "Teléfono", value: formatPhone(agency.phone) },
        { icon: Mail, label: "Correo", value: agency.email },
      ]}
    />
  );
}
