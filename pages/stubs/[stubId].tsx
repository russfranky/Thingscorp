import Head from 'next/head';
import Link from 'next/link';
import { HubzzStub, getStub } from '@/lib/hubzz-api';
import { defaultUseMock } from '@/lib/mock-config';

interface StubPageProps {
  stub: HubzzStub;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function formatTimeRange(start: Date, end: Date) {
  const timeFormatter = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
  return `${timeFormatter.format(start)} - ${timeFormatter.format(end)}`;
}

function durationLabel(minutes?: number) {
  if (!minutes) return null;
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins ? `${hours}h ${mins}m` : `${hours}h`;
}

export default function StubDetailPage({ stub }: StubPageProps) {
  const start = new Date(stub.startTime);
  const end = new Date(stub.endTime);

  return (
    <>
      <Head>
        <title>{stub.eventName} | Stub</title>
      </Head>
      <main className="stub-page">
        <header className="stub-header">
          <div>
            <p className="stub-label">Past event stub</p>
            <h1>{stub.eventName}</h1>
          </div>
          <div className="stub-meta">
            <span>Ticket {stub.ticketNumber}</span>
            <span>Stub code {stub.stubCode}</span>
          </div>
        </header>

        <section className="stub-hero placeholder-box">
          {stub.venueImageUrl ? (
            <img src={stub.venueImageUrl} alt="Venue replay preview" className="stub-hero-image" />
          ) : null}
          <div className="stub-hero-body">
            <div className="stub-hero-meta">
              <p className="stub-venue">{stub.venueName}</p>
              <p className="stub-time">
                {formatDate(start)} · {formatTimeRange(start, end)}
              </p>
            </div>
            <p className="stub-description">{stub.description}</p>
            <div className="stub-hero-actions">
              {stub.replayUrl ? (
                <a className="stub-button" href={stub.replayUrl} target="_blank" rel="noreferrer">
                  Replay event
                </a>
              ) : (
                <button className="stub-button" disabled>
                  Replay unavailable
                </button>
              )}
            </div>
          </div>
        </section>

        <div className="stub-grid">
          <section className="stub-card placeholder-box">
            <div className="stub-card-header">
              <h2>Hosted by</h2>
              <span>{stub.hostName}</span>
            </div>
            <div className="stub-hosts">
              {stub.hostedBy.map((host) => (
                <div key={host.id} className="stub-avatar">
                  <div className="stub-avatar-circle" aria-hidden />
                  <div>
                    <p className="stub-avatar-name">{host.name}</p>
                    {host.role ? <p className="stub-avatar-role">{host.role}</p> : null}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="stub-card placeholder-box">
            <div className="stub-card-header">
              <h2>Guest list</h2>
              <span>{stub.guestCount.toLocaleString()} people</span>
            </div>
            <ol className="stub-guest-list">
              {stub.guests.map((guest) => (
                <li key={guest.id} className="stub-guest-row">
                  <div className="stub-guest-rank">{guest.attendeeNumber ?? '–'}</div>
                  <div className="stub-guest-meta">
                    <div className="stub-avatar-circle" aria-hidden />
                    <div>
                      <p className="stub-avatar-name">{guest.name}</p>
                      {guest.durationMinutes ? (
                        <p className="stub-avatar-role">{durationLabel(guest.durationMinutes)} present</p>
                      ) : null}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <footer className="stub-footer">
          <Link href="/tickets" className="stub-link">
            ← Back to tickets
          </Link>
        </footer>
      </main>
    </>
  );
}

export async function getServerSideProps({ params }: { params?: { stubId?: string } }) {
  const stubId = params?.stubId;
  if (!stubId || typeof stubId !== 'string') {
    return { notFound: true };
  }

  const useMock = defaultUseMock();

  try {
    const stub = await getStub(stubId, { useMock });
    return { props: { stub } };
  } catch (error) {
    return { notFound: true };
  }
}
