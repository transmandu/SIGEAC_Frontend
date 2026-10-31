import { useEffect, useState } from "react";

/**
 * Segundos que faltan para una fecha ISO, descontando cada segundo mientras
 * falte algo. Devuelve 0 sin fecha o con la fecha ya vencida, y deja de
 * programar ticks en cuanto llega a 0.
 *
 * Al llegar una fecha nueva la hora guardada es vieja y el restante saldría
 * inflado; por eso se resincroniza en el siguiente ciclo, sin esperar al primer
 * segundo del intervalo.
 */
export function useCountdown(until?: string | null): number {
  const target = until ? new Date(until).getTime() : 0;
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (target - Date.now() <= 0) return;

    const sync = setTimeout(() => setNow(Date.now()), 0);
    const id = setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (current >= target) clearInterval(id);
    }, 1000);

    return () => {
      clearTimeout(sync);
      clearInterval(id);
    };
  }, [target]);

  return Math.max(0, Math.ceil((target - now) / 1000));
}

/** 7:05 para 425 segundos. */
export const formatCountdown = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const rest = String(seconds % 60).padStart(2, "0");

  return `${minutes}:${rest}`;
};
