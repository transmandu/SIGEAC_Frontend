"use client";

import { ControlSnapshotDialog } from "./snapshot/ControlSnapshotDialog";
import { avionicsSnapshotConfig } from "./snapshot/snapshotConfigs";

/** "Consultar Estado" del control de aviónica: ver ControlSnapshotDialog. */
export function AvionicsControlSnapshotDialog() {
  return <ControlSnapshotDialog config={avionicsSnapshotConfig} />;
}
