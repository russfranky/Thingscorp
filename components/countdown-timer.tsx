import { useEffect, useState } from 'react';

function calculateTimeLeft(target: Date) {
  const difference = target.getTime() - Date.now();
  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
}

export function CountdownTimer({ startTime }: { startTime: string }) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(new Date(startTime)));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft(new Date(startTime)));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  return (
    <div className="placeholder-box">
      <h3>Event starts in</h3>
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <span>{timeLeft.days}d</span>
        <span>{timeLeft.hours}h</span>
        <span>{timeLeft.minutes}m</span>
        <span>{timeLeft.seconds}s</span>
      </div>
    </div>
  );
}
