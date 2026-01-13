"use client";

import BoardingPass from "./BoardingPass";
import FlightMap from "./FlightMap";
import { useFlightTimer } from "../hooks/useFlightTimer";
import { formatTime } from "../lib/time";
import { useEffect, useMemo, useState } from "react";

const FLIGHTS = [
  {
    code: "FOCUS101",
    origin: "TPE",
    destination: "HND",
    durationSeconds: 25 * 60,
    originCoord: [121.233, 25.08] as const,
    destinationCoord: [139.78, 35.55] as const,
  },
  {
    code: "FOCUS202",
    origin: "ICN",
    destination: "HKG",
    durationSeconds: 45 * 60,
    originCoord: [126.45, 37.46] as const,
    destinationCoord: [114.17, 22.31] as const,
  },
  {
    code: "FOCUS303",
    origin: "SFO",
    destination: "LAX",
    durationSeconds: 15 * 60,
    originCoord: [-122.38, 37.62] as const,
    destinationCoord: [-118.4, 33.94] as const,
  },
];

export default function FlightScreen() {
  const [flightState, setFlightState] = useState<
    "select" | "checkin" | "in_flight" | "completed" | "cancelled"
  >("select");
  const [selectedFlight, setSelectedFlight] = useState(FLIGHTS[0]);
  const [zoom, setZoom] = useState(6.2);
  const passengerName = "Focus Pilot";
  const { progress, remainingSeconds, isComplete, reset } = useFlightTimer(
    selectedFlight.durationSeconds,
    flightState === "in_flight"
  );

  useEffect(() => {
    if (isComplete && flightState === "in_flight") {
      setFlightState("completed");
    }
  }, [isComplete, flightState]);

  const handleStart = () => {
    reset();
    setFlightState("in_flight");
  };

  const handleCancel = () => {
    setFlightState("cancelled");
  };

  const handleSelect = (flight: (typeof FLIGHTS)[number]) => {
    setSelectedFlight(flight);
    setFlightState("checkin");
  };

  const handleReset = () => {
    setFlightState("select");
  };

  const etaLabel = useMemo(() => {
    if (flightState === "in_flight") return formatTime(remainingSeconds);
    return formatTime(selectedFlight.durationSeconds);
  }, [flightState, remainingSeconds, selectedFlight.durationSeconds]);

  return (
    <div className="relative min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {flightState === "in_flight" ||
      flightState === "completed" ||
      flightState === "cancelled" ? (
        <>
          <div className="absolute inset-0">
            <FlightMap
              progress={progress}
              zoom={zoom}
              origin={selectedFlight.originCoord}
              destination={selectedFlight.destinationCoord}
              originLabel={selectedFlight.origin}
              destinationLabel={selectedFlight.destination}
            />
          </div>
          {(flightState === "completed" || flightState === "cancelled") && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-center">
              <div className="rounded-full border border-white/20 bg-black/40 px-8 py-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.6em] text-slate-200">
                  {flightState === "completed" ? "Arrived" : "Cancelled"}
                </p>
                <p className="mt-1 text-xl font-semibold tracking-[0.2em]">
                  {flightState === "completed"
                    ? "Focus Complete"
                    : "Flight Ended"}
                </p>
              </div>
            </div>
          )}
          <header className="hud-bar absolute left-0 right-0 top-0 z-10 mx-4 mt-4 flex flex-wrap items-center justify-between gap-4 px-6 py-4 sm:mx-10">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-slate-300">
                Focus Flight
              </p>
              <div className="mt-1 flex items-baseline gap-3">
                <h1 className="text-2xl font-semibold tracking-[0.18em]">
                  {selectedFlight.origin} -&gt; {selectedFlight.destination}
                </h1>
              </div>
            </div>
            <div className="flex flex-1 items-center justify-end gap-6">
              <div className="text-right">
                <p className="text-xs uppercase tracking-[0.4em] text-slate-300">
                  Remaining
                </p>
                <p className="mt-1 font-mono text-2xl tracking-[0.2em]">
                  {formatTime(remainingSeconds)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <input
                  aria-label="Camera zoom"
                  className="h-1 w-24 cursor-pointer appearance-none rounded-full bg-white/10 accent-[#8ab9ff]"
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
              <div className="flex items-center gap-3">
                {flightState === "in_flight" ? (
                  <button
                    className="rounded-full border border-transparent px-4 py-2 text-[10px] uppercase tracking-[0.35em] text-slate-400 transition hover:text-slate-200"
                    type="button"
                    onClick={handleCancel}
                  >
                    End Flight
                  </button>
                ) : (
                  <button
                    className="rounded-full bg-[#8ab9ff] px-5 py-2 text-xs uppercase tracking-[0.4em] text-[#05070d] transition hover:bg-[#a6c8ff]"
                    type="button"
                    onClick={handleReset}
                  >
                    New Flight
                  </button>
                )}
              </div>
            </div>
          </header>
        </>
      ) : (
        <div className="relative flex min-h-screen items-center justify-center px-6 py-10">
          <div className="ife-shell w-full max-w-4xl rounded-[32px] px-8 py-10">
            {flightState === "select" && (
              <>
                <div className="mb-8">
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-300">
                    Flight Focus
                  </p>
                  <h1 className="mt-2 text-3xl font-semibold tracking-[0.2em]">
                    Choose Your Route
                  </h1>
                  <p className="mt-3 text-sm text-slate-300">
                    Flight length syncs with your focus duration.
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  {FLIGHTS.map((flight) => (
                    <button
                      key={flight.code}
                      className="group rounded-3xl border border-white/10 bg-black/20 p-5 text-left transition hover:border-white/30 hover:bg-black/30"
                      type="button"
                      onClick={() => handleSelect(flight)}
                    >
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-300">
                        {flight.code}
                      </p>
                      <p className="mt-2 text-2xl font-semibold tracking-[0.2em]">
                        {flight.origin} → {flight.destination}
                      </p>
                      <p className="mt-3 font-mono text-sm text-slate-300">
                        {formatTime(flight.durationSeconds)} focus session
                      </p>
                      <span className="mt-4 inline-flex items-center text-xs uppercase tracking-[0.3em] text-[#8ab9ff]">
                        Select
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
            {flightState === "checkin" && (
              <div className="flex flex-col items-start gap-8">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-300">
                    Check-in
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-[0.2em]">
                    {selectedFlight.origin} → {selectedFlight.destination}
                  </h2>
                  <p className="mt-3 text-sm text-slate-300">
                    Boarding pass ready. Your focus flight lasts{" "}
                    {formatTime(selectedFlight.durationSeconds)}.
                  </p>
                </div>
                <BoardingPass
                  origin={selectedFlight.origin}
                  destination={selectedFlight.destination}
                  durationSeconds={selectedFlight.durationSeconds}
                  passengerName={passengerName}
                  onTear={handleStart}
                />
                <button
                  className="rounded-full border border-white/20 px-6 py-3 text-xs uppercase tracking-[0.4em] text-slate-200 transition hover:border-white/40"
                  type="button"
                  onClick={handleReset}
                >
                  Back to Routes
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
