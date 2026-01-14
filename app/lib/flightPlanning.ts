type PomodoroBucket = {
  maxFlightHours: number;
  focusMinutes: number;
};

const DEFAULT_CRUISE_KMH = 900;
const DEFAULT_TAXI_MINUTES = 45;

const POMODORO_BUCKETS: PomodoroBucket[] = [
  { maxFlightHours: 1.5, focusMinutes: 25 },
  { maxFlightHours: 4, focusMinutes: 45 },
  { maxFlightHours: 8, focusMinutes: 60 },
  { maxFlightHours: 14, focusMinutes: 90 },
  { maxFlightHours: 24, focusMinutes: 120 },
];

export const estimateFlightMinutes = (
  distanceKm: number,
  cruiseKmh = DEFAULT_CRUISE_KMH,
  taxiMinutes = DEFAULT_TAXI_MINUTES
) => Math.round((distanceKm / cruiseKmh) * 60 + taxiMinutes);

export const mapToFocusMinutes = (flightMinutes: number) => {
  const flightHours = flightMinutes / 60;
  const bucket = POMODORO_BUCKETS.find(
    (entry) => flightHours <= entry.maxFlightHours
  );

  return bucket ? bucket.focusMinutes : POMODORO_BUCKETS.at(-1)!.focusMinutes;
};
