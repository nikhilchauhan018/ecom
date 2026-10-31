import { useCallback, useEffect, useState } from 'react';

/**
 * Whole-second countdown that stays accurate after tab throttling (uses a deadline, not ticks).
 * @param {number} [initialSeconds]
 * @returns {{ secondsLeft: number, start: (seconds: number) => void }}
 */
export function useCountdown(initialSeconds = 0) {
  const [deadline, setDeadline] = useState(() => (initialSeconds > 0 ? Date.now() + initialSeconds * 1000 : 0));
  const [secondsLeft, setSecondsLeft] = useState(Math.max(0, initialSeconds));

  useEffect(() => {
    if (!deadline) return undefined;

    const tick = () => {
      const left = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setSecondsLeft(left);
      return left;
    };

    if (tick() === 0) return undefined;
    const id = setInterval(() => {
      if (tick() === 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [deadline]);

  const start = useCallback((seconds) => {
    setDeadline(seconds > 0 ? Date.now() + seconds * 1000 : 0);
    setSecondsLeft(Math.max(0, seconds));
  }, []);

  return { secondsLeft, start };
}

export default useCountdown;
