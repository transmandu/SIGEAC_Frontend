import { useEffect, useState } from "react";

/** La hora actual, refrescada cada `intervalMs`: para vistas que muestran un reloj. */
export function useNow(intervalMs = 1000): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}
