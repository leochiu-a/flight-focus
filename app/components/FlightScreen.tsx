"use client";

import { useEffect, useMemo, useState } from "react";
import BoardingPass from "./BoardingPass";
import FlightMap from "./FlightMap";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFlightTimer } from "../hooks/useFlightTimer";
import { formatTime } from "../lib/time";

const CURRENT_ORIGIN = "TPE";
const CURRENT_ORIGIN_CITY = "Taipei";
const CURRENT_ORIGIN_COORD = [121.233, 25.08] as const;

const FLIGHTS = [
  {
    code: "FOCUS101",
    origin: CURRENT_ORIGIN,
    destination: "HND",
    durationSeconds: 25 * 60,
    originCoord: CURRENT_ORIGIN_COORD,
    destinationCoord: [139.78, 35.55] as const,
  },
  {
    code: "FOCUS202",
    origin: CURRENT_ORIGIN,
    destination: "HKG",
    durationSeconds: 45 * 60,
    originCoord: CURRENT_ORIGIN_COORD,
    destinationCoord: [114.17, 22.31] as const,
  },
  {
    code: "FOCUS303",
    origin: CURRENT_ORIGIN,
    destination: "LAX",
    durationSeconds: 15 * 60,
    originCoord: CURRENT_ORIGIN_COORD,
    destinationCoord: [-118.4, 33.94] as const,
  },
  {
    code: "FOCUS404",
    origin: CURRENT_ORIGIN,
    destination: "ICN",
    durationSeconds: 35 * 60,
    originCoord: CURRENT_ORIGIN_COORD,
    destinationCoord: [126.45, 37.46] as const,
  },
  {
    code: "FOCUS505",
    origin: CURRENT_ORIGIN,
    destination: "SFO",
    durationSeconds: 55 * 60,
    originCoord: CURRENT_ORIGIN_COORD,
    destinationCoord: [-122.38, 37.62] as const,
  },
  {
    code: "FOCUS606",
    origin: CURRENT_ORIGIN,
    destination: "SIN",
    durationSeconds: 40 * 60,
    originCoord: CURRENT_ORIGIN_COORD,
    destinationCoord: [103.99, 1.36] as const,
  },
  {
    code: "FOCUS707",
    origin: CURRENT_ORIGIN,
    destination: "BKK",
    durationSeconds: 30 * 60,
    originCoord: CURRENT_ORIGIN_COORD,
    destinationCoord: [100.75, 13.69] as const,
  },
  {
    code: "FOCUS808",
    origin: CURRENT_ORIGIN,
    destination: "SYD",
    durationSeconds: 60 * 60,
    originCoord: CURRENT_ORIGIN_COORD,
    destinationCoord: [151.18, -33.94] as const,
  },
  {
    code: "FOCUS909",
    origin: CURRENT_ORIGIN,
    destination: "DXB",
    durationSeconds: 50 * 60,
    originCoord: CURRENT_ORIGIN_COORD,
    destinationCoord: [55.36, 25.25] as const,
  },
  {
    code: "FOCUS010",
    origin: CURRENT_ORIGIN,
    destination: "CDG",
    durationSeconds: 70 * 60,
    originCoord: CURRENT_ORIGIN_COORD,
    destinationCoord: [2.55, 49.01] as const,
  },
  {
    code: "FOCUS111",
    origin: CURRENT_ORIGIN,
    destination: "AMS",
    durationSeconds: 65 * 60,
    originCoord: CURRENT_ORIGIN_COORD,
    destinationCoord: [4.76, 52.31] as const,
  },
];

