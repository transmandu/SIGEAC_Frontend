import type { AircraftAssingment } from "@/types";

/**
 * Lectura de la parte al removerse. Las remociones anteriores a que se guardara
 * no la tienen: ahí se muestra la que la parte tiene hoy, que no cambia desde
 * que salió de la aeronave.
 */
export const removalReadings = (assignment: AircraftAssingment) => ({
  tsn:
    assignment.removed_time_since_new ??
    assignment.aircraft_part.time_since_new,
  tso:
    assignment.removed_time_since_overhaul ??
    assignment.aircraft_part.time_since_overhaul,
  csn:
    assignment.removed_cycles_since_new ??
    assignment.aircraft_part.cycles_since_new,
  cso:
    assignment.removed_cycles_since_overhaul ??
    assignment.aircraft_part.cycles_since_overhaul,
});
