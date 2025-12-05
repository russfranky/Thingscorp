import Head from 'next/head';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { TicketCard } from '../components/ticket-card';
import { HubzzTicket, getUserTickets } from '../lib/hubzz-api';
import { defaultUseMock } from '../lib/mock-config';

interface TicketsPageProps {
  tickets: HubzzTicket[];
}

function sortTickets(tickets: HubzzTicket[]) {
  return [...tickets].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
}

export default function TicketsPage({ tickets }: TicketsPageProps) {
  const router = useRouter();
  const sorted = useMemo(() => sortTickets(tickets), [tickets]);
  const upcoming = sorted.filter((ticket) => ticket.status === 'upcoming' || ticket.status === 'live');
  const stubs = sorted.filter((ticket) => ticket.status === 'stub' || ticket.status === 'past');

  const handleOpenLink = (href: string) => {
    if (href.startsWith('/')) {
      router.push(href);
    } else {
      window.open(href, '_blank');
    }
  };

  return (
    <>
      <Head>
        <title>Tickets | Hubzz Mock</title>
      </Head>
      <main style={{ padding: '2rem', maxWidth: 960, margin: '0 auto', display: 'grid', gap: '1.5rem' }}>
        <header>
          <p style={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.9rem' }}>Tickets</p>
          <h1 style={{ margin: '0.35rem 0 0.5rem', fontSize: '1.8rem' }}>Your passes (mock data)</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)' }}>
            These cards mirror the feed tickets shown in the mobile mock. Join is enabled once the join window opens;
            past events show their stub state.
          </p>
        </header>

        <section>
          <div className="ticket-section-header">
            <h2>Upcoming</h2>
            <span>{upcoming.length} active</span>
          </div>
          <div className="ticket-grid">
            {upcoming.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                stubHref={ticket.stubId ? `/stubs/${ticket.stubId}` : undefined}
                onOpenLink={handleOpenLink}
              />
            ))}
          </div>
        </section>

        <section>
          <div className="ticket-section-header">
            <h2>Past (stubs)</h2>
            <span>{stubs.length} saved</span>
          </div>
          <div className="ticket-grid">
            {stubs.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                stubHref={ticket.stubId ? `/stubs/${ticket.stubId}` : undefined}
                onOpenLink={handleOpenLink}
              />
            ))}
          </div>
        </section>
      </main>
    </>
  );
}

export async function getServerSideProps() {
  const useMock = defaultUseMock();
  const tickets = await getUserTickets('demo-user', { useMock });

  return {
    props: {
      tickets,
    },
  };
}
