import { useCallback, useMemo, useState } from "react";

import {
  notificationArea,
  notificationFacets,
  notificationTone,
  type NotificationArea,
  type NotificationTone,
} from "@/lib/notifications";

export const ALL_FILTER = "ALL";

type Filterable = { type?: string; data?: { type?: string } };

/**
 * Filtros por área y tipo de la bandeja, compartidos por la página y el panel
 * de la campana (cada uno con su propio estado: filtrar en uno no mueve al
 * otro).
 *
 * Las opciones salen de lo que hay en `notifications`, no de un catálogo: lo
 * que esta compañía o este usuario no recibe nunca se ofrece, y con menos de
 * dos opciones el filtro no separaría nada, así que no se muestra. Una
 * selección que ya no existe (se borraron esas notificaciones) cuenta como
 * "todas" en vez de dejar la lista vacía con un filtro que no se ve.
 */
export const useNotificationFilters = (notifications: Filterable[]) => {
  const [areaChoice, setAreaChoice] = useState<string>(ALL_FILTER);
  const [toneChoice, setToneChoice] = useState<string>(ALL_FILTER);

  const facets = useMemo(
    () => notificationFacets(notifications),
    [notifications],
  );

  const showAreaFilter = facets.areas.length > 1;
  const showToneFilter = facets.tones.length > 1;

  const area =
    showAreaFilter && facets.areas.some((item) => item.key === areaChoice)
      ? (areaChoice as NotificationArea)
      : null;
  const tone =
    showToneFilter && facets.tones.some((item) => item.key === toneChoice)
      ? (toneChoice as NotificationTone)
      : null;

  const matches = useCallback(
    (notification: Filterable) =>
      (!area || notificationArea(notification) === area) &&
      (!tone || notificationTone(notification.data?.type) === tone),
    [area, tone],
  );

  const clear = useCallback(() => {
    setAreaChoice(ALL_FILTER);
    setToneChoice(ALL_FILTER);
  }, []);

  return {
    total: notifications.length,
    facets,
    showAreaFilter,
    showToneFilter,
    area,
    tone,
    setAreaChoice,
    setToneChoice,
    matches,
    isFiltered: !!area || !!tone,
    clear,
  };
};
