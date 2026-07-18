/**
 * Replace deprecated THREE.Clock with a Timer-backed, Clock-compatible facade
 * before @react-three/fiber constructs its store clock.
 *
 * THREE r183+ deprecates Clock in favor of Timer. R3F still expects Clock API
 * (getDelta, getElapsedTime, elapsedTime, oldTime, start/stop).
 *
 * Uses Object.defineProperty — ESM module namespace is immutable for direct assign.
 */
import * as THREE from 'three';
import { Timer } from 'three';

type ClockLike = {
  autoStart: boolean;
  running: boolean;
  startTime: number;
  oldTime: number;
  elapsedTime: number;
  start: () => void;
  stop: () => void;
  getDelta: () => number;
  getElapsedTime: () => number;
};

function createTimerClock(autoStart = true): ClockLike {
  const timer = new Timer();
  if (typeof document !== 'undefined') {
    try {
      timer.connect(document);
    } catch {
      /* SSR / no document */
    }
  }

  let running = false;
  let startTime = 0;
  let oldTime = 0;
  /** When R3F sets elapsedTime directly (frameloop "never"), prefer this. */
  let manualElapsed: number | null = null;

  const clock: ClockLike = {
    autoStart,
    get running() {
      return running;
    },
    set running(v: boolean) {
      running = v;
    },
    startTime: 0,
    get oldTime() {
      return oldTime;
    },
    set oldTime(v: number) {
      oldTime = v;
    },
    get elapsedTime() {
      if (manualElapsed != null) return manualElapsed;
      return timer.getElapsed();
    },
    set elapsedTime(v: number) {
      manualElapsed = v;
    },
    start() {
      timer.reset();
      timer.update();
      startTime = performance.now();
      oldTime = startTime;
      clock.startTime = startTime;
      running = true;
      manualElapsed = null;
    },
    stop() {
      running = false;
    },
    getDelta() {
      if (!running && clock.autoStart) clock.start();
      if (running) {
        timer.update();
        manualElapsed = null;
      }
      return timer.getDelta();
    },
    getElapsedTime() {
      if (manualElapsed != null) return manualElapsed;
      if (running) timer.update();
      return timer.getElapsed();
    },
  };

  if (autoStart) clock.start();
  return clock;
}

function TimerClockConstructor(this: unknown, autoStart = true) {
  return createTimerClock(autoStart);
}

let installed = false;

/** Idempotent: swap THREE.Clock for Timer-backed implementation. Call before first Canvas. */
export function installTimerClock(): void {
  if (installed) return;
  installed = true;

  try {
    Object.defineProperty(THREE, 'Clock', {
      configurable: true,
      enumerable: true,
      writable: true,
      value: TimerClockConstructor,
    });
  } catch (err) {
    console.warn('[installTimerClock] could not replace THREE.Clock', err);
  }
}
