import { useEffect, useRef, useState } from "react";

export const useFlightTimer = (totalSeconds: number, isRunning: boolean) => {
  const startRef = useRef<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isRunning) {
      return;
    }
    let frame = 0;

    const tick = (now: number) => {
      if (startRef.current === null) {
        startRef.current = now;
      }

      const elapsed = Math.min((now - startRef.current) / 1000, totalSeconds);
      const nextProgress = Math.min(elapsed / totalSeconds, 1);
      const nextElapsedWhole = Math.floor(elapsed);

      setProgress(nextProgress);
      setElapsedSeconds((prev) =>
        prev === nextElapsedWhole ? prev : nextElapsedWhole
      );

      if (elapsed < totalSeconds) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [totalSeconds, isRunning]);

  const reset = () => {
    startRef.current = null;
    setElapsedSeconds(0);
    setProgress(0);
  };

  return {
    progress,
    elapsedSeconds,
    remainingSeconds: Math.max(totalSeconds - elapsedSeconds, 0),
    isComplete: progress >= 1,
    reset,
  };
};
