"use client";

import { useEffect, useMemo, useState } from "react";
import BoardingPass from "./BoardingPass";
import FlightMap from "./FlightMap";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFlightTimer } from "../hooks/useFlightTimer";
import { formatTime } from "../lib/time";
import { haversineDistance } from "../lib/flight";
import { estimateFlightMinutes, mapToFocusMinutes } from "../lib/flightPlanning";
import citiesData from "../data/cities.json";

type City = {
  id: string;
  name: string;
  iata: string;
  lat: number;
  lon: number;
  tz: string;
  regionId: string;
};

type Flight = {
  code: string;
  origin: string;
  destination: string;
  originCoord: readonly [number, number];
  destinationCoord: readonly [number, number];
  distanceKm: number;
  durationSeconds: number;
  regionId: string;
};

const CITIES = citiesData as City[];
const ORIGIN_CITY_ID = "tpe";
const originCity = CITIES.find((city) => city.id === ORIGIN_CITY_ID) ?? CITIES[0];

const toCoord = (city: City) => [city.lon, city.lat] as const;

const REGIONS = [
  { id: "asia", name: "Asia" },
  { id: "europe", name: "Europe" },
  { id: "oceania", name: "Oceania" },
  { id: "americas", name: "Americas" },
  { id: "africa", name: "Africa" },
] as const;

const DEFAULT_REGION_ID = REGIONS[0]?.id ?? "asia";

const ALL_FLIGHTS: Flight[] = CITIES.filter((city) => city.id !== originCity.id)
  .map((destination) => {
    const originCoord = toCoord(originCity);
    const destinationCoord = toCoord(destination);
    const distanceKm = Math.round(
      haversineDistance(originCoord, destinationCoord)
    );
    const flightMinutes = estimateFlightMinutes(distanceKm);

    return {
      code: `${originCity.iata}${destination.iata}`,
      origin: originCity.iata,
      destination: destination.iata,
      originCoord,
      destinationCoord,
      distanceKm,
      durationSeconds: mapToFocusMinutes(flightMinutes) * 60,
      regionId: destination.regionId,
    };
  })
  .sort((a, b) => a.distanceKm - b.distanceKm);

const DEFAULT_REGION_FLIGHTS = ALL_FLIGHTS.filter(
  (flight) => flight.regionId === DEFAULT_REGION_ID
);

const buildRegionFocusRange = (flights: Flight[]) => {
  if (!flights.length) {
    return null;
  }

  const minutes = flights.map((flight) => Math.round(flight.durationSeconds / 60));
  return { min: Math.min(...minutes), max: Math.max(...minutes) };
};

