"use client";

import { Mail, MapPin, Phone } from "lucide-react";

import { ContactSubRow } from "@/components/tables/ContactSubRow";
import { formatPhone } from "@/lib/phone";
import type { Vendor } from "@/types";

export default function VendorsSubRow({ vendor }: { vendor: Vendor }) {
  return (
    <ContactSubRow
      items={[
        { icon: Phone, label: "Teléfono", value: formatPhone(vendor.phone) },
        { icon: Mail, label: "Correo", value: vendor.email },
        { icon: MapPin, label: "Dirección", value: vendor.address },
      ]}
    />
  );
}
