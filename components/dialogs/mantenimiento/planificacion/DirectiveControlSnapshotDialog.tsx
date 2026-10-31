"use client";

import { ControlSnapshotDialog } from "./snapshot/ControlSnapshotDialog";
import { directiveSnapshotConfig } from "./snapshot/snapshotConfigs";

/** "Consultar Estado" del control de directivas: ver ControlSnapshotDialog. */
export function DirectiveControlSnapshotDialog() {
  return <ControlSnapshotDialog config={directiveSnapshotConfig} />;
}
