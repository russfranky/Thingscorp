import { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link';
import { CountdownTimer } from '@/components/countdown-timer';
import { getEvent, getEventStages, getGroupMembers, HubzzEvent, HubzzStage, GroupMember } from '@/lib/hubzz-api';
import { StreamQueueEmbed } from '@/components/stream-queue';
import { generateDeepLink } from '@/lib/deep-links';
import { defaultUseMock } from '@/lib/mock-config';

interface Props {
  event: HubzzEvent;
  stages: HubzzStage[];
  members: GroupMember[];
  useMock: boolean;
}

export default function EventLanding({ event, stages, members, useMock }: Props) {
  return (
    <main style={{ padding: '2rem', display: 'grid', gap: '1rem', maxWidth: 900, margin: '0 auto' }}>
      <header>
        <p style={{ opacity: 0.75 }}>Hubzz preview</p>
        <h1>{event.name}</h1>
        <p>{event.description}</p>
      </header>

      <CountdownTimer startTime={event.startTime} />

      <section className="placeholder-box">
        <h3>Stages</h3>
        <ul>
          {stages.map((stage) => (
            <li key={stage.id} style={{ marginBottom: '0.5rem' }}>
              <div>{stage.name}</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>Type: {stage.streamType}</div>
              <Link href={`/event/${event.id}/stage/${stage.id}`}>Open stage</Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="placeholder-box">
        <h3>Hosts & Speakers</h3>
        <ul>
          {members.map((member) => (
            <li key={member.id}>
              {member.username} ({member.role})
            </li>
          ))}
        </ul>
      </section>

      <section className="placeholder-box">
        <h3>Deep link preview</h3>
        <p>This deep link will open the first stage in the Hubzz client.</p>
        <code style={{ wordBreak: 'break-word' }}>{generateDeepLink(stages[0])}</code>
      </section>

      <section>
        <StreamQueueEmbed eventId={event.id} useMock={useMock} />
      </section>
    </main>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  return { paths: [], fallback: 'blocking' };
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const eventId = params?.eventId as string;
  const useMock = defaultUseMock();
  const event = await getEvent(eventId, { useMock });
  const stages = await getEventStages(eventId, { useMock });
  const members = await getGroupMembers(event.groupId, { useMock });

  return {
    props: { event, stages, members, useMock },
    revalidate: 30,
  };
};
