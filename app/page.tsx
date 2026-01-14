"use client";

import dynamic from "next/dynamic";

// Map rendering is client-only; avoid SSR hydration mismatch for this screen.
const FlightScreen = dynamic(() => import("./components/FlightScreen"), {
  ssr: false,
});

export default function Home() {
  return <FlightScreen />;
}
