import { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link';
import { CountdownTimer } from '@/components/countdown-timer';
import { DropInStrip } from '@/components/drop-in-strip';
import {
  DropInSession,
  getDropInSession,
  getEvent,
  getEventStages,
  HubzzEvent,
  HubzzStage,
} from '@/lib/hubzz-api';
import { generateDeepLink, openHubzzLink } from '@/lib/deep-links';
import { defaultUseMock } from '@/lib/mock-config';

interface Props {
  event: HubzzEvent;
  stage: HubzzStage;
  dropIn: DropInSession;
}

export default function StagePage({ event, stage, dropIn }: Props) {
  const deepLink = generateDeepLink(stage);
  const isLive = new Date(event.startTime).getTime() <= Date.now();

  return (
    <main style={{ padding: '2rem', display: 'grid', gap: '1rem', maxWidth: 900, margin: '0 auto' }}>
      <header>
        <p style={{ opacity: 0.75 }}>Hubzz preview</p>
        <h1>{stage.name}</h1>
        <p>{event.name}</p>
      </header>

      {!isLive && <CountdownTimer startTime={event.startTime} />}

      <section className="placeholder-box">
        <h3>Stage embed placeholder</h3>
        <p>Stream type: {stage.streamType}</p>
        {stage.externalStreamUrl ? (
          <p>External stream URL: {stage.externalStreamUrl}</p>
        ) : (
          <p>Using Hubzz spatial fallback</p>
        )}
      </section>

      <section className="placeholder-box" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 600 }}>Enter Hubzz</div>
          <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>{deepLink}</div>
        </div>
        <button
          type="button"
          onClick={() => openHubzzLink(deepLink)}
          disabled={!isLive}
          style={{ padding: '0.75rem 1rem', borderRadius: '0.5rem', border: 'none', background: '#7f5af0', color: '#fff' }}
        >
          {isLive ? 'Open in Hubzz' : 'Available at start time'}
        </button>
      </section>

      <DropInStrip session={dropIn} />

      <Link href={`/event/${event.id}`}>Back to event</Link>
    </main>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  return { paths: [], fallback: 'blocking' };
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const eventId = params?.eventId as string;
  const stageId = params?.stageId as string;
  const useMock = defaultUseMock();
  const event = await getEvent(eventId, { useMock });
  const stages = await getEventStages(eventId, { useMock });
  const dropIn = await getDropInSession(eventId, { useMock });
  const stage = stages.find((item) => item.id === stageId);

  if (!stage) {
    return { notFound: true };
  }

  return {
    props: { event, stage, dropIn },
    revalidate: 30,
  };
};
