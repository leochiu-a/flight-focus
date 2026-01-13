"use client";

import maplibregl, { type GeoJSONSource } from "maplibre-gl";
import { useEffect, useMemo, useRef } from "react";
import {
  buildBezierRoute,
  buildRouteMetrics,
  interpolateRoute,
  splitRouteAt,
  type Coordinate,
} from "../lib/flight";

type FlightMapProps = {
  progress: number;
  zoom: number;
};

const mapStyle = "https://demotiles.maplibre.org/style.json";

const planeSvg = `
<svg viewBox="0 0 48 48" aria-hidden="true">
  <path d="M24 4l4 12 14 6-14 6-4 12-4-12-14-6 14-6 4-12z" />
</svg>
`;

const buildLineString = (coords: Coordinate[]) => ({
  type: "Feature" as const,
  geometry: {
    type: "LineString" as const,
    coordinates: coords.length > 1 ? coords : [coords[0], coords[0]],
  },
  properties: {},
});

export default function FlightMap({ progress, zoom }: FlightMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const loadedRef = useRef(false);
  const planeMarkerRef = useRef<maplibregl.Marker | null>(null);
  const completeSourceRef = useRef<GeoJSONSource | null>(null);
  const remainingSourceRef = useRef<GeoJSONSource | null>(null);

  const routeData = useMemo(() => {
    const origin: Coordinate = [121.233, 25.08];
    const destination: Coordinate = [139.78, 35.55];
    const path = buildBezierRoute(origin, destination, 180);
    const metrics = buildRouteMetrics(path);
    return { origin, destination, path, metrics };
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: mapStyle,
      center: routeData.origin,
      zoom,
      pitch: 48,
      bearing: 20,
      interactive: false,
      attributionControl: false,
    });

    mapRef.current = map;

    map.on("load", () => {
      const baseLayers = map.getStyle().layers ?? [];
      baseLayers.forEach((layer) => {
        if (
          layer.type === "symbol" ||
          layer.type === "line" ||
          layer.type === "fill-extrusion" ||
          layer.type === "circle"
        ) {
          map.setLayoutProperty(layer.id, "visibility", "none");
        }
      });

      map.addSource("route-complete", {
        type: "geojson",
        data: buildLineString([routeData.origin, routeData.origin]),
      });
      map.addSource("route-remaining", {
        type: "geojson",
        data: buildLineString(routeData.path),
      });

      map.addLayer({
        id: "route-remaining-line",
        type: "line",
        source: "route-remaining",
        paint: {
          "line-color": "#32496f",
          "line-width": 2,
          "line-opacity": 0.5,
        },
      });
      map.addLayer({
        id: "route-complete-line",
        type: "line",
        source: "route-complete",
        paint: {
          "line-color": "#8ab9ff",
          "line-width": 3,
          "line-opacity": 0.95,
        },
      });

      completeSourceRef.current = map.getSource(
        "route-complete"
      ) as GeoJSONSource;
      remainingSourceRef.current = map.getSource(
        "route-remaining"
      ) as GeoJSONSource;

      const planeEl = document.createElement("div");
      planeEl.className = "plane-marker";
      planeEl.innerHTML = planeSvg;

      planeMarkerRef.current = new maplibregl.Marker({
        element: planeEl,
        rotationAlignment: "map",
      })
        .setLngLat(routeData.origin)
        .addTo(map);

      const originEl = document.createElement("div");
      originEl.className = "airport-marker";
      originEl.textContent = "TPE";

      new maplibregl.Marker({ element: originEl })
        .setLngLat(routeData.origin)
        .addTo(map);

      const destEl = document.createElement("div");
      destEl.className = "airport-marker";
      destEl.textContent = "HND";

      new maplibregl.Marker({ element: destEl })
        .setLngLat(routeData.destination)
        .addTo(map);

      loadedRef.current = true;
    });

    return () => map.remove();
  }, [routeData]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loadedRef.current) return;

    const { position, heading, segmentIndex } = interpolateRoute(
      routeData.path,
      routeData.metrics.distances,
      progress
    );
    const { completed, remaining } = splitRouteAt(
      routeData.path,
      segmentIndex,
      position
    );

    completeSourceRef.current?.setData(buildLineString(completed));
    remainingSourceRef.current?.setData(buildLineString(remaining));
    planeMarkerRef.current?.setLngLat(position).setRotation(heading);

    map.easeTo({
      center: position,
      bearing: heading,
      zoom,
      duration: 900,
      easing: (t) => t,
    });
  }, [progress, routeData, zoom]);

  return (
    <div className="map-shell h-full w-full min-h-[60vh]">
      <div ref={containerRef} className="map-container" />
      <div className="map-overlay" />
    </div>
  );
}