export default function FlightScreen() {
  const [flightState, setFlightState] = useState<
    "select" | "checkin" | "in_flight" | "completed" | "cancelled"
  >("select");
  const [selectedRegion, setSelectedRegion] = useState(DEFAULT_REGION_ID);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(
    DEFAULT_REGION_FLIGHTS[0] ?? ALL_FLIGHTS[0] ?? null
  );
  const [zoom, setZoom] = useState(8);
  const [cameraMode, setCameraMode] = useState<"follow" | "fit">("follow");
  const [fitToBoundsSignal, setFitToBoundsSignal] = useState(0);
  const passengerName = "Focus Pilot";
  const flights = useMemo(
    () =>
      ALL_FLIGHTS.filter((flight) => flight.regionId === selectedRegion).slice(
        0,
        12
      ),
    [selectedRegion]
  );
  const regionRanges = useMemo(() => {
    const ranges = new Map<string, ReturnType<typeof buildRegionFocusRange>>();
    for (const region of REGIONS) {
      const regionFlights = ALL_FLIGHTS.filter(
        (flight) => flight.regionId === region.id
      );
      ranges.set(region.id, buildRegionFocusRange(regionFlights));
    }
    return ranges;
  }, []);
  const { progress, remainingSeconds, isComplete, reset } = useFlightTimer(
    selectedFlight?.durationSeconds ?? 0,
    flightState === "in_flight" && Boolean(selectedFlight)
  );

  useEffect(() => {
    if (isComplete && flightState === "in_flight") {
      setFlightState("completed");
    }
  }, [isComplete, flightState]);

  useEffect(() => {
    if (!flights.length) {
      setSelectedFlight(null);
      return;
    }

    if (!selectedFlight) {
      setSelectedFlight(flights[0]);
      return;
    }

    const hasFlight = flights.some((flight) => flight.code === selectedFlight.code);
    if (!hasFlight) {
      setSelectedFlight(flights[0]);
      setFlightState("select");
    }
  }, [flights, selectedFlight]);

  useEffect(() => {
    if (!selectedFlight && flightState !== "select") {
      setFlightState("select");
    }
  }, [selectedFlight, flightState]);

  const handleStart = () => {
    reset();
    setFlightState("in_flight");
  };

  const handleCancel = () => {
    setFlightState("cancelled");
  };

  const handleSelect = (flight: Flight) => {
    setSelectedFlight(flight);
    setFlightState("checkin");
  };

  const handleReset = () => {
    setFlightState("select");
  };

  const etaLabel = useMemo(() => {
    if (!selectedFlight) return formatTime(0);
    if (flightState === "in_flight") return formatTime(remainingSeconds);
    return formatTime(selectedFlight.durationSeconds);
  }, [flightState, remainingSeconds, selectedFlight]);

  const remainingDistanceKm = useMemo(() => {
    if (!selectedFlight) return 0;
    if (flightState !== "in_flight") return selectedFlight.distanceKm;
    return Math.max(Math.round(selectedFlight.distanceKm * (1 - progress)), 0);
  }, [flightState, progress, selectedFlight]);

  return (
    <div className="relative min-h-screen text-[var(--foreground)]">
      {flightState === "in_flight" ||
      flightState === "completed" ||
      flightState === "cancelled" ? (
        selectedFlight ? (
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
                <div className="text-right">
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-200">
                    Distance Left
                  </p>
                  <p className="mt-1 font-mono text-2xl tracking-[0.2em] text-slate-100">
                    {remainingDistanceKm} km
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
          <div className="ife-shell w-full rounded-[32px] px-8 py-10">
            <p className="text-sm text-slate-300">
              No flight selected. Choose a region to view available routes.
            </p>
          </div>
        )
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
                      Current location: {originCity.iata} • {originCity.name}
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
                      <div className="border-b border-white/10 px-5 py-4">
                        <p className="text-[10px] uppercase tracking-[0.4em] text-slate-400">
                          Destination Region
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {REGIONS.map((region) => {
                            const range = regionRanges.get(region.id);
                            const rangeLabel = range
                              ? `${range.min}-${range.max} min`
                              : "No routes";
                            return (
                              <button
                                key={region.id}
                                className={`rounded-full border px-4 py-2 text-[10px] uppercase tracking-[0.35em] transition ${
                                  selectedRegion === region.id
                                    ? "border-[#8ab9ff] bg-[#8ab9ff] text-[#05070d]"
                                    : "border-white/15 text-slate-300 hover:border-white/40 hover:text-white"
                                }`}
                                type="button"
                                onClick={() => setSelectedRegion(region.id)}
                              >
                                {region.name} · {rangeLabel}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <div className="grid grid-cols-[1.1fr_1.1fr_0.8fr_0.8fr_0.9fr_0.6fr] gap-3 border-b border-white/10 px-5 py-3 text-[10px] uppercase tracking-[0.4em] text-slate-400">
                        <span>Flight</span>
                        <span>Destination</span>
                        <span>Duration</span>
                        <span>Distance</span>
                        <span>Status</span>
                        <span className="text-right">Select</span>
                      </div>
                      {flights.length === 0 ? (
                        <div className="px-5 py-8 text-sm text-slate-300">
                          No routes available for this region yet.
                        </div>
                      ) : (
                        <ScrollArea className="h-[420px]">
                          <div className="divide-y divide-white/10">
                            {flights.map((flight) => (
                              <button
                                key={flight.code}
                                className="group grid w-full grid-cols-[1.1fr_1.1fr_0.8fr_0.8fr_0.9fr_0.6fr] items-center gap-3 px-5 py-4 text-left transition hover:bg-white/5"
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
                                    From {originCity.name}
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
                                    Distance
                                  </p>
                                  <p className="mt-1 text-base font-semibold text-slate-100">
                                    {flight.distanceKm} km
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
                      )}
                      <div className="flex items-center justify-between border-t border-white/10 px-5 py-3 text-[10px] uppercase tracking-[0.4em] text-slate-400">
                        <span>Total {flights.length} routes</span>
                        <span>Scroll for more</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {flightState === "checkin" && selectedFlight && (
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
