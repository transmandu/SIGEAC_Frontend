"use client";

import { useTheme } from "next-themes";
import Image from "next/image";
import logo from "@/public/logo.png";
import logoDark from "@/public/logo-dark.png";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
}

const Logo = ({
  width = 350,
  height = 350,
  className,
}: LogoProps) => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const src =
    !mounted
      ? logo
      : resolvedTheme === "dark"
        ? logoDark
        : logo;

  return (
    <Image
      src={src}
      alt="Logo SIGEAC"
      width={width}
      height={height}
      priority
      className={cn("w-auto h-auto", className)}
    />
  );
};

export default Logo;