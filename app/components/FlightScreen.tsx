"use client";

import FlightMap from "./FlightMap";
import { useFlightTimer } from "../hooks/useFlightTimer";
import { formatTime } from "../lib/time";
import { useState } from "react";

const FLIGHT = {
  code: "FOCUS101",
  origin: "TPE",
  destination: "HND",
  durationSeconds: 60,
};

export default function FlightScreen() {
  const { progress, remainingSeconds, isComplete } = useFlightTimer(
    FLIGHT.durationSeconds
  );
  const [zoom, setZoom] = useState(6.2);

  return (
    <div className="min-h-screen bg-[var(--background)] px-4 py-6 text-[var(--foreground)] sm:px-8">
      <div className="ife-shell mx-auto flex min-h-[88vh] w-full max-w-6xl flex-col overflow-hidden rounded-[32px]">
        <header className="hud-bar flex flex-wrap items-center justify-between gap-4 px-6 py-4 sm:px-10">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-300">
              Focus Flight
            </p>
            <div className="mt-1 flex items-baseline gap-3">
              <h1 className="text-2xl font-semibold tracking-[0.18em]">
                {FLIGHT.code}
              </h1>
              <span className="text-sm text-slate-300">
                {FLIGHT.origin} -&gt; {FLIGHT.destination}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-300">
              Remaining
            </p>
            <p className="mt-1 font-mono text-2xl tracking-[0.2em]">
              {formatTime(remainingSeconds)}
            </p>
          </div>
        </header>

        <main className="relative flex-1 min-h-[60vh]">
          <FlightMap progress={progress} zoom={zoom} />
          {isComplete && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-center">
              <div className="rounded-full border border-white/20 bg-black/40 px-8 py-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.6em] text-slate-200">
                  Arrived
                </p>
                <p className="mt-1 text-xl font-semibold tracking-[0.2em]">
                  Focus Complete
                </p>
              </div>
            </div>
          )}
        </main>

        <footer className="hud-bar px-6 py-4 sm:px-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-slate-300">
                ETA
              </p>
              <p className="mt-1 font-mono text-lg tracking-[0.2em]">
                {formatTime(remainingSeconds)}
              </p>
            </div>
            <div className="min-w-[220px] flex-1">
              <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-300">
                <span>Progress</span>
                <span>{Math.round(progress * 100)}%</span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${Math.min(progress * 100, 100)}%` }}
                />
              </div>
            </div>
            <div className="min-w-[200px] text-right">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-300">
                Camera
              </p>
              <div className="mt-2 flex items-center justify-end gap-3">
                <input
                  aria-label="Camera zoom"
                  className="h-1 w-36 cursor-pointer appearance-none rounded-full bg-white/10 accent-[#8ab9ff]"
                  type="range"
                  min="4.5"
                  max="9"
                  step="0.1"
                  value={zoom}
                  onChange={(event) => setZoom(Number(event.target.value))}
                />
                <span className="font-mono text-xs text-slate-300">
                  {zoom.toFixed(1)}x
                </span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
