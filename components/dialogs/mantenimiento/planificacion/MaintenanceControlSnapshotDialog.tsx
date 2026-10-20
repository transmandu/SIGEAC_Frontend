"use client";

import { ControlSnapshotDialog } from "./snapshot/ControlSnapshotDialog";
import { maintenanceSnapshotConfig } from "./snapshot/snapshotConfigs";

/** "Consultar Estado" del control de mantenimiento: ver ControlSnapshotDialog. */
export function MaintenanceControlSnapshotDialog() {
  return <ControlSnapshotDialog config={maintenanceSnapshotConfig} />;
}
