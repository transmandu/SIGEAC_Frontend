"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const formSchema = z.object({
  tittle: z
    .string()
    .min(5, "El titulo debe contener al menos 5 caracteres")
    .max(32, "El titulo no debe exceder los 32 caracteres"),
  description: z
    .string()
    .min(5, "La descripción debe contener al menos 5 caracteres")
    .max(256, "La descripción no debe exceder los 256 caracteres"),
});

function Page() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tittle: "",
      description: "",
    },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    toast("Por favor, ingrese los siguientes valores: ", {
      description: (
        <pre>
          <code>{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
      position: "bottom-right",
      classNames: {
        content: "flex flex-col gap-2",
      },
      style: {
        "--border-radius": "calc(var(--radius) + px)",
      } as React.CSSProperties,
    });
  }

  return <div>page</div>;
}

export default Page;
