"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { formatTime } from "../lib/time";

type BoardingPassProps = {
  origin: string;
  destination: string;
  durationSeconds: number;
  passengerName: string;
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

const BARCODE_LENGTH = 40;

const hashSeed = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return hash >>> 0;
};

const createBarcodeRows = (seedValue: string) => {
  let state = hashSeed(seedValue);
  const next = () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };

  return Array.from({ length: BARCODE_LENGTH }, (_, i) => ({
    key: `barcode-${i}`,
    width: next() > 0.5 ? "2px" : "1px",
    opacity: next() > 0.2 ? 1 : 0.3,
  }));
};

export default function BoardingPass({
  origin,
  destination,
  durationSeconds,
  passengerName,
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
  const passengerShort = passengerName.split(" ")[0] || passengerName;

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

  const barcodeRows = useMemo(
    () => createBarcodeRows(`${origin}-${destination}`),
    [origin, destination]
  );

  return (
    <div className="relative flex flex-col items-stretch select-none md:flex-row">
      <div
        style={mainTicketMask}
        className={`ticket-main relative flex h-[320px] w-full flex-col overflow-hidden rounded-l-3xl border border-r-0 border-white/10 bg-slate-900/80 shadow-[0_24px_80px_rgba(5,10,25,0.55)] backdrop-blur transition-transform duration-500 md:w-[600px] ${
          isTorn ? "-translate-x-[10px]" : ""
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/10 bg-gradient-to-r from-slate-900/80 via-slate-900/60 to-slate-900/80 px-8 text-white">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/10">
              <span className="text-lg">✈</span>
            </div>
            <span className="text-lg font-semibold tracking-[0.4em] text-slate-100">
              FLIGHT FOCUS
            </span>
          </div>
          <div className="text-[11px] uppercase tracking-[0.5em] text-slate-300">
            Boarding Pass
          </div>
        </div>

        <div className="flex flex-grow flex-col justify-between p-8 text-slate-100">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-4xl font-semibold tracking-[0.2em]">
                {origin}
              </span>
              <span className="text-[10px] uppercase tracking-[0.5em] text-slate-400">
                {fromCity}
              </span>
            </div>

            <div className="relative flex flex-grow flex-col items-center px-4">
              <div className="absolute top-1/2 h-px w-full -translate-y-1/2 bg-white/15" />
              <div className="relative z-10 bg-slate-900/80 px-3 text-[#8ab9ff]">
                ✈
              </div>
            </div>

            <div className="flex flex-col text-right">
              <span className="text-4xl font-semibold tracking-[0.2em]">
                {destination}
              </span>
              <span className="text-[10px] uppercase tracking-[0.5em] text-slate-400">
                {toCity}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 border-t border-white/10 pt-6">
            <div className="flex flex-col">
              <span className="mb-1 text-[10px] uppercase tracking-[0.4em] text-slate-400">
                Passenger
              </span>
              <span className="truncate text-sm font-semibold text-slate-100">
                {passengerName}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="mb-1 text-[10px] uppercase tracking-[0.4em] text-slate-400">
                Flight No.
              </span>
              <span className="text-sm font-semibold text-slate-100">
                FF019
              </span>
            </div>
            <div className="flex flex-col">
              <span className="mb-1 text-[10px] uppercase tracking-[0.4em] text-slate-400">
                Gate
              </span>
              <span className="text-sm font-semibold text-slate-100">12</span>
            </div>
            <div className="flex flex-col">
              <span className="mb-1 text-[10px] uppercase tracking-[0.4em] text-slate-400">
                Seat
              </span>
              <span className="text-sm font-semibold text-slate-100">7A</span>
            </div>
          </div>

          <div className="mt-4 flex items-end justify-between">
            <div className="flex flex-col">
              <span className="mb-1 text-[10px] uppercase tracking-[0.4em] text-slate-400">
                Class
              </span>
              <span className="rounded border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-[0.4em] text-[#8ab9ff]">
                Focus
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-[10px] uppercase tracking-[0.4em] text-slate-400">
                  Departure
                </span>
                <span className="text-lg font-semibold text-[#8ab9ff]">
                  Now
                </span>
              </div>
              <div className="flex flex-col items-end border-l border-white/10 pl-4">
                <span className="text-[10px] uppercase tracking-[0.4em] text-slate-400">
                  Duration
                </span>
                <span className="text-lg font-semibold uppercase text-slate-100">
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
        className={`ticket-stub group relative flex h-[320px] w-full cursor-pointer flex-col overflow-hidden rounded-r-3xl border border-l-0 border-white/10 bg-slate-900/80 shadow-[0_24px_80px_rgba(5,10,25,0.55)] backdrop-blur transition-all duration-700 ease-in-out md:w-[240px] ${
          isTorn
            ? "tearing-animation pointer-events-none"
            : "hover:bg-slate-900/60"
        }`}
      >
        <div className="flex h-16 items-center whitespace-nowrap border-b border-white/10 bg-gradient-to-r from-slate-900/80 via-slate-900/60 to-slate-900/80 px-6 text-white">
          <span className="text-[11px] uppercase tracking-[0.5em] text-slate-300">
            STUB • FF019
          </span>
        </div>

        <div className="flex h-full flex-col p-6 text-slate-100">
          <div className="mb-4 flex justify-between">
            <div className="flex flex-col">
              <span className="text-2xl font-bold leading-none">{origin}</span>
              <span className="text-[10px] uppercase tracking-[0.4em] text-slate-400">
                {fromCity.split(" ")[0]}
              </span>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-2xl font-bold leading-none">
                {destination}
              </span>
              <span className="text-[10px] uppercase tracking-[0.4em] text-slate-400">
                {toCity.split(" ")[0]}
              </span>
            </div>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-y-4">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-[0.4em] text-slate-400">
                Passenger
              </span>
              <span className="truncate text-xs font-semibold text-slate-100">
                {passengerShort}
              </span>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-[10px] uppercase tracking-[0.4em] text-slate-400">
                Seat
              </span>
              <span className="text-xs font-semibold text-slate-100">7A</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-[0.4em] text-slate-400">
                Gate
              </span>
              <span className="text-xs font-semibold text-slate-100">12</span>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-[10px] uppercase tracking-[0.4em] text-slate-400">
                Class
              </span>
              <span className="text-[10px] uppercase tracking-[0.4em] text-[#8ab9ff]">
                Focus
              </span>
            </div>
          </div>

          <div className="mt-auto flex flex-col items-center">
            <div className="flex h-10 w-full justify-between gap-[1px]">
              {barcodeRows.map((bar) => (
                <div
                  key={bar.key}
                  className="flex-grow bg-slate-100/80"
                  style={{
                    width: bar.width,
                    opacity: bar.opacity,
                  }}
                />
              ))}
            </div>
            <span className="mono mt-2 text-[9px] uppercase tracking-[0.4em] text-slate-400">
              FF-FOCUS-2025
            </span>
          </div>
        </div>

        {!isTorn && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/0 transition-all duration-300 group-hover:bg-white/5">
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/80 px-3 py-1.5 text-[10px] uppercase tracking-[0.4em] text-slate-200 opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
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
