import { useEffect, useMemo, useState } from 'react';
import type { HubzzTicket } from '../lib/hubzz-api';

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function calculateCountdown(target: Date) {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
  };
}

interface TicketCardProps {
  ticket: HubzzTicket;
  onOpenLink?: (url: string) => void;
  stubHref?: string;
}

export function TicketCard({ ticket, onOpenLink, stubHref }: TicketCardProps) {
  const start = useMemo(() => new Date(ticket.startTime), [ticket.startTime]);
  const end = useMemo(() => new Date(ticket.endTime), [ticket.endTime]);
  const joinOpensAt = useMemo(
    () => new Date(ticket.canJoinAt ?? ticket.startTime),
    [ticket.canJoinAt, ticket.startTime]
  );

  const [countdown, setCountdown] = useState(() => calculateCountdown(joinOpensAt));

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(calculateCountdown(joinOpensAt));
    }, 1000);
    return () => clearInterval(interval);
  }, [joinOpensAt]);

  const now = Date.now();
  const isLive = now >= start.getTime() && now < end.getTime();
  const isPast = now >= end.getTime();
  const joinOpen = now >= joinOpensAt.getTime();
  const isStub = ticket.status === 'stub' || Boolean(ticket.stubId);

  let ctaLabel = 'Join event';
  if (isPast && isStub) {
    ctaLabel = 'View stub';
  } else if (!joinOpen && !isLive) {
    ctaLabel = 'Opens soon';
  } else if (isLive) {
    ctaLabel = ticket.isCurrent ? 'Leave' : 'Join event';
  }

  const handleClick = () => {
    if (isStub && stubHref) {
      if (onOpenLink) return onOpenLink(stubHref);
      window.location.href = stubHref;
      return;
    }

    if (!ticket.deepLink) return;
    if (!joinOpen && !isLive) return;
    if (onOpenLink) {
      onOpenLink(ticket.deepLink);
    } else {
      window.open(ticket.deepLink, '_blank');
    }
  };

  const isDisabled = isStub ? false : !joinOpen && !isLive;

  return (
    <article className="ticket-card placeholder-box" aria-label={`Ticket for ${ticket.eventName}`}>
      <div className="ticket-meta">
        <div>
          <p className="ticket-date">{formatDate(start)}</p>
          <p className="ticket-time">{formatTime(start)}</p>
        </div>
        <div className="ticket-number">#{ticket.ticketNumber}</div>
      </div>

      <div className="ticket-body">
        <div>
          <p className="ticket-host">Hosted by {ticket.hostName}</p>
          <h3 className="ticket-title">{ticket.eventName}</h3>
          <p className="ticket-location">{ticket.venueName}</p>
        </div>
        <div className="ticket-countdown" aria-label="Join countdown">
          {isPast ? (
            <span>{isStub ? 'Stub issued' : 'Event ended'}</span>
          ) : (
            <>
              <span>{countdown.days}d</span>
              <span>{countdown.hours}h</span>
              <span>{countdown.minutes}m</span>
            </>
          )}
        </div>
      </div>

      <div className="ticket-actions">
        <button className="ticket-cta" onClick={handleClick} disabled={isDisabled}>
          {ctaLabel}
        </button>
      </div>
    </article>
  );
}
