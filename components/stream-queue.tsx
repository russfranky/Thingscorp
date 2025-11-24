import { useEffect, useState } from 'react';
import type { StreamQueue } from '@/lib/hubzz-api';
import { getStreamQueue } from '@/lib/hubzz-api';

interface Props {
  eventId: string;
  useMock?: boolean;
}

export function StreamQueueEmbed({ eventId, useMock }: Props) {
  const [queue, setQueue] = useState<StreamQueue | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getStreamQueue(eventId, { useMock })
      .then(setQueue)
      .catch((err) => setError(err.message));
  }, [eventId, useMock]);

  if (error) {
    return <div className="placeholder-box">Stream queue unavailable: {error}</div>;
  }

  if (!queue || queue.streams.length === 0) {
    return <div className="placeholder-box">No active streams. Falling back to spatial audio.</div>;
  }

  const active = queue.streams[queue.activeStreamIndex];
  if (!active) {
    return <div className="placeholder-box">No active stream found. Check stream priorities.</div>;
  }

  return (
    <div className="placeholder-box">
      <h3>Active Stream ({active.platform})</h3>
      <p>Channel: {active.channelId}</p>
      <p>Embed URL: {active.embedUrl}</p>
      <p>Priority: {active.priority}</p>
    </div>
  );
}