export default function FlightScreen() {
  const [flightState, setFlightState] = useState<
    "select" | "checkin" | "in_flight" | "completed" | "cancelled"
  >("select");
  const [selectedFlight, setSelectedFlight] = useState(FLIGHTS[0]);
  const [zoom, setZoom] = useState(8);
  const [cameraMode, setCameraMode] = useState<"follow" | "fit">("follow");
  const [fitToBoundsSignal, setFitToBoundsSignal] = useState(0);
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
    <div className="relative min-h-screen text-[var(--foreground)]">
      {flightState === "in_flight" ||
      flightState === "completed" ||
      flightState === "cancelled" ? (
        <>
          <div className="absolute inset-0">
            <FlightMap
              progress={progress}
              zoom={zoom}
              fitToBoundsSignal={fitToBoundsSignal}
              cameraMode={cameraMode}
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
              <p className="text-xs uppercase tracking-[0.4em] text-slate-200">
                Focus Flight
              </p>
              <div className="mt-1 flex items-baseline gap-3">
                <h1 className="text-2xl font-semibold tracking-[0.18em] text-slate-100">
                  {selectedFlight.origin} -&gt; {selectedFlight.destination}
                </h1>
              </div>
            </div>
            <div className="flex flex-1 items-center justify-end gap-6">
              <div className="text-right">
                <p className="text-xs uppercase tracking-[0.4em] text-slate-200">
                  Remaining
                </p>
                <p className="mt-1 font-mono text-2xl tracking-[0.2em] text-slate-100">
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
              <button
                className="rounded-full border border-white/20 px-4 py-2 text-[10px] uppercase tracking-[0.35em] text-slate-200 transition hover:border-white/40 hover:text-white"
                type="button"
                onClick={() => {
                  if (cameraMode === "fit") {
                    setCameraMode("follow");
                    return;
                  }
                  setCameraMode("fit");
                  setFitToBoundsSignal((value) => value + 1);
                }}
              >
                {cameraMode === "fit" ? "Follow Plane" : "Fit Route"}
              </button>
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
        <div className="relative min-h-screen">
          <div className="ife-shell w-full rounded-[32px] px-8 py-10">
            {flightState === "select" && (
              <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(138,185,255,0.12),_transparent_55%),_linear-gradient(180deg,_rgba(5,7,13,0.85),_rgba(5,7,13,0.6))] p-8">
                <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#8ab9ff]/10 blur-3xl" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="relative z-10 flex flex-col gap-8">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.5em] text-slate-300">
                      Departures Hall
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <h1 className="text-3xl font-semibold tracking-[0.24em] text-slate-100">
                        Ticketing Counter
                      </h1>
                      <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.4em] text-[#8ab9ff]">
                        Now Serving
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-slate-300">
                      Current location: {CURRENT_ORIGIN} • {CURRENT_ORIGIN_CITY}
                    </p>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-[1.05fr_1.95fr]">
                    <div className="relative rounded-3xl border border-white/10 bg-black/30 p-6">
                      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.4em] text-slate-400">
                        <span>Counter</span>
                        <span>Agent 07</span>
                      </div>
                      <div className="mt-5 flex items-baseline gap-3">
                        <span className="text-5xl font-semibold tracking-[0.2em] text-[#8ab9ff]">
                          07
                        </span>
                        <span className="text-xs uppercase tracking-[0.4em] text-slate-300">
                          Open
                        </span>
                      </div>
                      <div className="mt-6 grid grid-cols-2 gap-4 text-[11px] uppercase tracking-[0.3em] text-slate-400">
                        <div>
                          <p className="text-slate-500">Queue</p>
                          <p className="mt-2 text-lg font-semibold text-slate-100">
                            03
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-slate-500">Wait</p>
                          <p className="mt-2 text-lg font-semibold text-slate-100">
                            02 min
                          </p>
                        </div>
                      </div>
                      <div className="mt-6 rounded-2xl border border-dashed border-white/15 px-4 py-3">
                        <p className="text-[10px] uppercase tracking-[0.4em] text-slate-400">
                          Notice
                        </p>
                        <p className="mt-2 text-xs text-slate-300">
                          Tickets are issued by destination. Select a route to
                          begin boarding.
                        </p>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-black/25">
                      <div className="grid grid-cols-[1.1fr_1.1fr_1fr_0.9fr_0.6fr] gap-3 border-b border-white/10 px-5 py-3 text-[10px] uppercase tracking-[0.4em] text-slate-400">
                        <span>Flight</span>
                        <span>Destination</span>
                        <span>Duration</span>
                        <span>Status</span>
                        <span className="text-right">Select</span>
                      </div>
                      <ScrollArea className="h-[420px]">
                        <div className="divide-y divide-white/10">
                          {FLIGHTS.map((flight) => (
                            <button
                              key={flight.code}
                              className="group grid w-full grid-cols-[1.1fr_1.1fr_1fr_0.9fr_0.6fr] items-center gap-3 px-5 py-4 text-left transition hover:bg-white/5"
                              type="button"
                              onClick={() => handleSelect(flight)}
                            >
                              <div>
                                <p className="text-[10px] uppercase tracking-[0.4em] text-slate-500">
                                  Code
                                </p>
                                <p className="mt-1 font-mono text-sm uppercase tracking-[0.35em] text-slate-100">
                                  {flight.code}
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] uppercase tracking-[0.4em] text-slate-500">
                                  Route
                                </p>
                                <p className="mt-1 text-lg font-semibold tracking-[0.2em] text-slate-100">
                                  {flight.origin} → {flight.destination}
                                </p>
                                <p className="mt-1 text-[10px] uppercase tracking-[0.4em] text-slate-400">
                                  From {CURRENT_ORIGIN_CITY}
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] uppercase tracking-[0.4em] text-slate-500">
                                  Session
                                </p>
                                <p className="mt-1 text-base font-semibold text-[#8ab9ff]">
                                  {formatTime(flight.durationSeconds)}
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] uppercase tracking-[0.4em] text-slate-500">
                                  Status
                                </p>
                                <p className="mt-1 text-xs uppercase tracking-[0.4em] text-slate-300">
                                  Boarding
                                </p>
                              </div>
                              <div className="text-right">
                                <span className="inline-flex items-center text-[10px] uppercase tracking-[0.4em] text-[#8ab9ff] transition group-hover:translate-x-1">
                                  Issue
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </ScrollArea>
                      <div className="flex items-center justify-between border-t border-white/10 px-5 py-3 text-[10px] uppercase tracking-[0.4em] text-slate-400">
                        <span>Total {FLIGHTS.length} routes</span>
                        <span>Scroll for more</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {flightState === "checkin" && (
              <div className="flex flex-col items-center gap-8">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-300">
                    Check-in
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-[0.2em] text-slate-100">
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
