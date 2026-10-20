"use client";

import { ControlSnapshotDialog } from "./snapshot/ControlSnapshotDialog";
import { componentSnapshotConfig } from "./snapshot/snapshotConfigs";

/** "Consultar Estado" del control de componentes: ver ControlSnapshotDialog. */
export function ComponentControlSnapshotDialog() {
  return <ControlSnapshotDialog config={componentSnapshotConfig} />;
}
