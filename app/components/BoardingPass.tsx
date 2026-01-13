"use client";

import { useState, type CSSProperties } from "react";
import { formatTime } from "../lib/time";

type BoardingPassProps = {
  origin: string;
  destination: string;
  durationSeconds: number;
  onTear: () => void;
  debug?: boolean;
};

const CITY_NAMES: Record<string, string> = {
  TPE: "Taipei",
  HND: "Tokyo",
  ICN: "Seoul",
  HKG: "Hong Kong",
  SFO: "San Francisco",
  LAX: "Los Angeles",
};

export default function BoardingPass({
  origin,
  destination,
  durationSeconds,
  onTear,
  debug = false,
}: BoardingPassProps) {
  const [isTorn, setIsTorn] = useState(false);

  const handleTear = () => {
    if (isTorn) return;
    setIsTorn(true);
    window.setTimeout(() => onTear(), 700);
  };

  const fromCity = CITY_NAMES[origin] ?? "Origin";
  const toCity = CITY_NAMES[destination] ?? "Destination";

  const mainTicketMask: CSSProperties = {
    maskImage:
      "radial-gradient(circle at 100% 0px, transparent 14px, black 15px), radial-gradient(circle at 100% 100%, transparent 14px, black 15px)",
    WebkitMaskImage:
      "radial-gradient(circle at 100% 0px, transparent 14px, black 15px), radial-gradient(circle at 100% 100%, transparent 14px, black 15px)",
    maskComposite: "intersect",
    WebkitMaskComposite: "source-in",
  };

  const stubMask: CSSProperties = {
    maskImage:
      "radial-gradient(circle at 0px 0px, transparent 14px, black 15px), radial-gradient(circle at 0px 100%, transparent 14px, black 15px)",
    WebkitMaskImage:
      "radial-gradient(circle at 0px 0px, transparent 14px, black 15px), radial-gradient(circle at 0px 100%, transparent 14px, black 15px)",
    maskComposite: "intersect",
    WebkitMaskComposite: "source-in",
  };

  return (
    <div className="relative flex flex-col items-stretch select-none md:flex-row">
      <div
        style={mainTicketMask}
        className={`ticket-main relative flex h-[320px] w-full flex-col overflow-hidden rounded-l-3xl bg-white shadow-xl transition-transform duration-500 md:w-[600px] ${
          isTorn ? "-translate-x-[10px]" : ""
        }`}
      >
        <div className="flex h-16 items-center justify-between bg-blue-600 px-8 text-white">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
              <span className="text-lg">✈</span>
            </div>
            <span className="text-lg font-bold tracking-widest italic">
              FLIGHT FOCUS
            </span>
          </div>
          <div className="text-sm font-bold uppercase tracking-widest opacity-80">
            Boarding Pass
          </div>
        </div>

        <div className="flex flex-grow flex-col justify-between p-8 text-slate-900">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-4xl font-extrabold tracking-tight">
                {origin}
              </span>
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                {fromCity}
              </span>
            </div>

            <div className="relative flex flex-grow flex-col items-center px-4">
              <div className="absolute top-1/2 h-px w-full -translate-y-1/2 bg-slate-200" />
              <div className="relative z-10 bg-white px-3 text-blue-600">
                ✈
              </div>
            </div>

            <div className="flex flex-col text-right">
              <span className="text-4xl font-extrabold tracking-tight">
                {destination}
              </span>
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                {toCity}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 border-t border-slate-100 pt-6">
            <div className="flex flex-col">
              <span className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Passenger
              </span>
              <span className="truncate text-sm font-bold text-slate-800">
                Focus Pilot
              </span>
            </div>
            <div className="flex flex-col">
              <span className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Flight No.
              </span>
              <span className="text-sm font-bold text-slate-800">FF019</span>
            </div>
            <div className="flex flex-col">
              <span className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Gate
              </span>
              <span className="text-sm font-bold text-slate-800">12</span>
            </div>
            <div className="flex flex-col">
              <span className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Seat
              </span>
              <span className="text-sm font-bold text-slate-800">7A</span>
            </div>
          </div>

          <div className="mt-4 flex items-end justify-between">
            <div className="flex flex-col">
              <span className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Class
              </span>
              <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase text-blue-700">
                Focus
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Departure
                </span>
                <span className="text-lg font-bold text-blue-600">Now</span>
              </div>
              <div className="flex flex-col items-end border-l border-slate-100 pl-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Duration
                </span>
                <span className="text-lg font-bold uppercase text-slate-800">
                  {formatTime(durationSeconds)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        onClick={handleTear}
        style={stubMask}
        className={`ticket-stub group relative flex h-[320px] w-full cursor-pointer flex-col overflow-hidden rounded-r-3xl bg-white shadow-xl transition-all duration-700 ease-in-out md:w-[240px] ${
          isTorn ? "tearing-animation pointer-events-none" : "hover:bg-slate-50"
        }`}
      >
        <div className="flex h-16 items-center whitespace-nowrap bg-blue-600 px-6 text-white">
          <span className="text-sm font-bold tracking-widest opacity-60">
            STUB • FF019
          </span>
        </div>

        <div className="flex h-full flex-col p-6 text-slate-900">
          <div className="mb-4 flex justify-between">
            <div className="flex flex-col">
              <span className="text-2xl font-bold leading-none">{origin}</span>
              <span className="text-[10px] font-bold uppercase text-slate-400">
                {fromCity.split(" ")[0]}
              </span>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-2xl font-bold leading-none">
                {destination}
              </span>
              <span className="text-[10px] font-bold uppercase text-slate-400">
                {toCity.split(" ")[0]}
              </span>
            </div>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-y-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Passenger
              </span>
              <span className="truncate text-xs font-bold text-slate-700">
                Focus
              </span>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Seat
              </span>
              <span className="text-xs font-bold text-slate-700">7A</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Gate
              </span>
              <span className="text-xs font-bold text-slate-700">12</span>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Class
              </span>
              <span className="text-[10px] font-bold uppercase text-blue-600">
                Focus
              </span>
            </div>
          </div>

          <div className="mt-auto flex flex-col items-center">
            <div className="flex h-10 w-full justify-between gap-[1px]">
              {Array.from({ length: 40 }).map((_, i) => (
                <div
                  key={`barcode-${i}`}
                  className="flex-grow bg-slate-800"
                  style={{
                    width: `${Math.random() > 0.5 ? "2px" : "1px"}`,
                    opacity: Math.random() > 0.2 ? 1 : 0.3,
                  }}
                />
              ))}
            </div>
            <span className="mono mt-2 text-[9px] uppercase tracking-[0.3em] text-slate-400">
              FF-FOCUS-2025
            </span>
          </div>
        </div>

        {!isTorn && (
          <div className="absolute inset-0 flex items-center justify-center bg-blue-500/0 transition-all duration-300 group-hover:bg-blue-500/5">
            <div className="flex items-center gap-2 rounded-full border border-slate-100 bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-600 opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
              Tear Here
            </div>
          </div>
        )}
      </div>

      {debug && (
        <div className="ticket-debug-panel">
          <span>torn {String(isTorn)}</span>
          <span>duration {formatTime(durationSeconds)}</span>
        </div>
      )}
    </div>
  );
}
