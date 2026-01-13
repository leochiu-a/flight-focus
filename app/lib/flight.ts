export type Coordinate = [number, number];

const toRadians = (deg: number) => (deg * Math.PI) / 180;
const toDegrees = (rad: number) => (rad * 180) / Math.PI;

export const buildBezierRoute = (
  origin: Coordinate,
  destination: Coordinate,
  steps = 160
) => {
  const [lon1, lat1] = origin;
  const [lon2, lat2] = destination;
  const midLon = (lon1 + lon2) / 2;
  const midLat = (lat1 + lat2) / 2;
  const arcOffset = Math.max(Math.abs(lon2 - lon1), Math.abs(lat2 - lat1)) * 0.18;
  const control: Coordinate = [midLon, midLat + arcOffset];
  const points: Coordinate[] = [];

  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const oneMinus = 1 - t;
    const lon =
      oneMinus * oneMinus * lon1 + 2 * oneMinus * t * control[0] + t * t * lon2;
    const lat =
      oneMinus * oneMinus * lat1 + 2 * oneMinus * t * control[1] + t * t * lat2;
    points.push([lon, lat]);
  }

  return points;
};

export const haversineDistance = (a: Coordinate, b: Coordinate) => {
  const earthRadius = 6371;
  const dLat = toRadians(b[1] - a[1]);
  const dLon = toRadians(b[0] - a[0]);
  const lat1 = toRadians(a[1]);
  const lat2 = toRadians(b[1]);

  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return 2 * earthRadius * Math.asin(Math.sqrt(h));
};

export const buildRouteMetrics = (coords: Coordinate[]) => {
  const distances: number[] = [0];
  for (let i = 1; i < coords.length; i += 1) {
    distances.push(distances[i - 1] + haversineDistance(coords[i - 1], coords[i]));
  }
  return { distances, total: distances[distances.length - 1] };
};

export const bearingBetween = (a: Coordinate, b: Coordinate) => {
  const lat1 = toRadians(a[1]);
  const lat2 = toRadians(b[1]);
  const dLon = toRadians(b[0] - a[0]);

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

  const angle = Math.atan2(y, x);
  return (toDegrees(angle) + 360) % 360;
};

export const interpolateRoute = (
  coords: Coordinate[],
  distances: number[],
  progress: number
) => {
  const clamped = Math.min(Math.max(progress, 0), 1);
  const total = distances[distances.length - 1];
  const target = total * clamped;

  let index = distances.findIndex((value) => value >= target);
  if (index === -1) {
    index = distances.length - 1;
  }
  if (index === 0) {
    const heading = bearingBetween(coords[0], coords[1] ?? coords[0]);
    return { position: coords[0], heading, segmentIndex: 0 };
  }

  const prevDistance = distances[index - 1];
  const segmentDistance = distances[index] - prevDistance || 1;
  const segmentProgress = (target - prevDistance) / segmentDistance;
  const start = coords[index - 1];
  const end = coords[index];
  const lon = start[0] + (end[0] - start[0]) * segmentProgress;
  const lat = start[1] + (end[1] - start[1]) * segmentProgress;
  const heading = bearingBetween(start, end);

  return { position: [lon, lat] as Coordinate, heading, segmentIndex: index - 1 };
};

export const splitRouteAt = (
  coords: Coordinate[],
  segmentIndex: number,
  position: Coordinate
) => {
  const completed = coords.slice(0, segmentIndex + 1);
  completed.push(position);

  const remaining = [position, ...coords.slice(segmentIndex + 1)];

  return { completed, remaining };
};
