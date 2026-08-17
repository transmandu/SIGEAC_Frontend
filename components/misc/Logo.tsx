import Image from "next/image";
import logo from "@/public/logo.png";
import logoDark from "@/public/logo-dark.webp";
import { cn } from "@/lib/utils";

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
}

// Ambas variantes se renderizan y el tema lo resuelve CSS: con next-themes el
// tema real no se conoce hasta que monta, y elegir el src en JS provocaba un
// flash del logo claro más una segunda descarga en modo oscuro.
const Logo = ({
  width = 350,
  height = 350,
  className,
}: LogoProps) => {
  const shared = cn(
    "w-auto h-auto select-none pointer-events-none",
    className
  );

  return (
    <>
      <Image
        src={logo}
        alt="Logo SIGEAC"
        width={width}
        height={height}
        priority
        draggable={false}
        className={cn(shared, "dark:hidden")}
      />
      <Image
        src={logoDark}
        alt="Logo SIGEAC"
        width={width}
        height={height}
        priority
        draggable={false}
        className={cn(shared, "hidden dark:block")}
      />
    </>
  );
};

export default Logo;
