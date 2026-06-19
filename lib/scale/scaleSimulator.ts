/**
 * scaleSimulator.ts
 * Simulador de balanza USB Serial con perfiles de comportamiento.
 */

import { ScaleDriver } from "./scale.types";
import { SIMULATION_PROFILE } from "./scale.config";

type DataCallback = (chunk: string) => void;
type SimulationProfile = "stable" | "unstable" | "heavy" | "light";

interface ProfileConfig {
  getBaseWeight: () => number;
  getNoise: () => number;
  changeInterval: number;
}

const PROFILE_MAP: Record<SimulationProfile, ProfileConfig> = {
  stable: {
    getBaseWeight: () => 10.0,
    getNoise: () => (Math.random() - 0.5) * 0.002, // Ruido mínimo
    changeInterval: 0, // Peso fijo
  },
  unstable: {
    getBaseWeight: () => 15.0,
    getNoise: () => (Math.random() - 0.5) * 1.5, // Ruido alto
    changeInterval: 500, // Cambia constantemente
  },
  heavy: {
    getBaseWeight: () => 30.0 + Math.random() * 15.0, // 30-45kg
    getNoise: () => (Math.random() - 0.5) * 0.05,
    changeInterval: 6000, // Cambia cada 6s
  },
  light: {
    getBaseWeight: () => 0.1 + Math.random() * 1.9, // 0.1-2.0kg
    getNoise: () => (Math.random() - 0.5) * 0.02,
    changeInterval: 4000, // Cambia cada 4s
  },
};

function getProfileConfig(profile: string): ProfileConfig {
  const valid = profile as SimulationProfile;
  if (valid in PROFILE_MAP) return PROFILE_MAP[valid];
  console.warn(
    `[ScaleSimulator] Perfil "${profile}" invalido. Usando "stable".`,
  );
  return PROFILE_MAP.stable;
}

export class ScaleSimulator implements ScaleDriver {
  private callbacks: Set<DataCallback> = new Set();
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private weightChangeId: ReturnType<typeof setTimeout> | null = null;
  private stepIntervalId: ReturnType<typeof setInterval> | null = null;
  private currentWeight = 0;
  private connected = false;
  private config: ProfileConfig;

  constructor() {
    this.config = getProfileConfig(SIMULATION_PROFILE);
    this.currentWeight = this.config.getBaseWeight();
  }

  async connect(): Promise<void> {
    if (this.connected) return; // Idempotente
    this.connected = true;

    this.intervalId = setInterval(() => {
      if (!this.connected) return;
      const reading = this.currentWeight + this.config.getNoise();
      this.emit(`${reading.toFixed(3)} kg\r\n`);
    }, 100);

    if (this.config.changeInterval > 0) {
      this.scheduleWeightChange();
    }
  }

  async disconnect(): Promise<void> {
    if (!this.connected) return; // Idempotente
    this.connected = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.weightChangeId) {
      clearTimeout(this.weightChangeId);
      this.weightChangeId = null;
    }
    if (this.stepIntervalId) {
      clearInterval(this.stepIntervalId);
      this.stepIntervalId = null;
    }
    this.callbacks.clear();
  }

  onData(callback: (chunk: string) => void): void {
    this.callbacks.add(callback);
  }

  offData(callback: (chunk: string) => void): void {
    this.callbacks.delete(callback);
  }

  private emit(chunk: string): void {
    this.callbacks.forEach((cb) => cb(chunk));
  }

  private scheduleWeightChange(): void {
    if (!this.connected || this.config.changeInterval <= 0) return;
    this.weightChangeId = setTimeout(() => {
      if (!this.connected) return;
      const target = this.config.getBaseWeight();
      let step = 0;
      this.stepIntervalId = setInterval(() => {
        if (!this.connected) {
          if (this.stepIntervalId) {
            clearInterval(this.stepIntervalId);
            this.stepIntervalId = null;
          }
          return;
        }
        step++;
        this.currentWeight += (target - this.currentWeight) * 0.3;
        if (step >= 20) {
          this.currentWeight = target;
          if (this.stepIntervalId) {
            clearInterval(this.stepIntervalId);
            this.stepIntervalId = null;
          }
        }
      }, 50);
      this.scheduleWeightChange();
    }, this.config.changeInterval);
  }
}
